const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/movies.json');

// Чтение данных из файла
const readMovies = async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Если файла нет, создаем пустой массив
    if (error.code === 'ENOENT') {
      await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
      return [];
    }
    throw error;
  }
};

// Запись данных в файл
const writeMovies = async (movies) => {
  await fs.writeFile(DATA_FILE, JSON.stringify(movies, null, 2), 'utf8');
};

// Контроллер для получения всех фильмов
const getAllMovies = async (req, res, filters = {}) => {
  try {
    let movies = await readMovies();
    
    // Фильтрация по query параметрам
    if (filters.genre) {
      movies = movies.filter(movie => 
        movie.genre.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }
    
    if (filters.year) {
      movies = movies.filter(movie => movie.year == filters.year);
    }
    
    if (filters.minRating) {
      movies = movies.filter(movie => movie.rating >= parseFloat(filters.minRating));
    }
    
    // Сортировка
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'year':
          movies.sort((a, b) => b.year - a.year);
          break;
        case 'rating':
          movies.sort((a, b) => b.rating - a.rating);
          break;
        case 'title':
          movies.sort((a, b) => a.title.localeCompare(b.title));
          break;
      }
    }
    
    res.json({
      success: true,
      count: movies.length,
      filters: filters,
      data: movies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении фильмов',
      message: error.message
    });
  }
};

// Получить фильм по ID
const getMovieById = async (req, res) => {
  try {
    const movies = await readMovies();
    const movie = movies.find(m => m.id === parseInt(req.params.id));
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Фильм не найден'
      });
    }
    
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении фильма',
      message: error.message
    });
  }
};

// Создать новый фильм
const createMovie = async (req, res) => {
  try {
    const movies = await readMovies();
    
    const newMovie = {
      id: movies.length > 0 ? Math.max(...movies.map(m => m.id)) + 1 : 1,
      title: req.body.title,
      director: req.body.director,
      year: parseInt(req.body.year),
      genre: req.body.genre,
      rating: parseFloat(req.body.rating),
      description: req.body.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    movies.push(newMovie);
    await writeMovies(movies);
    
    res.status(201).json({
      success: true,
      message: 'Фильм успешно добавлен',
      data: newMovie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при добавлении фильма',
      message: error.message
    });
  }
};

// Обновить фильм
const updateMovie = async (req, res) => {
  try {
    const movies = await readMovies();
    const index = movies.findIndex(m => m.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Фильм не найден'
      });
    }
    
    const updatedMovie = {
      ...movies[index],
      ...req.body,
      id: parseInt(req.params.id), // Защищаем ID от изменения
      updatedAt: new Date().toISOString()
    };
    
    movies[index] = updatedMovie;
    await writeMovies(movies);
    
    res.json({
      success: true,
      message: 'Фильм успешно обновлен',
      data: updatedMovie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении фильма',
      message: error.message
    });
  }
};

// Удалить фильм
const deleteMovie = async (req, res) => {
  try {
    const movies = await readMovies();
    const index = movies.findIndex(m => m.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Фильм не найден'
      });
    }
    
    const deletedMovie = movies.splice(index, 1)[0];
    await writeMovies(movies);
    
    res.json({
      success: true,
      message: 'Фильм успешно удален',
      data: deletedMovie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при удалении фильма',
      message: error.message
    });
  }
};

// Поиск фильмов по названию
const searchMovies = async (req, res) => {
  try {
    const movies = await readMovies();
    const searchTerm = req.params.title.toLowerCase();
    
    const filteredMovies = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchTerm)
    );
    
    res.json({
      success: true,
      count: filteredMovies.length,
      searchTerm: searchTerm,
      data: filteredMovies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при поиске фильмов',
      message: error.message
    });
  }
};

// Статистика по рейтингу
const getRatingStats = async (req, res) => {
  try {
    const movies = await readMovies();
    
    if (movies.length === 0) {
      return res.json({
        success: true,
        message: 'Нет фильмов для статистики',
        data: {}
      });
    }
    
    const ratings = movies.map(m => m.rating);
    const averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const maxRating = Math.max(...ratings);
    const minRating = Math.min(...ratings);
    
    const ratingDistribution = {
      '0-2': movies.filter(m => m.rating >= 0 && m.rating < 2).length,
      '2-4': movies.filter(m => m.rating >= 2 && m.rating < 4).length,
      '4-6': movies.filter(m => m.rating >= 4 && m.rating < 6).length,
      '6-8': movies.filter(m => m.rating >= 6 && m.rating < 8).length,
      '8-10': movies.filter(m => m.rating >= 8 && m.rating <= 10).length
    };
    
    res.json({
      success: true,
      data: {
        totalMovies: movies.length,
        averageRating: parseFloat(averageRating.toFixed(2)),
        maxRating: maxRating,
        minRating: minRating,
        ratingDistribution: ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Ошибка при получении статистики',
      message: error.message
    });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  getRatingStats
};