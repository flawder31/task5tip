// Middleware для валидации данных фильма
const validateMovie = (req, res, next) => {
  const { title, director, year, genre, rating } = req.body;
  const errors = [];
  
  // Проверка названия
  if (!title || title.trim().length < 1) {
    errors.push('Название фильма обязательно');
  } else if (title.length > 100) {
    errors.push('Название фильма не должно превышать 100 символов');
  }
  
  // Проверка режиссера
  if (!director || director.trim().length < 1) {
    errors.push('Имя режиссера обязательно');
  }
  
  // Проверка года
  if (!year) {
    errors.push('Год выпуска обязателен');
  } else if (isNaN(year) || year < 1888 || year > new Date().getFullYear() + 5) {
    errors.push('Некорректный год выпуска');
  }
  
  // Проверка жанра
  if (!genre || genre.trim().length < 1) {
    errors.push('Жанр обязателен');
  }
  
  // Проверка рейтинга
  if (!rating && rating !== 0) {
    errors.push('Рейтинг обязателен');
  } else if (isNaN(rating) || rating < 0 || rating > 10) {
    errors.push('Рейтинг должен быть от 0 до 10');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Ошибка валидации',
      messages: errors,
      receivedData: req.body
    });
  }
  
  // Очистка данных
  req.body.title = title.trim();
  req.body.director = director.trim();
  req.body.genre = genre.trim();
  req.body.year = parseInt(year);
  req.body.rating = parseFloat(rating);
  
  if (req.body.description) {
    req.body.description = req.body.description.trim();
  }
  
  next();
};

module.exports = validateMovie;