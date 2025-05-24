// src/utils/CustomError.js
/**
 * Кастомный класс ошибки для стандартизированной обработки HTTP-ошибок.
 * Позволяет передавать HTTP статус-код вместе с сообщением об ошибке.
 */
class CustomError extends Error {
  /**
   * @param {string} message - Сообщение об ошибке.
   * @param {number} [statusCode=500] - HTTP статус-код ошибки.
   */
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name; // Имя ошибки (CustomError)
    this.statusCode = statusCode;      // HTTP статус-код
    // Захватываем стек вызовов, чтобы получить информацию о месте возникновения ошибки
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;