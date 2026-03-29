const { Employee, User } = require('../models');
const { Op } = require('sequelize');
const { Shift, ShiftRegistration, Attendance } = require('../models');
const employeeService = require('../services/employee.service');
const shiftService = require('../services/shift.service');
const attendanceService = require('../services/attendance.service');
const scheduleService = require('../services/schedule.service');
const notificationService = require('../services/notification.service');
const statisticsService = require('../services/statistics.service');
const { success, error } = require('../utils/response.util');

const getProfile = async (req, res, next) => {
  try {
    const data = await employeeService.getEmployeeById(req.user.employeeId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const data = await employeeService.updateEmployee(req.user.employeeId, { fullName, phone });
    return success(res, data, 'Cập nhật hồ sơ thành công');
  } catch (err) {
    next(err);
  }
};

const getAvailableShifts = async (req, res, next) => {
  try {
    const data = await shiftService.getAvailableShifts();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const registerForShift = async (req, res, next) => {
  try {
    const data = await shiftService.registerForShift(req.params.shiftId, req.user.employeeId);
    return success(res, data, 'Đăng ký ca thành công', 201);
  } catch (err) {
    next(err);
  }
};

const getSchedule = async (req, res, next) => {
  try {
    const data = await scheduleService.getMySchedule(req.user.employeeId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const checkIn = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    const data = await attendanceService.checkIn(qrToken, req.user.employeeId);
    return success(res, data, 'Chấm công vào thành công');
  } catch (err) {
    next(err);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const { qrToken } = req.body;
    const data = await attendanceService.checkOut(qrToken, req.user.employeeId);
    return success(res, data, 'Chấm công ra thành công');
  } catch (err) {
    next(err);
  }
};

const getRegistrations = async (req, res, next) => {
  try {
    const data = await shiftService.getEmployeeRegistrations(req.user.employeeId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    await shiftService.cancelRegistration(req.params.id, req.user.employeeId);
    return success(res, null, 'Hủy đăng ký thành công');
  } catch (err) {
    next(err);
  }
};

const getUpcomingShifts = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await shiftService.getShifts(today, null);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getStatisticsSummary = async (req, res, next) => {
  try {
    const data = await statisticsService.getEmployeeStatsById(req.user.employeeId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.employeeId);
    return success(res, { count });
  } catch (err) {
    next(err);
  }
};

const getRecentNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getRecentNotifications(req.user.employeeId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const data = await notificationService.getNotifications(req.user.employeeId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const markNotificationAsRead = async (req, res, next) => {
  try {
    const data = await notificationService.markAsRead(req.params.id);
    return success(res, data, 'Đánh dấu đã đọc');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getAvailableShifts,
  registerForShift,
  getSchedule,
  checkIn,
  checkOut,
  getRegistrations,
  cancelRegistration,
  getUpcomingShifts,
  getStatisticsSummary,
  getUnreadNotificationCount,
  getRecentNotifications,
  getNotifications,
  markNotificationAsRead,
};
