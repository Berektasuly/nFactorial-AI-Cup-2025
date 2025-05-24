// src/routes/eventsRoutes.js
const express = require('express');
const eventsController = require('../controllers/eventsController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.route('/')
  .post(eventsController.createEvent) // Создать новое событие
  .get(eventsController.getAllEvents); // Получить все события

router.route('/:id')
  .get(eventsController.getEventById)    // Получить событие по ID
  .put(eventsController.updateEvent)     // Обновить событие по ID
  .delete(eventsController.deleteEvent); // Удалить событие по ID

module.exports = router;