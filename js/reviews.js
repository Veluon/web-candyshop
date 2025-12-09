(function () {
  const STORAGE_KEY = 'siteReviews_v1';

  // базовые отзывы
  const seed = [
    {
      name: 'Анонимный пользователь',
      date: '12 ноября 2025',
      text: 'Только в этом магазине сладостей я нашел нужную сладость за минуту!',
      avatar: 'data/user-icon.png'
    },
    {
      name: 'Мария П.',
      date: '05 ноября 2025',
      text: 'Купила набор — упаковка аккуратная, товар пришел быстро. Рекомендую для подарков.',
      avatar: 'data/user-icon.png'
    },
    {
      name: 'Иван С.',
      date: '28 октября 2025',
      text: 'Всё ок.',
      avatar: 'data/user-icon.png'
    }
  ];

  // загрузка отзывов из памяти
  function loadReviews() {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
        return seed.slice();
    }

    return JSON.parse(raw);
  }

  // сохранение отзывов в память
  function saveReviews(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  // рендер списка отзывов на странице отзывов
  function renderReviewsList(container) {
    if (!container) return;

    const reviews = loadReviews();

    reviews.forEach(r => { // для каждого отзыва создаем структуру и добавляем в контейнер
      const art = document.createElement('article');

      art.className = 'review';
      art.innerHTML = `
        <div class="review-header">
          <img class="review-ava" src="${r.avatar}" alt="Аватар ${r.name}">
          <div class="review-meta">
            <div class="review-name">${r.name}</div>
            <div class="review-date">${r.date}</div>
          </div>
        </div>
        <div class="review-body">${r.text}</div>
      `;
      container.appendChild(art);
    });
  }

  // рендер карусели отзывов на главной странице
  function renderCarousel(container) {
    if (!container) return;

    const reviews = loadReviews();
    // создаем обертку карусели
    const track = document.createElement('div');
    track.className = 'carousel-track';

    reviews.forEach(r => { // добавляем каждый отзыв как слайд карусели
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = `
        <div class="feedback-citate carousel-card">
          <div class="feedback1">
            <img class="feedback-ava" src="${r.avatar}" alt="avatar">
            <div class="feedback-name">${r.name}</div>
          </div>
          <div class="feedback2">${r.text}</div>
        </div>
      `;
      track.appendChild(slide);
    });

    // кнопка предыдущего отзыва
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-prev';
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Предыдущий отзыв');
    prevBtn.textContent = '◀';

    // кнопка следующего отзыва
    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-next';
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Следующий отзыв');
    nextBtn.textContent = '▶';

    container.appendChild(prevBtn);
    container.appendChild(track);
    container.appendChild(nextBtn);

    // логика прокрутки
    let index = 0;
    let slideWidth = 0;
    let autoplayId = null;
    const slides = Array.from(track.children);

    // расчет ширины слайдов
    function recalc() {
      slideWidth = container.clientWidth; // считаем слайда карусели как текущий размер
      slides.forEach(s => { s.style.width = `${slideWidth}px`; }); // задаем ширину в слайды 
      updatePos();
    }

    // обновление положения
    function updatePos() {
      track.style.transform = `translateX(${ -index * slideWidth }px)`;
    }

    // перемещение к следующему
    function showNext() {
      index = (index + 1) % slides.length;
      updatePos();
    }

    // перемещение к предыдущему
    function showPrev() {
      index = (index - 1 + slides.length) % slides.length;
      updatePos();
    }

    // запуск автопрокрутки
    function startAutoplay() {
      stopAutoplay();
      autoplayId = setInterval(showNext, 4000);
    }

    // остановка автопрокрутки
    function stopAutoplay() {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    }

    // остановка автопрокрутки при нажатии на кнопки смены слайда
    nextBtn.addEventListener('click', () => { showNext(); stopAutoplay(); });
    prevBtn.addEventListener('click', () => { showPrev(); stopAutoplay(); });

    // перерасчет при изменении окна
    window.addEventListener('resize', recalc);

    recalc();
    startAutoplay();
  }


  // инициализация страницы отзывов
  function initReviewsPage() {
    // определение переменных
    const listContainer = document.querySelector('.reviews-list');
    const addBtn = document.querySelector('#open-add-review');
    const modal = document.querySelector('#add-review-modal');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    const form = modal ? modal.querySelector('form') : null;

    renderReviewsList(listContainer);

    if (!addBtn || !modal || !form) return;

    // при нажатии добавления отзыва - открываем окно добавления
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('open');

      const nameInput = form.querySelector('input[name="name"]');
      if (nameInput) nameInput.focus();
    });

    // при нажатии на кнопку закрытия или на задний фон - закрываем окно добавления отзыва
    closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

    // при подтверждении
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // подготавливаем форму
      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim() || 'Анонимный пользователь';
      const text = (formData.get('text') || '').toString().trim();
      if (!text) {
        alert('Пожалуйста, напишите текст отзыва');
        return;
      }
      // определяем аватарку и дату написания
      const avatar = 'data/user-icon.png';
      const date = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });

      // загрузка отзывов и сохранение
      const reviews = loadReviews();
      reviews.unshift({ name, date, text, avatar });
      saveReviews(reviews);

      // перерисовка отзывов
      renderReviewsList(listContainer);
      const carouselContainer = document.querySelector('#reviews-carousel');
      if (carouselContainer) renderCarousel(carouselContainer);

      // закрытие окна и очистка формы
      modal.classList.remove('open');
      form.reset();

    });
  }

  // при загрузке страницы
  document.addEventListener('DOMContentLoaded', () => {
    // загружаем карусель отзывов
    const carouselContainer = document.querySelector('#reviews-carousel');
    if (carouselContainer) renderCarousel(carouselContainer);

    // загружаем отзывы на странице отзывов
    if (document.querySelector('.reviews-list')) {
      initReviewsPage();
      //localStorage.removeItem('siteReviews_v1'); // очистка из памяти для дебага

    }
  });

  window.__siteReviews = {
    loadReviews,
    saveReviews,
    renderReviewsList,
    renderCarousel
  };
})();
