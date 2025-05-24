// src/config/supabase.js
const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

let supabase;

try {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Supabase URL or Anon Key is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  }
  supabase = createClient(config.supabase.url, config.supabase.anonKey);
  console.log('🔗 Supabase client initialized.');
} catch (error) {
  console.error(`🚨 Error initializing Supabase client: ${error.message}`);
  // В продакшене здесь также можно завершить приложение, если без БД работа невозможна.
}

module.exports = supabase;