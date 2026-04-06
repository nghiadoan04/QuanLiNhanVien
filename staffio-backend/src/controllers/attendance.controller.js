const attendanceService = require('../services/attendance.service');
const { success } = require('../utils/response.util');

const getAll = async (req, res, next) => {
  try {
    const { from, to, page = 0, size = 10 } = req.query;
    const data = await attendanceService.getAttendanceList({ from, to, page, size });
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const generateQr = async (req, res, next) => {
  try {
    const shiftId = req.query.shiftId || req.params.shiftId;
    const data = await attendanceService.generateQrForShift(shiftId);
    return success(res, data, 'Tạo mã QR thành công');
  } catch (err) {
    next(err);
  }
};

const adminCheckIn = async (req, res, next) => {
  try {
    const { shiftId, employeeId } = req.body;
    const data = await attendanceService.adminCheckIn(shiftId, employeeId);
    return success(res, data, 'Chấm công vào thành công');
  } catch (err) {
    next(err);
  }
};

const adminCheckOut = async (req, res, next) => {
  try {
    const { shiftId, employeeId } = req.body;
    const data = await attendanceService.adminCheckOut(shiftId, employeeId);
    return success(res, data, 'Chấm công ra thành công');
  } catch (err) {
    next(err);
  }
};

const getShiftAttendance = async (req, res, next) => {
  try {
    const data = await attendanceService.getShiftAttendance(req.params.shiftId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, generateQr, adminCheckIn, adminCheckOut, getShiftAttendance };
