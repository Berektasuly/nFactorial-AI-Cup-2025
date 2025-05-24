// src/routes/chartsRoutes.js
const express = require('express');
const chartsController = require('../controllers/chartsController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/grades/student/:studentId', chartsController.getStudentGradesChartData); // Данные для графика успеваемости ученика
router.get('/comparison/class/:className', chartsController.getClassComparisonChartData); // Данные для графика сравнения классов

module.exports = router;