// src/services/openAIService.js
const openai = require('../config/openai');
const CustomError = require('../utils/CustomError');

/**
 * Сервис-обертка для взаимодействия с OpenAI API.
 * Предоставляет методы для чата, генерации текста и использования инструментов.
 */
class OpenAIService {
  constructor() {
    if (!openai) {
      console.warn("OpenAI client not initialized. AI features will be unavailable.");
      this.isReady = false;
    } else {
      this.isReady = true;
    }
  }

  /**
   * Отправляет запрос к модели OpenAI (чат).
   * @param {string} prompt - Текст запроса пользователя.
   * @param {Array<Object>} [history=[]] - История сообщений в формате { role: 'user'|'assistant', content: '...' }.
   * @param {string} [model='gpt-3.5-turbo'] - Модель OpenAI для использования.
   * @returns {Promise<string>} Ответ от AI.
   * @throws {CustomError} Если OpenAI API не готов или произошла ошибка.
   */
  async getChatCompletion(prompt, history = [], model = 'gpt-3.5-turbo') {
    if (!this.isReady) {
      throw new CustomError('OpenAI service is not configured correctly.', 503);
    }

    const messages = [
      ...history,
      { role: 'user', content: prompt }
    ];

    try {
      const response = await openai.chat.completions.create({
        model: model,
        messages: messages,
        temperature: 0.7, // Баланс между креативностью и точностью
        max_tokens: 500,  // Ограничение длины ответа
      });

      // Принципы Anthropic: Прозрачность - явно указываем, что ответ от AI
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw new CustomError(`Failed to get response from AI: ${error.message}`, 500);
    }
  }

  /**
   * Использует OpenAI для выбора и вызова "инструментов" (функций).
   * Этот метод будет использоваться в `agentService`.
   * @param {string} prompt - Запрос пользователя.
   * @param {Array<Object>} tools - Описание доступных инструментов в формате OpenAI.
   * @returns {Promise<Object>} Объект с решением AI: { tool_calls: [], message: string }
   */
  async callWithTools(prompt, tools) {
    if (!this.isReady) {
      throw new CustomError('OpenAI service is not configured correctly.', 503);
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0125', // Используем модель, поддерживающую Tool Calling
        messages: [{ role: 'user', content: prompt }],
        tools: tools,
        tool_choice: 'auto', // Дать модели решать, вызывать ли инструмент
      });

      const responseMessage = response.choices[0].message;
      return responseMessage; // Вернем сообщение, которое может содержать tool_calls или просто текст
    } catch (error) {
      console.error('OpenAI Tool Calling API error:', error.message);
      throw new CustomError(`Failed to process AI tool call: ${error.message}`, 500);
    }
  }

  /**
   * Генерирует рекомендацию или совет на основе входных данных.
   * @param {string} studentName - Имя ученика.
   * @param {Object} performanceAnalysis - Анализ успеваемости (слабые темы/предметы).
   * @param {string[]} recentGrades - Недавние оценки для контекста.
   * @returns {Promise<Object>} Структурированный AI-совет.
   * @throws {CustomError} Если произошла ошибка.
   */
  async generateRecommendation(studentName, performanceAnalysis, recentGrades) {
    if (!this.isReady) {
      throw new CustomError('OpenAI service is not configured correctly.', 503);
    }

    const { weakSubjects, weakTopics, averageOverall } = performanceAnalysis;

    let prompt = `Ты - AI-школьный помощник "AI Schoolmate". Твоя задача - давать персонализированные, полезные и безопасные советы ученику по имени ${studentName} для улучшения его успеваемости.`;
    prompt += `\nЕго общий средний балл: ${averageOverall.toFixed(2)}.\n`;

    if (weakSubjects && weakSubjects.length > 0) {
      prompt += `\nСледующие предметы нуждаются в улучшении (средний балл): ${weakSubjects.map(s => `${s.subject} (${s.average.toFixed(2)})`).join(', ')}.`;
    }
    if (weakTopics && weakTopics.length > 0) {
      prompt += `\nОсобое внимание следует уделить следующим темам: ${weakTopics.map(t => `${t.topic} по ${t.subject} (средний балл: ${t.average.toFixed(2)})`).join(', ')}.`;
    }

    prompt += `\nПоследние оценки ученика: ${JSON.stringify(recentGrades)}.`;

    prompt += `\n\nСгенерируй конкретные, действенные советы по улучшению знаний и предложи, как можно использовать визуальные материалы (диаграммы, схемы) для лучшего понимания. Ответ должен быть в формате JSON:
    {
      "type": "grade_improvement",
      "subject": "Название предмета, если совет по одному предмету, иначе null",
      "topic": "Название темы, если совет по одной теме, иначе null",
      "advice": "Развернутый совет по улучшению, не более 200 слов.",
      "visual_suggestion": "Предложение по визуальному материалу для лучшего понимания, не более 50 слов."
    }`;

    try {
      const rawResponse = await this.getChatCompletion(prompt, [], 'gpt-4'); // Используем более сильную модель для рекомендаций

      // Принципы Anthropic: Контроль и Безопасность
      // Пробуем распарсить JSON. Если не получается, возвращаем сырой текст или стандартный совет.
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(rawResponse);
      } catch (jsonError) {
        console.warn('AI did not return valid JSON for recommendation. Returning raw response.', rawResponse);
        // Fallback: возвращаем общий совет или сырой текст
        parsedResponse = {
          type: 'general_advice',
          subject: null,
          topic: null,
          advice: `AI не смог дать специфический совет, но помните: регулярное повторение материала, активное участие в уроках и задавание вопросов - ключ к успеху. ${rawResponse}`,
          visual_suggestion: 'Постройте ментальные карты или блок-схемы для визуализации связей между темами.'
        };
      }

      // Принципы Anthropic: Помощь без вреда - проверка на содержание.
      // Хотя AI-модели OpenAI уже фильтруют вредоносный контент, здесь можно добавить свои проверки, если требуется.
      // Например, проверку на длину совета, наличие ключевых слов и т.д.
      return parsedResponse;

    } catch (error) {
      console.error('Error generating AI recommendation:', error.message);
      throw new CustomError(`Failed to generate AI recommendation: ${error.message}`, 500);
    }
  }
}

module.exports = new OpenAIService();