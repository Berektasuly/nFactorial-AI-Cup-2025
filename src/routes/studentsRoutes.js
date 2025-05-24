// src/routes/studentsRoutes.js
const express = require('express');
const studentsController = require('../controllers/studentsController');
const gradesController = require('../controllers/gradesController'); // Для получения оценок ученика
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

// Применяем middleware для всех маршрутов в этом роутере (или выборочно)
router.use(authMiddleware);

router.route('/')
  .post(studentsController.createStudent) // Создать ученика
  .get(studentsController.getAllStudents); // Получить всех учеников

router.route('/:id')
  .get(studentsController.getStudentById)    // Получить ученика по ID
  .put(studentsController.updateStudent)     // Обновить ученика по ID
  .delete(studentsController.deleteStudent); // Удалить ученика по ID

// Маршрут для получения всех оценок конкретного ученика
router.get('/:studentId/grades', gradesController.getGradesForStudent);

module.exports = router;