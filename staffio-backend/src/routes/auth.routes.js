const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { loginValidator, registerValidator } = require('../validators/auth.validator');
const validate = require('../middlewares/validate.middleware');

router.post('/login', loginValidator, validate, authController.login);
router.post('/register', registerValidator, validate, authController.register);

module.exports = router;
