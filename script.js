document.addEventListener('DOMContentLoaded', function() {
    // Вместо fetch используем встроенные данные
    // Данные будут загружены из переменной portfolioData
    loadData();
});

// Загрузка данных из переменной вместо fetch
function loadData() {
    // При открытии в браузере через file:// fetch не работает из-за CORS
    // Поэтому напрямую загружаем переменную с данными
    const script = document.createElement('script');
    script.src = 'portfolio-data.js'; // Файл с данными в формате JavaScript
    script.onload = function() {
        // Когда скрипт загрузится, данные будут доступны в глобальной переменной portfolioData
        if (typeof portfolioData !== 'undefined') {
            renderPortfolio(portfolioData.performer.portfolio);
            renderTestimonials(portfolioData.performer.feedback.items);
            renderUserInfo(portfolioData);
            renderSkills(portfolioData.skills);
            renderCompletedTasks(portfolioData);
            renderAbout(portfolioData);
            // Мгновенно показываем все элементы
            checkFadeElements();
        } else {
            console.error('Ошибка: данные портфолио не найдены.');
            document.getElementById('portfolioGrid').innerHTML = '<p>Не удалось загрузить портфолио.</p>';
            document.getElementById('testimonialsSlider').innerHTML = '<p>Не удалось загрузить отзывы.</p>';
            document.getElementById('completedTasksList').innerHTML = '<p>Не удалось загрузить выполненные проекты.</p>';
        }
    };
    script.onerror = function() {
        console.error('Ошибка загрузки файла данных portfolio-data.js');
        document.getElementById('portfolioGrid').innerHTML = '<p>Не удалось загрузить портфолио.</p>';
        document.getElementById('testimonialsSlider').innerHTML = '<p>Не удалось загрузить отзывы.</p>';
        document.getElementById('completedTasksList').innerHTML = '<p>Не удалось загрузить выполненные проекты.</p>';
    };
    document.head.appendChild(script);
}

// Функция для отображения информации о пользователе
function renderUserInfo(data) {
    if (!data) return;
    
    // Заполняем данные профиля
    const avatar = document.querySelector('.header__avatar img');
    const name = document.querySelector('.header__name');
    const specialization = document.querySelector('.header__specialization');
    const experienceValue = document.querySelector('.about__meta-item:nth-child(1) .about__meta-value');
    const projectsValue = document.querySelector('.about__meta-item:nth-child(2) .about__meta-value');
    const feedbackValue = document.querySelector('.about__meta-item:nth-child(3) .about__meta-value');
    const categoriesValue = document.querySelector('.about__meta-item:nth-child(4) .about__meta-value');

    if (avatar) avatar.src = data.avatar || avatar.src;
    if (name) name.textContent = `${data.first_name} ${data.last_name}` || name.textContent;
    if (specialization) specialization.textContent = data.specialization || specialization.textContent;
    if (experienceValue) experienceValue.textContent = data.experience || experienceValue.textContent;
    if (projectsValue && data.performer) projectsValue.textContent = data.performer.completed_tasks.total_count || projectsValue.textContent;
    if (feedbackValue && data.performer) feedbackValue.textContent = data.performer.feedback.total_count || feedbackValue.textContent;
    if (categoriesValue && data.categories) categoriesValue.textContent = data.categories.join(', ') || categoriesValue.textContent;

    // Заполняем контакты
    if (data.contacts) {
        const emailContact = document.querySelector('.contacts__item:nth-child(1) .contacts__value a');
        const phoneContact = document.querySelector('.contacts__item:nth-child(2) .contacts__value a');
        
        if (emailContact) emailContact.textContent = data.contacts.email || emailContact.textContent;
        if (phoneContact) phoneContact.textContent = data.contacts.phone || phoneContact.textContent;
    }
}

// Функция для отображения навыков
function renderSkills(skills) {
    if (!skills || !Array.isArray(skills)) return;
    
    const skillsContainer = document.querySelector('.skills__list');
    if (!skillsContainer) return;
    
    let skillsHTML = '';
    
    skills.forEach((skill) => {
        skillsHTML += `
            <div class="skills__item fade-in">
                ${skill}
            </div>
        `;
    });
    
    skillsContainer.innerHTML = skillsHTML;
}

// Функция для отображения портфолио с ограничением
function renderPortfolio(portfolioItems) {
    const portfolioContainer = document.getElementById('portfolioGrid');
    if (!portfolioContainer || !portfolioItems) return;
    
    const ITEMS_PER_PAGE = 6;
    let currentlyShown = ITEMS_PER_PAGE;
    
    // Сортируем портфолио по дате
    const sortedItems = [...portfolioItems].sort((a, b) => b.created_at - a.created_at);
    
    function renderItems(items) {
        let portfolioHTML = '';
        items.forEach((item) => {
            const imageUrl = item.images && item.images.length > 0 
                ? item.images[0] 
                : 'https://via.placeholder.com/300x200?text=Нет+изображения';
            
            portfolioHTML += `
                <div class="portfolio__item visible">
                    <img src="${imageUrl}" alt="${item.title}" class="portfolio__image">
                    <div class="portfolio__content">
                        <h3 class="portfolio__title">${item.title}</h3>
                        <p class="portfolio__description">${item.description}</p>
                    </div>
                </div>
            `;
        });
        
        if (sortedItems.length > ITEMS_PER_PAGE) {
            portfolioHTML += `
                <div class="show-more-container">
                    <button class="show-more-btn" id="showMorePortfolio">
                        Показать ещё (${sortedItems.length - currentlyShown})
                    </button>
                </div>
            `;
        }
        
        portfolioContainer.innerHTML = portfolioHTML;
        
        // Добавляем обработчик для кнопки
        const showMoreBtn = document.getElementById('showMorePortfolio');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                currentlyShown += ITEMS_PER_PAGE;
                renderItems(sortedItems.slice(0, currentlyShown));
                if (currentlyShown >= sortedItems.length) {
                    showMoreBtn.style.display = 'none';
                }
            });
        }
    }
    
    renderItems(sortedItems.slice(0, currentlyShown));
}

function renderAbout(data) {
    const aboutContainer = document.querySelector('.about__text');
    if (!aboutContainer) return;
    
    aboutContainer.innerHTML = `<p>${data.about}</p>`;
}


// Функция для отображения отзывов
function renderTestimonials(testimonialItems) {
    const testimonialsContainer = document.getElementById('testimonialsSlider');
    if (!testimonialsContainer || !testimonialItems) return;
    
    const ITEMS_PER_PAGE = 6;
    let currentlyShown = ITEMS_PER_PAGE;
    
    // Сортируем отзывы по дате (от новых к старым)
    const sortedItems = [...testimonialItems]
        .filter(item => item.comment !== null)
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 9999);
    
    function renderItems(items) {
        let testimonialsHTML = '';
        items.forEach((item) => {
            const date = new Date(item.created_at * 1000);
            const formattedDate = date.toLocaleDateString('ru-RU');
            
            const ratingStars = '★'.repeat(Math.floor(item.score)) + 
                              (item.score % 1 > 0 ? '½' : '') + 
                              '☆'.repeat(5 - Math.ceil(item.score));
            
            testimonialsHTML += `
                <div class="testimonial__item visible">
                    <div class="testimonial__text">${item.comment || 'Без комментариев'}</div>
                    <div class="testimonial__date">${formattedDate}</div>
                    <div class="testimonial__rating">${ratingStars} (${item.score})</div>
                </div>
            `;
        });
        
        if (sortedItems.length > ITEMS_PER_PAGE) {
            testimonialsHTML += `
                <div class="show-more-container">
                    <button class="show-more-btn" id="showMoreTestimonials">
                        Показать ещё (${sortedItems.length - currentlyShown})
                    </button>
                </div>
            `;
        }
        
        testimonialsContainer.innerHTML = testimonialsHTML;
        
        // Добавляем обработчик для кнопки
        const showMoreBtn = document.getElementById('showMoreTestimonials');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                currentlyShown += ITEMS_PER_PAGE;
                renderItems(sortedItems.slice(0, currentlyShown));
                if (currentlyShown >= sortedItems.length) {
                    showMoreBtn.style.display = 'none';
                }
            });
        }
    }
    
    renderItems(sortedItems.slice(0, currentlyShown));
}

// Функция для отображения выполненных проектов
function renderCompletedTasks(data) {
    const completedTasksContainer = document.getElementById('completedTasksList');
    if (!completedTasksContainer || !data.performer || !data.performer.completed_tasks || !data.performer.completed_tasks.items) return;
    
    const ITEMS_PER_PAGE = 6;
    let currentlyShown = ITEMS_PER_PAGE;
    
    // Сортируем проекты по дате (от новых к старым)
    const tasksItems = [...data.performer.completed_tasks.items].sort((a, b) => {
        return b.created_at - a.created_at;
    });
    
    function renderItems(items) {
        let tasksHTML = '';
        items.forEach((task) => {
            const date = new Date(task.created_at * 1000);
            const formattedDate = date.toLocaleDateString('ru-RU');
            
            tasksHTML += `
                <div class="completed-task__item visible">
                    <div class="completed-task__header">
                        <h3 class="completed-task__title">${task.title}</h3>
                        <div class="completed-task__date">${formattedDate}</div>
                    </div>
                    <div class="completed-task__description">${task.description}</div>
                    <div class="completed-task__footer">
                        <div class="completed-task__skills">${task.skills}</div>
                        <div class="completed-task__price">${task.price}</div>
                    </div>
                </div>
            `;
        });
        
        if (tasksItems.length > ITEMS_PER_PAGE) {
            tasksHTML += `
                <div class="show-more-container">
                    <button class="show-more-btn" id="showMoreCompletedTasks">
                        Показать ещё (${tasksItems.length - currentlyShown})
                    </button>
                </div>
            `;
        }
        
        completedTasksContainer.innerHTML = tasksHTML;
        
        // Добавляем обработчик для кнопки
        const showMoreBtn = document.getElementById('showMoreCompletedTasks');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', () => {
                currentlyShown += ITEMS_PER_PAGE;
                renderItems(tasksItems.slice(0, currentlyShown));
                if (currentlyShown >= tasksItems.length) {
                    showMoreBtn.style.display = 'none';
                }
            });
        }
    }
    
    renderItems(tasksItems.slice(0, currentlyShown));
}

// Функция для проверки и активации анимаций для элементов
function checkFadeElements() {
    const fadeElements = document.querySelectorAll('.fade-in, .portfolio__item, .testimonial__item, .skills__item, .contacts__item');
    fadeElements.forEach(element => {
        element.classList.add('visible');
    });
}

// Упрощаем функцию проверки видимости
function checkFadeElements() {
    const fadeElements = document.querySelectorAll('.fade-in, .portfolio__item, .testimonial__item, .skills__item, .contacts__item');
    fadeElements.forEach(element => {
        element.classList.add('visible');
    });
}

// Начальная активация анимации для видимых элементов
window.addEventListener('load', function() {
    // Активируем анимацию для элементов, видимых при загрузке страницы
    setTimeout(checkFadeElements, 1);
});

// Добавляем стили для кнопки "Показать ещё"
const styles = `
    .show-more-container {
        grid-column: 1 / -1;
        text-align: center;
        margin-top: 30px;
    }

    .show-more-btn {
        background: var(--glass-bg);
        color: var(--primary-color);
        border: 1px solid var(--primary-color);
        padding: 12px 30px;
        border-radius: 30px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
    }

    .show-more-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 