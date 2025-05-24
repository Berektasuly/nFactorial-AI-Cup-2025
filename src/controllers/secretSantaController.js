// src/controllers/secretSantaController.js
const secretSantaService = require('../services/secretSantaService');
const validators = require('../utils/validators');
const CustomError = require('../utils/CustomError');

/**
 * Контроллер для генерации пар "Тайного Санты".
 */
class SecretSantaController {
  /**
   * Генерирует пары для "Тайного Санты".
   * POST /api/secret-santa/generate
   */
  async generateSecretSantaPairs(req, res, next) {
    try {
      const { studentIds } = req.body;

      if (!Array.isArray(studentIds) || studentIds.length < 2) {
        throw new CustomError('Invalid input: "studentIds" must be an array of at least 2 student IDs.', 400);
      }

      // Валидация каждого ID как UUID
      studentIds.forEach(id => validators.validateUUID(id, 'Student ID in list'));

      const pairs = await secretSantaService.generatePairs(studentIds);
      res.status(200).json({ message: 'Secret Santa pairs generated successfully', pairs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SecretSantaController();