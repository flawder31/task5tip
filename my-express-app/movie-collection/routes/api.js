const express = require('express');
const router = express.Router();

// Информация об API
router.get('/', (req, res) => {
  res.json({
    api: 'Movie Collection API',
    version: '1.0.0',
    description: 'API для управления коллекцией фильмов',
    author: 'Express.js Student Project',
    endpoints: {
      movies: {
        getAll: 'GET /api/movies',
        getOne: 'GET /api/movies/:id',
        create: 'POST /api/movies',
        update: 'PUT /api/movies/:id',
        delete: 'DELETE /api/movies/:id',
        search: 'GET /api/movies/search/:title',
        stats: 'GET /api/movies/stats/rating'
      }
    },
    queryParameters: {
      genre: '?genre=драма',
      year: '?year=2020',
      minRating: '?minRating=7.5',
      sortBy: '?sortBy=rating'
    }
  });
});

// Проверка здоровья API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

module.exports = router;