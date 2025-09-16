const validateRegistration = (req, res, next) => {
  const { username, gameNickname, server, bankAccount, password } = req.body;

  if (!username || !gameNickname || !server || !bankAccount || !password) {
    return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Имя пользователя должно быть от 3 до 20 символов' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Имя пользователя и пароль обязательны' });
  }

  next();
};

module.exports = { validateRegistration, validateLogin };