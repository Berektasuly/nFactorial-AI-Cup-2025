// src/utils/authMiddleware.js
const config = require('../config');
const CustomError = require('./CustomError'); // <-- Изменено: теперь импортируем из отдельного файла

/**
 * Простейшая заглушка для аутентификации.
 * Для MVP просто проверяет наличие предопределенного токена в заголовке Authorization.
 * В реальном приложении здесь будет полноценная JWT, OAuth2 или другая система аутентификации.
 * @param {Object} req - Объект запроса Express.
 * @param {Object} res - Объект ответа Express.
 * @param {Function} next - Функция для передачи управления следующему middleware.
 */
const authMiddleware = (req, res, next) => {
  // Получаем токен из заголовка Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new CustomError('Authorization token is missing or malformed', 401));
  }

  const token = authHeader.split(' ')[1];

  // Для MVP, просто сравниваем с предопределенным секретным ключом
  if (token === config.auth.secretKey) {
    // В реальном приложении здесь будет логика по проверке JWT токена
    // или сессии, и добавление данных пользователя в req.user
    req.user = { id: 'auth-user-id', role: 'admin' }; // Пример данных пользователя для MVP
    next();
  } else {
    next(new CustomError('Invalid authorization token', 403));
  }
};

module.exports = authMiddleware;

// Удалите класс CustomError отсюда, он теперь в src/utils/CustomError.js
/*
class CustomError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
*/