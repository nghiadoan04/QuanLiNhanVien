const { error } = require('../utils/response.util');

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return error(res, 'Access denied. Insufficient permissions.', 403);
    }
    next();
  };
};

module.exports = roleMiddleware;
