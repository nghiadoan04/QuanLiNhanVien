const router = require('express').Router();
const ctrl = require('../controllers/employee.self.controller');
const { updateProfileValidator } = require('../validators/employee.validator');
const { qrCheckValidator } = require('../validators/attendance.validator');
const validate = require('../middlewares/validate.middleware');

// Profile
router.get('/profile', ctrl.getProfile);
router.put('/profile', updateProfileValidator, validate, ctrl.updateProfile);

// Shifts
router.get('/shifts/available', ctrl.getAvailableShifts);
router.get('/shifts/upcoming', ctrl.getUpcomingShifts);
router.post('/shifts/:shiftId/register', ctrl.registerForShift);

// Schedule
router.get('/schedule', ctrl.getSchedule);

// Attendance
router.post('/attendance/check-in', qrCheckValidator, validate, ctrl.checkIn);
router.post('/attendance/check-out', qrCheckValidator, validate, ctrl.checkOut);

// Registrations
router.get('/registrations', ctrl.getRegistrations);
router.delete('/registrations/:id', ctrl.cancelRegistration);

// Statistics
router.get('/statistics/summary', ctrl.getStatisticsSummary);

// Notifications
router.get('/notifications/unread-count', ctrl.getUnreadNotificationCount);
router.get('/notifications/recent', ctrl.getRecentNotifications);
router.get('/notifications', ctrl.getNotifications);
router.put('/notifications/:id/read', ctrl.markNotificationAsRead);

module.exports = router;
