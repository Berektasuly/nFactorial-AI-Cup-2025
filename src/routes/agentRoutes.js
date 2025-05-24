// src/routes/agentRoutes.js
const express = require('express');
const agentController = require('../controllers/agentController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/ask', agentController.askAgent); // Отправить комплексный запрос AI-агенту

module.exports = router;