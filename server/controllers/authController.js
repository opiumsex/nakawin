const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { logDeposit } = require('../utils/logger');

const register = async (req, res) => {
  try {
    const { username, gameNickname, server, bankAccount, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      gameNickname,
      server,
      bankAccount,
      password: hashedPassword
    });

    await user.save();

    req.session.userId = user._id;
    req.session.username = user.username;

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверное имя пользователя или пароль' });
    }

    user.lastLogin = new Date();
    await user.save();

    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Вход выполнен успешно',
      user: {
        id: user._id,
        username: user.username,
        balance: user.balance
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при выходе' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Выход выполнен успешно' });
  });
};

const getAuthStatus = (req, res) => {
  if (req.session.userId) {
    res.json({ 
      authenticated: true, 
      user: { 
        id: req.session.userId, 
        username: req.session.username 
      } 
    });
  } else {
    res.json({ authenticated: false });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
      .select('-password')
      .populate('inventory.itemId');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  getAuthStatus,
  getProfile
};