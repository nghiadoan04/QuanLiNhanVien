const authService = require('../services/auth.service');
const { success, error } = require('../utils/response.util');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login(email, password);
    return success(res, data, 'Đăng nhập thành công');
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const data = await authService.register(req.body);
    return success(res, data, 'Đăng ký thành công', 201);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register };
