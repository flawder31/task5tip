const app = require('./app');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

const server = app.listen(PORT, HOST, () => {
  console.log('='.repeat(60));
  console.log('🎬 Movie Collection Server');
  console.log('='.repeat(60));
  console.log(`🚀 Сервер запущен: http://${HOST}:${PORT}`);
  console.log(`📁 Окружение: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📝 API доступно по: http://${HOST}:${PORT}/api/movies`);
  console.log(`🌐 Статические файлы: http://${HOST}:${PORT}/`);
  console.log('='.repeat(60));
  console.log('\n📋 Доступные маршруты:');
  console.log(`   GET  /              - Главная страница`);
  console.log(`   GET  /add           - Добавить фильм`);
  console.log(`   GET  /api/movies    - Все фильмы`);
  console.log(`   GET  /api/movies/:id - Фильм по ID`);
  console.log(`   POST /api/movies    - Добавить фильм`);
  console.log(`   PUT  /api/movies/:id - Обновить фильм`);
  console.log(`   DELETE /api/movies/:id - Удалить фильм`);
  console.log('='.repeat(60));
});

// Обработка корректного завершения
process.on('SIGTERM', () => {
  console.log('SIGTERM получен. Завершение работы...');
  server.close(() => {
    console.log('Сервер остановлен');
    process.exit(0);
  });
});

module.exports = server;