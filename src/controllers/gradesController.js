// src/controllers/gradesController.js
const gradeService = require('../services/gradeService');
const studentService = require('../services/studentService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для обработки запросов, связанных с оценками.
 */
class GradesController {
  /**
   * Добавляет новую оценку.
   * POST /api/grades
   */
  async createGrade(req, res, next) {
    try {
      const { student_id, subject, topic, score, grade_date } = req.body;
      validators.validateRequiredFields(req.body, ['student_id', 'subject', 'topic', 'score', 'grade_date']);
      validators.validateUUID(student_id, 'Student ID');
      validators.validateScore(score);
      validators.validateDate(grade_date, 'Grade Date');

      // Проверить, существует ли ученик
      const studentExists = await studentService.getStudentById(student_id);
      if (!studentExists) {
        throw new CustomError('Student not found. Cannot assign grade to non-existent student.', 404);
      }

      const newGrade = await gradeService.createGrade({ student_id, subject, topic, score, grade_date });
      res.status(201).json(newGrade);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает оценку по ID.
   * GET /api/grades/:id
   */
  async getGradeById(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Grade ID');

      const grade = await gradeService.getGradeById(id);
      if (!grade) {
        throw new CustomError('Grade not found', 404);
      }
      res.status(200).json(grade);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает все оценки для конкретного ученика.
   * GET /api/students/:studentId/grades (маршрут находится в studentsRoutes, но использует gradeService)
   */
  async getGradesForStudent(req, res, next) {
    try {
      const { studentId } = req.params;
      validators.validateUUID(studentId, 'Student ID');

      const grades = await gradeService.getGradesByStudentId(studentId);
      res.status(200).json(grades);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает все оценки (для всех учеников).
   * GET /api/grades
   */
  async getAllGrades(req, res, next) {
    try {
      const grades = await gradeService.getAllGrades();
      res.status(200).json(grades);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновляет оценку.
   * PUT /api/grades/:id
   */
  async updateGrade(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Grade ID');

      const { subject, topic, score, grade_date } = req.body;
      if (!subject && !topic && !score && !grade_date) {
        throw new CustomError('No update data provided', 400);
      }
      if (score !== undefined) validators.validateScore(score);
      if (grade_date) validators.validateDate(grade_date, 'Grade Date');

      const updatedGrade = await gradeService.updateGrade(id, { subject, topic, score, grade_date });
      if (!updatedGrade) {
        throw new CustomError('Grade not found or no changes applied', 404);
      }
      res.status(200).json(updatedGrade);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Удаляет оценку.
   * DELETE /api/grades/:id
   */
  async deleteGrade(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Grade ID');

      const success = await gradeService.deleteGrade(id);
      if (!success) {
        throw new CustomError('Grade not found or could not be deleted', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает аналитику успеваемости для ученика.
   * GET /api/grades/analytics/student/:studentId
   */
  async getStudentPerformanceAnalytics(req, res, next) {
    try {
      const { studentId } = req.params;
      validators.validateUUID(studentId, 'Student ID');

      const studentExists = await studentService.getStudentById(studentId);
      if (!studentExists) {
        throw new CustomError('Student not found.', 404);
      }

      const analytics = await gradeService.analyzeStudentPerformance(studentId);
      res.status(200).json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Сравнивает успеваемость учеников в классе.
   * GET /api/grades/comparison/class/:className
   */
  async compareClassPerformance(req, res, next) {
    try {
      const { className } = req.params;
      if (!className) {
        throw new CustomError('Class name is required for comparison.', 400);
      }

      const comparisonData = await gradeService.compareClassPerformance(className);
      if (comparisonData.length === 0) {
        res.status(200).json({ message: `No students or grade data found for class "${className}".`, data: [] });
      } else {
        res.status(200).json(comparisonData);
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GradesController();