const { Op } = require('sequelize');
const { Attendance, Employee, Shift, ShiftRegistration, User } = require('../models');
const { generateQrToken, generateQrImage } = require('../utils/qr.util');
const BadRequestError = require('../exceptions/BadRequestError');
const NotFoundError = require('../exceptions/NotFoundError');

const toDTO = (attendance) => {
  return {
    id: attendance.id,
    employeeId: attendance.employee_id,
    employeeName: attendance.employee ? attendance.employee.full_name : null,
    shiftId: attendance.shift_id,
    shiftName: attendance.shift ? attendance.shift.name : null,
    shiftDate: attendance.shift ? attendance.shift.date : null,
    checkIn: attendance.check_in,
    checkOut: attendance.check_out,
    status: attendance.status,
    totalHours: attendance.total_hours ? parseFloat(attendance.total_hours) : null,
  };
};

const generateQrForShift = async (shiftId) => {
  const shift = await Shift.findByPk(shiftId);
  if (!shift) {
    throw new NotFoundError('Ca làm không tồn tại');
  }

  const qrToken = generateQrToken(shiftId);
  const qrImage = await generateQrImage(qrToken);

  return {
    qrToken,
    qrImage,
    shiftId: shift.id,
    shiftName: shift.name,
    shiftDate: shift.date,
  };
};

const checkIn = async (qrToken, employeeId) => {
  // Parse shift ID from QR token
  const parts = qrToken.split('_');
  if (parts.length < 3 || parts[0] !== 'shift') {
    throw new BadRequestError('Mã QR không hợp lệ');
  }

  const shiftId = parseInt(parts[1]);
  const shift = await Shift.findByPk(shiftId);
  if (!shift) {
    throw new BadRequestError('Ca làm không tồn tại');
  }

  // Check if employee is registered for this shift
  const registration = await ShiftRegistration.findOne({
    where: {
      shift_id: shiftId,
      employee_id: employeeId,
      status: 'APPROVED',
    },
  });

  if (!registration) {
    throw new BadRequestError('Bạn chưa được duyệt cho ca làm này');
  }

  // Check if already checked in
  const existingAttendance = await Attendance.findOne({
    where: { employee_id: employeeId, shift_id: shiftId },
  });

  if (existingAttendance) {
    throw new BadRequestError('Bạn đã chấm công vào ca này rồi');
  }

  const attendance = await Attendance.create({
    employee_id: employeeId,
    shift_id: shiftId,
    check_in: new Date(),
    qr_token: qrToken,
    status: 'CHECKED_IN',
  });

  const result = await Attendance.findByPk(attendance.id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Shift, as: 'shift' },
    ],
  });

  return toDTO(result);
};

const checkOut = async (qrToken, employeeId) => {
  const parts = qrToken.split('_');
  if (parts.length < 3 || parts[0] !== 'shift') {
    throw new BadRequestError('Mã QR không hợp lệ');
  }

  const shiftId = parseInt(parts[1]);

  const attendance = await Attendance.findOne({
    where: {
      employee_id: employeeId,
      shift_id: shiftId,
      status: 'CHECKED_IN',
    },
    include: [
      { model: Employee, as: 'employee' },
      { model: Shift, as: 'shift' },
    ],
  });

  if (!attendance) {
    throw new BadRequestError('Không tìm thấy bản ghi chấm công vào');
  }

  if (attendance.check_out) {
    throw new BadRequestError('Bạn đã chấm công ra rồi');
  }

  const checkOutTime = new Date();
  const checkInTime = new Date(attendance.check_in);
  const diffMinutes = (checkOutTime - checkInTime) / (1000 * 60);
  const totalHours = Math.round((diffMinutes / 60) * 100) / 100;

  attendance.check_out = checkOutTime;
  attendance.total_hours = totalHours;
  attendance.status = 'CHECKED_OUT';
  await attendance.save();

  return toDTO(attendance);
};

const getAttendanceList = async ({ from, to, page = 0, size = 10 }) => {
  // Default: first day of current month to today
  const now = new Date();
  const defaultFrom = from || new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = to || now;

  const where = {
    check_in: {
      [Op.between]: [defaultFrom, new Date(new Date(defaultTo).setHours(23, 59, 59, 999))],
    },
  };

  const { count, rows } = await Attendance.findAndCountAll({
    where,
    include: [
      { model: Employee, as: 'employee' },
      { model: Shift, as: 'shift' },
    ],
    limit: parseInt(size),
    offset: parseInt(page) * parseInt(size),
    order: [['check_in', 'DESC']],
  });

  return {
    content: rows.map(toDTO),
    totalElements: count,
    totalPages: Math.ceil(count / size),
    number: parseInt(page),
    size: parseInt(size),
  };
};

// Admin manual check-in (no QR required)
const adminCheckIn = async (shiftId, employeeId) => {
  const shift = await Shift.findByPk(shiftId);
  if (!shift) {
    throw new NotFoundError('Ca làm không tồn tại');
  }

  const registration = await ShiftRegistration.findOne({
    where: {
      shift_id: shiftId,
      employee_id: employeeId,
      status: { [Op.in]: ['APPROVED', 'PENDING'] },
    },
  });

  if (!registration) {
    throw new BadRequestError('Nhân viên chưa đăng ký ca làm này');
  }

  // Auto-approve if still PENDING
  if (registration.status === 'PENDING') {
    registration.status = 'APPROVED';
    registration.approved_at = new Date();
    await registration.save();
  }

  const existingAttendance = await Attendance.findOne({
    where: { employee_id: employeeId, shift_id: shiftId },
  });

  if (existingAttendance) {
    throw new BadRequestError('Nhân viên đã được chấm công cho ca này rồi');
  }

  const attendance = await Attendance.create({
    employee_id: employeeId,
    shift_id: shiftId,
    check_in: new Date(),
    status: 'CHECKED_IN',
  });

  const result = await Attendance.findByPk(attendance.id, {
    include: [
      { model: Employee, as: 'employee' },
      { model: Shift, as: 'shift' },
    ],
  });

  return toDTO(result);
};

// Admin manual check-out (no QR required)
const adminCheckOut = async (shiftId, employeeId) => {
  const attendance = await Attendance.findOne({
    where: {
      employee_id: employeeId,
      shift_id: shiftId,
      status: 'CHECKED_IN',
    },
    include: [
      { model: Employee, as: 'employee' },
      { model: Shift, as: 'shift' },
    ],
  });

  if (!attendance) {
    throw new BadRequestError('Không tìm thấy bản ghi chấm công vào');
  }

  const checkOutTime = new Date();
  const checkInTime = new Date(attendance.check_in);
  const diffMinutes = (checkOutTime - checkInTime) / (1000 * 60);
  const totalHours = Math.round((diffMinutes / 60) * 100) / 100;

  attendance.check_out = checkOutTime;
  attendance.total_hours = totalHours;
  attendance.status = 'CHECKED_OUT';
  await attendance.save();

  return toDTO(attendance);
};

// Get approved employees for a shift with their attendance status
const getShiftAttendance = async (shiftId) => {
  const shift = await Shift.findByPk(shiftId);
  if (!shift) {
    throw new NotFoundError('Ca làm không tồn tại');
  }

  const registrations = await ShiftRegistration.findAll({
    where: { shift_id: shiftId, status: { [Op.in]: ['APPROVED', 'PENDING'] } },
    include: [{ model: Employee, as: 'employee' }],
  });

  const attendances = await Attendance.findAll({
    where: { shift_id: shiftId },
  });

  const attendanceMap = {};
  attendances.forEach((a) => {
    attendanceMap[a.employee_id] = {
      id: a.id,
      checkIn: a.check_in,
      checkOut: a.check_out,
      status: a.status,
      totalHours: a.total_hours ? parseFloat(a.total_hours) : null,
    };
  });

  const employees = registrations.map((reg) => ({
    employeeId: reg.employee_id,
    employeeName: reg.employee ? reg.employee.full_name : null,
    phone: reg.employee ? reg.employee.phone : null,
    registrationStatus: reg.status,
    attendance: attendanceMap[reg.employee_id] || null,
  }));

  return {
    shiftId: shift.id,
    shiftName: shift.name,
    shiftDate: shift.date,
    startTime: shift.start_time ? String(shift.start_time).substring(0, 5) : null,
    endTime: shift.end_time ? String(shift.end_time).substring(0, 5) : null,
    employees,
  };
};

module.exports = { generateQrForShift, checkIn, checkOut, getAttendanceList, adminCheckIn, adminCheckOut, getShiftAttendance };
