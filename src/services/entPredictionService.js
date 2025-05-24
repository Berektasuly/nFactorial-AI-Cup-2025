// src/services/entPredictionService.js
const supabase = require('../config/supabase');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для управления результатами пробного ЕНТ и прогнозирования итогового балла.
 */
class ENTPredictionService {
  constructor() {
    this.tableName = 'ent_results';
  }

  /**
   * Сохраняет результаты пробного ЕНТ.
   * @param {Object} entResultData - Данные о результатах ЕНТ (student_id, math_score, physics_score, etc., total_score, test_date).
   * @returns {Promise<Object>} Сохраненный результат ЕНТ с прогнозом.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async recordENTResult(entResultData) {
    // В MVP, простейший прогноз: просто добавление небольшого бонуса
    // или более сложная линейная регрессия на основе исторических данных.
    // Здесь - простейший вариант:
    const predictedScore = this._predictFinalScore(entResultData.total_score);

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([{ ...entResultData, predicted_score: predictedScore }])
      .select();

    if (error) {
      console.error('Supabase error (recordENTResult):', error.message);
      throw new CustomError(`Failed to record ENT result: ${error.message}`, 500);
    }
    return data[0];
  }

  /**
   * Получает все результаты ЕНТ для ученика.
   * @param {string} studentId - ID ученика.
   * @returns {Promise<Object[]>} Массив результатов ЕНТ.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getENTResultsByStudentId(studentId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('student_id', studentId)
      .order('test_date', { ascending: false });

    if (error) {
      console.error('Supabase error (getENTResultsByStudentId):', error.message);
      throw new CustomError(`Failed to retrieve ENT results for student ${studentId}: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Получает последний результат ЕНТ и прогноз для ученика.
   * @param {string} studentId - ID ученика.
   * @returns {Promise<Object|null>} Последний результат ЕНТ с прогнозом или null.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getLatestENTResultAndPrediction(studentId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('student_id', studentId)
      .order('test_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) {
      console.error('Supabase error (getLatestENTResultAndPrediction):', error.message);
      throw new CustomError(`Failed to retrieve latest ENT result: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Простейшая функция прогнозирования.
   * В реальном мире здесь будет более сложная модель (ML-модель, исторические данные).
   * @param {number} currentScore - Текущий балл пробного ЕНТ.
   * @returns {number} Прогнозируемый итоговый балл.
   */
  _predictFinalScore(currentScore) {
    // Очень простая модель:
    // Допустим, ученики улучшают свой результат на 5-10% к итоговому ЕНТ
    const improvementFactor = 1.05 + Math.random() * 0.05; // 5% до 10% улучшения
    let predicted = Math.round(currentScore * improvementFactor);

    // Ограничиваем максимальный балл ЕНТ (например, 140)
    const MAX_ENT_SCORE = 140;
    if (predicted > MAX_ENT_SCORE) {
      predicted = MAX_ENT_SCORE;
    }

    return predicted;
  }
}

module.exports = new ENTPredictionService();