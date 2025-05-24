// src/routes/secretSantaRoutes.js
const express = require('express');
const secretSantaController = require('../controllers/secretSantaController');
const authMiddleware = require('../utils/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/generate', secretSantaController.generateSecretSantaPairs); // Генерировать пары Тайного Санты

module.exports = router;