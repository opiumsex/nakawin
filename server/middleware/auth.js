const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    if (req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { requireAuth, optionalAuth };