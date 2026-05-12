const CART_KEY = 'johnnyClothingCart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `${value} SEK`;
}

function getBagCount(cart) {
  return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function updateBagCount() {
  const count = getBagCount(getCart());
  const countEl = document.querySelector('.bag-count');
  if (countEl) {
    countEl.textContent = count;
  }
}

function renderCart() {
  const cart = getCart();
  const items = Object.values(cart);
  const container = document.querySelector('.cart-items');
  const empty = document.querySelector('.cart-empty');
  const totalEl = document.querySelector('.cart-total');
  if (!container || !empty || !totalEl) return;

  container.innerHTML = '';
  if (items.length === 0) {
    empty.style.display = 'block';
    totalEl.textContent = formatPrice(0);
    return;
  }

  empty.style.display = 'none';
  let total = 0;

  items.forEach(item => {
    total += item.price * item.quantity;

    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <div class="item-info">
        <div>
          <div class="item-title">${item.title}</div>
          <div class="item-meta">${item.name} · ${item.color}</div>
        </div>
        <div class="item-price">${formatPrice(item.price * item.quantity)}</div>
      </div>
      <div class="item-actions">
        <div class="quantity-control">
          <button type="button" class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button type="button" class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
        <button type="button" class="remove-item" data-id="${item.id}">Remove</button>
      </div>
    `;

    container.appendChild(itemEl);
  });

  totalEl.textContent = formatPrice(total);
  container.querySelectorAll('.qty-btn').forEach(btn => btn.addEventListener('click', handleQuantity));
  container.querySelectorAll('.remove-item').forEach(btn => btn.addEventListener('click', handleRemove));
}

function saveCartAndRefresh(cart) {
  saveCart(cart);
  updateBagCount();
  renderCart();
}

function addToCart(item) {
  if (!item.id) return;
  const cart = getCart();
  const existing = cart[item.id];
  if (existing) {
    existing.quantity += 1;
  } else {
    cart[item.id] = { ...item, quantity: 1 };
  }
  saveCartAndRefresh(cart);
}

function handleQuantity(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!id) return;

  const cart = getCart();
  const item = cart[id];
  if (!item) return;

  if (action === 'increase') {
    item.quantity += 1;
  } else if (action === 'decrease') {
    item.quantity = Math.max(1, item.quantity - 1);
  }

  saveCartAndRefresh(cart);
}

function handleRemove(event) {
  const id = event.currentTarget.dataset.id;
  if (!id) return;
  const cart = getCart();
  delete cart[id];
  saveCartAndRefresh(cart);
}

function openCart() {
  const overlay = document.querySelector('.cart-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');
  document.body.style.overflow = 'hidden';
  renderCart();
}

function closeCart() {
  const overlay = document.querySelector('.cart-overlay');
  if (!overlay) return;
  overlay.classList.remove('visible');
  document.body.style.overflow = '';
}

function handleQuickAdd(event) {
  event.preventDefault();
  event.stopPropagation();
  const card = event.currentTarget.closest('.product-card');
  if (!card) return;
  addToCart({
    id: card.dataset.id,
    title: card.dataset.title || card.dataset.name,
    name: card.dataset.name,
    color: card.dataset.color,
    price: Number(card.dataset.price) || 0,
  });
}

function handleProductAdd(event) {
  event.preventDefault();
  const button = event.currentTarget;
  addToCart({
    id: button.dataset.id,
    title: button.dataset.title || button.dataset.name,
    name: button.dataset.name,
    color: button.dataset.color,
    price: Number(button.dataset.price) || 0,
  });
  openCart();
}

function handleBagClick(event) {
  event.preventDefault();
  openCart();
}

function handleOverlayClick(event) {
  if (event.target.classList.contains('cart-overlay')) {
    closeCart();
  }
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeCart();
  }
}

function bindCartEvents() {
  document.querySelectorAll('.quick-add').forEach(btn => btn.addEventListener('click', handleQuickAdd));
  document.querySelectorAll('.add-to-bag').forEach(btn => btn.addEventListener('click', handleProductAdd));
  document.querySelectorAll('.bag-toggle').forEach(btn => btn.addEventListener('click', handleBagClick));
  const closeButton = document.querySelector('.cart-close');
  if (closeButton) closeButton.addEventListener('click', closeCart);
  const overlay = document.querySelector('.cart-overlay');
  if (overlay) overlay.addEventListener('click', handleOverlayClick);
  const checkoutButton = document.querySelector('.checkout-btn');
  if (checkoutButton) checkoutButton.addEventListener('click', () => {
    if (getBagCount(getCart()) === 0) return;
    alert('Checkout flow is not enabled in this demo.');
  });
  document.addEventListener('keydown', handleEscape);
}

function initCart() {
  bindCartEvents();
  updateBagCount();
}

document.addEventListener('DOMContentLoaded', initCart);
