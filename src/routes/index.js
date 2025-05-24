// src/routes/index.js
const express = require('express');
const studentsRoutes = require('./studentsRoutes');
const gradesRoutes = require('./gradesRoutes');
const eventsRoutes = require('./eventsRoutes');
const secretSantaRoutes = require('./secretSantaRoutes');
const entRoutes = require('./entRoutes');
const chartsRoutes = require('./chartsRoutes');
const recommendationsRoutes = require('./recommendationsRoutes');
const openaiRoutes = require('./openaiRoutes');
const agentRoutes = require('./agentRoutes'); // Добавляем маршруты агента

const router = express.Router();

// Агрегируем все маршруты
router.use('/students', studentsRoutes);
router.use('/grades', gradesRoutes);
router.use('/events', eventsRoutes);
router.use('/secret-santa', secretSantaRoutes);
router.use('/ent', entRoutes);
router.use('/charts', chartsRoutes);
router.use('/recommendations', recommendationsRoutes);
router.use('/openai', openaiRoutes);
router.use('/agent', agentRoutes); // Подключаем маршруты агента

module.exports = router;