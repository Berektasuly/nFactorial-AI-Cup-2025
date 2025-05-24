// src/utils/validators.js
/**
 * Вспомогательные функции для валидации входных данных.
 * Для MVP используем простые проверки. В продакшене лучше использовать библиотеки вроде Joi или Yup.
 */
const CustomError = require('./CustomError'); // <-- Убедитесь, что импорт такой

const validators = {
  /**
   * Валидирует ID UUID формата.
   * @param {string} id - ID для валидации.
   * @param {string} paramName - Имя параметра для сообщения об ошибке.
   * @throws {CustomError} Если ID не является валидным UUID.
   */
  validateUUID(id, paramName = 'ID') {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!id || !uuidRegex.test(id)) {
      throw new CustomError(`Invalid ${paramName} format. Must be a valid UUID.`, 400);
    }
  },

  /**
   * Валидирует, что все обязательные поля присутствуют в объекте.
   * @param {Object} data - Объект данных для проверки.
   * @param {string[]} requiredFields - Массив имен обязательных полей.
   * @throws {CustomError} Если какое-либо обязательное поле отсутствует.
   */
  validateRequiredFields(data, requiredFields) {
    const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0); // Проверяем также на 0, так как 0 - валидное значение
    if (missingFields.length > 0) {
      throw new CustomError(`Missing required fields: ${missingFields.join(', ')}`, 400);
    }
  },

  /**
   * Валидирует оценку (score) в диапазоне от 0 до 100.
   * @param {number} score - Оценка для валидации.
   * @throws {CustomError} Если оценка не в диапазоне.
   */
  validateScore(score) {
    if (typeof score !== 'number' || score < 0 || score > 100) {
      throw new CustomError('Score must be a number between 0 and 100.', 400);
    }
  },

  /**
   * Валидирует дату в формате YYYY-MM-DD.
   * @param {string} dateString - Строка с датой.
   * @param {string} paramName - Имя параметра для сообщения об ошибке.
   * @throws {CustomError} Если дата не в правильном формате.
   */
  validateDate(dateString, paramName = 'Date') {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString || !dateRegex.test(dateString) || isNaN(new Date(dateString).getTime())) {
      throw new CustomError(`Invalid ${paramName} format. Must be YYYY-MM-DD.`, 400);
    }
  }
};

module.exports = validators;