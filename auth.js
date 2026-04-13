/* auth.js — 會員驗證系統
   使用 localStorage 模擬後端驗證
   - forma_users  : 所有註冊會員資料
   - forma_session: 目前登入的會員 email
*/

// ── 取得所有會員 ──
function getUsers() {
  return JSON.parse(localStorage.getItem('forma_users') || '[]');
}

// ── 取得目前登入會員 ──
function getCurrentUser() {
  const email = localStorage.getItem('forma_session');
  if (!email) return null;
  return getUsers().find(u => u.email === email) || null;
}

// ── 登入 ──
function login(email, password) {
  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false, msg: '電子郵件或密碼錯誤' };
  localStorage.setItem('forma_session', email);
  return { ok: true, user };
}

// ── 註冊 ──
function register(name, email, password) {
  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return { ok: false, msg: '此電子郵件已被註冊' };
  }
  const newUser = { name, email, password, orders: [] };
  users.push(newUser);
  localStorage.setItem('forma_users', JSON.stringify(users));
  localStorage.setItem('forma_session', email);
  return { ok: true, user: newUser };
}

// ── 登出 ──
function logout() {
  localStorage.removeItem('forma_session');
  window.location.href = 'index.html';
}

// ── 儲存訂單到會員資料 ──
function saveOrderToUser(orderItems, total) {
  const email = localStorage.getItem('forma_session');
  if (!email) return;
  const users = getUsers();
  const idx = users.findIndex(u => u.email === email);
  if (idx === -1) return;

  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toLocaleDateString('zh-TW'),
    items: orderItems.map(i => ({
      name: i.name,
      brand: i.brand,
      qty: i.qty,
      price: i.price
    })),
    total
  };
  users[idx].orders.push(order);
  localStorage.setItem('forma_users', JSON.stringify(users));
}

// ── 更新所有頁面的導覽列會員狀態 ──
function updateNavAuth() {
  const user = getCurrentUser();
  const personLink = document.querySelector('.nav-icon .bi-person')?.parentElement;
  if (!personLink) return;

  if (user) {
    // 已登入：顯示名字 + 下拉選單
    personLink.outerHTML = `
      <div class="dropdown">
        <a href="#" class="nav-icon dropdown-toggle" data-bs-toggle="dropdown" style="text-decoration:none;">
          <i class="bi bi-person-check"></i>
          <span style="font-size:.75rem;letter-spacing:.05em;">${user.name}</span>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" style="min-width:150px;">
          <li><a class="dropdown-item small" href="account.html">我的訂單</a></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item small" href="#" onclick="logout()">登出</a></li>
        </ul>
      </div>`;
  } else {
    // 未登入：點擊導向登入頁
    personLink.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', updateNavAuth);
