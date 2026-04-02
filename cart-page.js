/* cart-page.js — 購物車頁面邏輯
   使用技術：localStorage, DOM操作, Bootstrap Modal
*/

function renderCartPage() {
  const cart = getCart();
  const emptyCart   = document.getElementById('emptyCart');
  const cartContent = document.getElementById('cartContent');
  const cartItems   = document.getElementById('cartItems');

  if (!emptyCart || !cartContent) return;

  if (cart.length === 0) {
    emptyCart.style.display   = 'block';
    cartContent.style.display = 'none';
    return;
  }

  emptyCart.style.display   = 'none';
  cartContent.style.display = 'flex';

  // Item count
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('itemCount').textContent = totalQty;

  // Render items
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item" id="item-${item.id}">
      <img class="cart-item-img"
           src="${item.img || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=70'}"
           alt="${item.name}">
      <div>
        <p class="cart-item-brand">${item.brand || 'FORMA'}</p>
        <h4 class="cart-item-name">${item.name}</h4>
        <p class="cart-item-meta">免費配送 · 7-14 個工作天</p>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" onclick="updateQty(${item.id}, -1)"><i class="bi bi-dash"></i></button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateQty(${item.id}, 1)"><i class="bi bi-plus"></i></button>
        </div>
      </div>
      <div style="text-align:right;">
        <p class="cart-item-price">NT$ ${(item.price * item.qty).toLocaleString()}</p>
        <button class="cart-item-remove" onclick="removeItem(${item.id})">移除</button>
      </div>
    </div>
  `).join('');

  // Summary
  updateSummary(cart);
}

function updateSummary(cart) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const tax      = Math.round(subtotal * 0.05);
  const total    = subtotal + tax;

  document.getElementById('subtotal').textContent = `NT$ ${subtotal.toLocaleString()}`;
  document.getElementById('tax').textContent      = `NT$ ${tax.toLocaleString()}`;
  document.getElementById('total').textContent    = `NT$ ${total.toLocaleString()}`;
  document.getElementById('shipping').textContent = subtotal >= 50000 ? '免費' : 'NT$ 3,000';
}

function updateQty(id, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCartPage();
}

function removeItem(id) {
  const el = document.getElementById(`item-${id}`);
  if (el) {
    el.style.opacity   = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
  }
  setTimeout(() => {
    const cart = getCart().filter(i => i.id !== id);
    saveCart(cart);
    renderCartPage();
  }, 300);
}

function clearCart() {
  if (!confirm('確定要清空購物車嗎？')) return;
  saveCart([]);
  renderCartPage();
}

function applyCoupon() {
  const code = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg  = document.getElementById('couponMsg');
  const VALID = { 'FORMA10': 10, 'DESIGN20': 20 };

  if (VALID[code]) {
    msg.className = 'coupon-msg coupon-ok';
    msg.textContent = `✓ 已套用折扣碼，享 ${VALID[code]}% 折扣`;
  } else {
    msg.className = 'coupon-msg coupon-err';
    msg.textContent = '✗ 無效的折扣碼，請重新輸入';
  }
}

function checkout() {
  const cart  = getCart();
  if (cart.length === 0) return;

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('modalItemCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('modalTotal').textContent     = `NT$ ${total.toLocaleString()}`;

  const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  modal.show();
}

function confirmOrder() {
  saveCart([]);
  bootstrap.Modal.getInstance(document.getElementById('checkoutModal')).hide();

  // 顯示成功訊息
  document.querySelector('.container').innerHTML = `
    <div class="text-center py-5" style="animation: fadeInUp .5s ease both;">
      <i class="bi bi-check-circle" style="font-size:4rem;color:var(--color-accent);display:block;margin-bottom:1.5rem;"></i>
      <h2 style="font-family:var(--font-display);font-weight:300;font-size:2.2rem;margin-bottom:1rem;">訂單已確認</h2>
      <p style="color:var(--color-muted);margin-bottom:2rem;">感謝您的訂購！我們將於 1-2 個工作天內與您確認配送細節。</p>
      <a href="products.html" class="btn-forma">繼續選購</a>
    </div>`;
}

// Init
document.addEventListener('DOMContentLoaded', renderCartPage);
