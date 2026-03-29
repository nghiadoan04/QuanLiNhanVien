const { body } = require('express-validator');

const createShiftValidator = [
  body('name').notEmpty().withMessage('Tên ca không được để trống'),
  body('date').isDate().withMessage('Ngày không hợp lệ'),
  body('startTime').notEmpty().withMessage('Giờ bắt đầu không được để trống'),
  body('endTime').notEmpty().withMessage('Giờ kết thúc không được để trống'),
  body('maxEmployees').optional().isInt({ min: 1 }).withMessage('Số nhân viên tối đa không hợp lệ'),
];

const updateShiftValidator = [
  body('name').optional().notEmpty().withMessage('Tên ca không được để trống'),
  body('date').optional().isDate().withMessage('Ngày không hợp lệ'),
  body('startTime').optional().notEmpty().withMessage('Giờ bắt đầu không được để trống'),
  body('endTime').optional().notEmpty().withMessage('Giờ kết thúc không được để trống'),
  body('maxEmployees').optional().isInt({ min: 1 }).withMessage('Số nhân viên tối đa không hợp lệ'),
];

module.exports = { createShiftValidator, updateShiftValidator };
