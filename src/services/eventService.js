// src/services/eventService.js
const supabase = require('../config/supabase');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для управления событиями (олимпиады, конкурсы и т.д.).
 */
class EventService {
  constructor() {
    this.tableName = 'events';
  }

  /**
   * Создает новое событие.
   * @param {Object} eventData - Данные события (title, description, event_date, type, location, invitation_link).
   * @returns {Promise<Object>} Созданное событие.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([eventData])
      .select();

    if (error) {
      console.error('Supabase error (createEvent):', error.message);
      throw new CustomError(`Failed to create event: ${error.message}`, 500);
    }
    return data[0];
  }

  /**
   * Получает событие по ID.
   * @param {string} id - ID события.
   * @returns {Promise<Object|null>} Событие или null, если не найдено.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getEventById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) {
      console.error('Supabase error (getEventById):', error.message);
      throw new CustomError(`Failed to retrieve event: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Получает все события.
   * @param {Object} [filters={}] - Необязательные фильтры (e.g., { type: 'Olympiad', startDate: '2024-01-01' }).
   * @returns {Promise<Object[]>} Массив событий.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getAllEvents(filters = {}) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .order('event_date', { ascending: true });

    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.startDate) {
      query = query.gte('event_date', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('event_date', filters.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error (getAllEvents):', error.message);
      throw new CustomError(`Failed to retrieve events: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Обновляет данные события.
   * @param {string} id - ID события.
   * @param {Object} updateData - Обновляемые данные.
   * @returns {Promise<Object|null>} Обновленное событие или null, если не найдено.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async updateEvent(id, updateData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error (updateEvent):', error.message);
      throw new CustomError(`Failed to update event: ${error.message}`, 500);
    }
    return data[0];
  }

  /**
   * Удаляет событие по ID.
   * @param {string} id - ID события.
   * @returns {Promise<boolean>} True, если событие удалено.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async deleteEvent(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error (deleteEvent):', error.message);
      throw new CustomError(`Failed to delete event: ${error.message}`, 500);
    }
    return true;
  }
}

module.exports = new EventService();