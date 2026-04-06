const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');

router.get('/', attendanceController.getAll);
router.post('/qr/generate', attendanceController.generateQr);
router.post('/generate-qr/:shiftId', attendanceController.generateQr);
router.get('/shift/:shiftId', attendanceController.getShiftAttendance);
router.post('/check-in', attendanceController.adminCheckIn);
router.post('/check-out', attendanceController.adminCheckOut);

module.exports = router;
