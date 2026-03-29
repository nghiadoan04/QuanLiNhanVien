const shiftService = require('../services/shift.service');
const { success } = require('../utils/response.util');

const getAll = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await shiftService.getShifts(from, to);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getToday = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const data = await shiftService.getShifts(today, today);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getAvailableForQr = async (req, res, next) => {
  try {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const from = today.toISOString().split('T')[0];
    const to = nextWeek.toISOString().split('T')[0];
    const data = await shiftService.getShifts(from, to);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await shiftService.createShift(req.body, req.user.id);
    return success(res, data, 'Tạo ca làm thành công', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await shiftService.updateShift(req.params.id, req.body);
    return success(res, data, 'Cập nhật ca làm thành công');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await shiftService.deleteShift(req.params.id);
    return success(res, null, 'Xóa ca làm thành công');
  } catch (err) {
    next(err);
  }
};

const getRegistrations = async (req, res, next) => {
  try {
    const data = await shiftService.getRegistrations(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getPendingRegistrations = async (req, res, next) => {
  try {
    const data = await shiftService.getPendingRegistrations();
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const approveRegistration = async (req, res, next) => {
  try {
    const data = await shiftService.approveRegistration(req.params.id);
    return success(res, data, 'Duyệt đăng ký thành công');
  } catch (err) {
    next(err);
  }
};

const rejectRegistration = async (req, res, next) => {
  try {
    const data = await shiftService.rejectRegistration(req.params.id);
    return success(res, data, 'Từ chối đăng ký thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getToday,
  getAvailableForQr,
  create,
  update,
  remove,
  getRegistrations,
  getPendingRegistrations,
  approveRegistration,
  rejectRegistration,
};
