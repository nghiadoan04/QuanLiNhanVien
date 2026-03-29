require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Employee, Shift, ShiftRegistration, Attendance, Notification } = require('../models');

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function buildCheckIn(date, time) {
  return new Date(`${date}T${time}:00`);
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: false });

    // Check if data already exists
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database đã có dữ liệu, bỏ qua seed.');
      process.exit(0);
    }

    console.log('=== BẮT ĐẦU SEED DỮ LIỆU ===');
    const hashedAdmin = await bcrypt.hash('admin123', 10);
    const hashedEmp = await bcrypt.hash('nhanvien123', 10);

    // 1. Admin
    const admin = await User.create({
      email: 'admin@staffio.vn',
      password: hashedAdmin,
      role: 'ADMIN',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await Employee.create({
      user_id: admin.id,
      full_name: 'Nguyễn Văn Quản Lý',
      phone: '0901000000',
      hourly_rate: 0,
      status: 'ACTIVE',
      joined_date: '2025-01-01',
    });

    // 2. 8 Active employees
    const empData = [
      ['Trần Thị Mai', 'mai.tran@staffio.vn', '0912345001', 35000, '2025-06-15'],
      ['Lê Hoàng Nam', 'nam.le@staffio.vn', '0912345002', 30000, '2025-07-01'],
      ['Phạm Minh Tuấn', 'tuan.pham@staffio.vn', '0912345003', 32000, '2025-08-10'],
      ['Nguyễn Thị Hương', 'huong.nguyen@staffio.vn', '0912345004', 28000, '2025-09-01'],
      ['Đỗ Quang Hải', 'hai.do@staffio.vn', '0912345005', 33000, '2025-09-20'],
      ['Vũ Thị Lan Anh', 'lananh.vu@staffio.vn', '0912345006', 30000, '2025-10-05'],
      ['Bùi Đức Thịnh', 'thinh.bui@staffio.vn', '0912345007', 35000, '2025-11-01'],
      ['Hoàng Thị Ngọc', 'ngoc.hoang@staffio.vn', '0912345008', 27000, '2026-01-10'],
    ];

    const employees = [];
    for (const [fullName, email, phone, hourlyRate, joinedDate] of empData) {
      const user = await User.create({
        email,
        password: hashedEmp,
        role: 'EMPLOYEE',
        created_at: new Date(),
        updated_at: new Date(),
      });

      const emp = await Employee.create({
        user_id: user.id,
        full_name: fullName,
        phone,
        hourly_rate: hourlyRate,
        status: 'ACTIVE',
        joined_date: joinedDate,
      });
      employees.push(emp);
    }

    // Inactive employee
    const inactiveUser = await User.create({
      email: 'hung.phan@staffio.vn',
      password: hashedEmp,
      role: 'EMPLOYEE',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await Employee.create({
      user_id: inactiveUser.id,
      full_name: 'Phan Văn Hùng',
      phone: '0912345009',
      hourly_rate: 30000,
      status: 'INACTIVE',
      joined_date: '2025-05-01',
    });

    console.log('Đã tạo 1 admin + 8 nhân viên active + 1 nhân viên inactive');

    // 3. Shifts
    const today = getToday();

    // Past shifts (2 weeks ago)
    const pastShiftData = [
      ['Ca sáng', '08:00', '12:00', 4],
      ['Ca chiều', '13:00', '17:00', 4],
      ['Ca tối', '18:00', '22:00', 3],
      ['Ca sáng', '08:00', '12:00', 5],
      ['Ca chiều', '13:00', '17:00', 4],
      ['Ca sáng', '08:00', '12:00', 4],
    ];

    const pastShifts = [];
    for (let i = 0; i < pastShiftData.length; i++) {
      const [name, startTime, endTime, maxEmployees] = pastShiftData[i];
      const s = await Shift.create({
        name,
        date: addDays(today, -(14 - i)),
        start_time: startTime,
        end_time: endTime,
        max_employees: maxEmployees,
        created_by: admin.id,
        created_at: new Date(),
      });
      pastShifts.push(s);
    }

    // Helper to create shifts
    const createShift = async (name, date, startTime, endTime, maxEmployees) => {
      return await Shift.create({
        name,
        date,
        start_time: startTime,
        end_time: endTime,
        max_employees: maxEmployees,
        created_by: admin.id,
        created_at: new Date(),
      });
    };

    // Today's shifts
    const todayMorning = await createShift('Ca sáng', today, '07:30', '11:30', 4);
    const todayAfternoon = await createShift('Ca chiều', today, '13:00', '17:00', 4);
    const todayEvening = await createShift('Ca tối', today, '18:00', '22:00', 3);

    // Tomorrow
    const tomorrowMorning = await createShift('Ca sáng', addDays(today, 1), '08:00', '12:00', 5);
    const tomorrowAfternoon = await createShift('Ca chiều', addDays(today, 1), '13:00', '17:00', 4);

    // Next week
    const nextWeek1 = await createShift('Ca sáng', addDays(today, 3), '08:00', '12:00', 5);
    const nextWeek2 = await createShift('Ca chiều', addDays(today, 3), '13:00', '17:00', 4);
    const nextWeek3 = await createShift('Ca tối', addDays(today, 3), '18:00', '22:00', 3);
    const nextWeek4 = await createShift('Ca sáng', addDays(today, 5), '08:00', '12:00', 4);
    const nextWeek5 = await createShift('Ca chiều', addDays(today, 5), '13:00', '17:00', 4);
    const nextWeek6 = await createShift('Ca sáng', addDays(today, 7), '08:00', '12:00', 5);

    console.log('Đã tạo 17 ca làm việc');

    // 4. Registrations
    const createApproved = async (shift, employee) => {
      await ShiftRegistration.create({
        shift_id: shift.id,
        employee_id: employee.id,
        status: 'APPROVED',
        registered_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        approved_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
    };

    const createPending = async (shift, employee) => {
      await ShiftRegistration.create({
        shift_id: shift.id,
        employee_id: employee.id,
        status: 'PENDING',
        registered_at: new Date(),
      });
    };

    // Past shifts registrations (approved)
    await createApproved(pastShifts[0], employees[0]);
    await createApproved(pastShifts[0], employees[1]);
    await createApproved(pastShifts[0], employees[2]);
    await createApproved(pastShifts[1], employees[0]);
    await createApproved(pastShifts[1], employees[3]);
    await createApproved(pastShifts[2], employees[4]);
    await createApproved(pastShifts[2], employees[5]);
    await createApproved(pastShifts[3], employees[1]);
    await createApproved(pastShifts[3], employees[6]);
    await createApproved(pastShifts[3], employees[2]);
    await createApproved(pastShifts[4], employees[3]);
    await createApproved(pastShifts[4], employees[7]);
    await createApproved(pastShifts[5], employees[4]);
    await createApproved(pastShifts[5], employees[5]);
    await createApproved(pastShifts[5], employees[6]);

    // Today (approved)
    await createApproved(todayMorning, employees[0]);
    await createApproved(todayMorning, employees[2]);
    await createApproved(todayMorning, employees[6]);
    await createApproved(todayAfternoon, employees[1]);
    await createApproved(todayAfternoon, employees[3]);
    await createApproved(todayEvening, employees[4]);
    await createApproved(todayEvening, employees[7]);

    // Tomorrow (approved)
    await createApproved(tomorrowMorning, employees[0]);
    await createApproved(tomorrowMorning, employees[5]);
    await createApproved(tomorrowAfternoon, employees[2]);
    await createApproved(tomorrowAfternoon, employees[6]);

    // Next week (pending)
    await createPending(nextWeek1, employees[1]);
    await createPending(nextWeek1, employees[3]);
    await createPending(nextWeek2, employees[0]);
    await createPending(nextWeek2, employees[7]);
    await createPending(nextWeek3, employees[4]);
    await createPending(nextWeek4, employees[2]);
    await createPending(nextWeek5, employees[5]);
    await createPending(nextWeek6, employees[6]);

    console.log('Đã tạo đăng ký ca: 26 approved + 8 pending');

    // 5. Attendance
    const createAttendance = async (shift, employee, hours) => {
      const checkInTime = buildCheckIn(shift.date, shift.start_time);
      const checkOutTime = new Date(checkInTime.getTime() + hours * 60 * 60 * 1000);

      await Attendance.create({
        employee_id: employee.id,
        shift_id: shift.id,
        check_in: checkInTime,
        check_out: checkOutTime,
        qr_token: `seed_${shift.id}_${employee.id}`,
        status: 'CHECKED_OUT',
        total_hours: hours,
      });
    };

    await createAttendance(pastShifts[0], employees[0], 4.0);
    await createAttendance(pastShifts[0], employees[1], 3.5);
    await createAttendance(pastShifts[0], employees[2], 4.0);
    await createAttendance(pastShifts[1], employees[0], 4.0);
    await createAttendance(pastShifts[1], employees[3], 3.75);
    await createAttendance(pastShifts[2], employees[4], 4.0);
    await createAttendance(pastShifts[2], employees[5], 3.5);
    await createAttendance(pastShifts[3], employees[1], 4.0);
    await createAttendance(pastShifts[3], employees[6], 4.0);
    await createAttendance(pastShifts[3], employees[2], 3.5);
    await createAttendance(pastShifts[4], employees[3], 4.0);
    await createAttendance(pastShifts[4], employees[7], 3.75);
    await createAttendance(pastShifts[5], employees[4], 4.0);
    await createAttendance(pastShifts[5], employees[5], 4.0);
    await createAttendance(pastShifts[5], employees[6], 3.5);

    console.log('Đã tạo 15 bản ghi chấm công');

    // 6. Notifications
    const month = new Date().getMonth() + 1;

    const createNotif = async (employee, title, message, type, isRead) => {
      await Notification.create({
        employee_id: employee.id,
        title,
        message,
        type,
        is_read: isRead,
        sent_via_email: false,
        created_at: new Date(),
      });
    };

    await createNotif(employees[0], 'Ca làm đã được duyệt',
      `Ca sáng ngày ${today} đã được admin duyệt. Vui lòng đến đúng giờ.`,
      'SHIFT_ASSIGNED', false);

    await createNotif(employees[0], 'Nhắc nhở ca làm ngày mai',
      `Bạn có ca sáng vào ngày ${addDays(today, 1)} từ 08:00 - 12:00. Đừng quên nhé!`,
      'SHIFT_REMINDER', false);

    await createNotif(employees[1], 'Ca làm đã được duyệt',
      `Ca chiều ngày ${today} đã được duyệt. Hãy chấm công đúng giờ.`,
      'SHIFT_ASSIGNED', true);

    await createNotif(employees[2], 'Ca làm đã được duyệt',
      `Ca sáng ngày ${today} đã được admin duyệt.`,
      'SHIFT_ASSIGNED', false);

    await createNotif(employees[3], 'Thay đổi lịch làm',
      `Ca chiều ngày ${addDays(today, 2)} đã bị hủy do thay đổi lịch. Xin lỗi vì bất tiện.`,
      'SHIFT_CHANGE', false);

    await createNotif(employees[4], 'Nhắc nhở ca làm tối nay',
      'Bạn có ca tối hôm nay từ 18:00 - 22:00. Nhớ mang theo thẻ nhân viên.',
      'SHIFT_REMINDER', false);

    await createNotif(employees[5], 'Ca làm đã được duyệt',
      `Ca sáng ngày ${addDays(today, 1)} đã được duyệt cho bạn.`,
      'SHIFT_ASSIGNED', false);

    await createNotif(employees[6], 'Ca làm đã được duyệt',
      `Ca sáng ngày ${today} và ca chiều ngày ${addDays(today, 1)} đã được duyệt.`,
      'SHIFT_ASSIGNED', true);

    await createNotif(employees[7], 'Nhắc nhở chấm công',
      'Bạn chưa check-out ca chiều hôm qua. Vui lòng liên hệ quản lý để cập nhật.',
      'SHIFT_REMINDER', false);

    await createNotif(employees[0], 'Chào mừng tháng mới',
      `Chúc bạn tháng mới làm việc vui vẻ! Lịch ca tháng ${month} đã sẵn sàng.`,
      'SHIFT_CHANGE', true);

    console.log('Đã tạo 10 thông báo');
    console.log('=== SEED DỮ LIỆU HOÀN TẤT ===');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
