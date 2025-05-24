// src/controllers/eventsController.js
const eventService = require('../services/eventService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для обработки запросов, связанных с событиями (олимпиадами).
 */
class EventsController {
  /**
   * Создает новое событие.
   * POST /api/events
   */
  async createEvent(req, res, next) {
    try {
      const { title, description, event_date, type, location, invitation_link } = req.body;
      validators.validateRequiredFields(req.body, ['title', 'event_date', 'type']);
      validators.validateDate(event_date, 'Event Date');

      const newEvent = await eventService.createEvent({ title, description, event_date, type, location, invitation_link });
      res.status(201).json(newEvent);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает событие по ID.
   * GET /api/events/:id
   */
  async getEventById(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Event ID');

      const event = await eventService.getEventById(id);
      if (!event) {
        throw new CustomError('Event not found', 404);
      }
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает все события.
   * GET /api/events
   * Можно фильтровать по типу, дате.
   */
  async getAllEvents(req, res, next) {
    try {
      const filters = req.query; // Фильтры из query параметров (e.g., ?type=Olympiad&startDate=2024-01-01)
      const events = await eventService.getAllEvents(filters);
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновляет данные события.
   * PUT /api/events/:id
   */
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Event ID');

      const { title, description, event_date, type, location, invitation_link } = req.body;
      if (!title && !description && !event_date && !type && !location && !invitation_link) {
        throw new CustomError('No update data provided', 400);
      }
      if (event_date) validators.validateDate(event_date, 'Event Date');

      const updatedEvent = await eventService.updateEvent(id, { title, description, event_date, type, location, invitation_link });
      if (!updatedEvent) {
        throw new CustomError('Event not found or no changes applied', 404);
      }
      res.status(200).json(updatedEvent);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Удаляет событие.
   * DELETE /api/events/:id
   */
  async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Event ID');

      const success = await eventService.deleteEvent(id);
      if (!success) {
        throw new CustomError('Event not found or could not be deleted', 404);
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EventsController();