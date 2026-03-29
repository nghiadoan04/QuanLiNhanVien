const bcrypt = require('bcryptjs');
const { User, Employee } = require('../models');
const { generateToken } = require('../utils/jwt.util');
const BadRequestError = require('../exceptions/BadRequestError');

const login = async (email, password) => {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new BadRequestError('Email hoặc mật khẩu không đúng');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new BadRequestError('Email hoặc mật khẩu không đúng');
  }

  const token = generateToken(user.email, user.role);

  const employee = await Employee.findOne({ where: { user_id: user.id } });

  return {
    token,
    role: user.role,
    employeeId: employee ? employee.id : null,
    fullName: employee ? employee.full_name : null,
  };
};

const register = async ({ email, password, fullName, phone }) => {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new BadRequestError('Email đã được sử dụng');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    email,
    password: hashedPassword,
    role: 'EMPLOYEE',
    created_at: new Date(),
    updated_at: new Date(),
  });

  const employee = await Employee.create({
    user_id: user.id,
    full_name: fullName,
    phone: phone || null,
    hourly_rate: 30000,
    status: 'ACTIVE',
    joined_date: new Date(),
  });

  const token = generateToken(user.email, user.role);

  return {
    token,
    role: user.role,
    employeeId: employee.id,
    fullName: employee.full_name,
  };
};

module.exports = { login, register };
