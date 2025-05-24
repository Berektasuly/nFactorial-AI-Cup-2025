// src/services/studentService.js
const supabase = require('../config/supabase');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для управления данными учеников (CRUD).
 */
class StudentService {
  constructor() {
    this.tableName = 'students';
  }

  /**
   * Создает нового ученика.
   * @param {Object} studentData - Данные ученика (name, class, email).
   * @returns {Promise<Object>} Созданный ученик.
   * @throws {CustomError} Если произошла ошибка БД или валидации.
   */
  async createStudent(studentData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([studentData])
      .select();

    if (error) {
      console.error('Supabase error (createStudent):', error.message);
      throw new CustomError(`Failed to create student: ${error.message}`, 500);
    }
    return data[0];
  }

  /**
   * Получает ученика по ID.
   * @param {string} id - ID ученика.
   * @returns {Promise<Object|null>} Ученик или null, если не найден.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getStudentById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single(); // Ожидаем одну запись

    if (error && error.code === 'PGRST116') { // 406: No rows found
      return null;
    }
    if (error) {
      console.error('Supabase error (getStudentById):', error.message);
      throw new CustomError(`Failed to retrieve student: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Получает всех учеников.
   * @returns {Promise<Object[]>} Массив учеников.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getAllStudents() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('name', { ascending: true }); // Сортировка по имени для удобства

    if (error) {
      console.error('Supabase error (getAllStudents):', error.message);
      throw new CustomError(`Failed to retrieve students: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Обновляет данные ученика.
   * @param {string} id - ID ученика.
   * @param {Object} updateData - Обновляемые данные.
   * @returns {Promise<Object|null>} Обновленный ученик или null, если не найден.
   * @throws {CustomError} Если произошла ошибка БД или валидации.
   */
  async updateStudent(id, updateData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error (updateStudent):', error.message);
      throw new CustomError(`Failed to update student: ${error.message}`, 500);
    }
    return data[0]; // Возвращаем обновленную запись, если она есть
  }

  /**
   * Удаляет ученика по ID.
   * @param {string} id - ID ученика.
   * @returns {Promise<boolean>} True, если ученик удален.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async deleteStudent(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error (deleteStudent):', error.message);
      throw new CustomError(`Failed to delete student: ${error.message}`, 500);
    }
    return true; // Supabase не возвращает удаленную запись, только информацию об ошибке
  }

  /**
   * Получает учеников по классу.
   * @param {string} className - Название класса.
   * @returns {Promise<Object[]>} Массив учеников класса.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getStudentsByClass(className) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('class', className)
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase error (getStudentsByClass):', error.message);
      throw new CustomError(`Failed to retrieve students for class ${className}: ${error.message}`, 500);
    }
    return data;
  }
}

module.exports = new StudentService();