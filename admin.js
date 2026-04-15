/* admin.js — 商家管理後台邏輯 */

const API_BASE = 'http://localhost:8080';

let productModal, deleteModal;
let editingProductId = null;

// ── 頁面初始化 ──
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  productModal = new bootstrap.Modal(document.getElementById('productModal'));
  deleteModal  = new bootstrap.Modal(document.getElementById('deleteModal'));
  document.getElementById('f_mainImage').addEventListener('input', function () {
    updateMainPreview(this.value);
  });
  document.getElementById('productModal').addEventListener('hidden.bs.modal', resetForm);
  loadProducts();
});

// ── 驗證管理員身份 ──
function checkAuth() {
  const user  = JSON.parse(localStorage.getItem('forma_user') || 'null');
  const token = localStorage.getItem('forma_token');
  if (!user || !token || user.role !== 'ADMIN') {
    sessionStorage.setItem('loginRedirect', 'admin.html');
    window.location.href = 'login.html';
    return;
  }
  document.getElementById('adminEmail').textContent = user.email;
}

// ── 帶 JWT token 的 fetch ──
function adminFetch(url, options = {}) {
  const token = localStorage.getItem('forma_token');
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });
}

// ── 切換側邊欄區段 ──
function showSection(name, btn) {
  ['products', 'orders', 'settings'].forEach(s => {
    document.getElementById(`section-${s}`).style.display = s === name ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');

  // 切換到訂單頁時自動載入
  if (name === 'orders') loadOrders();
}

// ── 登出 ──
function doLogout() {
  localStorage.removeItem('forma_token');
  localStorage.removeItem('forma_user');
  window.location.href = 'index.html';
}


// ════════════════════════════════
// 商品管理
// ════════════════════════════════

async function loadProducts() {
  const token = localStorage.getItem('forma_token');
  try {
    const res = await fetch(`${API_BASE}/api/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = await res.json();
    renderProductTable(products);
  } catch (e) {
    document.getElementById('productTableBody').innerHTML =
      `<tr class="loading-row"><td colspan="8">
        <i class="bi bi-wifi-off me-2"></i>無法連線到後端（請確認 Spring Boot 已啟動）
       </td></tr>`;
  }
}

function renderProductTable(products) {
  const tbody  = document.getElementById('productTableBody');
  const catMap = { chair: '椅子', sofa: '沙發', table: '桌子', storage: '收納' };

  document.getElementById('productCount').textContent = products.length;

  if (products.length === 0) {
    tbody.innerHTML = `<tr class="empty-row">
      <td colspan="8">
        <i class="bi bi-inbox" style="font-size:2rem; display:block; margin-bottom:12px;"></i>
        尚無商品 — 點擊右上角「新增商品」開始吧
      </td>
    </tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    // 標記（本季主打 / 設計經典）
    const flags = [
      p.isFeatured ? `<span class="flag-badge flag-featured"><i class="bi bi-star-fill me-1"></i>主打</span>` : '',
      p.isClassic  ? `<span class="flag-badge flag-classic"><i class="bi bi-award-fill me-1"></i>經典</span>`  : ''
    ].join('');

    return `
    <tr>
      <td><img src="${p.mainImage || ''}" class="product-thumb" alt="${p.name}" onerror="this.style.opacity='0'"></td>
      <td>
        <div class="product-name">${p.name}</div>
        ${p.description ? `<div class="product-desc">${p.description.substring(0, 55)}${p.description.length > 55 ? '...' : ''}</div>` : ''}
      </td>
      <td style="color:var(--muted);">${p.brand || '—'}</td>
      <td><span class="cat-badge">${catMap[p.category] || p.category || '—'}</span></td>
      <td style="white-space:nowrap;">NT$ ${(p.price || 0).toLocaleString()}</td>
      <td>${flags || '<span style="color:var(--muted);font-size:.75rem;">—</span>'}</td>
      <td>
        ${p.inStock
          ? '<span class="stock-badge stock-yes"><i class="bi bi-check-circle me-1"></i>有貨</span>'
          : '<span class="stock-badge stock-no"><i class="bi bi-x-circle me-1"></i>無貨</span>'}
      </td>
      <td>
        <button class="action-btn" onclick="openEditModal(${p.id})"><i class="bi bi-pencil"></i> 編輯</button>
        <button class="action-btn del" onclick="confirmDelete(${p.id}, '${p.name.replace(/'/g, "\\'")}')"><i class="bi bi-trash"></i></button>
      </td>
    </tr>`;
  }).join('');
}


// ════════════════════════════════
// 新增 / 編輯商品 Modal
// ════════════════════════════════

function openAddModal() {
  editingProductId = null;
  document.getElementById('modalTitle').textContent = '新增商品';
  productModal.show();
}

async function openEditModal(id) {
  editingProductId = id;
  document.getElementById('modalTitle').textContent = '編輯商品';

  try {
    const res = await adminFetch(`${API_BASE}/api/products/${id}`);
    const p   = await res.json();

    document.getElementById('f_name').value        = p.name        || '';
    document.getElementById('f_brand').value       = p.brand       || '';
    document.getElementById('f_category').value    = p.category    || '';
    document.getElementById('f_price').value       = p.price       || '';
    document.getElementById('f_description').value = p.description || '';
    document.getElementById('f_mainImage').value   = p.mainImage   || '';
    document.getElementById('f_inStock').checked   = p.inStock !== false;
    document.getElementById('f_isFeatured').checked = p.isFeatured === true;
    document.getElementById('f_isClassic').checked  = p.isClassic  === true;
    document.getElementById('f_widthCm').value  = p.widthCm  || '';
    document.getElementById('f_depthCm').value  = p.depthCm  || '';
    document.getElementById('f_heightCm').value = p.heightCm || '';

    updateMainPreview(p.mainImage || '');

    // 顏色款式
    document.getElementById('variantRows').innerHTML = '';
    if (p.galleryJson) {
      try {
        JSON.parse(p.galleryJson).forEach(item => addVariantRow(item.color || '', item.full || ''));
      } catch (e) {}
    }
    updateVariantEmpty();

    // 木材選項
    document.getElementById('woodRows').innerHTML = '';
    if (p.woodOptionsJson) {
      try {
        JSON.parse(p.woodOptionsJson).forEach(item => addWoodRow(item.wood || ''));
      } catch (e) {}
    }
    updateWoodEmpty();

    productModal.show();
  } catch (e) {
    showToast('無法載入商品資料', 'error');
  }
}

function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('f_inStock').checked    = true;
  document.getElementById('f_isFeatured').checked = false;
  document.getElementById('f_isClassic').checked  = false;
  document.getElementById('variantRows').innerHTML = '';
  document.getElementById('woodRows').innerHTML    = '';
  updateMainPreview('');
  updateVariantEmpty();
  updateWoodEmpty();
}

async function saveProduct() {
  const name  = document.getElementById('f_name').value.trim();
  const price = document.getElementById('f_price').value;
  if (!name || !price) {
    showToast('請填寫商品名稱與售價', 'error');
    return;
  }

  const gallery     = collectVariants();
  const woodOptions = collectWoods();
  const mainImage   = document.getElementById('f_mainImage').value.trim()
    || (gallery.length > 0 ? gallery[0].full : '');

  const widthCm  = document.getElementById('f_widthCm').value;
  const depthCm  = document.getElementById('f_depthCm').value;
  const heightCm = document.getElementById('f_heightCm').value;

  const payload = {
    name,
    brand:          document.getElementById('f_brand').value.trim(),
    category:       document.getElementById('f_category').value,
    price:          parseInt(price),
    description:    document.getElementById('f_description').value.trim(),
    mainImage,
    galleryJson:    gallery.length     ? JSON.stringify(gallery)     : null,
    woodOptionsJson: woodOptions.length ? JSON.stringify(woodOptions) : null,
    widthCm:        widthCm  ? parseInt(widthCm)  : null,
    depthCm:        depthCm  ? parseInt(depthCm)  : null,
    heightCm:       heightCm ? parseInt(heightCm) : null,
    isFeatured:     document.getElementById('f_isFeatured').checked,
    isClassic:      document.getElementById('f_isClassic').checked,
    inStock:        document.getElementById('f_inStock').checked
  };

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = '儲存中...';

  try {
    const url    = editingProductId ? `${API_BASE}/api/products/${editingProductId}` : `${API_BASE}/api/products`;
    const method = editingProductId ? 'PUT' : 'POST';
    const res    = await adminFetch(url, { method, body: JSON.stringify(payload) });

    if (!res.ok) {
      const err = await res.json();
      showToast('儲存失敗：' + (err.message || res.status), 'error');
      return;
    }

    productModal.hide();
    showToast(editingProductId ? '商品已更新' : '商品已新增', 'success');
    loadProducts();
  } catch (e) {
    showToast('無法連線到後端，請確認 Spring Boot 已啟動', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> 儲存商品';
  }
}


// ════════════════════════════════
// 刪除商品
// ════════════════════════════════

function confirmDelete(id, name) {
  deleteModal.show();
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    try {
      await adminFetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
      deleteModal.hide();
      showToast(`「${name}」已刪除`, 'success');
      loadProducts();
    } catch (e) {
      showToast('刪除失敗', 'error');
    }
  };
}


// ════════════════════════════════
// 顏色款式（Variants）
// ════════════════════════════════

function addVariantRow(colorName = '', imageUrl = '') {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <img src="${imageUrl}" class="variant-preview"
         style="${imageUrl ? '' : 'opacity:0;'}"
         onerror="this.style.opacity='0'">
    <input type="text" class="form-control form-control-sm variant-color"
           placeholder="顏色名稱（如：黑色）" style="flex:1;" value="${colorName}">
    <input type="text" class="form-control form-control-sm variant-url"
           placeholder="圖片 URL（或點右側上傳）" style="flex:2;" value="${imageUrl}"
           oninput="syncVariantPreview(this)">
    <label class="variant-upload-btn">
      <i class="bi bi-cloud-upload me-1"></i>上傳
      <input type="file" accept="image/*" style="display:none;" onchange="uploadVariantImage(this)">
    </label>
    <button type="button" class="variant-del-btn" onclick="removeVariantRow(this)">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  document.getElementById('variantRows').appendChild(row);
  updateVariantEmpty();
}

function removeVariantRow(btn) {
  btn.closest('.variant-row').remove();
  updateVariantEmpty();
}

function syncVariantPreview(input) {
  const preview = input.closest('.variant-row').querySelector('.variant-preview');
  preview.src = input.value;
  preview.style.opacity = input.value ? '1' : '0';
}

function collectVariants() {
  const gallery = [];
  document.querySelectorAll('#variantRows .variant-row').forEach(row => {
    const color = row.querySelector('.variant-color')?.value.trim() || '';
    const url   = row.querySelector('.variant-url')?.value.trim()   || '';
    if (url) gallery.push({ color, thumb: url, full: url });
  });
  return gallery;
}

function updateVariantEmpty() {
  const rows = document.querySelectorAll('#variantRows .variant-row').length;
  document.getElementById('variantEmpty').style.display = rows === 0 ? 'block' : 'none';
}


// ════════════════════════════════
// 木材選項（Woods）
// ════════════════════════════════

function addWoodRow(woodName = '') {
  const row = document.createElement('div');
  row.className = 'wood-row';
  row.innerHTML = `
    <i class="bi bi-tree" style="color:var(--muted); flex-shrink:0;"></i>
    <input type="text" class="form-control form-control-sm wood-name"
           placeholder="木材名稱（如：胡桃木）" style="flex:1;" value="${woodName}">
    <button type="button" class="variant-del-btn" onclick="removeWoodRow(this)">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  document.getElementById('woodRows').appendChild(row);
  updateWoodEmpty();
}

function removeWoodRow(btn) {
  btn.closest('.wood-row').remove();
  updateWoodEmpty();
}

function collectWoods() {
  const woods = [];
  document.querySelectorAll('#woodRows .wood-row').forEach(row => {
    const name = row.querySelector('.wood-name')?.value.trim() || '';
    if (name) woods.push({ wood: name });
  });
  return woods;
}

function updateWoodEmpty() {
  const rows = document.querySelectorAll('#woodRows .wood-row').length;
  document.getElementById('woodEmpty').style.display = rows === 0 ? 'block' : 'none';
}


// ════════════════════════════════
// 訂單管理
// ════════════════════════════════

const STATUS_MAP = {
  PENDING:   { label: '待處理', cls: 'status-PENDING' },
  CONFIRMED: { label: '已確認', cls: 'status-CONFIRMED' },
  SHIPPING:  { label: '配送中', cls: 'status-SHIPPING' },
  DELIVERED: { label: '已送達', cls: 'status-DELIVERED' }
};

async function loadOrders() {
  document.getElementById('orderTableBody').innerHTML =
    `<tr class="loading-row"><td colspan="7"><i class="bi bi-arrow-repeat me-2"></i>載入中...</td></tr>`;

  try {
    const res    = await adminFetch(`${API_BASE}/api/orders/all`);
    const orders = await res.json();
    renderOrderTable(orders);
  } catch (e) {
    document.getElementById('orderTableBody').innerHTML =
      `<tr class="loading-row"><td colspan="7"><i class="bi bi-wifi-off me-2"></i>無法連線到後端</td></tr>`;
  }
}

function renderOrderTable(orders) {
  document.getElementById('orderCount').textContent = orders.length;

  if (orders.length === 0) {
    document.getElementById('orderTableBody').innerHTML =
      `<tr class="empty-row"><td colspan="7"><i class="bi bi-inbox" style="font-size:2rem; display:block; margin-bottom:12px;"></i>目前尚無訂單</td></tr>`;
    return;
  }

  document.getElementById('orderTableBody').innerHTML = orders.map(o => {
    const st = STATUS_MAP[o.status] || STATUS_MAP.PENDING;
    const options = Object.entries(STATUS_MAP).map(([val, info]) =>
      `<option value="${val}" ${o.status === val ? 'selected' : ''}>${info.label}</option>`
    ).join('');

    return `
      <tr>
        <td>
          <button class="action-btn" style="padding:3px 8px;" onclick="toggleOrderDetail('detail-${o.rawId}')">
            <i class="bi bi-chevron-down" style="font-size:.7rem;"></i>
          </button>
        </td>
        <td style="font-family:monospace; font-size:.82rem;">${o.id}</td>
        <td style="color:var(--muted); font-size:.82rem;">${o.date}</td>
        <td>
          <div style="font-size:.85rem;">${o.recipientName || '—'}</div>
          <div style="font-size:.72rem; color:var(--muted);">${o.recipientAddress || ''}</div>
        </td>
        <td style="font-size:.82rem; color:var(--muted);">${o.recipientPhone || '—'}</td>
        <td style="white-space:nowrap; font-size:.85rem;">NT$ ${Number(o.total).toLocaleString()}</td>
        <td>
          <select class="status-select" onchange="updateOrderStatus(${o.rawId}, this.value)">
            ${options}
          </select>
        </td>
      </tr>
      <tr id="detail-${o.rawId}" style="display:none;" class="order-detail-row">
        <td colspan="7">
          <div style="font-size:.78rem; color:var(--muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:.08em;">訂單明細</div>
          <ul class="order-items-list list-unstyled mb-1">
            ${o.items.map(item => `
              <li><i class="bi bi-dot"></i>${item.productName}
                ${item.color ? `<span style="color:var(--accent)"> · ${item.color}</span>` : ''}
                ${item.wood  ? `<span style="color:#6dbf87"> · ${item.wood}</span>`  : ''}
                × ${item.qty} — NT$ ${Number(item.price).toLocaleString()}
              </li>`).join('')}
          </ul>
          ${o.note ? `<div style="font-size:.75rem; color:var(--muted); margin-top:6px;"><i class="bi bi-chat-left-text me-1"></i>備註：${o.note}</div>` : ''}
        </td>
      </tr>`;
  }).join('');
}

function toggleOrderDetail(id) {
  const row = document.getElementById(id);
  if (!row) return;
  row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}

async function updateOrderStatus(rawId, status) {
  try {
    const res = await adminFetch(`${API_BASE}/api/orders/${rawId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      showToast('訂單狀態已更新', 'success');
    } else {
      showToast('更新失敗', 'error');
    }
  } catch (e) {
    showToast('無法連線到後端', 'error');
  }
}


// ════════════════════════════════
// 圖片上傳
// ════════════════════════════════

async function uploadMainImage(input) {
  if (!input.files[0]) return;
  const url = await uploadFile(input.files[0]);
  if (url) {
    document.getElementById('f_mainImage').value = url;
    updateMainPreview(url);
    showToast('主圖上傳成功', 'success');
  }
}

async function uploadVariantImage(input) {
  if (!input.files[0]) return;
  const url = await uploadFile(input.files[0]);
  if (url) {
    const row     = input.closest('.variant-row');
    const urlInp  = row.querySelector('.variant-url');
    const preview = row.querySelector('.variant-preview');
    urlInp.value = url;
    preview.src   = url;
    preview.style.opacity = '1';
    showToast('顏色圖片上傳成功', 'success');
  }
}

async function uploadFile(file) {
  const token    = localStorage.getItem('forma_token');
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res  = await fetch(`${API_BASE}/api/products/upload-image`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body:    formData
    });
    const data = await res.json();
    if (!res.ok) { showToast('上傳失敗：' + (data.message || res.status), 'error'); return null; }
    return data.url;
  } catch (e) {
    showToast('上傳失敗，請確認後端已啟動', 'error');
    return null;
  }
}

function updateMainPreview(url) {
  const preview     = document.getElementById('mainImagePreview');
  const placeholder = document.getElementById('mainImagePlaceholder');
  if (url) {
    preview.src = url;
    preview.style.display     = 'block';
    placeholder.style.display = 'none';
  } else {
    preview.style.display     = 'none';
    placeholder.style.display = 'flex';
  }
}


// ════════════════════════════════
// 設定：升級管理員
// ════════════════════════════════

async function setupAdmin() {
  const email  = document.getElementById('setupEmail').value.trim();
  const secret = document.getElementById('setupSecret').value.trim();
  if (!email || !secret) { showToast('請填寫 Email 和管理員設定密碼', 'error'); return; }
  try {
    const res  = await fetch(`${API_BASE}/api/auth/setup-admin`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, secret })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message + '，請重新登入後生效', 'success');
      document.getElementById('setupEmail').value  = '';
      document.getElementById('setupSecret').value = '';
    } else {
      showToast('失敗：' + (data.message || ''), 'error');
    }
  } catch (e) {
    showToast('無法連線到後端', 'error');
  }
}


// ════════════════════════════════
// 通知 Toast
// ════════════════════════════════

function showToast(msg, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>${msg}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
