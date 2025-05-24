// src/controllers/entController.js
const entPredictionService = require('../services/entPredictionService');
const studentService = require('../services/studentService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для управления результатами пробного ЕНТ и прогнозирования.
 */
class EntController {
  /**
   * Записывает результат пробного ЕНТ.
   * POST /api/ent
   */
  async recordENTResult(req, res, next) {
    try {
      const { student_id, total_score, test_date, math_score, physics_score, history_score, kaz_lang_score, russ_lang_score } = req.body;
      validators.validateRequiredFields(req.body, ['student_id', 'total_score', 'test_date']);
      validators.validateUUID(student_id, 'Student ID');
      validators.validateDate(test_date, 'Test Date');

      if (typeof total_score !== 'number' || total_score < 0 || total_score > 140) {
        throw new CustomError('Total score must be a number between 0 and 140.', 400);
      }
      // Опциональная валидация попредметных баллов
      [math_score, physics_score, history_score, kaz_lang_score, russ_lang_score].forEach(score => {
        if (score !== undefined && (typeof score !== 'number' || score < 0 || score > 30)) {
          throw new CustomError('Subject scores must be numbers between 0 and 30.', 400);
        }
      });

      // Проверить, существует ли ученик
      const studentExists = await studentService.getStudentById(student_id);
      if (!studentExists) {
        throw new CustomError('Student not found. Cannot record ENT result for non-existent student.', 404);
      }

      const newResult = await entPredictionService.recordENTResult(req.body);
      res.status(201).json(newResult);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает все результаты ЕНТ для ученика.
   * GET /api/ent/student/:studentId
   */
  async getENTResultsByStudent(req, res, next) {
    try {
      const { studentId } = req.params;
      validators.validateUUID(studentId, 'Student ID');

      const studentExists = await studentService.getStudentById(studentId);
      if (!studentExists) {
        throw new CustomError('Student not found.', 404);
      }

      const results = await entPredictionService.getENTResultsByStudentId(studentId);
      res.status(200).json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает последний результат ЕНТ и прогноз для ученика.
   * GET /api/ent/student/:studentId/latest
   */
  async getLatestENTResultAndPrediction(req, res, next) {
    try {
      const { studentId } = req.params;
      validators.validateUUID(studentId, 'Student ID');

      const studentExists = await studentService.getStudentById(studentId);
      if (!studentExists) {
        throw new CustomError('Student not found.', 404);
      }

      const latestResult = await entPredictionService.getLatestENTResultAndPrediction(studentId);
      if (!latestResult) {
        res.status(200).json({ message: 'No ENT results found for this student.' });
      } else {
        res.status(200).json(latestResult);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntController();