const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

const generateQrToken = (shiftId) => {
  return `shift_${shiftId}_${uuidv4()}`;
};

const generateQrImage = async (content) => {
  const base64 = await QRCode.toDataURL(content, {
    width: 300,
    margin: 2,
  });
  return base64;
};

module.exports = { generateQrToken, generateQrImage };
