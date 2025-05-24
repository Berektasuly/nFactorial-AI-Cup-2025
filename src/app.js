// src/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
// const YAML = require('yamljs'); // <-- УДАЛИТЕ ЭТУ СТРОКУ

const config = require('./config');
const allRoutes = require('./routes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware для CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware для парсинга JSON-тела запроса
app.use(express.json());

// Загрузка Swagger документации
// Использование require для JSON файлов - это стандартный способ в Node.js
const swaggerDocument = require('../swagger.json'); // <-- ИЗМЕНИТЕ ЭТУ СТРОКУ
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Основные маршруты API
app.use('/api', allRoutes);

// Тестовый маршрут для проверки работы сервера
app.get('/', (req, res) => {
  res.send('Welcome to AI Schoolmate Backend API! Visit /api-docs for API documentation.');
});

// Middleware для обработки несуществующих маршрутов (404 Not Found)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Централизованный обработчик ошибок
app.use(errorHandler);

module.exports = app;