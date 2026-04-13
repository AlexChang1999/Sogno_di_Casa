/* products.js — 商品列表邏輯
   使用技術：Array methods, DOM操作, CSS Grid/Flex切換
*/

const allProducts = [
  { id: 1, name: 'Eames Lounge Chair', brand: 'Herman Miller', price: 128000, cat: 'chair', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', badge: '新品' },
  { id: 2, name: 'LC2 Grand Confort', brand: 'Cassina', price: 245000, cat: 'sofa', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', badge: '' },
  { id: 3, name: 'Series 7 Chair', brand: 'Fritz Hansen', price: 38000, cat: 'chair', img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80', badge: '熱銷' },
  { id: 4, name: 'Noguchi Coffee Table', brand: 'Vitra', price: 96000, cat: 'table', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80', badge: '' },
  { id: 5, name: 'Aeron Chair', brand: 'Herman Miller', price: 158000, cat: 'chair', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80', badge: '' },
  { id: 6, name: 'Tulip Dining Table', brand: 'Knoll', price: 182000, cat: 'table', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', badge: '限量' },
  { id: 7, name: 'Shell Chair', brand: 'Fritz Hansen', price: 62000, cat: 'chair', img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', badge: '' },
  { id: 8, name: 'Ant Chair', brand: 'Fritz Hansen', price: 29000, cat: 'chair', img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80', badge: '' },
  { id: 9, name: 'DSW Chair', brand: 'Vitra', price: 42000, cat: 'chair', img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80', badge: '' },
  { id: 10, name: 'Barcelona Chair', brand: 'Knoll', price: 320000, cat: 'chair', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80', badge: '限量' },
  { id: 11, name: 'LC4 Chaise Longue', brand: 'Cassina', price: 285000, cat: 'sofa', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80', badge: '' },
  { id: 12, name: 'Florence Knoll Sofa', brand: 'Knoll', price: 198000, cat: 'sofa', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80', badge: '新品' },
];

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

// Init
document.addEventListener('DOMContentLoaded', () => {
  renderProducts(allProducts);
});
