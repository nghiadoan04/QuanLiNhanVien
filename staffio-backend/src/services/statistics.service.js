const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { Employee, Shift, Attendance, User } = require('../models');
const NotFoundError = require('../exceptions/NotFoundError');

const buildEmployeeStats = async (employee, startDate, endDate) => {
  const attendances = await Attendance.findAll({
    where: {
      employee_id: employee.id,
      check_in: { [Op.between]: [startDate, endDate] },
    },
  });

  let totalHours = 0;
  attendances.forEach((a) => {
    if (a.total_hours) {
      totalHours += parseFloat(a.total_hours);
    }
  });

  totalHours = Math.round(totalHours * 100) / 100;
  const totalSalary = Math.round(totalHours * parseFloat(employee.hourly_rate) * 100) / 100;

  return {
    employeeId: employee.id,
    fullName: employee.full_name,
    employeeName: employee.full_name,
    totalHours,
    totalSalary,
    shiftsWorked: attendances.length,
    shiftCount: attendances.length,
    hourlyRate: parseFloat(employee.hourly_rate),
  };
};

const getOverview = async (from, to) => {
  const now = new Date();
  const startDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const endDate = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const totalEmployees = await Employee.count({ where: { status: 'ACTIVE' } });

  const totalShifts = await Shift.count({
    where: { date: { [Op.between]: [startDate, endDate] } },
  });

  const attendances = await Attendance.findAll({
    where: {
      check_in: { [Op.between]: [startDate, endDate] },
    },
    include: [{ model: Employee, as: 'employee' }],
  });

  let totalHoursThisMonth = 0;
  let totalSalaryThisMonth = 0;

  attendances.forEach((a) => {
    if (a.total_hours) {
      const hours = parseFloat(a.total_hours);
      totalHoursThisMonth += hours;
      if (a.employee) {
        totalSalaryThisMonth += hours * parseFloat(a.employee.hourly_rate);
      }
    }
  });

  return {
    totalEmployees,
    totalShifts,
    totalShiftsThisMonth: totalShifts,
    totalHoursThisMonth: Math.round(totalHoursThisMonth * 100) / 100,
    totalSalaryThisMonth: Math.round(totalSalaryThisMonth * 100) / 100,
  };
};

const getEmployeeStats = async (from, to) => {
  const now = new Date();
  const startDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth() - 3, 1);
  const endDate = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const employees = await Employee.findAll({
    where: { status: 'ACTIVE' },
    include: [{ model: User, as: 'user', attributes: ['email'] }],
  });

  const stats = [];
  for (const employee of employees) {
    const stat = await buildEmployeeStats(employee, startDate, endDate);
    stats.push(stat);
  }

  return stats;
};

const getEmployeeStatsById = async (employeeId, from, to) => {
  const now = new Date();
  const startDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = to ? new Date(new Date(to).setHours(23, 59, 59, 999)) : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const employee = await Employee.findByPk(employeeId, {
    include: [{ model: User, as: 'user', attributes: ['email'] }],
  });

  if (!employee) {
    throw new NotFoundError('Nhân viên không tồn tại');
  }

  return await buildEmployeeStats(employee, startDate, endDate);
};

module.exports = { getOverview, getEmployeeStats, getEmployeeStatsById };
