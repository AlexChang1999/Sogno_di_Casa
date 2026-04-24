/* cart-page.js — 購物車頁面邏輯
   使用技術：localStorage, DOM操作, Bootstrap Modal
*/

let activeDiscount = 0; // 目前套用的折扣百分比（0 = 無折扣）

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
  cartItems.innerHTML = cart.map(item => {
    const key = CSS.escape(item._key || item.id);
    return `
    <div class="cart-item" id="item-${key}">
      <img class="cart-item-img"
           src="${item.img || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&q=70'}"
           alt="${item.name}">
      <div>
        <p class="cart-item-brand">${item.brand || 'FORMA'}</p>
        <h4 class="cart-item-name">${item.name}</h4>
        ${item.variant ? `<p class="cart-item-meta" style="color:var(--color-muted)">${[item.variant.color, item.variant.wood].filter(Boolean).join(' · ')}</p>` : ''}
        <p class="cart-item-meta">免費配送 · 7-14 個工作天</p>
        <div class="cart-item-qty">
          <button class="cart-qty-btn" onclick="updateQty('${item._key || item.id}', -1)"><i class="bi bi-dash"></i></button>
          <span class="cart-qty-num">${item.qty}</span>
          <button class="cart-qty-btn" onclick="updateQty('${item._key || item.id}', 1)"><i class="bi bi-plus"></i></button>
        </div>
      </div>
      <div style="text-align:right;">
        <p class="cart-item-price">NT$ ${(item.price * item.qty).toLocaleString()}</p>
        <button class="cart-item-remove" onclick="removeItem('${item._key || item.id}')">移除</button>
      </div>
    </div>`;
  }).join('');

  // Summary
  updateSummary(cart);
}

function updateSummary(cart) {
  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount    = Math.round(subtotal * activeDiscount / 100);
  const discounted  = subtotal - discount;
  const shippingFee = discounted >= 50000 ? 0 : 3000;
  const tax         = Math.round(discounted * 0.05);
  const total       = discounted + shippingFee + tax;

  document.getElementById('subtotal').textContent  = `NT$ ${subtotal.toLocaleString()}`;
  document.getElementById('tax').textContent       = `NT$ ${tax.toLocaleString()}`;
  document.getElementById('shipping').textContent  = shippingFee === 0 ? '免費' : `NT$ ${shippingFee.toLocaleString()}`;
  document.getElementById('total').textContent     = `NT$ ${total.toLocaleString()}`;

  // 折扣列：有折扣才顯示
  const discountRow = document.getElementById('discountRow');
  if (discountRow) {
    discountRow.style.display = activeDiscount > 0 ? '' : 'none';
    document.getElementById('discountAmount').textContent = `-NT$ ${discount.toLocaleString()}`;
  }
}

function updateQty(key, delta) {
  const cart = getCart();
  const idx  = cart.findIndex(i => (i._key || i.id) == key);
  if (idx === -1) return;
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCartPage();
}

function removeItem(key) {
  const safeId = CSS.escape(key);
  const el = document.getElementById(`item-${safeId}`);
  if (el) {
    el.style.opacity    = '0';
    el.style.transform  = 'translateX(20px)';
    el.style.transition = 'all 0.3s ease';
  }
  setTimeout(() => {
    const cart = getCart().filter(i => (i._key || i.id) != key);
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
  const code  = document.getElementById('couponInput').value.trim().toUpperCase();
  const msg   = document.getElementById('couponMsg');
  const VALID = { 'FORMA10': 10, 'DESIGN20': 20 };

  if (VALID[code]) {
    activeDiscount = VALID[code]; // 設定折扣並重新計算金額
    msg.className   = 'coupon-msg coupon-ok';
    msg.textContent = `✓ 已套用折扣碼，享 ${activeDiscount}% 折扣`;
    updateSummary(getCart());
  } else {
    activeDiscount  = 0;
    msg.className   = 'coupon-msg coupon-err';
    msg.textContent = '✗ 無效的折扣碼，請重新輸入';
    updateSummary(getCart());
  }
}

function checkout() {
  const cart = getCart();
  if (cart.length === 0) return;

  // 未登入則導向登入頁，用 sessionStorage 記住回來的頁面
  const user = getCurrentUser();
  if (!user) {
    sessionStorage.setItem('loginRedirect', 'cart.html');
    window.location.href = 'login.html';
    return;
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * activeDiscount / 100);
  const discounted = subtotal - discount;
  const shippingFee = discounted >= 50000 ? 0 : 3000;
  const tax = Math.round(discounted * 0.05);
  const total = discounted + shippingFee + tax;

  document.getElementById('modalItemCount').textContent = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('modalTotal').textContent     = `NT$ ${total.toLocaleString()}`;

  const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
  // 預填資料並清空舊錯誤
  document.getElementById('checkoutName').value = user.name || '';
  document.getElementById('checkoutPhone').value = '';
  document.getElementById('checkoutAddress').value = '';
  document.getElementById('checkoutNote').value = '';
  document.getElementById('checkoutErrorMsg').classList.add('d-none');
  modal.show();
}

async function confirmOrder() {
  // 1. 取得使用者輸入的收件資料
  const name    = document.getElementById('checkoutName').value.trim();
  const phone   = document.getElementById('checkoutPhone').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const note    = document.getElementById('checkoutNote').value.trim();
  const errorMsg = document.getElementById('checkoutErrorMsg');

  // 2. 基礎前端驗證
  if (!name || !phone || !address) {
    errorMsg.textContent = '請填寫完整的收件資訊（姓名、電話、地址）';
    errorMsg.classList.remove('d-none');
    return;
  }
  errorMsg.classList.add('d-none');

  // 3. 計算總金額
  const cart     = getCart();
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * activeDiscount / 100);
  const discounted = subtotal - discount;
  const shipping = discounted >= 50000 ? 0 : 3000;
  const tax      = Math.round(discounted * 0.05);
  const total    = discounted + shipping + tax;

  // 4. 組裝符合 Spring Boot OrderRequest 的資料格式
  const payload = {
    items: cart.map(item => ({
      productId: item.id || item._key,
      productName: item.name,
      brand: item.brand,
      price: item.price,
      qty: item.qty,
      color: item.variant ? item.variant.color : null,
      wood: item.variant ? item.variant.wood : null
    })),
    total: total,
    recipientName: name,
    recipientPhone: phone,
    recipientAddress: address,
    note: note
  };

  // 更改按鈕狀態防止重複點擊
  const btn = document.querySelector('#checkoutModal .btn-forma-sm-dark');
  const originText = btn.textContent;
  btn.textContent = '處理中...';
  btn.disabled = true;

  try {
    const token = localStorage.getItem('forma_token');
    const API_BASE = 'http://localhost:8080'; // 確保網址與後端一致
    
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || '訂單建立失敗，請確認後端連線');
    }

    // 5. 成功建立訂單：清空購物車、關閉 Modal 並顯示成功畫面
    saveCart([]);
    bootstrap.Modal.getInstance(document.getElementById('checkoutModal'))?.hide();

    const user = getCurrentUser();
    document.querySelector('.container').innerHTML = `
      <div class="text-center py-5" style="animation: fadeInUp .5s ease both;">
        <i class="bi bi-check-circle" style="font-size:4rem;color:var(--color-accent);display:block;margin-bottom:1.5rem;"></i>
        <h2 style="font-family:var(--font-display);font-weight:300;font-size:2.2rem;margin-bottom:1rem;">訂單已確認</h2>
        <p style="color:var(--color-muted);margin-bottom:.5rem;">感謝您的訂購，<strong>${user?.name || ''}</strong>！</p>
        <p style="color:var(--color-muted);margin-bottom:2rem;">我們將於 1-2 個工作天內與您確認 <strong>${address}</strong> 的配送細節。</p>
        <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
          <a href="account.html" class="btn-forma">查看我的訂單</a>
          <a href="products.html" class="btn-forma-outline">繼續選購</a>
        </div>
      </div>`;
      
  } catch (error) {
    // 顯示錯誤訊息
    errorMsg.textContent = error.message;
    errorMsg.classList.remove('d-none');
  } finally {
    // 恢復按鈕狀態
    btn.textContent = originText;
    btn.disabled = false;
  }
}

// Init
document.addEventListener('DOMContentLoaded', renderCartPage);
