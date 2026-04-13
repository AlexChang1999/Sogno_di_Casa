/* admin.js — 商家管理後台邏輯
   功能：商品 CRUD、圖片上傳、管理員設定
*/

const API_BASE = 'http://localhost:8080';

let productModal, deleteModal;
let editingProductId = null;  // null = 新增模式；有值 = 編輯模式

// ── 頁面初始化 ──
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // 建立 Bootstrap Modal 實例
  productModal = new bootstrap.Modal(document.getElementById('productModal'));
  deleteModal  = new bootstrap.Modal(document.getElementById('deleteModal'));

  // 主圖 URL 輸入框 → 即時預覽
  document.getElementById('f_mainImage').addEventListener('input', function () {
    updateMainPreview(this.value);
  });

  // 監聽 Modal 關閉，重設表單
  document.getElementById('productModal').addEventListener('hidden.bs.modal', resetForm);

  loadProducts();
});

// ── 驗證管理員身份 ──
function checkAuth() {
  const user  = JSON.parse(localStorage.getItem('forma_user') || 'null');
  const token = localStorage.getItem('forma_token');

  if (!user || !token || user.role !== 'ADMIN') {
    // 不是管理員，導向登入頁
    sessionStorage.setItem('loginRedirect', 'admin.html');
    window.location.href = 'login.html';
    return;
  }
  // 顯示管理員 Email
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

// ── 載入所有商品 ──
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
      `<tr class="loading-row"><td colspan="7">
        <i class="bi bi-wifi-off me-2"></i>無法連線到後端（請確認 Spring Boot 已啟動）
       </td></tr>`;
  }
}

// ── 渲染商品表格 ──
function renderProductTable(products) {
  const tbody  = document.getElementById('productTableBody');
  const catMap = { chair: '椅子', sofa: '沙發', table: '桌子', storage: '收納' };

  document.getElementById('productCount').textContent = products.length;

  if (products.length === 0) {
    tbody.innerHTML = `<tr class="empty-row">
      <td colspan="7">
        <i class="bi bi-inbox" style="font-size:2rem; display:block; margin-bottom:12px;"></i>
        尚無商品 — 點擊右上角「新增商品」開始吧
      </td>
    </tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.mainImage || ''}" class="product-thumb"
             alt="${p.name}"
             onerror="this.style.opacity='0'">
      </td>
      <td>
        <div class="product-name">${p.name}</div>
        ${p.description
          ? `<div class="product-desc">${p.description.substring(0, 55)}${p.description.length > 55 ? '...' : ''}</div>`
          : ''}
      </td>
      <td style="color:var(--muted);">${p.brand || '—'}</td>
      <td><span class="cat-badge">${catMap[p.category] || p.category || '—'}</span></td>
      <td style="white-space:nowrap;">NT$ ${(p.price || 0).toLocaleString()}</td>
      <td>
        ${p.inStock
          ? '<span class="stock-badge stock-yes"><i class="bi bi-check-circle me-1"></i>有貨</span>'
          : '<span class="stock-badge stock-no"><i class="bi bi-x-circle me-1"></i>無貨</span>'}
      </td>
      <td>
        <button class="action-btn" onclick="openEditModal(${p.id})">
          <i class="bi bi-pencil"></i> 編輯
        </button>
        <button class="action-btn del" onclick="confirmDelete(${p.id}, '${p.name.replace(/'/g, "\\'")}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}


// ════════════════════════════════
// 新增 / 編輯 Modal
// ════════════════════════════════

// ── 開啟「新增商品」Modal ──
function openAddModal() {
  editingProductId = null;
  document.getElementById('modalTitle').textContent = '新增商品';
  productModal.show();
}

// ── 開啟「編輯商品」Modal，並填入現有資料 ──
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

    updateMainPreview(p.mainImage || '');

    // 載入顏色款式
    document.getElementById('variantRows').innerHTML = '';
    if (p.galleryJson) {
      try {
        JSON.parse(p.galleryJson).forEach(item =>
          addVariantRow(item.color || '', item.full || '')
        );
      } catch (e) {}
    }
    updateVariantEmpty();

    productModal.show();
  } catch (e) {
    showToast('無法載入商品資料', 'error');
  }
}

// ── 重設表單（Modal 關閉時呼叫）──
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('f_inStock').checked = true;
  document.getElementById('variantRows').innerHTML = '';
  updateMainPreview('');
  updateVariantEmpty();
}

// ── 儲存商品（新增 or 更新）──
async function saveProduct() {
  const name  = document.getElementById('f_name').value.trim();
  const price = document.getElementById('f_price').value;
  if (!name || !price) {
    showToast('請填寫商品名稱與售價', 'error');
    return;
  }

  const gallery = collectVariants();

  // 若主圖空白但有顏色款式，自動使用第一張顏色圖
  const mainImage = document.getElementById('f_mainImage').value.trim()
    || (gallery.length > 0 ? gallery[0].full : '');

  const payload = {
    name,
    brand:       document.getElementById('f_brand').value.trim(),
    category:    document.getElementById('f_category').value,
    price:       parseInt(price),
    description: document.getElementById('f_description').value.trim(),
    mainImage,
    galleryJson: gallery.length ? JSON.stringify(gallery) : null,
    inStock:     document.getElementById('f_inStock').checked
  };

  const btn    = document.getElementById('saveBtn');
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

// ── 新增一列顏色款式 ──
function addVariantRow(colorName = '', imageUrl = '') {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <img src="${imageUrl}" class="variant-preview"
         style="${imageUrl ? '' : 'opacity:0;'}"
         onerror="this.style.opacity='0'">
    <input type="text"
           class="form-control form-control-sm variant-color"
           placeholder="顏色名稱（如：黑色）"
           style="flex:1;"
           value="${colorName}">
    <input type="text"
           class="form-control form-control-sm variant-url"
           placeholder="圖片 URL（或點右側上傳）"
           style="flex:2;"
           value="${imageUrl}"
           oninput="syncVariantPreview(this)">
    <label class="variant-upload-btn">
      <i class="bi bi-cloud-upload me-1"></i>上傳
      <input type="file" accept="image/*" style="display:none;"
             onchange="uploadVariantImage(this)">
    </label>
    <button type="button" class="variant-del-btn" title="移除"
            onclick="removeVariantRow(this)">
      <i class="bi bi-x-lg"></i>
    </button>
  `;

  document.getElementById('variantRows').appendChild(row);
  updateVariantEmpty();
}

// ── 移除顏色款式列 ──
function removeVariantRow(btn) {
  btn.closest('.variant-row').remove();
  updateVariantEmpty();
}

// ── 同步顏色款式的圖片預覽 ──
function syncVariantPreview(input) {
  const preview = input.closest('.variant-row').querySelector('.variant-preview');
  preview.src   = input.value;
  preview.style.opacity = input.value ? '1' : '0';
}

// ── 收集所有顏色款式成 gallery 陣列 ──
function collectVariants() {
  const gallery = [];
  document.querySelectorAll('#variantRows .variant-row').forEach(row => {
    const color = row.querySelector('.variant-color')?.value.trim() || '';
    const url   = row.querySelector('.variant-url')?.value.trim()   || '';
    if (url) {
      gallery.push({ color, thumb: url, full: url });
    }
  });
  return gallery;
}

// ── 更新「尚未新增顏色」提示的顯示狀態 ──
function updateVariantEmpty() {
  const empty = document.getElementById('variantEmpty');
  const rows  = document.querySelectorAll('#variantRows .variant-row').length;
  empty.style.display = rows === 0 ? 'block' : 'none';
}


// ════════════════════════════════
// 圖片上傳
// ════════════════════════════════

// ── 上傳主圖 ──
async function uploadMainImage(input) {
  if (!input.files[0]) return;
  const url = await uploadFile(input.files[0]);
  if (url) {
    document.getElementById('f_mainImage').value = url;
    updateMainPreview(url);
    showToast('主圖上傳成功', 'success');
  }
}

// ── 上傳顏色款式圖片 ──
async function uploadVariantImage(input) {
  if (!input.files[0]) return;
  const url = await uploadFile(input.files[0]);
  if (url) {
    const row     = input.closest('.variant-row');
    const urlInp  = row.querySelector('.variant-url');
    const preview = row.querySelector('.variant-preview');
    urlInp.value      = url;
    preview.src       = url;
    preview.style.opacity = '1';
    showToast('顏色圖片上傳成功', 'success');
  }
}

// ── 通用：上傳單一檔案到後端，回傳 URL ──
async function uploadFile(file) {
  const token    = localStorage.getItem('forma_token');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res  = await fetch(`${API_BASE}/api/products/upload-image`, {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body:    formData
      // 注意：上傳檔案時不設 Content-Type，讓瀏覽器自動設定 multipart boundary
    });
    const data = await res.json();
    if (!res.ok) {
      showToast('上傳失敗：' + (data.message || res.status), 'error');
      return null;
    }
    return data.url;
  } catch (e) {
    showToast('上傳失敗，請確認後端已啟動', 'error');
    return null;
  }
}

// ── 更新主圖預覽 ──
function updateMainPreview(url) {
  const preview     = document.getElementById('mainImagePreview');
  const placeholder = document.getElementById('mainImagePlaceholder');
  if (url) {
    preview.src           = url;
    preview.style.display = 'block';
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
  if (!email || !secret) {
    showToast('請填寫 Email 和管理員設定密碼', 'error');
    return;
  }

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
  toast.innerHTML = `
    <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
    ${msg}
  `;
  container.appendChild(toast);
  // 3 秒後自動消失
  setTimeout(() => {
    toast.style.opacity    = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
