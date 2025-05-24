// src/controllers/openaiController.js
const openAIService = require('../services/openAIService');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для прямого взаимодействия с OpenAI API (например, простой чат).
 */
class OpenaiController {
  /**
   * Отправляет запрос к OpenAI API и получает ответ.
   * POST /api/openai/chat
   */
  async getChatResponse(req, res, next) {
    try {
      const { prompt, history } = req.body; // history может быть массивом сообщений для контекста
      if (!prompt) {
        throw new CustomError('Prompt is required.', 400);
      }

      // Принципы Anthropic: Безопасность - здесь можно добавить фильтрацию нежелательных/опасных запросов.
      // OpenAI уже имеет внутренние фильтры, но дополнительная защита никогда не помешает.
      if (prompt.length > 500) { // Ограничение на длину запроса
        throw new CustomError('Prompt is too long. Max 500 characters.', 400);
      }

      const aiResponse = await openAIService.getChatCompletion(prompt, history);

      res.status(200).json({ response: aiResponse, source: 'OpenAI API' });
    } catch (error) {
      // openAIService уже выбрасывает CustomError, если AI не настроен или ошибка API
      next(error);
    }
  }
}

module.exports = new OpenaiController();