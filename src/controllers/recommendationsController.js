// src/controllers/recommendationsController.js
const recommendationService = require('../services/recommendationService');
const studentService = require('../services/studentService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для получения AI-советов и рекомендаций.
 */
class RecommendationsController {
  /**
   * Получает AI-советы по слабым темам на основе оценок для конкретного ученика.
   * GET /api/recommendations/student/:studentId
   */
  async getStudentRecommendations(req, res, next) {
    try {
      const { studentId } = req.params;
      validators.validateUUID(studentId, 'Student ID');

      // Проверить, существует ли ученик
      const studentExists = await studentService.getStudentById(studentId);
      if (!studentExists) {
        throw new CustomError('Student not found. Cannot generate recommendations.', 404);
      }

      const recommendations = await recommendationService.getAIBasedRecommendations(studentId);
      // Принципы Anthropic: Добавляем метаданные, чтобы было ясно, что это AI-ответ.
      res.status(200).json({
        source: 'AI Schoolmate Assistant (OpenAI)',
        ...recommendations
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RecommendationsController();