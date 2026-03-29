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

module.exports = { getAll, generateQr };
