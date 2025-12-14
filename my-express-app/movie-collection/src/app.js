// Устанавливаем кодировку для поддержки русского языка
process.env.NODE_ENV === 'development' && require('dotenv').config();

const express = require('express');
const path = require('path');
const loggerMiddleware = require('../middleware/loggerMiddleware');

// Импорт роутов
const movieRoutes = require('../routes/movies');
const apiRoutes = require('../routes/api');

const app = express();

// Настройка для корректной обработки русских символов
app.use(express.json({ type: 'application/json' }));
app.use(express.urlencoded({ 
  extended: true,
  type: 'application/x-www-form-urlencoded',
  charset: 'utf-8'
}));

// Middleware для логирования
app.use(loggerMiddleware);

// Статические файлы
app.use(express.static(path.join(__dirname, '../public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Устанавливаем заголовки для всех ответов
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Powered-By', 'Express');
  next();
});

// Основные маршруты
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/add', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/add-movie.html'));
});

// API маршруты
app.use('/api/movies', movieRoutes);
app.use('/api', apiRoutes);

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Маршрут не найден',
    message: `Запрошенный путь ${req.path} не существует`,
    timestamp: new Date().toISOString()
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: 'Что-то пошло не так. Пожалуйста, попробуйте позже.',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;