// src/routes/gradesRoutes.js
const express = require('express');
const gradesController = require('../controllers/gradesController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .post(gradesController.createGrade) // Добавить новую оценку
  .get(gradesController.getAllGrades); // Получить все оценки

router.route('/:id')
  .get(gradesController.getGradeById)    // Получить оценку по ID
  .put(gradesController.updateGrade)     // Обновить оценку по ID
  .delete(gradesController.deleteGrade); // Удалить оценку по ID

// Маршруты аналитики
router.get('/analytics/student/:studentId', gradesController.getStudentPerformanceAnalytics);
router.get('/comparison/class/:className', gradesController.compareClassPerformance);

module.exports = router;