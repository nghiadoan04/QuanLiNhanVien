const { body } = require('express-validator');

const createEmployeeValidator = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('fullName').notEmpty().withMessage('Họ tên không được để trống'),
  body('hourlyRate').isFloat({ min: 0 }).withMessage('Lương theo giờ không hợp lệ'),
];

const updateEmployeeValidator = [
  body('fullName').optional().notEmpty().withMessage('Họ tên không được để trống'),
  body('hourlyRate').optional().isFloat({ min: 0 }).withMessage('Lương theo giờ không hợp lệ'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']).withMessage('Trạng thái không hợp lệ'),
];

const updateProfileValidator = [
  body('fullName').optional().notEmpty().withMessage('Họ tên không được để trống'),
  body('phone').optional().isString().withMessage('Số điện thoại không hợp lệ'),
];

module.exports = { createEmployeeValidator, updateEmployeeValidator, updateProfileValidator };
