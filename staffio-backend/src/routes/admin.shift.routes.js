const router = require('express').Router();
const shiftController = require('../controllers/shift.controller');
const { createShiftValidator, updateShiftValidator } = require('../validators/shift.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/today', shiftController.getToday);
router.get('/available-for-qr', shiftController.getAvailableForQr);
router.get('/', shiftController.getAll);
router.post('/', createShiftValidator, validate, shiftController.create);
router.put('/:id', updateShiftValidator, validate, shiftController.update);
router.delete('/:id', shiftController.remove);
router.get('/:id/registrations', shiftController.getRegistrations);
router.put('/registrations/:id/approve', shiftController.approveRegistration);
router.put('/registrations/:id/reject', shiftController.rejectRegistration);

module.exports = router;
