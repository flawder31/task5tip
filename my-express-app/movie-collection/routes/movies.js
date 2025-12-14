const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const validateMovie = require('../middleware/validateMovie');

// GET /api/movies - Все фильмы с query параметрами
router.get('/', (req, res) => {
  const { genre, year, minRating, sortBy } = req.query;
  movieController.getAllMovies(req, res, { genre, year, minRating, sortBy });
});

// GET /api/movies/:id - Фильм по ID
router.get('/:id', movieController.getMovieById);

// POST /api/movies - Добавить фильм (с middleware валидации)
router.post('/', validateMovie, movieController.createMovie);

// PUT /api/movies/:id - Обновить фильм
router.put('/:id', validateMovie, movieController.updateMovie);

// DELETE /api/movies/:id - Удалить фильм
router.delete('/:id', movieController.deleteMovie);

// GET /api/movies/search/:title - Поиск по названию
router.get('/search/:title', movieController.searchMovies);

// GET /api/movies/stats/rating - Статистика по рейтингу
router.get('/stats/rating', movieController.getRatingStats);

module.exports = router;