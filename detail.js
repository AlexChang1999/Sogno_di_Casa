/* detail.js — 商品詳情功能
   使用技術：
   - CSS position (absolute/relative) → 放大鏡定位
   - JavaScript mousemove 事件
   - DOM manipulation
   - URL params
*/

// 相對於網站根目錄的路徑，部署到 GitHub Pages 時會與 repo 內檔案對應（勿用 file:// 或本機絕對路徑）
const EAMES_LOCAL_GALLERY = [
  { thumb: 'pics/Black.jpg',    full: 'pics/Black.jpg' },
  { thumb: 'pics/Brown.jpg',    full: 'pics/Brown.jpg' },
  { thumb: 'pics/camel.jpg',    full: 'pics/camel.jpg' },
  { thumb: 'pics/Navy_blue.jpg', full: 'pics/Navy_blue.jpg' },
];

// 商品資料（與 products.js 相同，用來根據 URL ?id= 查詢對應商品）
const PRODUCTS_DATA = [
  {
    id: 1,
    name: 'Eames Lounge Chair',
    brand: 'Herman Miller',
    price: 128000,
    img: 'pics/Black.jpg',
    gallery: EAMES_LOCAL_GALLERY,
  },
  { id: 2,  name: 'LC2 Grand Confort',    brand: 'Cassina',       price: 245000, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=90' },
  { id: 3,  name: 'Series 7 Chair',       brand: 'Fritz Hansen',  price: 38000,  img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=90' },
  { id: 4,  name: 'Noguchi Coffee Table', brand: 'Vitra',         price: 96000,  img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=90' },
  { id: 5,  name: 'Aeron Chair',          brand: 'Herman Miller', price: 158000, img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=900&q=90' },
  { id: 6,  name: 'Tulip Dining Table',   brand: 'Knoll',         price: 182000, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=90' },
  { id: 7,  name: 'Shell Chair',          brand: 'Fritz Hansen',  price: 62000,  img: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=90' },
  { id: 8,  name: 'Ant Chair',            brand: 'Fritz Hansen',  price: 29000,  img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=90' },
  { id: 9,  name: 'DSW Chair',            brand: 'Vitra',         price: 42000,  img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=900&q=90' },
  { id: 10, name: 'Barcelona Chair',      brand: 'Knoll',         price: 320000, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=90' },
  { id: 11, name: 'LC4 Chaise Longue',    brand: 'Cassina',       price: 285000, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=90' },
  { id: 12, name: 'Florence Knoll Sofa',  brand: 'Knoll',         price: 198000, img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=900&q=90' },
];

const PRODUCT_IMAGE_MAP = window.PRODUCT_IMAGE_MAP || {};

PRODUCTS_DATA.forEach((product) => {
  const custom = PRODUCT_IMAGE_MAP[product.id];
  if (!custom) return;
  if (custom.img) product.img = custom.img;
  if (Array.isArray(custom.gallery) && custom.gallery.length > 0) {
    product.gallery = custom.gallery;
  }
});

// API_BASE 由 auth.js 定義（http://localhost:8080），detail.js 直接沿用

let qty = 1;
let currentProductId = 1;
let currentProductPrice = 128000; // 由 loadProductData() 動態設定
let dynamicColorImages   = {};    // 由 API gallery 建立的顏色→圖片對照表

// 每種顏色對應的主圖與縮圖組合（優先使用 product-images.js 的 id=1 gallery）
const DEFAULT_COLOR_IMAGES = {
  '黑色皮革': { main: 'pics/Black.jpg', thumb: 'pics/Black.jpg' },
  '棕色皮革': { main: 'pics/Brown.jpg', thumb: 'pics/Brown.jpg' },
  '駝色皮革': { main: 'pics/camel.jpg', thumb: 'pics/camel.jpg' },
  '深藍皮革': { main: 'pics/Navy_blue.jpg', thumb: 'pics/Navy_blue.jpg' },
};

function buildColorImageMap() {
  const gallery = PRODUCT_IMAGE_MAP?.[1]?.gallery;
  if (!Array.isArray(gallery) || gallery.length < 4) return DEFAULT_COLOR_IMAGES;

  return {
    '黑色皮革': { main: gallery[0].full, thumb: gallery[0].thumb },
    '棕色皮革': { main: gallery[1].full, thumb: gallery[1].thumb },
    '駝色皮革': { main: gallery[2].full, thumb: gallery[2].thumb },
    '深藍皮革': { main: gallery[3].full, thumb: gallery[3].thumb },
  };
}

const COLOR_IMAGES = buildColorImageMap();

// ── 放大鏡功能 ──
function initMagnifier() {
  const container = document.getElementById('magnifierContainer');
  const mainImg = document.getElementById('mainImage');
  const lens = document.getElementById('magnifierLens');
  const result = document.getElementById('magnifierResult');

  if (!container || !mainImg || !lens || !result) return;

  const ZOOM = 3;         // 放大倍數
  const LENS_SIZE = 120;  // 放大鏡圓圈大小 (px)

  lens.style.width  = LENS_SIZE + 'px';
  lens.style.height = LENS_SIZE + 'px';

  function updateMagnifier(e) {
    const rect = container.getBoundingClientRect();

    // 滑鼠相對容器的位置
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // 邊界限制 (lens 圓心)
    const halfLens = LENS_SIZE / 2;
    x = Math.max(halfLens, Math.min(rect.width  - halfLens, x));
    y = Math.max(halfLens, Math.min(rect.height - halfLens, y));

    // 定位 lens
    lens.style.left = (x - halfLens) + 'px';
    lens.style.top  = (y - halfLens) + 'px';

    // 計算 background-position（縮放後的偏移）
    const bgX = -(x * ZOOM - result.offsetWidth  / 2);
    const bgY = -(y * ZOOM - result.offsetHeight / 2);

    result.style.backgroundImage    = `url('${mainImg.src}')`;
    result.style.backgroundSize     = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
    result.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }

  container.addEventListener('mousemove', updateMagnifier);
  container.addEventListener('mouseenter', () => {
    lens.style.opacity   = '1';
    result.style.opacity = '1';
  });
  container.addEventListener('mouseleave', () => {
    lens.style.opacity   = '0';
    result.style.opacity = '0';
  });
}

// ── 切換縮圖 ──
function switchImage(thumbEl) {
  const mainImg = document.getElementById('mainImage');
  const result = document.getElementById('magnifierResult');

  mainImg.style.opacity = '0';
  setTimeout(() => {
    mainImg.src = thumbEl.dataset.full;
    mainImg.style.opacity = '1';
    if (result) result.style.backgroundImage = `url('${thumbEl.dataset.full}')`;
  }, 150);

  document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}

// ── 數量控制 ──
function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById('qtyNum').textContent = qty;
}

// ── 顏色選擇（同時更換主圖與第一張縮圖）──
function selectColor(btn, name) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('colorSelected').textContent = name;

  // 優先使用從 API gallery 建立的動態顏色對照表
  // 如果 API 沒有資料，則 fallback 到舊的 COLOR_IMAGES（Eames 本地圖片）
  const colorData = dynamicColorImages[name] || COLOR_IMAGES[name];
  if (!colorData) return;

  const mainImg    = document.getElementById('mainImage');
  const result     = document.getElementById('magnifierResult');
  const firstThumb = document.querySelector('.thumb');

  // 淡出 → 換圖 → 淡入
  mainImg.style.opacity = '0';
  setTimeout(() => {
    const src = colorData.main || colorData.full;
    mainImg.src = src;
    mainImg.style.opacity = '1';
    if (result) result.style.backgroundImage = `url('${src}')`;
  }, 150);

  // 同步更新第一張縮圖
  if (firstThumb) {
    const src = colorData.main || colorData.full;
    firstThumb.src = colorData.thumb || src;
    firstThumb.dataset.full = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    firstThumb.classList.add('active');
  }
}

// ── 選項選擇 ──
function selectOption(btn, targetId, name) {
  btn.closest('.option-group').querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(targetId).textContent = name;
}

// ── 加入購物車（詳情頁，包含顏色與材質選擇）──
function addToCartDetail() {
  const color = document.getElementById('colorSelected')?.textContent?.trim() || '';
  const wood  = document.getElementById('woodSelected')?.textContent?.trim()  || '';
  const variant = (color || wood) ? { color, wood } : null;

  addToCart(
    currentProductId,
    document.getElementById('detailName')?.textContent || 'Product',
    currentProductPrice, // 使用動態載入的價格，不再硬寫死
    qty,
    document.getElementById('detailBrand')?.textContent || '',
    document.getElementById('mainImage')?.src || '',
    variant
  );
}

// ── 同步縮圖列（與主圖同一組相對路徑，避免主圖已換但縮圖仍指向舊網址） ──
function syncThumbStrip(product) {
  const strip = document.getElementById('thumbStrip');
  if (!strip || !product.img) return;

  const thumbs = strip.querySelectorAll('.thumb');
  const slides = product.gallery && product.gallery.length
    ? product.gallery
    : [{ thumb: product.img, full: product.img }];

  thumbs.forEach((el, i) => {
    const g = slides[i] || slides[0];
    el.src = g.thumb;
    el.dataset.full = g.full;
    el.classList.toggle('active', i === 0);
  });
}

function syncRelatedProducts() {
  const cards = document.querySelectorAll('.mt-6 .product-card[onclick*="product-detail.html?id="]');
  cards.forEach((card) => {
    const onclickText = card.getAttribute('onclick') || '';
    const match = onclickText.match(/id=(\d+)/);
    if (!match) return;

    const productId = Number(match[1]);
    const product = PRODUCTS_DATA.find((p) => p.id === productId);
    if (!product) return;

    const imgEl = card.querySelector('.product-img');
    const brandEl = card.querySelector('.product-brand');
    const nameEl = card.querySelector('.product-name');
    const priceEl = card.querySelector('.product-price');
    const btnEl = card.querySelector('.btn-overlay');

    if (imgEl) {
      imgEl.src = product.img;
      imgEl.alt = product.name;
    }
    if (brandEl) brandEl.textContent = product.brand;
    if (nameEl) nameEl.textContent = product.name;
    if (priceEl) priceEl.textContent = `NT$ ${product.price.toLocaleString()}`;
    if (btnEl) {
      btnEl.setAttribute(
        'onclick',
        `event.stopPropagation(); addToCart(${product.id},'${product.name.replace(/'/g, "\\'")}',${product.price})`
      );
    }
  });
}

function verifyColorImageMapping() {
  const keywordRules = {
    '黑色皮革': /black/i,
    '棕色皮革': /brown/i,
    '駝色皮革': /(camel|tan)/i,
    '深藍皮革': /(navy|blue)/i,
  };

  Object.entries(COLOR_IMAGES).forEach(([label, cfg]) => {
    const mainPath = String(cfg.main || '');
    const expected = keywordRules[label];
    if (expected && !expected.test(mainPath)) {
      console.warn(`[ColorMap] ${label} 的路徑看起來與文字描述不一致: ${mainPath}`);
    }

    const probe = new Image();
    probe.onerror = () => {
      console.warn(`[ColorMap] ${label} 圖片載入失敗: ${mainPath}`);
    };
    probe.src = mainPath;
  });
}

// ── 根據 URL ?id= 動態載入對應商品資料（優先從 API 讀取）──
async function loadProductData(id) {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return;

  let product = null;

  // 步驟 1：嘗試從後端 API 取得
  try {
    const res = await fetch(`${API_BASE}/api/products/${numId}`);
    if (res.ok) {
      const data = await res.json();
      let gallery = [];
      if (data.galleryJson) {
        try { gallery = JSON.parse(data.galleryJson); } catch (e) {}
      }
      product = {
        id:          data.id,
        name:        data.name  || '',
        brand:       data.brand || '',
        price:       data.price || 0,
        img:         data.mainImage || '',
        gallery:     gallery,
        description: data.description || ''
      };
    }
  } catch (e) {
    // 後端連不到，繼續用本機資料
  }

  // 步驟 2：API 失敗時，fallback 到硬編碼的 PRODUCTS_DATA
  if (!product) {
    product = PRODUCTS_DATA.find(p => p.id === numId);
    if (!product) return;
  }

  // 步驟 3：從 gallery 建立顏色→圖片對照表（給 selectColor() 使用）
  dynamicColorImages = {};
  if (product.gallery && product.gallery.length > 0) {
    product.gallery.forEach(item => {
      if (item.color) {
        dynamicColorImages[item.color] = { main: item.full, thumb: item.thumb };
      }
    });
    generateColorButtons(product.gallery);
  }

  // 步驟 4：更新 DOM
  const brandEl    = document.getElementById('detailBrand');
  const nameEl     = document.getElementById('detailName');
  const priceEl    = document.getElementById('detailPrice');
  const mainImg    = document.getElementById('mainImage');
  const breadcrumb = document.getElementById('breadcrumbProduct');
  const descEl     = document.getElementById('detailDescription');

  if (brandEl)    brandEl.textContent = product.brand;
  if (nameEl)     nameEl.textContent  = product.name;
  if (priceEl)    priceEl.textContent = `NT$ ${product.price.toLocaleString()}`;
  if (breadcrumb) breadcrumb.textContent = product.name;
  if (mainImg && product.img) mainImg.src = product.img;
  if (descEl && product.description) descEl.textContent = product.description;

  document.title      = `${product.name} — FORMA`;
  currentProductPrice = product.price;

  syncThumbStrip(product);
}

// ── 根據 gallery 動態產生顏色按鈕（若已有顏色資訊）──
function generateColorButtons(gallery) {
  const colorItems = gallery.filter(item => item.color);
  if (colorItems.length === 0) return;

  const swatchGroup = document.querySelector('.swatch-group');
  if (!swatchGroup) return;

  swatchGroup.innerHTML = colorItems.map((item, i) => `
    <button class="swatch ${i === 0 ? 'active' : ''}"
            onclick="selectColor(this, '${item.color}')"
            title="${item.color}"
            style="background-image:url('${item.thumb || item.full}'); background-size:cover; background-position:center;">
    </button>
  `).join('');

  const colorLabel = document.getElementById('colorSelected');
  if (colorLabel) colorLabel.textContent = colorItems[0].color;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const parsed = parseInt(params.get('id'), 10);
  currentProductId = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  // loadProductData 是 async，await 確保圖片設定完後再跑放大鏡
  await loadProductData(currentProductId);
  syncRelatedProducts();
  verifyColorImageMapping();
  initMagnifier();
});
