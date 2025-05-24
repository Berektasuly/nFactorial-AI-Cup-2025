// src/config/openai.js
const { OpenAI } = require('openai');
const config = require('./index');

let openaiClient;

try {
  if (!config.openai.apiKey) {
    throw new Error('OpenAI API Key is missing. Please set OPENAI_API_KEY in your .env file.');
  }
  openaiClient = new OpenAI({
    apiKey: config.openai.apiKey,
  });
  console.log('🔗 OpenAI client initialized.');
} catch (error) {
  console.error(`🚨 Error initializing OpenAI client: ${error.message}`);
  // В продакшене можно рассмотреть graceful degradation или завершение приложения,
  // если OpenAI критически важен. Для MVP просто логируем.
}

module.exports = openaiClient;