/* auth.js — 會員驗證系統（串接 Spring Boot 後端）
   所有會員資料改存入 PostgreSQL，不再用 localStorage 模擬
*/

const API_BASE = 'http://localhost:8080'; // Spring Boot 後端位址

// ── 取得 JWT Token（存在 localStorage）──
function getToken() {
  return localStorage.getItem('forma_token');
}

// ── 取得目前登入會員（從 localStorage 取快取的基本資訊）──
function getCurrentUser() {
  const raw = localStorage.getItem('forma_user');
  return raw ? JSON.parse(raw) : null;
}

// ── 帶 Token 的 fetch 輔助函式 ──
// 呼叫需要登入的 API 時，自動加上 Authorization header
async function authFetch(url, options = {}) {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
}

// ── 登入 ──
// 回傳 Promise，成功時 resolve { ok: true, user }，失敗時 resolve { ok: false, msg }
async function login(email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, msg: data.message || '登入失敗' };

    // 儲存 token 與基本資訊（含 role，admin.html 用來判斷是否顯示管理員入口）
    localStorage.setItem('forma_token', data.token);
    localStorage.setItem('forma_user', JSON.stringify({
      name:  data.name,
      email: data.email,
      role:  data.role || 'USER'
    }));
    return { ok: true, user: data };
  } catch (e) {
    return { ok: false, msg: '無法連線到伺服器，請確認後端已啟動' };
  }
}

// ── 步驟一：發送驗證碼 ──
async function sendCode(name, email, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, msg: data.message || '發送驗證碼失敗' };
    return { ok: true, msg: data.message };
  } catch (e) {
    return { ok: false, msg: '無法連線到伺服器，請確認後端已啟動' };
  }
}

// ── 步驟二：正式註冊 ──
// 修改：參數改為 email 與 code
async function register(email, code) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, msg: data.message || '註冊失敗' };

    localStorage.setItem('forma_token', data.token);
    localStorage.setItem('forma_user', JSON.stringify({
      name:  data.name,
      email: data.email,
      role:  data.role || 'USER'
    }));
    return { ok: true, user: data };
  } catch (e) {
    return { ok: false, msg: '無法連線到伺服器，請確認後端已啟動' };
  }
}

// ── 登出 ──
function logout() {
  localStorage.removeItem('forma_token');
  localStorage.removeItem('forma_user');
  window.location.href = 'index.html';
}

// ── 儲存訂單到後端（由 cart-page.js 呼叫）──
async function saveOrderToUser(cartItems, total) {
  const items = cartItems.map(i => ({
    productId:   i.id,
    productName: i.name,
    brand:       i.brand || '',
    price:       i.price,
    qty:         i.qty,
    color:       i.variant?.color || '',
    wood:        i.variant?.wood  || ''
  }));

  try {
    await authFetch(`${API_BASE}/api/orders`, {
      method: 'POST',
      body: JSON.stringify({ items, total })
    });
  } catch (e) {
    console.error('訂單儲存失敗', e);
  }
}

// ── 更新導覽列登入狀態 ──
function updateNavAuth() {
  const user = getCurrentUser();
  const personLink = document.querySelector('.nav-icon .bi-person')?.parentElement;
  if (!personLink) return;

  if (user) {
    // 管理員多一個「商家後台」選項
    const adminItem = user.role === 'ADMIN'
      ? `<li><a class="dropdown-item small" href="admin.html"><i class="bi bi-grid-3x3-gap me-1"></i>商家後台</a></li>
         <li><hr class="dropdown-divider"></li>`
      : '';

    personLink.outerHTML = `
      <div class="dropdown">
        <a href="#" class="nav-icon dropdown-toggle" data-bs-toggle="dropdown" style="text-decoration:none;">
          <i class="bi bi-person-check"></i>
          <span style="font-size:.75rem;letter-spacing:.05em;">${user.name}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" style="min-width:160px;">
          ${adminItem}
          <li><a class="dropdown-item small" href="account.html">我的訂單</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item small" href="#" onclick="logout()">登出</a></li>
        </ul>
      </div>`;
  } else {
    personLink.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
