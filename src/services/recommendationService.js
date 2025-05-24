// src/services/recommendationService.js
const openAIService = require('./openAIService');
const gradeService = require('./gradeService');
const studentService = require('./studentService');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для генерации персонализированных рекомендаций на основе данных ученика и AI.
 */
class RecommendationService {
  /**
   * Генерирует AI-советы по слабым темам для ученика.
   * @param {string} studentId - ID ученика.
   * @returns {Promise<Object>} Структурированный AI-совет.
   * @throws {CustomError} Если данные отсутствуют или AI-сервис недоступен.
   */
  async getAIBasedRecommendations(studentId) {
    // 1. Получить данные об ученике
    const student = await studentService.getStudentById(studentId);
    if (!student) {
      throw new CustomError(`Student with ID ${studentId} not found.`, 404);
    }

    // 2. Проанализировать успеваемость ученика
    const performanceAnalysis = await gradeService.analyzeStudentPerformance(studentId);

    // 3. Получить недавние оценки для контекста
    const recentGrades = await gradeService.getGradesByStudentId(studentId);
    const top5RecentGrades = recentGrades.slice(0, 5).map(g => ({
      subject: g.subject,
      topic: g.topic,
      score: g.score,
      date: g.grade_date
    }));

    // Проверяем, есть ли слабые места для рекомендаций
    if (performanceAnalysis.weakSubjects.length === 0 && performanceAnalysis.weakTopics.length === 0) {
      // Если слабых мест нет, можно предложить общие советы или подтверждение хорошей работы
      return {
        type: 'general_excellence_advice',
        subject: null,
        topic: null,
        advice: `Отличная работа, ${student.name}! Ваши оценки показывают сильные знания во всех областях. Продолжайте в том же духе, активно участвуйте в уроках и не бойтесь брать на себя новые вызовы.`,
        visual_suggestion: "Используйте диаграммы прогресса для отслеживания ваших успехов и постановки новых целей."
      };
    }

    // 4. Использовать AI для генерации рекомендаций
    // Принципы Anthropic: Помощь без вреда - AI должен быть настроен на образовательные цели.
    const aiRecommendation = await openAIService.generateRecommendation(
      student.name,
      performanceAnalysis,
      top5RecentGrades
    );

    return aiRecommendation;
  }
}

module.exports = new RecommendationService();