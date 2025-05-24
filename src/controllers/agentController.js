// src/controllers/agentController.js
const agentService = require('../services/agentService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для взаимодействия с высокоуровневым AI-агентом.
 */
class AgentController {
  /**
   * Отправляет комплексный запрос AI-агенту.
   * POST /api/agent/ask
   */
  async askAgent(req, res, next) {
    try {
      const { query, studentId } = req.body;
      if (!query) {
        throw new CustomError('Query is required for the AI agent.', 400);
      }

      if (studentId) {
        validators.validateUUID(studentId, 'Student ID');
        // Дополнительная проверка на существование studentId может быть здесь или внутри agentService.
        // Для простоты MVP, полагаемся на то, что нижележащие сервисы выкинут 404.
      }

      // Принципы Anthropic: Контроль - мы передаем контекст (studentId) агенту,
      // но оставляем ему свободу выбора инструментов.
      const agentResponse = await agentService.processQuery(query, studentId);

      // Принципы Anthropic: Прозрачность - указываем источник ответа.
      res.status(200).json({ message: agentResponse, source: 'AI Schoolmate Agent' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AgentController();