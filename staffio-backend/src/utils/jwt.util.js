const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'staffio-secret-key';
const EXPIRATION = parseInt(process.env.JWT_EXPIRATION) || 86400000;

const generateToken = (email, role) => {
  return jwt.sign(
    { email, role },
    SECRET,
    { expiresIn: EXPIRATION / 1000 } // jwt uses seconds
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

const getEmailFromToken = (token) => {
  const decoded = jwt.verify(token, SECRET);
  return decoded.email;
};

const getRoleFromToken = (token) => {
  const decoded = jwt.verify(token, SECRET);
  return decoded.role;
};

module.exports = { generateToken, verifyToken, getEmailFromToken, getRoleFromToken };
