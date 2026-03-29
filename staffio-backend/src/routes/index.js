const router = require('express').Router();
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// Public routes
router.use('/auth', require('./auth.routes'));

// Admin routes (require ADMIN role)
router.use('/admin/employees', authMiddleware, roleMiddleware('ADMIN'), require('./admin.employee.routes'));
router.use('/admin/shifts', authMiddleware, roleMiddleware('ADMIN'), require('./admin.shift.routes'));
router.use('/admin/attendance', authMiddleware, roleMiddleware('ADMIN'), require('./admin.attendance.routes'));
router.use('/admin/statistics', authMiddleware, roleMiddleware('ADMIN'), require('./admin.statistics.routes'));

// Admin registrations route (maps to shift controller)
const shiftController = require('../controllers/shift.controller');
router.get('/admin/registrations/pending', authMiddleware, roleMiddleware('ADMIN'), shiftController.getPendingRegistrations);
router.put('/admin/registrations/:id/approve', authMiddleware, roleMiddleware('ADMIN'), shiftController.approveRegistration);
router.put('/admin/registrations/:id/reject', authMiddleware, roleMiddleware('ADMIN'), shiftController.rejectRegistration);

// Employee routes (require authentication)
router.use('/employee', authMiddleware, require('./employee.routes'));

module.exports = router;
