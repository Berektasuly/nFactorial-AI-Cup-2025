// src/routes/recommendationsRoutes.js
const express = require('express');
const recommendationsController = require('../controllers/recommendationsController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/student/:studentId', recommendationsController.getStudentRecommendations); // Получить AI-советы для ученика

module.exports = router;