const statisticsService = require('../services/statistics.service');
const { success } = require('../utils/response.util');

const getOverview = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await statisticsService.getOverview(from, to);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getEmployeeStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await statisticsService.getEmployeeStats(from, to);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const getEmployeeStatsById = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const data = await statisticsService.getEmployeeStatsById(req.params.id, from, to);
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverview, getEmployeeStats, getEmployeeStatsById };
