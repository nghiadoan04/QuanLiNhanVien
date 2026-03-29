const employeeService = require('../services/employee.service');
const { success } = require('../utils/response.util');

const getAll = async (req, res, next) => {
  try {
    const { search, status, page = 0, size = 10 } = req.query;
    const data = await employeeService.getAllEmployees({ search, status, page, size });
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await employeeService.getEmployeeById(req.params.id);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await employeeService.createEmployee(req.body);
    return success(res, data, 'Thêm nhân viên thành công', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await employeeService.updateEmployee(req.params.id, req.body);
    return success(res, data, 'Cập nhật nhân viên thành công');
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    await employeeService.deleteEmployee(req.params.id);
    return success(res, null, 'Xóa nhân viên thành công');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove };
