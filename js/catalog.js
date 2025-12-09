(function(){
  // определяем элементы каталога
  const catalog = document.getElementById('catalog');
  const catalogWrap = document.querySelector('.catalog-wrap');
  const checkboxes = Array.from(document.querySelectorAll('#categories input[type="checkbox"]'));
  const search = document.getElementById('search');
  const price = document.getElementById('price');
  const priceValue = document.getElementById('priceValue');
  const clearBtn = document.getElementById('clear');
  const galleryCards = Array.from(document.querySelectorAll('.card-category'));

  // подписи категорий
  const captionToValue = {
    'конфеты': 'candies',
    'мармелад': 'marmalade',
    'печенье': 'cookies',
    'десерт': 'dessert',
  };

  //  установки категорий
  let presetActive = false;
  let prevStates = null;

  // получение массива выбранных категорий
  function getSelectedCategories(){
    return checkboxes.filter(c => c.checked).map(c => c.value);
  }

  // получение карточек товаров
  function getCards(){
    return catalog ? Array.from(catalog.querySelectorAll('.card')) : [];
  }

  // фильтрация каталога
  function filterCards(presetCategory = null){
    const cards = getCards();
    const selected = presetCategory ? [presetCategory] : getSelectedCategories(); // выбранные категории

    const q = (search && search.value) ? search.value.trim().toLowerCase() : '';
    const maxPrice = price ? Number(price.value) : Infinity;

    // подставляем каждую карточку в фильтр
    cards.forEach(card => {
      // определение параметров карточки (категория, цена, имя)
      const cat = card.dataset.category;
      const p = Number(card.dataset.price);
      const title = (card.querySelector('h4') && card.querySelector('h4').textContent) ? card.querySelector('h4').textContent.toLowerCase() : '';

      // проверка прохождения параметров
      const byCat = selected.length === 0 ? true : selected.includes(cat);
      const byPrice = isFinite(maxPrice) ? p <= maxPrice : true;
      const bySearch = q === '' ? true : title.includes(q);

      card.style.display = (byCat && byPrice && bySearch) ? '' : 'none'; // отображение или не отображение элемента
    });
  }

  // смещение к каталогу
  function scrollToCatalog(){
    if (!catalogWrap) return;

    const top = catalogWrap.getBoundingClientRect().top;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // отключение пресет режима при нажатии на категорию и фильтрация
  if (checkboxes.length) checkboxes.forEach(cb => cb.addEventListener('change', () => {
    if (presetActive) 
      { 
        presetActive = false; 
        prevStates = null; 
      }
    filterCards(null);
  }));

  // обработка изменений для остальных элементов меню фильтрации
  if (search) search.addEventListener('input', () => { presetActive = false; prevStates = null; filterCards(null); });
  if (price) price.addEventListener('change', () => { presetActive = false; prevStates = null; filterCards(null); });
  if (clearBtn) clearBtn.addEventListener('click', () => {
    presetActive = false;
    prevStates = null;

    // перевод всех элементов в начальное положение
    checkboxes.forEach(cb => cb.checked = true);

    if (search) search.value = '';
    if (price) price.value = price.max || 2000;
    if (priceValue) priceValue.textContent = price.value;
    filterCards(null);
  });

    // автоматическое обновление цены при смещении ползунка цены
  if (price && priceValue) {
    price.addEventListener('input', () => {
      priceValue.textContent = price.value;
    });
  }

  function setCheckboxesVisualOnly(targetValue) {
    prevStates = checkboxes.map(cb => cb.checked);
    presetActive = true;
    checkboxes.forEach(cb => { cb.checked = false; });
    const target = checkboxes.find(cb => cb.value === targetValue);
    if (target) target.checked = true;
  }

  if (galleryCards.length) {
    // для каждой карточки-категории
    galleryCards.forEach(g => {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => {
        // берем элемент с названием карточки
        const captionEl = g.querySelector('figcaption');
        if (!captionEl) return;

        // берем название категории
        const text = captionEl.textContent.trim().toLowerCase();

        let preset = null;
        if (!preset) {

          for (const [k, v] of Object.entries(captionToValue)) // находим нужный пресет
          {
            if (text.includes(k)) { preset = v; break; }
          }
        }

        if (preset) { // если пресет есть - фильтрируем каталог и смещаемся к нему
          setCheckboxesVisualOnly(preset);
          filterCards(preset);
          scrollToCatalog();
        }
      });
    });
  }

  if (priceValue && price) priceValue.textContent = price.value;
})();
