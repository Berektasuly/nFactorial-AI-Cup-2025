// src/services/gradeService.js
const supabase = require('../config/supabase');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для управления оценками и их аналитикой.
 */
class GradeService {
  constructor() {
    this.tableName = 'grades';
  }

  /**
   * Добавляет новую оценку.
   * @param {Object} gradeData - Данные оценки (student_id, subject, topic, score, grade_date).
   * @returns {Promise<Object>} Созданная оценка.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async createGrade(gradeData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([gradeData])
      .select();

    if (error) {
      console.error('Supabase error (createGrade):', error.message);
      throw new CustomError(`Failed to create grade: ${error.message}`, 500);
    }
    return data[0];
  }

  /**
   * Получает оценку по ID.
   * @param {string} id - ID оценки.
   * @returns {Promise<Object|null>} Оценка или null, если не найдена.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getGradeById(id) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code === 'PGRST116') {
      return null;
    }
    if (error) {
      console.error('Supabase error (getGradeById):', error.message);
      throw new CustomError(`Failed to retrieve grade: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Получает все оценки для конкретного ученика.
   * @param {string} studentId - ID ученика.
   * @returns {Promise<Object[]>} Массив оценок.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getGradesByStudentId(studentId) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('student_id', studentId)
      .order('grade_date', { ascending: false });

    if (error) {
      console.error('Supabase error (getGradesByStudentId):', error.message);
      throw new CustomError(`Failed to retrieve grades for student ${studentId}: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Получает все оценки (для всех учеников).
   * @returns {Promise<Object[]>} Массив всех оценок.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getAllGrades() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('grade_date', { ascending: false });

    if (error) {
      console.error('Supabase error (getAllGrades):', error.message);
      throw new CustomError(`Failed to retrieve all grades: ${error.message}`, 500);
    }
    return data;
  }

  /**
   * Обновляет оценку.
   * @param {string} id - ID оценки.
   * @param {Object} updateData - Обновляемые данные оценки.
   * @returns {Promise<Object|null>} Обновленная оценка или null, если не найдена.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async updateGrade(id, updateData) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error (updateGrade):', error.message);
      throw new CustomError(`Failed to update grade: ${error.message}`, 500);
    }
    return data[0];
  }

  /**
   * Удаляет оценку.
   * @param {string} id - ID оценки.
   * @returns {Promise<boolean>} True, если оценка удалена.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async deleteGrade(id) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error (deleteGrade):', error.message);
      throw new CustomError(`Failed to delete grade: ${error.message}`, 500);
    }
    return true;
  }

  /**
   * Вычисляет средний балл ученика по всем предметам или по конкретному.
   * @param {string} studentId - ID ученика.
   * @param {string} [subject=null] - Название предмета (необязательно).
   * @returns {Promise<number>} Средний балл.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getAverageScore(studentId, subject = null) {
    let query = supabase
      .from(this.tableName)
      .select('score')
      .eq('student_id', studentId);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error (getAverageScore):', error.message);
      throw new CustomError(`Failed to get average score: ${error.message}`, 500);
    }

    if (!data || data.length === 0) {
      return 0; // Нет оценок
    }

    const totalScore = data.reduce((sum, grade) => sum + grade.score, 0);
    return totalScore / data.length;
  }

  /**
   * Получает динамику оценок ученика по предмету или в целом.
   * @param {string} studentId - ID ученика.
   * @param {string} [subject=null] - Предмет (необязательно).
   * @returns {Promise<Object[]>} Массив объектов с датой и баллом.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async getGradeDynamics(studentId, subject = null) {
    let query = supabase
      .from(this.tableName)
      .select('score, grade_date')
      .eq('student_id', studentId);

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query.order('grade_date', { ascending: true });

    if (error) {
      console.error('Supabase error (getGradeDynamics):', error.message);
      throw new CustomError(`Failed to get grade dynamics: ${error.message}`, 500);
    }

    return data;
  }

  /**
   * Анализ успеваемости ученика по предметам и темам.
   * Определяет слабые места.
   * @param {string} studentId - ID ученика.
   * @returns {Promise<Object>} Объект с аналитическими данными.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async analyzeStudentPerformance(studentId) {
    const grades = await this.getGradesByStudentId(studentId);
    if (grades.length === 0) {
      return { message: "No grades available for this student.", weakSubjects: [], weakTopics: [] };
    }

    const subjectScores = {}; // { subject: { total: 0, count: 0, grades: [] } }
    const topicScores = {};   // { subject_topic: { total: 0, count: 0, grades: [] } }

    grades.forEach(grade => {
      // По предметам
      if (!subjectScores[grade.subject]) {
        subjectScores[grade.subject] = { total: 0, count: 0, grades: [] };
      }
      subjectScores[grade.subject].total += grade.score;
      subjectScores[grade.subject].count++;
      subjectScores[grade.subject].grades.push(grade.score);

      // По темам
      const topicKey = `${grade.subject} - ${grade.topic}`;
      if (!topicScores[topicKey]) {
        topicScores[topicKey] = { total: 0, count: 0, grades: [] };
      }
      topicScores[topicKey].total += grade.score;
      topicScores[topicKey].count++;
      topicScores[topicKey].grades.push(grade.score);
    });

    const averageOverall = grades.reduce((sum, g) => sum + g.score, 0) / grades.length;
    const subjectsAverage = {};
    const weakSubjects = [];
    for (const subject in subjectScores) {
      const avg = subjectScores[subject].total / subjectScores[subject].count;
      subjectsAverage[subject] = parseFloat(avg.toFixed(2));
      // Определяем "слабые" предметы как те, что ниже общего среднего на 10% или ниже определенного порога.
      // Порог можно настраивать.
      if (avg < 70 || avg < averageOverall * 0.9) {
        weakSubjects.push({ subject, average: avg, details: subjectScores[subject].grades });
      }
    }

    const weakTopics = [];
    for (const topicKey in topicScores) {
      const avg = topicScores[topicKey].total / topicScores[topicKey].count;
      const [subject, topic] = topicKey.split(' - ');
      // Аналогично, темы ниже порога.
      if (avg < 60) { // Более строгий порог для тем
        weakTopics.push({ subject, topic, average: avg, details: topicScores[topicKey].grades });
      }
    }

    return {
      averageOverall: parseFloat(averageOverall.toFixed(2)),
      subjectsAverage,
      weakSubjects: weakSubjects.sort((a, b) => a.average - b.average), // Сортируем по возрастанию среднего балла
      weakTopics: weakTopics.sort((a, b) => a.average - b.average),
      gradeCount: grades.length
    };
  }

  /**
   * Сравнение успеваемости учеников класса.
   * @param {string} className - Название класса.
   * @returns {Promise<Object[]>} Массив объектов с именем ученика и его средним баллом.
   * @throws {CustomError} Если произошла ошибка БД.
   */
  async compareClassPerformance(className) {
    // В Supabase прямой JOIN между grades и students по классу не очень удобен без views или функций.
    // Выполним это в два этапа: сначала получим учеников, затем их оценки.
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('id, name')
      .eq('class', className);

    if (studentError) {
      console.error('Supabase error (compareClassPerformance - students):', studentError.message);
      throw new CustomError(`Failed to retrieve students for class comparison: ${studentError.message}`, 500);
    }

    if (!students || students.length === 0) {
      return []; // Нет учеников в классе
    }

    const comparisonData = [];
    for (const student of students) {
      const averageScore = await this.getAverageScore(student.id);
      comparisonData.push({
        studentId: student.id,
        studentName: student.name,
        averageScore: parseFloat(averageScore.toFixed(2))
      });
    }

    // Сортируем по среднему баллу (от лучшего к худшему)
    return comparisonData.sort((a, b) => b.averageScore - a.averageScore);
  }
}

module.exports = new GradeService();