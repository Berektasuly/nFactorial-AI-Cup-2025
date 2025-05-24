// src/config/index.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  auth: {
    secretKey: process.env.AUTH_SECRET_KEY, // Простой ключ для MVP заглушки
  },
  // Дополнительные конфигурации, если понадобятся (например, для логирования, кэширования и т.д.)
};

// Проверка наличия критически важных переменных окружения
if (!config.supabase.url || !config.supabase.anonKey) {
  console.error('CRITICAL ERROR: Supabase URL or Anon Key is not defined in .env');
  process.exit(1); // Завершаем процесс, так как без БД приложение не будет работать
}

if (!config.openai.apiKey) {
  console.warn('WARNING: OpenAI API Key is not defined in .env. AI features might not work.');
}

if (!config.auth.secretKey) {
  console.warn('WARNING: AUTH_SECRET_KEY is not defined in .env. Auth middleware might not work as expected.');
}


module.exports = config;