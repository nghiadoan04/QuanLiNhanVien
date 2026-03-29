const router = require('express').Router();
const employeeController = require('../controllers/employee.controller');
const { createEmployeeValidator, updateEmployeeValidator } = require('../validators/employee.validator');
const validate = require('../middlewares/validate.middleware');

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', createEmployeeValidator, validate, employeeController.create);
router.put('/:id', updateEmployeeValidator, validate, employeeController.update);
router.delete('/:id', employeeController.remove);

module.exports = router;
