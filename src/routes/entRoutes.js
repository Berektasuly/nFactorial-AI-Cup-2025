// src/routes/entRoutes.js
const express = require('express');
const entController = require('../controllers/entController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', entController.recordENTResult); // Записать результат пробного ЕНТ
router.get('/student/:studentId', entController.getENTResultsByStudent); // Получить все результаты ЕНТ для ученика
router.get('/student/:studentId/latest', entController.getLatestENTResultAndPrediction); // Получить последний результат и прогноз

module.exports = router;