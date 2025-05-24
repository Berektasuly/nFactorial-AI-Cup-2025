// src/controllers/studentsController.js
const studentService = require('../services/studentService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для обработки запросов, связанных с учениками.
 */
class StudentsController {
  /**
   * Создает нового ученика.
   * POST /api/students
   */
  async createStudent(req, res, next) {
    try {
      const { name, class: studentClass, email } = req.body;
      validators.validateRequiredFields(req.body, ['name', 'class']);

      const newStudent = await studentService.createStudent({ name, class: studentClass, email });
      res.status(201).json(newStudent);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает ученика по ID.
   * GET /api/students/:id
   */
  async getStudentById(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Student ID');

      const student = await studentService.getStudentById(id);
      if (!student) {
        throw new CustomError('Student not found', 404);
      }
      res.status(200).json(student);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Получает всех учеников.
   * GET /api/students
   */
  async getAllStudents(req, res, next) {
    try {
      const students = await studentService.getAllStudents();
      res.status(200).json(students);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Обновляет данные ученика.
   * PUT /api/students/:id
   */
  async updateStudent(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Student ID');

      const { name, class: studentClass, email } = req.body;
      if (!name && !studentClass && !email) {
        throw new CustomError('No update data provided', 400);
      }

      const updatedStudent = await studentService.updateStudent(id, { name, class: studentClass, email });
      if (!updatedStudent) {
        throw new CustomError('Student not found or no changes applied', 404);
      }
      res.status(200).json(updatedStudent);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Удаляет ученика.
   * DELETE /api/students/:id
   */
  async deleteStudent(req, res, next) {
    try {
      const { id } = req.params;
      validators.validateUUID(id, 'Student ID');

      const success = await studentService.deleteStudent(id);
      if (!success) {
        throw new CustomError('Student not found or could not be deleted', 404);
      }
      res.status(204).send(); // No content
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentsController();