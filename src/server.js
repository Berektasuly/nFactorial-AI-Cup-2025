// src/server.js
const app = require('./app');
const config = require('./config'); // Импортируем объект конфигурации

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 AI Schoolmate Backend запущен на порту ${PORT}`);
  console.log(`🌐 Документация Swagger доступна по адресу: http://localhost:${PORT}/api-docs`);
});