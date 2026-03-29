const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { User, Employee } = require('../models');
const BadRequestError = require('../exceptions/BadRequestError');
const NotFoundError = require('../exceptions/NotFoundError');

const toDTO = (employee) => {
  return {
    id: employee.id,
    email: employee.user ? employee.user.email : null,
    fullName: employee.full_name,
    phone: employee.phone,
    avatarUrl: employee.avatar_url,
    hourlyRate: parseFloat(employee.hourly_rate),
    status: employee.status,
    joinedDate: employee.joined_date,
  };
};

const getAllEmployees = async ({ search, status, page = 0, size = 10 }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.full_name = { [Op.like]: `%${search}%` };
  }

  const { count, rows } = await Employee.findAndCountAll({
    where,
    include: [{ model: User, as: 'user', attributes: ['email'] }],
    limit: parseInt(size),
    offset: parseInt(page) * parseInt(size),
    order: [['id', 'ASC']],
  });

  return {
    content: rows.map(toDTO),
    totalElements: count,
    totalPages: Math.ceil(count / size),
    number: parseInt(page),
    size: parseInt(size),
  };
};

const getEmployeeById = async (id) => {
  const employee = await Employee.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['email'] }],
  });

  if (!employee) {
    throw new NotFoundError('Nhân viên không tồn tại');
  }

  return toDTO(employee);
};

const createEmployee = async ({ email, password, fullName, phone, hourlyRate }) => {
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
    hourly_rate: hourlyRate,
    status: 'ACTIVE',
    joined_date: new Date(),
  });

  const result = await Employee.findByPk(employee.id, {
    include: [{ model: User, as: 'user', attributes: ['email'] }],
  });

  return toDTO(result);
};

const updateEmployee = async (id, { fullName, phone, hourlyRate, status }) => {
  const employee = await Employee.findByPk(id, {
    include: [{ model: User, as: 'user', attributes: ['email'] }],
  });

  if (!employee) {
    throw new NotFoundError('Nhân viên không tồn tại');
  }

  if (fullName !== undefined) employee.full_name = fullName;
  if (phone !== undefined) employee.phone = phone;
  if (hourlyRate !== undefined) employee.hourly_rate = hourlyRate;
  if (status !== undefined) employee.status = status;

  await employee.save();

  return toDTO(employee);
};

const deleteEmployee = async (id) => {
  const employee = await Employee.findByPk(id);

  if (!employee) {
    throw new NotFoundError('Nhân viên không tồn tại');
  }

  employee.status = 'INACTIVE';
  await employee.save();
};

module.exports = { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, toDTO };
