// src/services/agentService.js
const openAIService = require('./openAIService');
const gradeService = require('./gradeService');
const eventService = require('./eventService');
const recommendationService = require('./recommendationService');
const CustomError = require('../utils/CustomError');

/**
 * Агентный концепт "AI Schoolmate".
 * Этот сервис выступает в роли высокоуровневого оркестратора.
 * Он использует OpenAI для интерпретации запросов пользователя
 * и динамического вызова соответствующих внутренних сервисов ("инструментов").
 *
 * Принципы Anthropic:
 * 1. Безопасность: Агент не принимает и не выполняет запросы, которые могут привести к вреду.
 * 2. Контроль: Пользователь и система сохраняют контроль, агент лишь предлагает действия.
 * 3. Прозрачность: Результаты AI-вызовов должны быть четкими. Если AI выбирает инструмент, это подразумевается.
 * 4. Помощь без вреда: Все действия агента направлены на помощь ученику или учителю.
 */
class AgentService {
  constructor() {
    this.tools = [
      {
        type: "function",
        function: {
          name: "getStudentGradesAndAnalysis",
          description: "Получает оценки и аналитику успеваемости для конкретного ученика. Используйте для вопросов о баллах, прогрессе, слабых и сильных сторонах.",
          parameters: {
            type: "object",
            properties: {
              studentId: {
                type: "string",
                description: "UUID идентификатор ученика."
              }
            },
            required: ["studentId"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getUpcomingEvents",
          description: "Получает список предстоящих школьных событий или олимпиад. Используйте для вопросов о предстоящих мероприятиях, конкурсах, олимпиадах.",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                description: "Тип события (например, 'Olympiad', 'Competition', 'School Event'). Необязательно."
              }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "getAIBasedRecommendations",
          description: "Генерирует персонализированные AI-советы по улучшению успеваемости для конкретного ученика. Используйте, когда пользователь просит советы по учебе, слабым темам, улучшению оценок.",
          parameters: {
            type: "object",
            properties: {
              studentId: {
                type: "string",
                description: "UUID идентификатор ученика."
              }
            },
            required: ["studentId"]
          }
        }
      },
      // Можно добавить другие инструменты:
      // {
      //   type: "function",
      //   function: {
      //     name: "getENTPrediction",
      //     description: "Прогнозирует итоговый балл ЕНТ на основе последних пробных результатов ученика.",
      //     parameters: {
      //       type: "object",
      //       properties: {
      //         studentId: { type: "string", description: "UUID идентификатор ученика." }
      //       },
      //       required: ["studentId"]
      //     }
      //   }
      // }
    ];
  }

  /**
   * Обрабатывает высокоуровневый запрос пользователя, используя AI для выбора и вызова инструментов.
   * @param {string} query - Запрос пользователя на естественном языке.
   * @param {string} [studentId] - ID ученика, если запрос относится к конкретному ученику.
   * @returns {Promise<string>} Отформатированный ответ от агента.
   */
  async processQuery(query, studentId = null) {
    // Начальный запрос к AI для определения намерений и инструментов
    const initialPrompt = `Пользователь задал вопрос: "${query}".
    ${studentId ? `ID ученика: ${studentId}. ` : ''}
    Основываясь на этом, определи, какой инструмент нужно использовать и с какими параметрами.
    Если для ответа требуется информация о конкретном ученике, убедись, что 'studentId' передан и валиден.
    Если никакой инструмент не подходит, дай общий ответ.
    `;

    // Принципы Anthropic: Контроль - мы явно описываем AI, что он может делать.
    const responseMessage = await openAIService.callWithTools(initialPrompt, this.tools);

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCalls = responseMessage.tool_calls;
      let finalResult = '';

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments);

        // Принципы Anthropic: Безопасность - здесь можно добавить проверку аргументов
        // чтобы избежать передачи невалидных или вредоносных данных в сервисы.
        if (functionArgs.studentId && studentId && functionArgs.studentId !== studentId) {
            // Если AI пытается использовать studentId, отличный от переданного, это подозрительно
            console.warn(`AI tried to use studentId ${functionArgs.studentId} but query was for ${studentId}. Using provided studentId.`);
            functionArgs.studentId = studentId; // Принудительно используем переданный studentId
        } else if (functionArgs.studentId && !studentId) {
            // Если AI запрашивает studentId, но пользователь не предоставил его
            return `Мне нужен ID ученика, чтобы ответить на этот вопрос. Пожалуйста, укажите его.`;
        } else if (!functionArgs.studentId && studentId) {
            // Если studentId есть, но AI его не использовал, добавляем
            functionArgs.studentId = studentId;
        }

        let toolOutput;
        try {
          switch (functionName) {
            case 'getStudentGradesAndAnalysis':
              toolOutput = await gradeService.analyzeStudentPerformance(functionArgs.studentId);
              finalResult += `\n### Анализ успеваемости:\n`;
              if (toolOutput.message) {
                finalResult += toolOutput.message;
              } else {
                finalResult += `Общий средний балл: ${toolOutput.averageOverall.toFixed(2)}. \n`;
                if (toolOutput.weakSubjects.length > 0) {
                  finalResult += `Слабые предметы: ${toolOutput.weakSubjects.map(s => `${s.subject} (средний: ${s.average.toFixed(2)})`).join(', ')}. \n`;
                }
                if (toolOutput.weakTopics.length > 0) {
                  finalResult += `Слабые темы: ${toolOutput.weakTopics.map(t => `${t.topic} по ${t.subject} (средний: ${t.average.toFixed(2)})`).join(', ')}. \n`;
                }
                finalResult += `Всего оценок: ${toolOutput.gradeCount}.`;
              }
              break;
            case 'getUpcomingEvents':
              toolOutput = await eventService.getAllEvents(functionArgs);
              if (toolOutput.length > 0) {
                finalResult += `\n### Предстоящие события/олимпиады:\n`;
                toolOutput.forEach(event => {
                  finalResult += `- **${event.title}** (${event.type}) ${event.event_date} в ${event.location || 'не указано'}. Подробнее: ${event.invitation_link || 'нет ссылки'}\n`;
                });
              } else {
                finalResult += '\nНет предстоящих событий или олимпиад, соответствующих вашему запросу.\n';
              }
              break;
            case 'getAIBasedRecommendations':
                toolOutput = await recommendationService.getAIBasedRecommendations(functionArgs.studentId);
                finalResult += `\n### AI-рекомендация для улучшения успеваемости:\n`;
                finalResult += `**Предмет:** ${toolOutput.subject || 'Общий'}\n`;
                finalResult += `**Тема:** ${toolOutput.topic || 'Общая'}\n`;
                finalResult += `**Совет:** ${toolOutput.advice}\n`;
                finalResult += `**Предложение по визуализации:** ${toolOutput.visual_suggestion}\n`;
                break;
            // case 'getENTPrediction':
            //     toolOutput = await entPredictionService.getLatestENTResultAndPrediction(functionArgs.studentId);
            //     if (toolOutput) {
            //         finalResult += `\n### Прогноз ЕНТ:\n`;
            //         finalResult += `Ваш последний результат пробного ЕНТ (${toolOutput.test_date}): ${toolOutput.total_score} баллов.\n`;
            //         finalResult += `Прогнозируемый итоговый балл: ${toolOutput.predicted_score} баллов.\n`;
            //     } else {
            //         finalResult += '\nНет доступных результатов пробного ЕНТ для прогнозирования.\n';
            //     }
            //     break;
            default:
              finalResult += `\nНеизвестный инструмент: ${functionName}\n`;
          }
        } catch (toolError) {
          console.error(`Error executing tool ${functionName}:`, toolError.message);
          finalResult += `\nОшибка при получении данных для "${functionName}": ${toolError.message}\n`;
        }
      }

      // Отправляем результат выполнения инструментов обратно в AI для синтеза и форматирования
      // Принципы Anthropic: Прозрачность - AI обобщает информацию
      const synthesisPrompt = `Пользователь задал: "${query}". Я выполнил следующие операции и получил результаты:
      ${finalResult}
      Пожалуйста, синтезируй эти результаты в связный, дружелюбный и полезный ответ для школьника.
      Если есть слабая тема, предложи конкретные шаги. Если есть олимпиады, кратко опиши их.
      Ответь на русском языке.
      `;
      const finalAnswer = await openAIService.getChatCompletion(synthesisPrompt);
      return finalAnswer;

    } else {
      // Если AI не выбрал никакой инструмент, просто возвращаем его текстовый ответ на запрос
      const generalAnswer = await openAIService.getChatCompletion(query);
      return generalAnswer;
    }
  }
}

module.exports = new AgentService();