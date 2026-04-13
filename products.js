/* products.js — 商品列表邏輯
   使用技術：Array methods, DOM操作, CSS Grid/Flex切換
   商品資料從後端 API 讀取（Spring Boot + PostgreSQL）
*/

const API_BASE = 'http://localhost:8080';

// 全域商品陣列，由 loadProductsFromAPI() 填入
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
        <div class="product-card" onclick="window.location='product-detail.html?id=${p.id}'">
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
             onclick="window.location='product-detail.html?id=${p.id}'" style="cursor:pointer;">
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

  // ── 品牌篩選 ──
  const brandHM      = document.getElementById('brand-hm')?.checked;
  const brandCassina = document.getElementById('brand-cassina')?.checked;
  const brandVitra   = document.getElementById('brand-vitra')?.checked;
  const brandFritz   = document.getElementById('brand-fritz')?.checked;
  const brandKnoll   = document.getElementById('brand-knoll')?.checked;
  const anyBrandChecked = brandHM || brandCassina || brandVitra || brandFritz || brandKnoll;

  // ── 價格上限 ──
  const maxPrice = parseInt(document.getElementById('priceRange')?.value || '300000');

  let filtered = allProducts.filter(p => {
    // 類別：「全部」勾選或沒有勾選任何特定類別，就全部通過
    const passCategory = catAll || !anyCatChecked ||
      (catChair   && p.cat === 'chair')   ||
      (catSofa    && p.cat === 'sofa')    ||
      (catTable   && p.cat === 'table')   ||
      (catStorage && p.cat === 'storage');

    // 品牌：沒有勾選任何品牌就全部通過
    const passBrand = !anyBrandChecked ||
      (brandHM      && p.brand === 'Herman Miller') ||
      (brandCassina && p.brand === 'Cassina')       ||
      (brandVitra   && p.brand === 'Vitra')         ||
      (brandFritz   && p.brand === 'Fritz Hansen')  ||
      (brandKnoll   && p.brand === 'Knoll');

    // 價格
    const passPrice = p.price <= maxPrice;

    return passCategory && passBrand && passPrice;
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
}

function setView(mode) {
  currentView = mode;
  document.getElementById('gridBtn').classList.toggle('active', mode === 'grid');
  document.getElementById('listBtn').classList.toggle('active', mode === 'list');
  filterProducts();
}

// ── 從後端 API 載入商品 ──
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
      id:    p.id,
      name:  p.name  || '',
      brand: p.brand || '',
      price: p.price || 0,
      cat:   p.category || '',     // API 叫 category，前端 filter 用 cat
      img:   p.mainImage || '',    // API 叫 mainImage，前端顯示用 img
      badge: '',                   // 目前不從 API 取，可之後擴充
      inStock: p.inStock !== false
    }));

    // 若後端沒有商品，顯示提示
    if (allProducts.length === 0) {
      if (grid) grid.innerHTML = `<div class="col-12 text-center py-5 text-muted">
        <i class="bi bi-inbox fs-2 d-block mb-3"></i>
        <p>目前尚無商品，請先在後台新增</p>
      </div>`;
      document.getElementById('productCount').textContent = '0';
      return;
    }

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
