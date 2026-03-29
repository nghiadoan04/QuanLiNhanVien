const { Op } = require('sequelize');
const { Shift, ShiftRegistration, Employee, Attendance, User } = require('../models');
const BadRequestError = require('../exceptions/BadRequestError');
const NotFoundError = require('../exceptions/NotFoundError');
const notificationService = require('./notification.service');

const toShiftDTO = (shift, registrations) => {
  const approvedCount = registrations
    ? registrations.filter((r) => r.status === 'APPROVED').length
    : 0;
  return {
    id: shift.id,
    name: shift.name,
    date: shift.date,
    startTime: shift.start_time,
    endTime: shift.end_time,
    maxEmployees: shift.max_employees,
    currentRegistrations: approvedCount,
    registeredCount: approvedCount,
    createdAt: shift.created_at,
  };
};

const toRegistrationDTO = (reg) => {
  return {
    id: reg.id,
    shiftId: reg.shift_id,
    shiftName: reg.shift ? reg.shift.name : null,
    shiftDate: reg.shift ? reg.shift.date : null,
    startTime: reg.shift ? reg.shift.start_time : null,
    endTime: reg.shift ? reg.shift.end_time : null,
    employeeId: reg.employee_id,
    employeeName: reg.employee ? reg.employee.full_name : null,
    status: reg.status,
    registeredAt: reg.registered_at,
  };
};

const getShifts = async (from, to) => {
  const where = {};
  if (from && to) {
    where.date = { [Op.between]: [from, to] };
  }

  const shifts = await Shift.findAll({
    where,
    include: [{ model: ShiftRegistration, as: 'registrations' }],
    order: [['date', 'ASC'], ['start_time', 'ASC']],
  });

  return shifts.map((s) => toShiftDTO(s, s.registrations));
};

const createShift = async ({ name, date, startTime, endTime, maxEmployees }, userId) => {
  const shift = await Shift.create({
    name,
    date,
    start_time: startTime,
    end_time: endTime,
    max_employees: maxEmployees || 5,
    created_by: userId,
    created_at: new Date(),
  });

  return toShiftDTO(shift, []);
};

const updateShift = async (id, { name, date, startTime, endTime, maxEmployees }) => {
  const shift = await Shift.findByPk(id);
  if (!shift) {
    throw new NotFoundError('Ca làm không tồn tại');
  }

  if (name !== undefined) shift.name = name;
  if (date !== undefined) shift.date = date;
  if (startTime !== undefined) shift.start_time = startTime;
  if (endTime !== undefined) shift.end_time = endTime;
  if (maxEmployees !== undefined) shift.max_employees = maxEmployees;

  await shift.save();

  const registrations = await ShiftRegistration.findAll({ where: { shift_id: id } });
  return toShiftDTO(shift, registrations);
};

const deleteShift = async (id) => {
  const shift = await Shift.findByPk(id);
  if (!shift) {
    throw new NotFoundError('Ca làm không tồn tại');
  }
  await shift.destroy();
};

const getAvailableShifts = async () => {
  const today = new Date().toISOString().split('T')[0];

  const shifts = await Shift.findAll({
    where: { date: { [Op.gte]: today } },
    include: [{ model: ShiftRegistration, as: 'registrations' }],
    order: [['date', 'ASC'], ['start_time', 'ASC']],
  });

  return shifts
    .filter((s) => {
      const approvedCount = s.registrations.filter((r) => r.status === 'APPROVED').length;
      return approvedCount < s.max_employees;
    })
    .map((s) => toShiftDTO(s, s.registrations));
};

const getRegistrations = async (shiftId) => {
  const registrations = await ShiftRegistration.findAll({
    where: { shift_id: shiftId },
    include: [
      { model: Shift, as: 'shift' },
      { model: Employee, as: 'employee' },
    ],
  });

  return registrations.map(toRegistrationDTO);
};

const getPendingRegistrations = async () => {
  const registrations = await ShiftRegistration.findAll({
    where: { status: 'PENDING' },
    include: [
      { model: Shift, as: 'shift' },
      { model: Employee, as: 'employee' },
    ],
    order: [['registered_at', 'DESC']],
  });

  return registrations.map(toRegistrationDTO);
};

const getEmployeeRegistrations = async (employeeId) => {
  const registrations = await ShiftRegistration.findAll({
    where: { employee_id: employeeId },
    include: [
      { model: Shift, as: 'shift' },
      { model: Employee, as: 'employee' },
    ],
    order: [['registered_at', 'DESC']],
  });

  return registrations.map(toRegistrationDTO);
};

const registerForShift = async (shiftId, employeeId) => {
  const shift = await Shift.findByPk(shiftId, {
    include: [{ model: ShiftRegistration, as: 'registrations' }],
  });

  if (!shift) {
    throw new NotFoundError('Ca làm không tồn tại');
  }

  const alreadyRegistered = await ShiftRegistration.findOne({
    where: { shift_id: shiftId, employee_id: employeeId },
  });

  if (alreadyRegistered) {
    throw new BadRequestError('Bạn đã đăng ký ca này rồi');
  }

  const approvedCount = shift.registrations.filter((r) => r.status === 'APPROVED').length;
  if (approvedCount >= shift.max_employees) {
    throw new BadRequestError('Ca làm đã đầy');
  }

  const registration = await ShiftRegistration.create({
    shift_id: shiftId,
    employee_id: employeeId,
    status: 'PENDING',
    registered_at: new Date(),
  });

  const result = await ShiftRegistration.findByPk(registration.id, {
    include: [
      { model: Shift, as: 'shift' },
      { model: Employee, as: 'employee' },
    ],
  });

  return toRegistrationDTO(result);
};

const approveRegistration = async (registrationId) => {
  const registration = await ShiftRegistration.findByPk(registrationId, {
    include: [{ model: Shift, as: 'shift' }],
  });

  if (!registration) {
    throw new NotFoundError('Đăng ký không tồn tại');
  }

  registration.status = 'APPROVED';
  registration.approved_at = new Date();
  await registration.save();

  try {
    await notificationService.createAndSendNotification(
      registration.employee_id,
      'Ca làm đã được duyệt',
      `Ca "${registration.shift.name}" ngày ${registration.shift.date} đã được duyệt.`,
      'SHIFT_ASSIGNED'
    );
  } catch (err) {
    console.warn('Failed to send notification:', err.message);
  }

  const result = await ShiftRegistration.findByPk(registrationId, {
    include: [
      { model: Shift, as: 'shift' },
      { model: Employee, as: 'employee' },
    ],
  });

  return toRegistrationDTO(result);
};

const rejectRegistration = async (registrationId) => {
  const registration = await ShiftRegistration.findByPk(registrationId, {
    include: [{ model: Shift, as: 'shift' }],
  });

  if (!registration) {
    throw new NotFoundError('Đăng ký không tồn tại');
  }

  registration.status = 'REJECTED';
  await registration.save();

  try {
    await notificationService.createAndSendNotification(
      registration.employee_id,
      'Ca làm bị từ chối',
      `Ca "${registration.shift.name}" ngày ${registration.shift.date} đã bị từ chối.`,
      'SHIFT_CHANGE'
    );
  } catch (err) {
    console.warn('Failed to send notification:', err.message);
  }

  const result = await ShiftRegistration.findByPk(registrationId, {
    include: [
      { model: Shift, as: 'shift' },
      { model: Employee, as: 'employee' },
    ],
  });

  return toRegistrationDTO(result);
};

const cancelRegistration = async (registrationId, employeeId) => {
  const registration = await ShiftRegistration.findByPk(registrationId);

  if (!registration) {
    throw new NotFoundError('Đăng ký không tồn tại');
  }

  if (registration.employee_id != employeeId) {
    throw new BadRequestError('Bạn không có quyền hủy đăng ký này');
  }

  if (registration.status !== 'PENDING') {
    throw new BadRequestError('Chỉ có thể hủy đăng ký đang chờ duyệt');
  }

  await registration.destroy();
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift,
  getAvailableShifts,
  getRegistrations,
  getPendingRegistrations,
  getEmployeeRegistrations,
  registerForShift,
  approveRegistration,
  rejectRegistration,
  cancelRegistration,
};
