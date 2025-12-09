(function(){

  // список товаров
  const products = [
    { id: 'p1', title: 'Ассорти конфет', price: 200, img: 'https://www.penzafood.ru/upload/iblock/950/2017Food_Cakes_and_Sweet_Appetizing_assorted_chocolates_on_white_background_118866_.jpg', category:'candies', desc:''},
    { id: 'p2', title: 'Мармелад фруктовый', price: 140, img: 'https://rskrf.ru/upload/medialibrary/86d/tk7nwuih929e63mvmbigvslc7xmegdmy.jpg', category:'marmalade', desc:''},
    { id: 'p3', title: 'Печенье с шоколадом', price: 200, img: 'data/коробка печенья.png', category:'cookies', desc:''},
    { id: 'p4', title: 'Набор конфет', price: 350, img: 'data/набор конфет.png', category:'candies', desc:''},
    { id: 'p5', title: 'Леденцы ассорти', price: 220, img: 'data/леденцы.png', category:'marmalade', desc:''},
    { id: 'p6', title: 'Набор мармелада', price: 300, img: 'data/набор мармелада.png', category:'marmalade', desc:''},
    { id: 'p7', title: 'Печенье с начинкой', price: 250, img: 'data/печенье.png', category:'cookies', desc:''},
    { id: 'p8', title: 'Эклеры', price: 200, img: 'data/эклеры.png', category:'dessert', desc:''},
    { id: 'p9', title: 'Тарталетка', price: 120, img: 'data/тарталетка.png', category:'dessert', desc:''},
    { id: 'p10', title: 'Кислые трубочки', price: 150, img: 'data/мармелад трубочки.png', category:'marmalade', desc:''},
    { id: 'p11', title: 'Пирожное', price: 100, img: 'data/пирожное.png', category:'dessert', desc:''}
  ];

  // парсинг содержимого корзины
  const CART_KEY = 'miniCart_v1';
  let cart = JSON.parse(localStorage.getItem(CART_KEY) || '{}');

  // определениие нужных элементов
  const catalog = document.getElementById('catalog');
  const cartToggle = document.getElementById('cart-toggle');
  const cartCount = document.getElementById('cart-count');

  // создание элемента окна корзины
  const cartPopup = document.createElement('div');
  cartPopup.className = 'cart-popup';
  cartPopup.id = 'cart-popup';
  cartPopup.innerHTML = `
    <h4>Корзина</h4>
    <div id="cart-items"></div>
    <div class="cart-total">
      <div>Итого</div>
      <div id="cart-sum">0 ₽</div>
    </div>
    <div class="cart-actions">
      <button id="clear-cart" class="clear-btn" type="button">Очистить</button>
      <button id="checkout-btn" class="pay-btn" type="button">Оплатить</button>
    </div>
  `;
  document.body.appendChild(cartPopup);

  // создание элемента окна товара
  const productModal = document.createElement('div');
  productModal.className = 'product-modal';
  productModal.id = 'product-modal';
  productModal.innerHTML = `
  <div class="panel" role="dialog" aria-modal="true">
    <img id="pm-img" alt="">
    <div style="flex:1">
      <h3 id="pm-title"></h3>
      <div class="meta" id="pm-price"></div>
      <p id="pm-desc" class="item-pm-desc"></p>
      <div class="actions" id="pm-actions"></div>
    </div>
    <button id="pm-close" class="item-pm-close">✕</button>
  </div>`;
  document.body.appendChild(productModal);

  // создание элемента окна покупки
  const paymentModal = document.createElement('div');
  paymentModal.className = 'payment-modal';
  paymentModal.id = 'payment-modal';
  paymentModal.innerHTML = `
    <div class="payment-panel" role="dialog" aria-modal="true">
      <button class="payment-close" type="button" aria-label="Закрыть">✕</button>
      <h3>Оформление заказа</h3>
      <div id="order-summary" class="order-summary"></div>

      <form id="checkout-form" class="checkout-form" novalidate>
        <label>
          Имя
          <input name="name" type="text" placeholder="Имя" class="checkout-input" required>
        </label>

        <label>
          Номер
          <input name="phone" type="text" placeholder="Номер" class="checkout-input" inputmode="tel">
        </label>

        <label>
          Адрес доставки
          <input name="address" type="text" placeholder="Адрес доставки" class="checkout-input" required>
        </label>

        <div class="checkout-actions">
          <button type="submit" id="pm-pay" class="pay-btn">Оплатить</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(paymentModal);

  // сохранение корзины в память
  function saveCart(){ 
    localStorage.setItem(CART_KEY, JSON.stringify(cart)); 
  }

  // рендеринг каталога
  function renderCatalog(){
    if(!catalog) return;

    // для каждого товара создаем элемент и возможность открытия окна информации
    products.forEach(p => {
      // создание элемента
      const el = document.createElement('article');
      el.className = 'card';
      el.dataset.category = p.category;
      el.dataset.price = p.price;
      el.dataset.id = p.id;
      el.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <h4>${p.title}</h4>
        <div class="meta">
          <div class="price">${p.price} ₽</div>
        </div>
        <div class="add-wrap">
          <button class="add-btn" data-id="${p.id}">Добавить</button>
        </div>
      `;

      // открытие окна информации по нажатию
      el.querySelector('img').addEventListener('click', () => openProductModal(p.id));
      el.querySelector('h4').addEventListener('click', () => openProductModal(p.id));

      catalog.appendChild(el);
    });
    syncAllAddButtons();
  }

  // обработка состояния всех кнопок изменения количества товара
  function syncAllAddButtons(){
    if(!catalog) return;

    // берем все карточки товара
    const cards = catalog.querySelectorAll('.card');

    // проходимся по каждой карточке товара
    cards.forEach(card => {
      const id = card.dataset.id;
      const wrap = card.querySelector('.add-wrap'); // создаем элемент, который будет содержать кнопки
      wrap.innerHTML = '';
      const qty = cart[id] || 0; // определяем количество товара в корзине

      if (qty <= 0) { // если равно нулю или меньше, то ставим кнопку "Добавить"
        const btn = document.createElement('button');
        btn.className = 'add-btn';
        btn.textContent = 'Добавить';
        btn.dataset.id = id;

        btn.addEventListener('click', (e) => { e.stopPropagation(); changeQtyFromCard(id, 1); });
        wrap.appendChild(btn);
      }
      else { // иначе добавляем кнопки "+" и "-" и количество товара в корзине
        const ctr = document.createElement('div');
        ctr.className = 'counter';
        ctr.innerHTML = `
        <button data-id="${id}" class="dec">−</button>
        <div class="count">${qty}</div>
        <button data-id="${id}" class="inc">+</button>`;

        ctr.querySelector('.dec').addEventListener('click', (e) => { e.stopPropagation(); changeQtyFromCard(id, -1); });
        ctr.querySelector('.inc').addEventListener('click', (e) => { e.stopPropagation(); changeQtyFromCard(id, +1); });
        wrap.appendChild(ctr);
      }
    });
  }

  // обработка изменения количества товара в корзине из каталога
  function changeQtyFromCard(id, delta){
    // вычисление следующего количества
    const prev = cart[id] || 0;
    const next = Math.max(0, prev + delta);

    // если равно 0 - удаляем, иначе меняем количество
    if(next == 0) delete cart[id]; 
    else cart[id] = next;

    // обновляем визуал
    saveCart();
    syncAllAddButtons();
    updateCartUI();
  }

  // открытие карточки информации о товаре
  function openProductModal(id){
    // если не нашли товар - выходим
    const p = products.find(x => x.id === id);
    if(!p) return;

    // определяем переменные
    productModal.classList.add('open');
    const imgEl = productModal.querySelector('#pm-img');
    const titleEl = productModal.querySelector('#pm-title');
    const priceEl = productModal.querySelector('#pm-price');
    const descEl = productModal.querySelector('#pm-desc');
    const actions = productModal.querySelector('#pm-actions');

    // загружаем текст и изображение
    imgEl.src = p.img;
    imgEl.alt = p.title;
    titleEl.textContent = p.title;
    priceEl.textContent = p.price + ' ₽';
    descEl.textContent = p.desc;
    actions.innerHTML = '';

    // определяем количество и выбираем нужный интерфейс: кнопка "Добавить" или кнопки "+"" и "-"" вместо с количеством
    const qty = cart[id] || 0;
    if (qty === 0) {
      const add = document.createElement('button');
      add.className = 'add-btn';
      add.textContent = 'Добавить в корзину';
      add.addEventListener('click', (e) => { e.stopPropagation(); cart[id] = 1; saveCart(); syncAllAddButtons(); updateCartUI(); openProductModal(id); });
      actions.appendChild(add);
    } 
    else {
      const ctr = document.createElement('div');
      ctr.className = 'counter';
      ctr.innerHTML = `<button class="dec">−</button><div class="count">${qty}</div><button class="inc">+</button>`;
      ctr.querySelector('.dec').addEventListener('click', (e) => { e.stopPropagation(); changeQtyFromModal(id, -1); });
      ctr.querySelector('.inc').addEventListener('click', (e) => { e.stopPropagation(); changeQtyFromModal(id, +1); });
      actions.appendChild(ctr);
    }
  }

  // обработка изменения количества товара из карточки окна информмции
  function changeQtyFromModal(id, delta){
    // начало как и в обработке из каталога
    const prev = cart[id] || 0;
    const next = Math.max(0, prev + delta);

    if (next === 0) delete cart[id]; 
    else cart[id] = next;

    saveCart();
    syncAllAddButtons();
    updateCartUI();

    // изменение отображения в окне товара
    const c = productModal.querySelector('.count');
    if (c) c.textContent = cart[id] || 0;

    const actions = productModal.querySelector('#pm-actions');
    if (!(cart[id])) {
      actions.innerHTML = '';
      const add = document.createElement('button');
      add.className = 'add-btn';
      add.textContent = 'Добавить в корзину';
      add.addEventListener('click', (e) => { e.stopPropagation(); cart[id] = 1; saveCart(); syncAllAddButtons(); updateCartUI(); openProductModal(id); });
      actions.appendChild(add);
    }
  }

  // закрытие окна по кнопке или по фону
  const pmClose = productModal.querySelector('#pm-close');
  if (pmClose) pmClose.addEventListener('click', (e) => { e.stopPropagation(); productModal.classList.remove('open'); });
  productModal.addEventListener('click', (e) => { if(e.target === productModal) productModal.classList.remove('open'); });

  // обновление рендера корзины
  function updateCartUI(){
    // общая сумма
    const totalCount = Object.values(cart).reduce((s, n) => s + n, 0);
    if (cartCount) cartCount.textContent = totalCount;

    // обертка хранящая список товаров
    const itemsWrap = document.getElementById('cart-items');
    if (!itemsWrap) return;
    itemsWrap.innerHTML = '';

    if (totalCount === 0){ // если товаров нет - пишем, что корзина пуста и выходим
      itemsWrap.innerHTML = '<div class="empty-cart">Корзина пуста</div>';
      const cs = document.getElementById('cart-sum');
      if (cs) cs.textContent = '0 ₽';

      const cb = document.getElementById('checkout-btn');
      if (cb) cb.style.display = 'none';
      return;
    }

    const cb = document.getElementById('checkout-btn');
    if (cb) cb.style.display = '';

    let sum = 0;

    // проходимся по каждому товару в корзине
    Object.entries(cart).forEach(([id, qty]) => {
      // находим товар
      const p = products.find(x => x.id === id);
      if (!p) return;

      // создаем элемент для отображения
      const row = document.createElement('div');
      row.className = 'cart-item';

      // получаем сумму на которую куплено товара в корзине и добавляем в общую
      const subtotal = p.price * qty;
      sum += subtotal;

      row.innerHTML = `
        <img src="${p.img}" alt="${p.title}">
        <div class="ci-info">
          <div class="cart-nam">${p.title}</div>
          <div class="cart-s-s">${p.price} ₽ × ${qty} = ${subtotal} ₽</div>
        </div>
        <div class="qty-control">
          <button class="cart-dec" data-id="${id}">−</button>
          <div class="cart-c">${qty}</div>
          <button class="cart-inc" data-id="${id}">+</button>
        </div>
      `;
      itemsWrap.appendChild(row);

      // кнопки изменения количества товара
      const decBtn = row.querySelector('.cart-dec');
      const incBtn = row.querySelector('.cart-inc');

      if (decBtn) decBtn.addEventListener('click', (e) => { // уменьшение
        e.stopPropagation();
        cart[id] = Math.max(0, (cart[id]||0)-1);
        if(cart[id] === 0) delete cart[id];
        saveCart();
        syncAllAddButtons();
        updateCartUI();
      });

      if (incBtn) incBtn.addEventListener('click', (e) => { // увелечение
        e.stopPropagation();
        cart[id] = (cart[id]||0) + 1;
        saveCart();
        syncAllAddButtons();
        updateCartUI();
      });
    });

    // итоговая сумма
    const cs = document.getElementById('cart-sum');
    if (cs) cs.textContent = sum + ' ₽';
  }

  cartPopup.addEventListener('click', (e) => { e.stopPropagation(); });

  const clearBtn = cartPopup.querySelector('#clear-cart'); // очистка корзины
  const checkoutBtn = cartPopup.querySelector('#checkout-btn'); // оформление заказа

  // очистка корзины
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (!confirm('Очистить корзину?')) return;
      cart = {};
      saveCart();
      syncAllAddButtons();
      updateCartUI();
    });
  }

  // оформление заказа
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openCheckoutModal();
    });
  }

  // открытие и закрытие корзины
  if (cartToggle) {
    cartToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      cartPopup.classList.toggle('open');
      updateCartUI();
    });
  }

  // клик вне корзины закрывает корзину
  document.addEventListener('click', (e) => {
    if (!cartPopup.contains(e.target) && !(cartToggle && cartToggle.contains(e.target))) {
      cartPopup.classList.remove('open');
    }
  });

  // построение суммы заказа
  function buildOrderSummaryHTML() {
    // собираем товары
    const items = Object.entries(cart).map(([id, qty]) => {
      // находим товар
      const p = products.find(x => x.id === id);
      if (!p) return null;

      // возващаем структуру товара
      return `
      <div class="order-row">
        <div class="or-left">
          <img src="${p.img}" alt="${p.title}">
          <div class="or-title">${p.title}</div>
        </div>
        <div class="or-right">${qty} × ${p.price} ₽ = ${qty * p.price} ₽</div>
      </div>`;
    }).filter(Boolean).join('');

    // вычисляем общую сумму заказа
    const total = Object.entries(cart).reduce((s,[id, qty]) => {
      const p = products.find(x => x.id === id);

      return s + (p ? p.price * qty : 0);
    }, 0);

    // возвращем собранную структуру
    return `
    <div class="order-items">${items}</div>
    <div class="order-total">Итого: <strong>${total} ₽</strong></div>`;
  }

  // открытие окна оплаты 
  function openCheckoutModal() {
    // определение переменной окна
    const pm = document.getElementById('payment-modal');
    if (!pm) return;

    // определение переменной суммы
    const summary = pm.querySelector('#order-summary');
    if (summary) summary.innerHTML = buildOrderSummaryHTML();

    pm.classList.add('open');

    // определение переменной имени
    const nameInput = pm.querySelector('input[name="name"]');
    if (nameInput) nameInput.focus();
  }

  // закрытие окна по кнопке или по нажатию на фон
  const pmCloseBtn = paymentModal.querySelector('.payment-close');
  if (pmCloseBtn) pmCloseBtn.addEventListener('click', () => paymentModal.classList.remove('open'));
  paymentModal.addEventListener('click', (e) => { if(e.target === paymentModal) paymentModal.classList.remove('open'); });

  // определение формы
  const checkoutForm = document.getElementById('checkout-form');

  if (checkoutForm) {
    // обработка подтверждения
    checkoutForm.addEventListener('submit', (e) => {
      // определение формы заполнения
      e.preventDefault();
      const fd = new FormData(checkoutForm);

      // поля для ввода
      const name = (fd.get('name') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();
      const address = (fd.get('address') || '').toString().trim();

      if (!name) {
        alert('Введите имя');
        return;
      }
      if (!address) {
        alert('Введите адрес доставки');
        return;
      }

      // при оплате очищаем всё и как бы переходим на страницу оплаты
      paymentModal.classList.remove('open');
      cart = {};
      saveCart();
      syncAllAddButtons();
      updateCartUI();

      window.location.href = 'index.html';
    });
  }

  // инициализация работы
  renderCatalog();
  updateCartUI();


  window.__miniCart = { cart, products, renderCatalog, updateCartUI };
})();
