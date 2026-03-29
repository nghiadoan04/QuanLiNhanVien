const { body } = require('express-validator');

const qrCheckValidator = [
  body('qrToken').notEmpty().withMessage('Mã QR không được để trống'),
];

module.exports = { qrCheckValidator };
