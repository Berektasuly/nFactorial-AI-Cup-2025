// src/services/secretSantaService.js
const studentService = require('./studentService');
const CustomError = require('../utils/CustomError');

/**
 * Сервис для генерации пар "Тайного Санты".
 */
class SecretSantaService {
  /**
   * Генерирует пары "даритель-получатель" для "Тайного Санты".
   * Каждый ученик должен подарить подарок и получить подарок.
   * Никто не дарит подарок себе.
   * @param {string[]} studentIds - Массив ID учеников, участвующих в игре.
   * @returns {Promise<Object[]>} Массив объектов { giver: string, receiver: string }.
   * @throws {CustomError} Если недостаточно учеников или не удалось сгенерировать пары.
   */
  async generatePairs(studentIds) {
    if (!studentIds || studentIds.length < 2) {
      throw new CustomError('At least 2 students are required for Secret Santa.', 400);
    }

    // Получаем имена учеников для более понятного вывода (опционально, но полезно для отладки)
    const students = [];
    for (const id of studentIds) {
        const student = await studentService.getStudentById(id);
        if (student) {
            students.push({ id: student.id, name: student.name });
        } else {
            console.warn(`Student with ID ${id} not found, skipping.`);
        }
    }

    if (students.length < 2) {
        throw new CustomError('Not enough valid students found to generate Secret Santa pairs.', 400);
    }

    const participants = [...students];
    const pairs = [];
    let attempts = 0;
    const MAX_ATTEMPTS = 10; // Предотвращаем бесконечный цикл для сложных случаев

    while (attempts < MAX_ATTEMPTS) {
      let shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
      let isValid = true;
      let currentPairs = [];

      for (let i = 0; i < participants.length; i++) {
        const giver = participants[i];
        let receiver = shuffledParticipants[i];

        // Если даритель и получатель совпадают, или получатель уже был получателем для кого-то в текущем цикле
        // и не является последним элементом (чтобы избежать тупиков в конце)
        if (giver.id === receiver.id ||
            (i === participants.length - 1 && giver.id === shuffledParticipants[0].id) // Закрытие цикла
           ) {
          isValid = false;
          break;
        }
        currentPairs.push({ giver: giver.id, receiver: receiver.id });
      }

      // Проверяем, что каждый ученик был получателем ровно один раз
      const receivedIds = new Set(currentPairs.map(p => p.receiver));
      if (isValid && receivedIds.size === participants.length) {
        // Дополнительная проверка на то, что никто не дарит себе
        const selfGifts = currentPairs.filter(p => p.giver === p.receiver);
        if (selfGifts.length === 0) {
            // Преобразуем ID обратно в объекты с именем для читаемости
            const finalPairs = currentPairs.map(pair => {
                const giverName = students.find(s => s.id === pair.giver)?.name || pair.giver;
                const receiverName = students.find(s => s.id === pair.receiver)?.name || pair.receiver;
                return { giverId: pair.giver, giverName: giverName, receiverId: pair.receiver, receiverName: receiverName };
            });
            return finalPairs;
        }
      }
      attempts++;
    }

    throw new CustomError('Could not generate Secret Santa pairs. Please try again or with different participants.', 500);
  }
}

module.exports = new SecretSantaService();