/* products.js — 商品列表邏輯
   使用技術：Array methods, DOM操作, CSS Grid/Flex切換
   商品資料從後端 API 讀取（Spring Boot + PostgreSQL）
*/

// 全域商品陣列，由 loadProductsFromAPI() 填入
// API_BASE 由 auth.js 定義（http://localhost:8080）
let allProducts = [];

let currentView = 'grid';

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  document.getElementById('productCount').textContent = products.length;

  if (products.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
      <i class="bi bi-search fs-2 d-block mb-3"></i>
      <p>找不到符合條件的商品</p>
    </div>`;
    return;
  }

  if (currentView === 'grid') {
    grid.className = 'row g-4';
    grid.innerHTML = products.map(p => `
      <div class="col-6 col-md-4 col-lg-4">
        <div class="product-card" onclick="window.location='product-detail.html#id=${p.id}'">
          <div class="product-img-wrap">
            <img src="${p.img}" class="product-img" alt="${p.name}" loading="lazy">
            <div class="product-overlay">
              <button class="btn-overlay" onclick="event.stopPropagation(); addToCart(${p.id},'${p.name}',${p.price})">
                <i class="bi bi-bag-plus me-1"></i> 加入購物車
              </button>
            </div>
            ${p.badge ? `<span class="product-badge ${p.badge === '熱銷' ? 'badge-sale' : ''}">${p.badge}</span>` : ''}
          </div>
          <div class="product-info">
            <p class="product-brand">${p.brand}</p>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-price">NT$ ${p.price.toLocaleString()}</p>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    // List view
    grid.className = 'row g-0';
    grid.innerHTML = products.map(p => `
      <div class="col-12">
        <div class="product-list-item d-flex gap-4 align-items-center py-3 border-bottom"
             onclick="window.location='product-detail.html#id=${p.id}'" style="cursor:pointer;">
          <img src="${p.img}" style="width:100px;height:100px;object-fit:cover;flex-shrink:0;background:var(--color-cream);" alt="${p.name}">
          <div class="flex-grow-1">
            <p class="product-brand mb-1">${p.brand}</p>
            <h3 class="product-name mb-1" style="font-size:1.1rem;">${p.name}</h3>
            <p class="product-price mb-0">NT$ ${p.price.toLocaleString()}</p>
          </div>
          <button class="btn-overlay" style="position:static;opacity:1;background:var(--color-black);color:white;border:none;padding:.5rem 1rem;font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;"
                  onclick="event.stopPropagation(); addToCart(${p.id},'${p.name}',${p.price})">
            加入購物車
          </button>
        </div>
      </div>
    `).join('');
  }
}

function filterProducts() {
  const sortVal = document.getElementById('sortBy').value;

  // ── 類別篩選 ──
  const catAll    = document.getElementById('cat-all')?.checked;
  const catChair  = document.getElementById('cat-chair')?.checked;
  const catSofa   = document.getElementById('cat-sofa')?.checked;
  const catTable  = document.getElementById('cat-table')?.checked;
  const catStorage = document.getElementById('cat-storage')?.checked;
  const anyCatChecked = catChair || catSofa || catTable || catStorage;

  // ── 品牌篩選（動態從 #brandFilters 抓勾選的品牌名）──
  const checkedBrands = Array.from(
    document.querySelectorAll('#brandFilters input[type="checkbox"]:checked')
  ).map(cb => cb.dataset.brand);
  const anyBrandChecked = checkedBrands.length > 0;

  // ── 設計師篩選（動態從 #designerFilters 抓勾選的設計師名）──
  const checkedDesigners = Array.from(
    document.querySelectorAll('#designerFilters input[type="checkbox"]:checked')
  ).map(cb => cb.dataset.designer);
  const anyDesignerChecked = checkedDesigners.length > 0;

  // ── 價格上限 ──
  const maxPrice = parseInt(document.getElementById('priceRange')?.value || '10000000', 10);

  let filtered = allProducts.filter(p => {
    const passCategory = catAll || !anyCatChecked ||
      (catChair   && p.cat === 'chair')   ||
      (catSofa    && p.cat === 'sofa')    ||
      (catTable   && p.cat === 'table')   ||
      (catStorage && p.cat === 'storage');

    const passBrand = !anyBrandChecked || checkedBrands.includes(p.brand);

    const passDesigner = !anyDesignerChecked || checkedDesigners.includes(p.designer);

    const passPrice = p.price <= maxPrice;

    return passCategory && passBrand && passDesigner && passPrice;
  });

  renderProducts(sortList(filtered, sortVal));
}

function sortProducts() {
  filterProducts();
}

// 勾選「全部」時，取消其他類別；勾選其他時，取消「全部」
function handleCatAll() {
  const all = document.getElementById('cat-all');
  if (all.checked) {
    ['cat-chair','cat-sofa','cat-table','cat-storage'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
  }
  filterProducts();
}

function handleCatSpecific() {
  const allEl = document.getElementById('cat-all');
  if (allEl) allEl.checked = false;
  filterProducts();
}

function sortList(arr, val) {
  if (val === 'price-asc') return arr.sort((a, b) => a.price - b.price);
  if (val === 'price-desc') return arr.sort((a, b) => b.price - a.price);
  if (val === 'name') return arr.sort((a, b) => a.name.localeCompare(b.name));
  return arr;
}

function updatePrice(val) {
  document.getElementById('priceMax').textContent = Number(val).toLocaleString();
  filterProducts(); // 價格改變時重新篩選
}

function setView(mode) {
  currentView = mode;
  document.getElementById('gridBtn').classList.toggle('active', mode === 'grid');
  document.getElementById('listBtn').classList.toggle('active', mode === 'list');
  filterProducts();
}

// ── 依後端商品資料動態產生品牌篩選 checkbox ──
// 規則：A→Z 排序，最多 8 個，實際有幾個品牌就顯示幾個
function renderBrandFilters(products) {
  const container = document.getElementById('brandFilters');
  if (!container) return;

  // 抽出不重複且非空的品牌名
  const brandSet = new Set();
  products.forEach(p => {
    if (p.brand && p.brand.trim()) brandSet.add(p.brand.trim());
  });

  // A→Z 排序（localeCompare 也支援中文），最多取 8 個
  const brands = Array.from(brandSet).sort((a, b) => a.localeCompare(b)).slice(0, 8);

  if (brands.length === 0) {
    container.innerHTML = `<div style="font-size:.8rem; color:#999;">尚無品牌資料</div>`;
    return;
  }

  container.innerHTML = brands.map((b, i) => {
    const safeId = `brand-${i}`;
    // data-brand 存真正的品牌名，filterProducts 會讀這個比對
    return `
      <div class="form-check filter-check">
        <input class="form-check-input" type="checkbox" id="${safeId}"
               data-brand="${b.replace(/"/g, '&quot;')}"
               onchange="filterProducts()">
        <label class="form-check-label" for="${safeId}">${b}</label>
      </div>
    `;
  }).join('');
}

// ── 從後端 API 載入商品 ──
// ── 設計師篩選 checkbox（從商品資料抽取，最多 10 個，可捲動）──
function renderDesignerFilters(products) {
  const container = document.getElementById('designerFilters');
  if (!container) return;

  const designerSet = new Set();
  products.forEach(p => {
    if (p.designer && p.designer.trim()) designerSet.add(p.designer.trim());
  });

  const designers = Array.from(designerSet).sort((a, b) => a.localeCompare(b)).slice(0, 10);

  if (designers.length === 0) {
    container.innerHTML = `<div style="font-size:.8rem; color:#999;">尚無設計師資料</div>`;
    return;
  }

  container.innerHTML = designers.map((d, i) => {
    const safeId = `designer-${i}`;
    return `
      <div class="form-check filter-check">
        <input class="form-check-input" type="checkbox" id="${safeId}"
               data-designer="${d.replace(/"/g, '&quot;')}"
               onchange="filterProducts()">
        <label class="form-check-label" for="${safeId}">${d}</label>
      </div>`;
  }).join('');

  initDragScroll(container);
}

// ── 拖曳捲動（滑鼠按住拖動）──
function initDragScroll(el) {
  let isDown = false, startY, scrollTop;
  el.addEventListener('mousedown', e => {
    isDown = true;
    startY = e.pageY - el.offsetTop;
    scrollTop = el.scrollTop;
    el.style.cursor = 'grabbing';
  });
  el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mouseup',    () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mousemove',  e => {
    if (!isDown) return;
    e.preventDefault();
    el.scrollTop = scrollTop - (e.pageY - el.offsetTop - startY);
  });
}

async function loadProductsFromAPI() {
  const grid = document.getElementById('productGrid');
  if (grid) {
    grid.className = 'row g-4';
    grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
      <div class="spinner-border spinner-border-sm me-2" role="status"></div>載入商品中...
    </div>`;
  }

  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error('API 回傳錯誤');
    const data = await res.json();

    // 把後端欄位（category / mainImage）對應到前端用的（cat / img）
    allProducts = data.map(p => ({
      id:       p.id,
      name:     p.name  || '',
      brand:    p.brand || '',
      designer: p.designer || '',
      price:    p.price || 0,
      cat:      p.category || '',   // API 叫 category，前端 filter 用 cat
      img:      p.mainImage || '',  // API 叫 mainImage，前端顯示用 img
      badge:    '',                 // 目前不從 API 取，可之後擴充
      inStock: p.inStock !== false
    }));

    // 若後端沒有商品，顯示提示
    if (allProducts.length === 0) {
      if (grid) grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-inbox fs-2 d-block mb-3"></i>
        <p>目前尚無商品，請先在後台新增</p>
      </div>`;
      document.getElementById('productCount').textContent = '0';
      renderBrandFilters([]);
      return;
    }

    renderBrandFilters(allProducts);
    renderDesignerFilters(allProducts);
    filterProducts(); // 套用目前的篩選與排序後渲染
  } catch (e) {
    // 後端連不到時，顯示友善錯誤提示
    if (grid) grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
      <i class="bi bi-wifi-off fs-2 d-block mb-3"></i>
      <p>無法連線到後端服務</p>
      <p class="small">請先啟動 Spring Boot（./mvnw spring-boot:run）</p>
    </div>`;
    document.getElementById('productCount').textContent = '0';
  }
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  loadProductsFromAPI();
});
