const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController')

router.get('/stats/:userId', dashboardController.getUserDashboardStats);
router.get('/activities/:userId', dashboardController.getUserRecentActivities);


module.exports = router;