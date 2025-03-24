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

// Функция для отображения портфолио
function renderPortfolio(portfolioItems) {
    const portfolioContainer = document.getElementById('portfolioGrid');
    if (!portfolioContainer || !portfolioItems) return;
    
    // Отображаем только первые 12 проектов
    const displayItems = portfolioItems.slice(0, 999);
    
    let portfolioHTML = '';
    
    displayItems.forEach((item) => {
        const imageUrl = item.images && item.images.length > 0 
            ? item.images[0] 
            : 'https://via.placeholder.com/300x200?text=Нет+изображения';
        
        portfolioHTML += `
            <div class="portfolio__item">
                <img src="${imageUrl}" alt="${item.title}" class="portfolio__image">
                <div class="portfolio__content">
                    <h3 class="portfolio__title">${item.title}</h3>
                    <p class="portfolio__description">${item.description}</p>
                </div>
            </div>
        `;
    });
    
    portfolioContainer.innerHTML = portfolioHTML;
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
    
    // Берем только первые 6 отзывов с комментариями
    const filteredItems = testimonialItems
        .filter(item => item.comment !== null)
        .slice(0, 9999);
    
    let testimonialsHTML = '';
    
    filteredItems.forEach((item) => {
        const date = new Date(item.created_at * 1000);
        const formattedDate = date.toLocaleDateString('ru-RU');
        
        const ratingStars = '★'.repeat(Math.floor(item.score)) + 
                          (item.score % 1 > 0 ? '½' : '') + 
                          '☆'.repeat(5 - Math.ceil(item.score));
        
        testimonialsHTML += `
            <div class="testimonial__item">
                <div class="testimonial__text">${item.comment || 'Без комментариев'}</div>
                <div class="testimonial__date">${formattedDate}</div>
                <div class="testimonial__rating">${ratingStars} (${item.score})</div>
            </div>
        `;
    });
    
    testimonialsContainer.innerHTML = testimonialsHTML;
}

// Функция для отображения выполненных проектов
function renderCompletedTasks(data) {
    const completedTasksContainer = document.getElementById('completedTasksList');
    if (!completedTasksContainer || !data.performer || !data.performer.completed_tasks || !data.performer.completed_tasks.items) return;
    
    const tasksItems = data.performer.completed_tasks.items;
    let tasksHTML = '';
    
    tasksItems.forEach((task) => {
        // Форматирование даты
        const date = new Date(task.created_at * 1000);
        const formattedDate = date.toLocaleDateString('ru-RU');
        
        tasksHTML += `
            <div class="completed-task__item">
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
    
    completedTasksContainer.innerHTML = tasksHTML;
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