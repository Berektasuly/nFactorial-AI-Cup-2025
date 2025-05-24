// src/controllers/chartsController.js
const chartService = require('../services/chartService');
const studentService = require('../services/studentService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для подготовки данных для графиков.
 */
class ChartsController {
  /**
   * Получает данные для графика успеваемости по предметам для ученика.
   * GET /api/charts/grades/student/:studentId
   */
  async getStudentGradesChartData(req, res, next) {
    try {
      const { studentId } = req.params;
      validators.validateUUID(studentId, 'Student ID');

      const studentExists = await studentService.getStudentById(studentId);
      if (!studentExists) {
        throw new CustomError('Student not found.', 404);
      }

      const chartData = await chartService.getGradeDynamicsChartData(studentId);
      res.status(200).json(chartData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает данные для графика сравнения среднего балла учеников в классе.
   * GET /api/charts/comparison/class/:className
   */
  async getClassComparisonChartData(req, res, next) {
    try {
      const { className } = req.params;
      if (!className) {
        throw new CustomError('Class name is required.', 400);
      }

      // Проверить, существуют ли ученики в этом классе, хотя сервис сам это обрабатывает
      // Но для более явного 404 можно проверить здесь.
      const studentsInClass = await studentService.getStudentsByClass(className);
      if (!studentsInClass || studentsInClass.length === 0) {
        res.status(200).json({ message: `No students found in class "${className}".`, labels: [], datasets: [] });
        return;
      }

      const chartData = await chartService.getClassComparisonChartData(className);
      res.status(200).json(chartData);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChartsController();