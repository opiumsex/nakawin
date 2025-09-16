const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { logDeposit } = require('../utils/logger');

const confirmPayment = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // В реальном приложении здесь была бы проверка платежа
    // Для демонстрации просто добавляем 1000 монет
    const depositAmount = 1000;
    user.balance += depositAmount;

    // Создаем запись о транзакции
    const transaction = new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: depositAmount,
      description: 'Пополнение баланса через платежную систему',
      status: 'completed'
    });

    await Promise.all([user.save(), transaction.save()]);

    // Логирование
    logDeposit(user._id, depositAmount, user.username);

    res.json({
      success: true,
      message: 'Оплата подтверждена',
      newBalance: user.balance,
      depositAmount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepositInfo = (req, res) => {
  // Информация для пополнения счета
  res.json({
    cardNumber: 'XXXX XXXX XXXX XXXX',
    bankName: 'Example Bank',
    instructions: 'ОБЯЗАТЕЛЬНО В КОММЕНТАРИЯХ К ПЕРЕВОДУ УКАЖИТЕ СВОЙ НИК НА САЙТЕ',
    minAmount: 100,
    processingTime: '1-24 часа'
  });
};

module.exports = {
  confirmPayment,
  getPaymentHistory,
  getDepositInfo
};