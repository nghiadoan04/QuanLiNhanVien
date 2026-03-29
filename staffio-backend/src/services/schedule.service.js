const { ShiftRegistration, Shift, Attendance, Employee } = require('../models');

const getMySchedule = async (employeeId) => {
  const registrations = await ShiftRegistration.findAll({
    where: {
      employee_id: employeeId,
      status: 'APPROVED',
    },
    include: [
      {
        model: Shift,
        as: 'shift',
        include: [
          {
            model: Attendance,
            as: 'attendances',
            where: { employee_id: employeeId },
            required: false,
          },
        ],
      },
    ],
    order: [[{ model: Shift, as: 'shift' }, 'date', 'ASC']],
  });

  return registrations.map((reg) => {
    const shift = reg.shift;
    const attendance = shift.attendances && shift.attendances.length > 0 ? shift.attendances[0] : null;

    const dto = {
      id: shift.id,
      name: shift.name,
      date: shift.date,
      startTime: shift.start_time,
      endTime: shift.end_time,
      maxEmployees: shift.max_employees,
      createdAt: shift.created_at,
    };

    if (attendance) {
      dto.attendance = {
        checkIn: attendance.check_in,
        checkOut: attendance.check_out,
        status: attendance.status,
        totalHours: attendance.total_hours ? parseFloat(attendance.total_hours) : null,
      };
    }

    return dto;
  });
};

module.exports = { getMySchedule };
