const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

router.post('/login', agentController.login);
router.post('/register', agentController.register);

module.exports = router;