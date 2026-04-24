/* home.js — 首頁動態內容
   功能：
   1. 從後端讀「本季主打」商品 → 填入 #featuredGrid（最多 4 個）
   2. 從後端讀「設計經典」商品 → 填入 #classicGrid（最多 3 個）
   3. 從後端讀「Hero 大輪播」商品 → 換掉 3 個 hero slide 的背景圖（最多 3 個）
   4. 沒資料時 fallback 到 /api/products 前幾個商品
*/

// API_BASE 由 auth.js 定義

// ── 共用：產生商品卡 HTML ──
// wide=true 時用 col-md-4（設計經典那種寬卡）；否則用 col-md-6 col-lg-3（4 欄卡）
function buildProductCard(p, wide = false) {
  const colClass = wide
    ? 'col-12 col-md-4 col-lg-4'
    : 'col-12 col-md-6 col-lg-3';
  const wideClass = wide ? ' product-card-wide' : '';
  const safeName  = (p.name || '').replace(/'/g, "\\'");
  const img       = p.mainImage || '';

  return `
    <div class="${colClass}">
      <div class="product-card${wideClass}" onclick="window.location='product-detail.html#id=${p.id}'">
        <div class="product-img-wrap">
          <img src="${img}" class="product-img" alt="${p.name || ''}"
               onerror="this.style.opacity='0.3'">
          <div class="product-overlay">
            <button class="btn-overlay"
                    onclick="event.stopPropagation(); addToCart(${p.id}, '${safeName}', ${p.price || 0})">
              <i class="bi bi-bag-plus me-1"></i> 加入購物車
            </button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-brand">${p.brand || ''}</p>
          <h3 class="product-name">${p.name || ''}</h3>
          <p class="product-price">NT$ ${(p.price || 0).toLocaleString()}</p>
        </div>
      </div>
    </div>
  `;
}

// ── 顯示「尚無商品」提示 ──
function renderEmpty(containerId, text) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="col-12 text-center py-4 text-muted" style="font-size:.85rem;">
      <i class="bi bi-inbox me-1"></i> ${text}
    </div>
  `;
}

// ── 載入本季主打商品 ──
// 規則：有勾選 isFeatured 的商品前 4 個；若為空則 fallback 到所有商品前 4 個
async function loadFeatured() {
  const container = document.getElementById('featuredGrid');
  if (!container) return;

  try {
    let res  = await fetch(`${API_BASE}/api/products/featured`);
    let data = res.ok ? await res.json() : [];

    if (!Array.isArray(data) || data.length === 0) {
      // Fallback：沒有任何 featured 商品 → 抓所有商品的前 4 個
      const allRes = await fetch(`${API_BASE}/api/products`);
      data = allRes.ok ? await allRes.json() : [];
    }

    data = data.slice(0, 4); // Q3=B：固定最多 4 個

    if (data.length === 0) {
      renderEmpty('featuredGrid', '目前尚無商品，請至後台新增');
      return;
    }

    container.innerHTML = data.map(p => buildProductCard(p, false)).join('');
  } catch (e) {
    renderEmpty('featuredGrid', '無法連線到後端服務');
  }
}

// ── 載入設計經典商品 ──
// 規則：有勾選 isClassic 的商品前 3 個；若為空則 fallback
async function loadClassic() {
  const container = document.getElementById('classicGrid');
  if (!container) return;

  try {
    let res  = await fetch(`${API_BASE}/api/products/classic`);
    let data = res.ok ? await res.json() : [];

    if (!Array.isArray(data) || data.length === 0) {
      const allRes = await fetch(`${API_BASE}/api/products`);
      data = allRes.ok ? await allRes.json() : [];
      // Fallback 時跳過 featured 已顯示的前 4 個，避免重複
      data = data.slice(4);
    }

    data = data.slice(0, 3); // Q3=B：固定最多 3 個

    if (data.length === 0) {
      renderEmpty('classicGrid', '目前尚無商品，請至後台新增');
      return;
    }

    container.innerHTML = data.map(p => buildProductCard(p, true)).join('');
  } catch (e) {
    renderEmpty('classicGrid', '無法連線到後端服務');
  }
}

// ── 載入 Hero 大輪播背景圖 ──
// 規則：有勾選 isHero 的商品前 3 張主圖；不足 3 張時用所有商品的前幾個補齊
async function loadHero() {
  const slides = [
    document.getElementById('heroSlide1'),
    document.getElementById('heroSlide2'),
    document.getElementById('heroSlide3'),
  ];
  if (slides.some(s => !s)) return; // 頁面結構不符就不動

  try {
    let res  = await fetch(`${API_BASE}/api/products/hero`);
    let heroProducts = res.ok ? await res.json() : [];

    // 不足 3 張時，用所有商品補齊（Q5=A）
    if (heroProducts.length < 3) {
      const allRes = await fetch(`${API_BASE}/api/products`);
      const all = allRes.ok ? await allRes.json() : [];
      // 把已在 heroProducts 的 id 濾掉，避免重複
      const existIds = new Set(heroProducts.map(p => p.id));
      const filler = all.filter(p => !existIds.has(p.id));
      heroProducts = heroProducts.concat(filler);
    }

    const top3 = heroProducts.slice(0, 3);

    // 逐張套用背景圖（覆蓋 CSS 裡 ::after 的硬編碼 Unsplash 圖）
    top3.forEach((p, i) => {
      if (!slides[i] || !p.mainImage) return;
      applyHeroBg(slides[i], p.mainImage);
    });
    // 如果後端完全沒商品，保留 CSS 預設樣式，不報錯
  } catch (e) {
    // 連不到後端，保留 CSS 預設背景
  }
}

// ── 套用 hero 背景圖（用 inline <style> 覆蓋 ::after 偽元素的 background） ──
// 因為 ::after 背景無法直接用 element.style 改，所以動態插入一段 CSS
function applyHeroBg(slideEl, imageUrl) {
  const id = slideEl.id; // heroSlide1 / heroSlide2 / heroSlide3
  let styleEl = document.getElementById(`${id}-bg-style`);
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = `${id}-bg-style`;
    document.head.appendChild(styleEl);
  }
  // center/cover 讓商品圖填滿 hero 區域
  styleEl.textContent = `
    #${id}::after {
      background: url('${imageUrl}') center/cover no-repeat !important;
      opacity: 0.55 !important;
    }
  `;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadFeatured();
  loadClassic();
  loadHero();
});
