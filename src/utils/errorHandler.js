// src/utils/errorHandler.js
/**
 * Централизованный обработчик ошибок для Express.
 * Логирует ошибку и отправляет соответствующий HTTP-ответ.
 * @param {Error} err - Объект ошибки.
 * @param {Object} req - Объект запроса Express.
 * @param {Object} res - Объект ответа Express.
 * @param {Function} next - Функция для передачи ошибки следующему middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Определяем статус код: если ошибка имеет свойство statusCode, используем его, иначе 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;

  // Логируем ошибку для отладки
  console.error(`🚨 Error: ${err.message}`);
  if (err.stack) {
    console.error(err.stack); // Полный стек для более детального анализа
  }

  // Отправляем ответ клиенту
  res.status(statusCode).json({
    message: err.message || 'An unexpected error occurred',
    // В режиме разработки (development) можно отправлять стек ошибок для отладки
    // В продакшене (production) стек ошибок не должен быть доступен клиенту по соображениям безопасности
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = errorHandler;