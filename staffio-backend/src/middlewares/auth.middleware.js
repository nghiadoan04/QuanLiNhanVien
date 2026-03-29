const { verifyToken } = require('../utils/jwt.util');
const { User, Employee } = require('../models');
const { error } = require('../utils/response.util');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findOne({ where: { email: decoded.email } });
    if (!user) {
      return error(res, 'Invalid token. User not found.', 401);
    }

    const employee = await Employee.findOne({ where: { user_id: user.id } });

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      employeeId: employee ? employee.id : null,
    };

    next();
  } catch (err) {
    return error(res, 'Invalid or expired token.', 401);
  }
};

module.exports = authMiddleware;
