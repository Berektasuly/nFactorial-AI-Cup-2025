// src/services/chartService.js
const gradeService = require('./gradeService');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для подготовки данных для графиков успеваемости.
 * Не генерирует сами графики, только структурированные данные.
 */
class ChartService {
  /**
   * Получает данные для графика динамики оценок по предметам для конкретного ученика.
   * @param {string} studentId - ID ученика.
   * @returns {Promise<Object>} Объект с данными для графика (labels, datasets).
   * @throws {CustomError} Если произошла ошибка.
   */
  async getGradeDynamicsChartData(studentId) {
    const grades = await gradeService.getGradesByStudentId(studentId);

    if (!grades || grades.length === 0) {
      return {
        labels: [],
        datasets: [],
        message: "No grade data available for this student to generate charts."
      };
    }

    // Группируем оценки по предметам
    const gradesBySubject = {};
    grades.forEach(grade => {
      if (!gradesBySubject[grade.subject]) {
        gradesBySubject[grade.subject] = [];
      }
      gradesBySubject[grade.subject].push(grade);
    });

    const datasets = [];
    let allDates = new Set(); // Для сбора всех уникальных дат

    for (const subject in gradesBySubject) {
      // Сортируем оценки по дате для правильной динамики
      const sortedGrades = gradesBySubject[subject].sort((a, b) => new Date(a.grade_date) - new Date(b.grade_date));

      const dataPoints = sortedGrades.map(grade => {
        allDates.add(grade.grade_date); // Собираем даты
        return { x: grade.grade_date, y: grade.score };
      });

      datasets.push({
        label: subject,
        data: dataPoints,
        // Дополнительные свойства для визуализации (цвет, тип линии и т.д.) могут быть добавлены здесь
        // Например, backgroundColor: 'rgba(255, 99, 132, 0.5)', borderColor: 'rgb(255, 99, 132)'
      });
    }

    // Сортируем и форматируем все уникальные даты для labels
    const labels = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    // Для простоты, здесь мы предполагаем, что фронтенд может обработать данные в формате { x: date, y: score }
    // Если фронтенд требует, чтобы все datasets имели одинаковый набор меток,
    // необходимо будет интерполировать или заполнять пропущенные значения.
    // Для MVP текущий формат более гибкий.

    return {
      labels, // Общий набор дат для оси X, может быть неполным для каждого предмета
      datasets,
      chartType: 'line', // Предлагаемый тип графика
      title: `Динамика успеваемости ученика ${studentId}`
    };
  }

  /**
   * Получает данные для графика сравнения среднего балла учеников в классе.
   * @param {string} className - Название класса.
   * @returns {Promise<Object>} Объект с данными для графика (labels, datasets).
   * @throws {CustomError} Если произошла ошибка.
   */
  async getClassComparisonChartData(className) {
    const comparisonData = await gradeService.compareClassPerformance(className);

    if (!comparisonData || comparisonData.length === 0) {
      return {
        labels: [],
        datasets: [],
        message: `No students or grade data available for class "${className}" to generate comparison charts.`
      };
    }

    const labels = comparisonData.map(d => d.studentName);
    const data = comparisonData.map(d => d.averageScore);

    const datasets = [
      {
        label: 'Средний балл',
        data: data,
        // backgroundColor: 'rgba(54, 162, 235, 0.5)', // Пример цвета
        // borderColor: 'rgb(54, 162, 235)',
        // borderWidth: 1
      }
    ];

    return {
      labels,
      datasets,
      chartType: 'bar', // Предлагаемый тип графика
      title: `Сравнение среднего балла в классе ${className}`
    };
  }
}

module.exports = new ChartService();