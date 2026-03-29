const router = require('express').Router();
const attendanceController = require('../controllers/attendance.controller');

router.get('/', attendanceController.getAll);
router.post('/qr/generate', attendanceController.generateQr);
router.post('/generate-qr/:shiftId', attendanceController.generateQr);

module.exports = router;
