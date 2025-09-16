const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Ошибка валидации', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }

  if (err.name === 'MongoError' && err.code === 11000) {
    return res.status(400).json({ 
      message: 'Пользователь с таким именем уже существует' 
    });
  }

  res.status(500).json({ 
    message: 'Внутренняя ошибка сервера' 
  });
};

module.exports = errorHandler;