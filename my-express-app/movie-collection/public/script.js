/**
 * Movie Collection - Клиентский JavaScript
 */

// Глобальные переменные
let allMovies = [];
let filteredMovies = [];
let genres = [];
let years = [];

// Загрузка статистики
async function loadStats() {
    try {
        const response = await fetch('/api/movies/stats/rating');
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('total-movies').textContent = result.data.totalMovies || 0;
            document.getElementById('avg-rating').textContent = result.data.averageRating?.toFixed(1) || '0.0';
            
            // Находим последний год из фильмов
            const moviesResponse = await fetch('/api/movies');
            const moviesResult = await moviesResponse.json();
            
            if (moviesResult.success && moviesResult.data.length > 0) {
                const latestYear = Math.max(...moviesResult.data.map(m => m.year));
                document.getElementById('latest-year').textContent = latestYear;
                
                // Подсчитываем уникальные жанры
                const uniqueGenres = [...new Set(moviesResult.data.map(m => m.genre))];
                document.getElementById('total-genres').textContent = uniqueGenres.length;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// Загрузка всех фильмов
async function loadMovies() {
    const loadingEl = document.getElementById('loading');
    const noMoviesEl = document.getElementById('no-movies');
    const moviesContainer = document.getElementById('movies-container');
    
    loadingEl.style.display = 'block';
    moviesContainer.innerHTML = '';
    noMoviesEl.style.display = 'none';
    
    try {
        const response = await fetch('/api/movies');
        const result = await response.json();
        
        if (result.success) {
            allMovies = result.data;
            filteredMovies = [...allMovies];
            
            // Скрываем загрузку
            loadingEl.style.display = 'none';
            
            // Показываем сообщение если нет фильмов
            if (allMovies.length === 0) {
                noMoviesEl.style.display = 'block';
            } else {
                // Отображаем фильмы
                displayMovies(allMovies);
                
                // Обновляем фильтры
                updateFilterOptions();
            }
            
            // Обновляем статистику
            loadStats();
        }
    } catch (error) {
        console.error('Ошибка загрузки фильмов:', error);
        loadingEl.style.display = 'none';
        showNotification('Ошибка загрузки фильмов. Проверьте соединение.', 'error');
    }
}

// Отображение фильмов
function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies-container');
    moviesContainer.innerHTML = '';
    
    if (movies.length === 0) {
        moviesContainer.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search fa-3x" style="color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3>Фильмы не найдены</h3>
                <p>Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesContainer.appendChild(movieCard);
    });
}

// Создание карточки фильма
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-item fade-in';
    
    // Форматируем рейтинг
    const ratingStars = getRatingStars(movie.rating);
    
    card.innerHTML = `
        <div class="movie-header">
            <div class="movie-title">${escapeHtml(movie.title)}</div>
            <div class="movie-meta">
                <span class="year"><i class="fas fa-calendar"></i> ${movie.year}</span>
                <span class="rating"><i class="fas fa-star"></i> ${movie.rating}/10</span>
                <span class="director"><i class="fas fa-user-tie"></i> ${escapeHtml(movie.director)}</span>
            </div>
            <div class="genre">${escapeHtml(movie.genre)}</div>
        </div>
        <div class="movie-body">
            <div class="movie-description">
                ${movie.description || 'Описание отсутствует'}
            </div>
            <div class="movie-actions">
                <button class="btn btn-small" onclick="viewMovie(${movie.id})">
                    <i class="fas fa-eye"></i> Подробнее
                </button>
                <button class="btn btn-small btn-secondary" onclick="editMovie(${movie.id})">
                    <i class="fas fa-edit"></i> Редактировать
                </button>
                <button class="btn btn-small btn-danger" onclick="deleteMovie(${movie.id}, '${escapeHtml(movie.title)}')">
                    <i class="fas fa-trash"></i> Удалить
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Звезды рейтинга
function getRatingStars(rating) {
    const fullStars = Math.floor(rating / 2);
    const halfStar = rating % 2 >= 1;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Обновление опций фильтров
function updateFilterOptions() {
    if (allMovies.length === 0) return;
    
    // Собираем уникальные жанры
    genres = [...new Set(allMovies.map(m => m.genre))].sort();
    const genreFilter = document.getElementById('genre-filter');
    
    // Сохраняем текущее значение
    const currentGenre = genreFilter.value;
    genreFilter.innerHTML = '<option value="">Все жанры</option>';
    
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        genreFilter.appendChild(option);
    });
    
    // Восстанавливаем значение
    if (genres.includes(currentGenre)) {
        genreFilter.value = currentGenre;
    }
    
    // Собираем уникальные годы
    years = [...new Set(allMovies.map(m => m.year))].sort((a, b) => b - a);
    const yearFilter = document.getElementById('year-filter');
    
    // Сохраняем текущее значение
    const currentYear = yearFilter.value;
    yearFilter.innerHTML = '<option value="">Все годы</option>';
    
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
    
    // Восстанавливаем значение
    if (years.includes(parseInt(currentYear))) {
        yearFilter.value = currentYear;
    }
}

// Фильтрация фильмов
function filterMovies() {
    const genre = document.getElementById('genre-filter').value;
    const year = document.getElementById('year-filter').value;
    const minRating = parseFloat(document.getElementById('rating-filter').value);
    const sortBy = document.getElementById('sort-filter').value;
    
    let filtered = [...allMovies];
    
    // Применяем фильтры
    if (genre) {
        filtered = filtered.filter(movie => movie.genre === genre);
    }
    
    if (year) {
        filtered = filtered.filter(movie => movie.year === parseInt(year));
    }
    
    if (minRating > 0) {
        filtered = filtered.filter(movie => movie.rating >= minRating);
    }
    
    // Применяем сортировку
    switch (sortBy) {
        case 'title':
            filtered.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'year-desc':
            filtered.sort((a, b) => b.year - a.year);
            break;
        case 'year-asc':
            filtered.sort((a, b) => a.year - b.year);
            break;
        case 'rating-desc':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-asc':
            filtered.sort((a, b) => a.rating - b.rating);
            break;
    }
    
    filteredMovies = filtered;
    displayMovies(filtered);
}

// Обновление значения рейтинга
function updateRatingValue(value) {
    document.getElementById('rating-value').textContent = `${value}+`;
}

// Просмотр деталей фильма
async function viewMovie(id) {
    try {
        const response = await fetch(`/api/movies/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const movie = result.data;
            
            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i class="fas fa-film"></i> ${escapeHtml(movie.title)}</h2>
                        <button class="close-btn" onclick="closeModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="movie-details">
                            <div class="detail-row">
                                <span class="detail-label"><i class="fas fa-user-tie"></i> Режиссер:</span>
                                <span class="detail-value">${escapeHtml(movie.director)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label"><i class="fas fa-calendar"></i> Год:</span>
                                <span class="detail-value">${movie.year}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label"><i class="fas fa-theater-masks"></i> Жанр:</span>
                                <span class="detail-value">${escapeHtml(movie.genre)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label"><i class="fas fa-star"></i> Рейтинг:</span>
                                <span class="detail-value">
                                    ${getRatingStars(movie.rating)}
                                    <strong>${movie.rating}/10</strong>
                                </span>
                            </div>
                            <div class="detail-row full-width">
                                <span class="detail-label"><i class="fas fa-align-left"></i> Описание:</span>
                                <div class="detail-value">${movie.description || 'Описание отсутствует'}</div>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label"><i class="fas fa-clock"></i> Добавлен:</span>
                                <span class="detail-value">${new Date(movie.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal()">
                            <i class="fas fa-times"></i> Закрыть
                        </button>
                        <button class="btn" onclick="editMovie(${movie.id})">
                            <i class="fas fa-edit"></i> Редактировать
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            showModal();
        }
    } catch (error) {
        console.error('Ошибка загрузки деталей фильма:', error);
        showNotification('Ошибка загрузки деталей фильма', 'error');
    }
}

// Редактирование фильма
async function editMovie(id) {
    try {
        const response = await fetch(`/api/movies/${id}`);
        const result = await response.json();
        
        if (result.success) {
            const movie = result.data;
            
            // Заполняем форму редактирования
            document.getElementById('title').value = movie.title;
            document.getElementById('director').value = movie.director;
            document.getElementById('year').value = movie.year;
            document.getElementById('rating').value = movie.rating;
            document.getElementById('genre').value = movie.genre;
            document.getElementById('description').value = movie.description || '';
            
            // Прокручиваем к форме
            document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
            
            // Показываем сообщение
            showNotification(`Редактирование фильма: ${movie.title}`, 'info');
            
            // Меняем действие формы
            const form = document.getElementById('movieForm');
            form.onsubmit = async function(e) {
                e.preventDefault();
                
                const formData = {
                    title: document.getElementById('title').value,
                    director: document.getElementById('director').value,
                    year: document.getElementById('year').value,
                    rating: document.getElementById('rating').value,
                    genre: document.getElementById('genre').value,
                    description: document.getElementById('description').value
                };
                
                try {
                    const updateResponse = await fetch(`/api/movies/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const updateResult = await updateResponse.json();
                    
                    if (updateResponse.ok) {
                        showNotification(`Фильм "${formData.title}" успешно обновлен!`, 'success');
                        loadMovies(); // Перезагружаем список
                        
                        // Сбрасываем форму к добавлению
                        form.reset();
                        form.onsubmit = null; // Удаляем кастомный обработчик
                        
                        // Возвращаем стандартный обработчик
                        form.addEventListener('submit', handleFormSubmit);
                    } else {
                        showNotification(`Ошибка: ${updateResult.error}`, 'error');
                    }
                } catch (error) {
                    showNotification('Ошибка сети', 'error');
                }
            };
        }
    } catch (error) {
        console.error('Ошибка загрузки фильма для редактирования:', error);
        showNotification('Ошибка загрузки фильма', 'error');
    }
}

// Удаление фильма
async function deleteMovie(id, title) {
    if (!confirm(`Вы уверены, что хотите удалить фильм "${title}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/movies/${id}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(`Фильм "${title}" успешно удален`, 'success');
            loadMovies(); // Перезагружаем список
        } else {
            showNotification(`Ошибка: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Ошибка удаления фильма:', error);
        showNotification('Ошибка удаления фильма', 'error');
    }
}

// Модальные окна
function showModal() {
    document.querySelector('.modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Уведомления
function showNotification(message, type = 'info') {
    // Удаляем старое уведомление
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                &times;
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Автоматическое скрытие
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Вспомогательные функции
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Стили для модальных окон и уведомлений
const additionalStyles = `
    /* Модальные окна */
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 1000;
        overflow-y: auto;
        padding: 20px;
    }
    
    .modal-content {
        background: var(--bg-card);
        border-radius: 15px;
        max-width: 600px;
        margin: 50px auto;
        border: 2px solid var(--accent-primary);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        animation: modalSlideIn 0.3s ease-out;
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-50px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-header h2 {
        margin: 0;
        font-size: 1.8rem;
    }
    
    .close-btn {
        background: none;
        border: none;
        color: var(--text-primary);
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .close-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--accent-secondary);
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid var(--border-color);
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }
    
    .movie-details {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    
    .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 15px;
    }
    
    .detail-row.full-width {
        flex-direction: column;
    }
    
    .detail-label {
        color: var(--accent-secondary);
        font-weight: 600;
        min-width: 120px;
    }
    
    .detail-value {
        flex: 1;
        color: var(--text-primary);
    }
    
    /* Уведомления */
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        animation: notificationSlideIn 0.3s ease-out;
    }
    
    @keyframes notificationSlideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification-content {
        background: var(--bg-card);
        border-radius: 10px;
        padding: 15px 20px;
        display: flex;
        align-items: center;
        gap: 15px;
        border-left: 4px solid;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        min-width: 300px;
    }
    
    .notification-success {
        border-color: var(--success);
    }
    
    .notification-success .notification-content {
        border-left-color: var(--success);
    }
    
    .notification-error {
        border-color: var(--danger);
    }
    
    .notification-error .notification-content {
        border-left-color: var(--danger);
    }
    
    .notification-warning {
        border-color: var(--warning);
    }
    
    .notification-warning .notification-content {
        border-left-color: var(--warning);
    }
    
    .notification-info {
        border-color: var(--info);
    }
    
    .notification-info .notification-content {
        border-left-color: var(--info);
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
    }
    
    /* Загрузка */
    .loading {
        text-align: center;
        padding: 3rem;
        color: var(--text-secondary);
    }
    
    .loading .fa-spinner {
        margin-bottom: 1rem;
        color: var(--accent-primary);
    }
    
    .no-movies {
        animation: fadeIn 0.5s ease-out;
    }
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Экспортируем функции для использования в консоли
window.loadMovies = loadMovies;
window.filterMovies = filterMovies;
window.updateRatingValue = updateRatingValue;
window.viewMovie = viewMovie;
window.editMovie = editMovie;
window.deleteMovie = deleteMovie;
window.showNotification = showNotification;
window.closeModal = closeModal;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Movie Collection загружен!');
    console.log('Доступные функции: loadMovies(), filterMovies(), viewMovie(id), editMovie(id), deleteMovie(id)');
});