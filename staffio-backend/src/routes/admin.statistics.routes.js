const router = require('express').Router();
const statisticsController = require('../controllers/statistics.controller');

router.get('/revenue', statisticsController.getOverview);
router.get('/overview', statisticsController.getOverview);
router.get('/employees', statisticsController.getEmployeeStats);
router.get('/details', statisticsController.getEmployeeStats);
router.get('/employees/:id', statisticsController.getEmployeeStatsById);

module.exports = router;
