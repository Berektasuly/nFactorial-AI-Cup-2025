// src/routes/openaiRoutes.js
const express = require('express');
const openaiController = require('../controllers/openaiController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/chat', openaiController.getChatResponse); // Отправить запрос в чат OpenAI

module.exports = router;