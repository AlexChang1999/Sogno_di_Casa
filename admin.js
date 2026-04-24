/* admin.js — 商家管理後台邏輯
   功能：商品 CRUD、圖片上傳、管理員設定
*/
/* admin.js — 商家管理後台邏輯 */

const API_BASE = 'http://localhost:8080';

// 1. 將 historyModal 加在全域變數這裡，讓所有函式都抓得到
let productModal, deleteModal, brandModal, designerModal, historyModal;
let editingProductId = null;
let editingBrandId = null;
let editingDesignerId = null;

// ── 頁面初始化 ──
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();

  // 2. 在這裡統一初始化所有的 Modal (不要再包一層 DOMContentLoaded)
  historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
  productModal = new bootstrap.Modal(document.getElementById('productModal'));
  deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  brandModal = new bootstrap.Modal(document.getElementById('brandModal'));
  designerModal = new bootstrap.Modal(document.getElementById('designerModal'));

  document.getElementById('f_mainImage').addEventListener('input', function () {
    updateMainPreview(this.value);
  });

  document.getElementById('productModal').addEventListener('hidden.bs.modal', resetForm);

  loadProducts();
});

// ── 驗證管理員身份 ──
function checkAuth() {
  const user = JSON.parse(localStorage.getItem('forma_user') || 'null');
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
  ['products', 'orders', 'settings', 'brands', 'designers'].forEach(s => {
    document.getElementById(`section-${s}`).style.display = s === name ? 'block' : 'none';
  });
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (name === 'orders') loadAllOrders();
  if (name === 'brands') loadBrands();
  if (name === 'designers') loadDesigners();
}

// ════════════════════════════════
// 訂單查覽（管理員看所有會員訂單）
// ════════════════════════════════
let allOrdersList = []; // 新增：用來暫存所有訂單，方便前端篩選

async function loadAllOrders() {
  const token = localStorage.getItem('forma_token');
  const content = document.getElementById('orderContent');
  content.innerHTML = '<div style="color:var(--muted); padding:20px 0;">載入中…</div>';

  try {
    const res = await fetch(`${API_BASE}/api/orders/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error();

    allOrdersList = await res.json();
    renderOrders(allOrdersList); // 預設顯示全部
  } catch (e) {
    content.innerHTML = '<div style="color:#d9534f; padding:20px 0;">無法連線到後端，請確認後端已啟動</div>';
  }
}

// 新增：篩選訂單功能
function filterOrders(status, btn) {
  // 切換按鈕的視覺狀態
  const tabs = document.querySelectorAll('#orderFilterTabs button');
  tabs.forEach(b => {
    b.classList.remove('btn-primary-admin');
    b.classList.add('btn-outline-admin');
  });
  btn.classList.remove('btn-outline-admin');
  btn.classList.add('btn-primary-admin');

  // 篩選並重新渲染
  if (status === '全部') {
    renderOrders(allOrdersList);
  } else {
    const filtered = allOrdersList.filter(o => o.status === status);
    renderOrders(filtered);
  }
}

function renderOrders(orders) {
  const content = document.getElementById('orderContent');
  if (!orders.length) {
    content.innerHTML = '<div style="color:var(--muted); padding:40px 0; text-align:center;">此分類目前無訂單</div>';
    return;
  }

  const rows = orders.map(o => {
    const itemsHtml = o.items.map(it => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding:12px 4px;">${escapeHtml(it.productName)}${it.brand ? ' <span style="color:var(--muted);">/ ' + escapeHtml(it.brand) + '</span>' : ''}</td>
        <td style="padding:12px 4px; color:var(--text-soft);">${it.color ? escapeHtml(it.color) : '—'} / ${it.wood ? escapeHtml(it.wood) : '—'}</td>
        <td style="padding:12px 4px; text-align:right;">NT$ ${Number(it.price).toLocaleString()}</td>
        <td style="padding:12px 4px; text-align:center; color:var(--accent);">× ${it.qty}</td>
      </tr>
    `).join('');

    const statusOptions = ['待處理', '已聯絡', '已收款', '確認配送方式', '確認配送時間', '配送中', '已送達'];
    const statusSelectHtml = statusOptions.map(opt =>
      `<option value="${opt}" ${o.status === opt ? 'selected' : ''}>${opt}</option>`
    ).join('');

    // 拆分日期與時間
    const dateValue = o.deliveryTime ? o.deliveryTime.substring(0, 10) : '';
    const timeValue = o.deliveryTime ? o.deliveryTime.substring(11, 16) : '';

    // 👇 ===== 新增區塊：判斷是否為測試訂單 ===== 👇
    const testCardStyle = o.isTest 
      ? 'background:rgba(212, 195, 158, 0.05); border:1px dashed var(--accent); box-shadow:none;' 
      : 'background:var(--card); border:1px solid var(--border); box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
      
    const testBadge = o.isTest 
      ? '<span style="background:var(--accent); color:#111; font-size:0.75rem; padding:2px 8px; border-radius:4px; margin-left:12px; font-weight:600; vertical-align:middle;">範例訂單</span>' 
      : '';

    const testRevenueText = o.isTest 
      ? '<span style="color:var(--danger); font-size:0.8rem; margin-left:8px; font-weight:400;">(不計入營收)</span>' 
      : '';
    // 👆 ========================================== 👆

    return `
      <div style="${testCardStyle} border-radius:8px; margin-bottom:20px; padding:20px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:20px; margin-bottom:16px;">
          
          <div style="flex:1; min-width:280px;">
            <div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <strong style="font-size:1.2rem; color:var(--accent); letter-spacing:1px;">${escapeHtml(o.id)}</strong>
                ${testBadge}
                <span style="color:var(--muted); margin-left:12px; font-size:.9rem;">下單日：${escapeHtml(o.date)}</span>
              </div>
              <button class="action-btn del" onclick="confirmDeleteOrder(${o.rawId}, '${o.id}')" title="刪除訂單">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <div style="color:var(--text-soft); font-size:.9rem; line-height:1.8; background:rgba(255,255,255,0.03); padding:12px 16px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
              <div><i class="bi bi-person me-2" style="color:var(--accent);"></i><strong style="color:var(--text);">${escapeHtml(o.recipientName || '—')}</strong> / ${escapeHtml(o.recipientPhone || '—')}</div>
              <div><i class="bi bi-geo-alt me-2" style="color:var(--accent);"></i>${escapeHtml(o.recipientAddress || '—')}</div>
              ${o.note ? `<div style="color:#e07676; margin-top:8px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.1);"><i class="bi bi-chat-left-text me-2"></i>備註：${escapeHtml(o.note)}</div>` : ''}
            </div>
          </div>

          <div style="flex:0 0 320px; background:rgba(0,0,0,0.2); padding:16px; border-radius:6px; border:1px solid var(--border);">
            <div style="margin-bottom:12px;">
              <label style="font-size:.85rem; color:var(--muted); margin-bottom:6px; display:block;">訂單進度</label>
              <select id="status-${o.rawId}" class="form-select form-select-sm" style="background:#111; color:var(--text); border-color:var(--border-strong);">
                ${statusSelectHtml}
              </select>
            </div>
            <div style="margin-bottom:16px;">
              <label style="font-size:.85rem; color:var(--muted); margin-bottom:6px; display:block;">預定配送時間</label>
              <div style="display:flex; gap:8px;">
                <input type="date" id="date-${o.rawId}" class="form-control form-control-sm" value="${dateValue}" style="background:#111; color:var(--text); border-color:var(--border-strong);">
                <input type="time" id="time-${o.rawId}" class="form-control form-control-sm" value="${timeValue}" style="background:#111; color:var(--text); border-color:var(--border-strong);">
              </div>
            </div>
            <button onclick="saveOrderProgress(${o.rawId})" class="btn-forma-sm-dark w-100" style="padding:8px;">
               <i class="bi bi-save me-1"></i> 儲存進度
            </button>
            
            <button onclick="viewOrderHistory(${o.rawId})" class="btn-outline-admin w-100 mt-2" style="padding:6px; font-size:0.85rem;">
               <i class="bi bi-clock-history me-1"></i> 查看歷史紀錄
            </button>
          </div>
        </div>

        <div style="font-weight:500; text-align:right; margin-bottom:12px; font-size:1.1rem; color:var(--text);">
          總計 <span style="color:var(--accent);">NT$ ${Number(o.total).toLocaleString()}</span>
          ${testRevenueText} </div>
        
        <table style="width:100%; border-collapse:collapse; font-size:.9rem;">
          <thead style="background:rgba(255,255,255,0.03);">
            <tr style="color:var(--muted); text-align:left;">
              <th style="padding:10px 4px; border-radius:6px 0 0 6px;">商品</th>
              <th style="padding:10px 4px;">規格</th>
              <th style="padding:10px 4px; text-align:right;">單價</th>
              <th style="padding:10px 4px; text-align:center; border-radius:0 6px 6px 0;">數量</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      </div>
    `;
  }).join('');

  content.innerHTML = rows;
}

// 防 XSS：把使用者資料中的特殊字元轉義
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
  const tbody = document.getElementById('productTableBody');
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
    const p = await res.json();

    document.getElementById('f_name').value = p.name || '';
    document.getElementById('f_brand').value = p.brand || '';
    document.getElementById('f_designer').value = p.designer || '';
    document.getElementById('f_category').value = p.category || '';
    document.getElementById('f_price').value = p.price || '';
    document.getElementById('f_description').value = p.description || '';
    document.getElementById('f_mainImage').value = p.mainImage || '';
    document.getElementById('f_inStock').checked = p.inStock !== false;
    document.getElementById('f_isFeatured').checked = p.isFeatured === true;
    document.getElementById('f_isClassic').checked = p.isClassic === true;
    document.getElementById('f_isHero').checked = p.isHero === true;

    updateMainPreview(p.mainImage || '');

    // 載入顏色款式（優先讀 colorsJson）
    document.getElementById('variantRows').innerHTML = '';
    if (p.colorsJson) {
      try {
        JSON.parse(p.colorsJson).forEach(item =>
          addVariantRow(item.name || '', item.hex || '#000000', item.image || '')
        );
      } catch (e) { }
    }
    updateVariantEmpty();

    // 載入商品輪播圖（galleryJson 新格式為純字串陣列，舊資料相容 {full}/{color,full} 物件陣列）
    document.getElementById('galleryRows').innerHTML = '';
    if (p.galleryJson) {
      try {
        JSON.parse(p.galleryJson).forEach(item => {
          if (typeof item === 'string' && item.trim()) {
            addGalleryRow(item.trim());
          } else if (item && typeof item === 'object') {
            // 相容舊的 {full} 或 {color, full, thumb}；只取 full
            if (item.full) addGalleryRow(item.full);
          }
        });
      } catch (e) { }
    }
    updateGalleryEmpty();

    // 載入木材款式
    document.getElementById('woodRows').innerHTML = '';
    if (p.woodOptionsJson) {
      try {
        JSON.parse(p.woodOptionsJson).forEach(item =>
          addWoodRow(item.wood || '')
        );
      } catch (e) { }
    }
    updateWoodEmpty();

    productModal.show();
  } catch (e) {
    showToast('無法載入商品資料', 'error');
  }
}

// ── 重設表單（Modal 關閉時呼叫）──
function resetForm() {
  document.getElementById('productForm').reset();
  document.getElementById('f_inStock').checked = true;
  document.getElementById('f_isFeatured').checked = false;
  document.getElementById('f_isClassic').checked = false;
  document.getElementById('f_isHero').checked = false;
  document.getElementById('variantRows').innerHTML = '';
  document.getElementById('woodRows').innerHTML = '';
  document.getElementById('galleryRows').innerHTML = '';
  updateMainPreview('');
  updateVariantEmpty();
  updateWoodEmpty();
  updateGalleryEmpty();
}

// ── 儲存商品（新增 or 更新）──
async function saveProduct() {
  const name = document.getElementById('f_name').value.trim();
  const price = document.getElementById('f_price').value;
  if (!name || !price) {
    showToast('請填寫商品名稱與售價', 'error');
    return;
  }

  const colors = collectVariants();   // [{name, hex, image?}]
  const woods = collectWoods();      // [{wood}]
  const gallery = collectGallery();    // ["url1", "url2", ...]

  // 若主圖空白，依優先順序補：輪播圖第一張 → 顏色第一張
  const firstGalleryImage = gallery[0] || '';
  const firstColorImage = colors.find(c => c.image)?.image || '';
  const mainImage = document.getElementById('f_mainImage').value.trim()
    || firstGalleryImage
    || firstColorImage;

  const payload = {
    name,
    brand: document.getElementById('f_brand').value.trim(),
    designer: document.getElementById('f_designer').value.trim(),
    category: document.getElementById('f_category').value,
    price: parseInt(price),
    description: document.getElementById('f_description').value.trim(),
    mainImage,
    galleryJson: gallery.length ? JSON.stringify(gallery) : null,
    colorsJson: colors.length ? JSON.stringify(colors) : null,
    woodOptionsJson: woods.length ? JSON.stringify(woods) : null,
    inStock: document.getElementById('f_inStock').checked,
    isFeatured: document.getElementById('f_isFeatured').checked,
    isClassic: document.getElementById('f_isClassic').checked,
    isHero: document.getElementById('f_isHero').checked
  };

  const btn = document.getElementById('saveBtn');
  btn.disabled = true;
  btn.textContent = '儲存中...';

  try {
    const url = editingProductId ? `${API_BASE}/api/products/${editingProductId}` : `${API_BASE}/api/products`;
    const method = editingProductId ? 'PUT' : 'POST';
    const res = await adminFetch(url, { method, body: JSON.stringify(payload) });

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
// 支援 colorsJson 格式：{ name, hex, image? }
function addVariantRow(colorName = '', hex = '#000000', imageUrl = '') {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <img src="${imageUrl}" class="variant-preview"
         style="${imageUrl ? '' : 'opacity:0;'}"
         onerror="this.style.opacity='0'">
    <input type="text"
           class="form-control form-control-sm variant-color"
           placeholder="顏色名稱（如：黑色皮革）"
           style="flex:1;"
           value="${colorName}">
    <input type="color"
           class="form-control form-control-sm form-control-color variant-hex"
           title="選擇色碼"
           style="width:42px; padding:2px; flex:0 0 auto;"
           value="${hex || '#000000'}">
    <input type="text"
           class="form-control form-control-sm variant-url"
           placeholder="圖片 URL（選填，點右側可上傳）"
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
  preview.src = input.value;
  preview.style.opacity = input.value ? '1' : '0';
}

// ── 收集所有顏色款式成 colors 陣列（colorsJson 格式）──
// 回傳：[{ name, hex, image? }]
function collectVariants() {
  const colors = [];
  document.querySelectorAll('#variantRows .variant-row').forEach(row => {
    const name = row.querySelector('.variant-color')?.value.trim() || '';
    const hex = row.querySelector('.variant-hex')?.value.trim() || '#000000';
    const image = row.querySelector('.variant-url')?.value.trim() || '';
    // 只要有填名稱就算一筆（image 是選填）
    if (name) {
      const entry = { name, hex };
      if (image) entry.image = image;
      colors.push(entry);
    }
  });
  return colors;
}

// ── 更新「尚未新增顏色」提示的顯示狀態 ──
function updateVariantEmpty() {
  const empty = document.getElementById('variantEmpty');
  const rows = document.querySelectorAll('#variantRows .variant-row').length;
  empty.style.display = rows === 0 ? 'block' : 'none';
}


// ════════════════════════════════
// 商品輪播圖（Gallery Images）
// ════════════════════════════════

// ── 新增一列輪播圖 ──
function addGalleryRow(imageUrl = '') {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <img src="${imageUrl}" class="variant-preview"
         style="${imageUrl ? '' : 'opacity:0;'}"
         onerror="this.style.opacity='0'">
    <input type="text"
           class="form-control form-control-sm gallery-url"
           placeholder="圖片 URL（或點右側上傳）"
           style="flex:3;"
           value="${imageUrl}"
           oninput="syncGalleryPreview(this)">
    <label class="variant-upload-btn">
      <i class="bi bi-cloud-upload me-1"></i>上傳
      <input type="file" accept="image/*" style="display:none;"
             onchange="uploadGalleryImage(this)">
    </label>
    <button type="button" class="variant-del-btn" title="移除"
            onclick="removeGalleryRow(this)">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  document.getElementById('galleryRows').appendChild(row);
  updateGalleryEmpty();
}

// ── 移除輪播圖列 ──
function removeGalleryRow(btn) {
  btn.closest('.variant-row').remove();
  updateGalleryEmpty();
}

// ── 同步輪播圖預覽 ──
function syncGalleryPreview(input) {
  const preview = input.closest('.variant-row').querySelector('.variant-preview');
  preview.src = input.value;
  preview.style.opacity = input.value ? '1' : '0';
}

// ── 上傳輪播圖 ──
async function uploadGalleryImage(input) {
  if (!input.files[0]) return;
  const url = await uploadFile(input.files[0]);
  if (url) {
    const row = input.closest('.variant-row');
    const urlInp = row.querySelector('.gallery-url');
    const preview = row.querySelector('.variant-preview');
    urlInp.value = url;
    preview.src = url;
    preview.style.opacity = '1';
    showToast('輪播圖上傳成功', 'success');
  }
}

// ── 收集所有輪播圖 URL（純字串陣列）──
function collectGallery() {
  const urls = [];
  document.querySelectorAll('#galleryRows .variant-row').forEach(row => {
    const url = row.querySelector('.gallery-url')?.value.trim() || '';
    if (url) urls.push(url);
  });
  return urls;
}

// ── 更新「尚未新增輪播圖」提示 ──
function updateGalleryEmpty() {
  const empty = document.getElementById('galleryEmpty');
  if (!empty) return;
  const rows = document.querySelectorAll('#galleryRows .variant-row').length;
  empty.style.display = rows === 0 ? 'block' : 'none';
}


// ════════════════════════════════
// 木材款式（Wood Options）
// ════════════════════════════════

// ── 新增一列木材款式 ──
function addWoodRow(woodName = '') {
  const row = document.createElement('div');
  row.className = 'variant-row';
  row.innerHTML = `
    <input type="text"
           class="form-control form-control-sm wood-name"
           placeholder="木材名稱（如：黑胡桃木）"
           style="flex:1;"
           value="${woodName}">
    <button type="button" class="variant-del-btn" title="移除"
            onclick="removeWoodRow(this)">
      <i class="bi bi-x-lg"></i>
    </button>
  `;
  document.getElementById('woodRows').appendChild(row);
  updateWoodEmpty();
}

// ── 移除木材列 ──
function removeWoodRow(btn) {
  btn.closest('.variant-row').remove();
  updateWoodEmpty();
}

// ── 收集所有木材款式成 woodOptions 陣列 ──
// 回傳：[{ wood: '黑胡桃木' }, ...]
function collectWoods() {
  const woods = [];
  document.querySelectorAll('#woodRows .variant-row').forEach(row => {
    const wood = row.querySelector('.wood-name')?.value.trim() || '';
    if (wood) woods.push({ wood });
  });
  return woods;
}

// ── 更新「尚未新增木材」提示的顯示狀態 ──
function updateWoodEmpty() {
  const empty = document.getElementById('woodEmpty');
  if (!empty) return;
  const rows = document.querySelectorAll('#woodRows .variant-row').length;
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
    const row = input.closest('.variant-row');
    const urlInp = row.querySelector('.variant-url');
    const preview = row.querySelector('.variant-preview');
    urlInp.value = url;
    preview.src = url;
    preview.style.opacity = '1';
    showToast('顏色圖片上傳成功', 'success');
  }
}

// ── 通用：上傳單一檔案到後端，回傳 URL ──
async function uploadFile(file) {
  const token = localStorage.getItem('forma_token');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/api/products/upload-image`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
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
  const preview = document.getElementById('mainImagePreview');
  const placeholder = document.getElementById('mainImagePlaceholder');
  if (url) {
    preview.src = url;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
  }
}


// ════════════════════════════════
// 設定：升級管理員
// ════════════════════════════════

async function setupAdmin() {
  const email = document.getElementById('setupEmail').value.trim();
  const secret = document.getElementById('setupSecret').value.trim();
  if (!email || !secret) {
    showToast('請填寫 Email 和管理員設定密碼', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/setup-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, secret })
    });
    const data = await res.json();
    if (res.ok) {
      showToast(data.message + '，請重新登入後生效', 'success');
      document.getElementById('setupEmail').value = '';
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
  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2"></i>
    ${msg}
  `;
  container.appendChild(toast);
  // 3 秒後自動消失
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity .3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ════════════════════════════════
// 品牌管理 CRUD
// ════════════════════════════════

async function loadBrands() {
  const tbody = document.getElementById('brandTableBody');
  const count = document.getElementById('brandCount');
  tbody.innerHTML = '<tr class="loading-row"><td colspan="5"><i class="bi bi-arrow-repeat me-2"></i>載入中...</td></tr>';

  try {
    const res = await adminFetch(`${API_BASE}/api/brands`);
    const brands = await res.json();
    if (count) count.textContent = brands.length;
    renderBrandTable(brands);
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--danger);">載入失敗</td></tr>';
  }
}

function renderBrandTable(brands) {
  const tbody = document.getElementById('brandTableBody');
  if (brands.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--muted); text-align:center; padding:24px;">尚無品牌資料</td></tr>';
    return;
  }
  tbody.innerHTML = brands.map(b => `
    <tr>
      <td class="product-name">${escapeHtml(b.name)}</td>
      <td>${escapeHtml(b.country || '—')}</td>
      <td>${b.foundedYear || '—'}</td>
      <td style="color:var(--muted); font-size:.82rem;">${escapeHtml(b.tagline || '—')}</td>
      <td>
        <button class="action-btn edit-btn" onclick="openEditBrandModal(${b.id})">編輯</button>
        <button class="action-btn delete-btn" onclick="confirmDeleteBrand(${b.id}, '${escapeHtml(b.name)}')">刪除</button>
      </td>
    </tr>
  `).join('');
}

function openAddBrandModal() {
  editingBrandId = null;
  document.getElementById('brandModalTitle').textContent = '新增品牌';
  document.getElementById('brandForm').reset();
  brandModal.show();
}

async function openEditBrandModal(id) {
  editingBrandId = id;
  document.getElementById('brandModalTitle').textContent = '編輯品牌';

  const res = await adminFetch(`${API_BASE}/api/brands/${id}`);
  const brand = await res.json();

  document.getElementById('bf_name').value = brand.name || '';
  document.getElementById('bf_country').value = brand.country || '';
  document.getElementById('bf_foundedYear').value = brand.foundedYear || '';
  document.getElementById('bf_tagline').value = brand.tagline || '';
  document.getElementById('bf_description').value = brand.description || '';
  document.getElementById('bf_websiteUrl').value = brand.websiteUrl || '';
  document.getElementById('bf_logoUrl').value = brand.logoUrl || '';
  document.getElementById('bf_coverImageUrl').value = brand.coverImageUrl || '';
  document.getElementById('bf_sortOrder').value = brand.sortOrder ?? 99;

  brandModal.show();
}

async function saveBrand() {
  const name = document.getElementById('bf_name').value.trim();
  if (!name) { alert('品牌名稱為必填'); return; }

  const body = {
    name,
    country: document.getElementById('bf_country').value.trim() || null,
    foundedYear: parseInt(document.getElementById('bf_foundedYear').value) || null,
    tagline: document.getElementById('bf_tagline').value.trim() || null,
    description: document.getElementById('bf_description').value.trim() || null,
    websiteUrl: document.getElementById('bf_websiteUrl').value.trim() || null,
    logoUrl: document.getElementById('bf_logoUrl').value.trim() || null,
    coverImageUrl: document.getElementById('bf_coverImageUrl').value.trim() || null,
    sortOrder: parseInt(document.getElementById('bf_sortOrder').value) || 99,
  };

  const url = editingBrandId ? `${API_BASE}/api/brands/${editingBrandId}` : `${API_BASE}/api/brands`;
  const method = editingBrandId ? 'PUT' : 'POST';

  try {
    const res = await adminFetch(url, { method, body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    brandModal.hide();
    loadBrands();
  } catch {
    alert('儲存失敗，請稍後再試');
  }
}

function confirmDeleteBrand(id, name) {
  const modal = document.getElementById('deleteModal');
  modal.querySelector('p:first-of-type').textContent = `確定要刪除品牌「${name}」？`;
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    await adminFetch(`${API_BASE}/api/brands/${id}`, { method: 'DELETE' });
    deleteModal.hide();
    loadBrands();
  };
  deleteModal.show();
}

// ════════════════════════════════
// 設計師管理 CRUD
// ════════════════════════════════

async function loadDesigners() {
  const tbody = document.getElementById('designerTableBody');
  const count = document.getElementById('designerCount');
  tbody.innerHTML = '<tr class="loading-row"><td colspan="5"><i class="bi bi-arrow-repeat me-2"></i>載入中...</td></tr>';

  try {
    const res = await adminFetch(`${API_BASE}/api/designers`);
    const designers = await res.json();
    if (count) count.textContent = designers.length;
    renderDesignerTable(designers);
  } catch {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--danger);">載入失敗</td></tr>';
  }
}

function renderDesignerTable(designers) {
  const tbody = document.getElementById('designerTableBody');
  if (designers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="color:var(--muted); text-align:center; padding:24px;">尚無設計師資料</td></tr>';
    return;
  }
  tbody.innerHTML = designers.map(d => {
    const years = d.deathYear ? `${d.birthYear}–${d.deathYear}` : `${d.birthYear}–`;
    return `
      <tr>
        <td class="product-name">${escapeHtml(d.name)}</td>
        <td>${escapeHtml(d.nationality || '—')}</td>
        <td>${years}</td>
        <td style="color:var(--muted); font-size:.82rem;">${escapeHtml(d.associatedBrands || '—')}</td>
        <td>
          <button class="action-btn edit-btn" onclick="openEditDesignerModal(${d.id})">編輯</button>
          <button class="action-btn delete-btn" onclick="confirmDeleteDesigner(${d.id}, '${escapeHtml(d.name)}')">刪除</button>
        </td>
      </tr>
    `;
  }).join('');
}

function openAddDesignerModal() {
  editingDesignerId = null;
  document.getElementById('designerModalTitle').textContent = '新增設計師';
  document.getElementById('designerForm').reset();
  designerModal.show();
}

async function openEditDesignerModal(id) {
  editingDesignerId = id;
  document.getElementById('designerModalTitle').textContent = '編輯設計師';

  const res = await adminFetch(`${API_BASE}/api/designers/${id}`);
  const designer = await res.json();

  document.getElementById('df_name').value = designer.name || '';
  document.getElementById('df_nationality').value = designer.nationality || '';
  document.getElementById('df_birthYear').value = designer.birthYear || '';
  document.getElementById('df_deathYear').value = designer.deathYear || '';
  document.getElementById('df_tagline').value = designer.tagline || '';
  document.getElementById('df_biography').value = designer.biography || '';
  document.getElementById('df_associatedBrands').value = designer.associatedBrands || '';
  document.getElementById('df_famousWorks').value = designer.famousWorks || '';
  document.getElementById('df_portraitUrl').value = designer.portraitUrl || '';
  document.getElementById('df_sortOrder').value = designer.sortOrder ?? 99;

  designerModal.show();
}

async function saveDesigner() {
  const name = document.getElementById('df_name').value.trim();
  if (!name) { alert('設計師姓名為必填'); return; }

  const body = {
    name,
    nationality: document.getElementById('df_nationality').value.trim() || null,
    birthYear: parseInt(document.getElementById('df_birthYear').value) || null,
    deathYear: parseInt(document.getElementById('df_deathYear').value) || null,
    tagline: document.getElementById('df_tagline').value.trim() || null,
    biography: document.getElementById('df_biography').value.trim() || null,
    associatedBrands: document.getElementById('df_associatedBrands').value.trim() || null,
    famousWorks: document.getElementById('df_famousWorks').value.trim() || null,
    portraitUrl: document.getElementById('df_portraitUrl').value.trim() || null,
    sortOrder: parseInt(document.getElementById('df_sortOrder').value) || 99,
  };

  const url = editingDesignerId ? `${API_BASE}/api/designers/${editingDesignerId}` : `${API_BASE}/api/designers`;
  const method = editingDesignerId ? 'PUT' : 'POST';

  try {
    const res = await adminFetch(url, { method, body: JSON.stringify(body) });
    if (!res.ok) throw new Error();
    designerModal.hide();
    loadDesigners();
  } catch {
    alert('儲存失敗，請稍後再試');
  }
}

function confirmDeleteDesigner(id, name) {
  const modal = document.getElementById('deleteModal');
  modal.querySelector('p:first-of-type').textContent = `確定要刪除設計師「${name}」？`;
  document.getElementById('confirmDeleteBtn').onclick = async () => {
    await adminFetch(`${API_BASE}/api/designers/${id}`, { method: 'DELETE' });
    deleteModal.hide();
    loadDesigners();
  };
  deleteModal.show();
}

// ── 儲存訂單狀態與配送時間 ──
async function saveOrderProgress(orderId) {
  const status = document.getElementById(`status-${orderId}`).value;
  const dateVal = document.getElementById(`date-${orderId}`).value;
  const timeVal = document.getElementById(`time-${orderId}`).value;

  // 組合回 ISO 格式，如果只填日期沒填時間，預設給 00:00
  let deliveryTime = '';
  if (dateVal) {
    deliveryTime = `${dateVal}T${timeVal || '00:00'}`;
  }

  try {
    const res = await adminFetch(`${API_BASE}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, deliveryTime })
    });

    if (res.ok) {
      showToast(`訂單 #${orderId} 進度已更新`, 'success');
      loadAllOrders(); // 儲存後重新整理畫面，讓分類頁籤也能即時更新
    } else {
      showToast('更新失敗，請稍後再試', 'error');
    }
  } catch (e) {
    showToast('無法連線到伺服器', 'error');
  }
}

async function viewOrderHistory(orderId) {
  const content = document.getElementById('historyModalBody');
  content.innerHTML = '<div class="text-center py-4" style="color:var(--muted);">載入中...</div>';
  historyModal.show();

  try {
    const res = await adminFetch(`${API_BASE}/api/orders/${orderId}/history`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    if (data.length === 0) {
      content.innerHTML = '<div class="text-center py-4" style="color:var(--muted);">目前無任何編輯紀錄</div>';
      return;
    }

    // 渲染出時間軸風格的列表
    content.innerHTML = data.map(h => `
      <div style="border-left: 2px solid var(--accent); padding-left: 12px; margin-bottom: 16px; position:relative;">
        <div style="position:absolute; left:-5px; top:5px; width:8px; height:8px; border-radius:50%; background:var(--accent);"></div>
        <div style="font-size: 0.85rem; color: var(--muted); margin-bottom: 4px;">
          ${h.time.replace('T', ' ').substring(0, 16)} · <strong>${escapeHtml(h.operator)}</strong>
        </div>
        <div style="color: var(--text-soft); font-size: 0.95rem;">
          ${escapeHtml(h.action)}
        </div>
      </div>
    `).join('');

  } catch (e) {
    content.innerHTML = '<div class="text-center py-4 text-danger">無法載入紀錄</div>';
  }
}

// ── 刪除訂單 ──
function confirmDeleteOrder(orderId, orderDisplayId) {
  if (confirm(`確定要永久刪除訂單 ${orderDisplayId} 嗎？此操作無法復原。`)) {
    executeDeleteOrder(orderId);
  }
}

async function executeDeleteOrder(orderId) {
  try {
    const res = await adminFetch(`${API_BASE}/api/orders/${orderId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      showToast('訂單已刪除', 'success');
      loadAllOrders(); // 重新整理列表
    } else {
      showToast('刪除失敗', 'error');
    }
  } catch (e) {
    showToast('連線失敗', 'error');
  }
}