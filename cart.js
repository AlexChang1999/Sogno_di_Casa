/* cart.js — 購物車共用功能
   使用技術：localStorage, DOM操作, Bootstrap Toast
*/

// ── 讀取購物車 ──
function getCart() {
  return JSON.parse(localStorage.getItem('forma_cart') || '[]');
}

// ── 儲存購物車 ──
function saveCart(cart) {
  localStorage.setItem('forma_cart', JSON.stringify(cart));
  updateCartBadge();
}

// ── 更新購物車數量徽章 ──
function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('#cartCount').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'flex' : 'none';
  });
}

// ── 加入購物車 ──
// variant 為選填，格式：{ color: '黑色皮革', wood: '黑胡桃木' }
function addToCart(id, name, price, qty = 1, brand = '', img = '', variant = null) {
  const cart = getCart();
  // 同一商品同一規格才合併數量；有 variant 時用複合 key 區分
  const key = variant ? `${id}_${variant.color || ''}_${variant.wood || ''}` : id;
  const idx = cart.findIndex(item => item._key === key);
  if (idx > -1) {
    cart[idx].qty += qty;
  } else {
    cart.push({ id, _key: key, name, price, qty, brand, img, variant });
  }
  saveCart(cart);
  showCartToast();
}

// ── Toast 通知 ──
function showCartToast() {
  const toastEl = document.getElementById('cartToast');
  if (toastEl) {
    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toast.show();
  }
}

// ── 初始化 Badge ──
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();

  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.forma-nav');
    if (nav) {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }
  });
});
