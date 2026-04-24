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

// ── 同步縮圖列 ──
// 來源：主圖 + galleryJson 裡的圖片（去重）
// 規則：只有 1 張圖時整個縮圖列隱藏；2 張以上才動態產生 <img>
// galleryJson 新格式：["url1", "url2", ...]（純字串陣列）
function syncThumbStrip(product) {
  const strip = document.getElementById('thumbStrip');
  if (!strip) return;

  // 收集所有候選圖片 URL
  const urls = [];
  if (product.img) urls.push(product.img);

  if (Array.isArray(product.gallery)) {
    product.gallery.forEach(item => {
      // 支援兩種格式：純字串 或 舊的 {full, thumb} 物件
      if (typeof item === 'string' && item.trim()) urls.push(item.trim());
      else if (item && typeof item === 'object' && item.full) urls.push(item.full);
    });
  }

  // 去重
  const unique = Array.from(new Set(urls));

  // 只有 1 張（或 0 張）→ 不顯示縮圖列
  if (unique.length <= 1) {
    strip.style.display = 'none';
    strip.innerHTML = '';
    return;
  }

  // 動態產生縮圖
  strip.style.display = '';
  strip.innerHTML = unique.map((url, i) => `
    <img class="thumb ${i === 0 ? 'active' : ''}"
         src="${url}"
         data-full="${url}"
         onclick="switchImage(this)"
         alt="view ${i + 1}">
  `).join('');
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

  // 步驟 1：從後端 API 取得商品資料（全部依賴後台，不再使用硬編碼）
  try {
    const res = await fetch(`${API_BASE}/api/products/${numId}`);
    if (res.ok) {
      const data = await res.json();

      // 解析 galleryJson（圖片縮圖列，可選）
      let gallery = [];
      if (data.galleryJson) {
        try { gallery = JSON.parse(data.galleryJson); } catch (e) {}
      }

      // 解析 colorsJson（顏色選項，格式：[{name, hex, image?}]）
      let colors = [];
      if (data.colorsJson) {
        try { colors = JSON.parse(data.colorsJson); } catch (e) {}
      }

      // 解析 woodOptionsJson（木材選項，格式：[{wood:"黑胡桃木"}, ...]）
      let woods = [];
      if (data.woodOptionsJson) {
        try { woods = JSON.parse(data.woodOptionsJson); } catch (e) {}
      }

      product = {
        id:          data.id,
        name:        data.name  || '',
        brand:       data.brand || '',
        price:       data.price || 0,
        img:         data.mainImage || '',
        gallery:     gallery,
        colors:      colors,
        woods:       woods,
        description: data.description || ''
      };
    }
  } catch (e) {
    console.error('[detail] 無法從後端取得商品資料：', e);
  }

  // 步驟 2：找不到商品時顯示提示（不再 fallback 到硬編碼）
  if (!product) {
    const nameEl = document.getElementById('detailName');
    if (nameEl) nameEl.textContent = '找不到此商品';
    return;
  }

  // 步驟 3：處理顏色選項（有資料才顯示整個顏色區塊）
  dynamicColorImages = {};
  const colorGroup = document.getElementById('colorGroup');
  if (Array.isArray(product.colors) && product.colors.length > 0) {
    product.colors.forEach(c => {
      if (c && c.name) {
        // 如果後台有設定顏色對應圖片，點擊顏色時切換主圖；否則維持原主圖
        dynamicColorImages[c.name] = {
          main:  c.image || product.img,
          thumb: c.image || product.img,
        };
      }
    });
    generateColorButtons(product.colors);
    if (colorGroup) colorGroup.style.display = '';
  } else {
    // 沒有顏色資料 → 整個顏色區塊隱藏
    if (colorGroup) colorGroup.style.display = 'none';
    const colorSwatches = document.getElementById('colorSwatches');
    if (colorSwatches) colorSwatches.innerHTML = '';
    const colorLabel = document.getElementById('colorSelected');
    if (colorLabel) colorLabel.textContent = '';
  }

  // 步驟 3.5：處理木材選項（有資料才顯示整個木材區塊）
  const woodGroup = document.getElementById('woodGroup');
  if (Array.isArray(product.woods) && product.woods.length > 0) {
    generateWoodButtons(product.woods);
    if (woodGroup) woodGroup.style.display = '';
  } else {
    if (woodGroup) woodGroup.style.display = 'none';
    const woodOptions = document.getElementById('woodOptions');
    if (woodOptions) woodOptions.innerHTML = '';
    const woodLabel = document.getElementById('woodSelected');
    if (woodLabel) woodLabel.textContent = '';
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
  if (mainImg && product.img) {
    mainImg.src = product.img;
    mainImg.onerror = () => {
      const fallback = (PRODUCT_IMAGE_MAP[numId] || {}).img;
      if (fallback) mainImg.src = fallback;
      mainImg.onerror = null; // 防止無限觸發
    };
  }
  if (descEl && product.description) descEl.textContent = product.description;

  document.title      = `${product.name} — FORMA`;
  currentProductPrice = product.price;

  syncThumbStrip(product);
}

// ── 根據 colorsJson 動態產生顏色按鈕 ──
// colors 格式：[{ name: '黑色皮革', hex: '#1a1a1a', image?: 'http://...' }]
function generateColorButtons(colors) {
  const colorItems = (colors || []).filter(c => c && c.name);
  // 注意：HTML 容器的 class 是 .color-swatches，id 是 colorSwatches
  const swatchGroup = document.getElementById('colorSwatches');
  if (!swatchGroup) return;

  if (colorItems.length === 0) {
    swatchGroup.innerHTML = '';
    return;
  }

  swatchGroup.innerHTML = colorItems.map((c, i) => {
    // 有圖片就用圖片當背景；否則用 hex 色塊
    const bgStyle = c.image
      ? `background-image:url('${c.image}'); background-size:cover; background-position:center;`
      : `background-color:${c.hex || '#ccc'};`;
    const safeName = String(c.name).replace(/'/g, "\\'");
    return `
      <button class="swatch ${i === 0 ? 'active' : ''}"
              onclick="selectColor(this, '${safeName}')"
              title="${c.name}"
              style="${bgStyle}">
      </button>
    `;
  }).join('');

  const colorLabel = document.getElementById('colorSelected');
  if (colorLabel) colorLabel.textContent = colorItems[0].name;
}

// ── 根據 woodOptionsJson 動態產生木材按鈕 ──
// woods 格式：[{ wood: '黑胡桃木' }, { wood: '白梣木' }, ...]
function generateWoodButtons(woods) {
  const items = (woods || []).filter(w => w && w.wood);
  const container = document.getElementById('woodOptions');
  if (!container) return;

  if (items.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = items.map((w, i) => {
    const safeName = String(w.wood).replace(/'/g, "\\'");
    return `
      <button class="opt-btn ${i === 0 ? 'active' : ''}"
              onclick="selectOption(this, 'woodSelected', '${safeName}')">
        ${w.wood}
      </button>
    `;
  }).join('');

  const woodLabel = document.getElementById('woodSelected');
  if (woodLabel) woodLabel.textContent = items[0].wood;
}

// ── 從 URL 讀取商品 id ──
// 優先讀 hash（#id=X），因為 npx serve 會把 query string 吃掉
// 若 hash 沒有才讀 query（?id=X）作為 fallback
function getProductIdFromUrl() {
  // hash 格式可能是 "#id=8" 或 "#/id=8"
  const hash = window.location.hash.replace(/^#\/?/, ''); // 去掉開頭 # 或 #/
  const hashParams = new URLSearchParams(hash);
  const hashId = parseInt(hashParams.get('id'), 10);
  if (Number.isFinite(hashId) && hashId > 0) return hashId;

  const queryParams = new URLSearchParams(window.location.search);
  const queryId = parseInt(queryParams.get('id'), 10);
  if (Number.isFinite(queryId) && queryId > 0) return queryId;

  return null;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  const id = getProductIdFromUrl();

  if (!id) {
    const nameEl = document.getElementById('detailName');
    if (nameEl) nameEl.textContent = '請從商品列表選擇商品';
    console.warn('[detail] 缺少 URL 參數 ?id= 或 #id=，請從商品列表進入此頁');
    return;
  }

  currentProductId = id;

  // loadProductData 是 async，await 確保圖片設定完後再跑放大鏡
  await loadProductData(currentProductId);
  syncRelatedProducts();
  initMagnifier();
  loadReviews(currentProductId);
  initStarPicker();
  initReviewForm();
});

// ── 當 hash 改變時（例如從相關商品點擊）重新載入資料 ──
window.addEventListener('hashchange', async () => {
  const id = getProductIdFromUrl();
  if (!id) return;
  currentProductId = id;
  await loadProductData(currentProductId);
  syncRelatedProducts();
  loadReviews(currentProductId);
  // 讓頁面捲回最上方，感覺像換頁
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── 評價功能 ──

/** 將 rating 數字轉成星號字串，例如 4 → "★★★★☆" */
function starsHtml(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

/** 防止 XSS：將特殊字元轉義 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** 從 API 載入該商品評價並渲染 */
async function loadReviews(productId) {
  const listEl  = document.getElementById('reviewList');
  const countEl = document.getElementById('reviewCount');
  if (!listEl) return;

  try {
    const res  = await fetch(`${API_BASE}/api/reviews?productId=${productId}`);
    const data = await res.json();

    if (countEl) countEl.textContent = data.length;

    if (data.length === 0) {
      listEl.innerHTML = '<p class="text-muted">此商品目前尚無評價，成為第一個留評的人吧！</p>';
      return;
    }

    listEl.innerHTML = data.map(r => {
      const date = new Date(r.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
      return `
        <div class="review-item">
          <div class="d-flex justify-content-between">
            <strong>${escapeHtml(r.authorName)}</strong>
            <span class="review-stars">${starsHtml(r.rating)}</span>
          </div>
          <p class="review-date">${date}</p>
          <p class="review-text">${escapeHtml(r.comment || '')}</p>
        </div>
      `;
    }).join('');
  } catch (err) {
    listEl.innerHTML = '<p class="text-danger">評價載入失敗，請稍後再試。</p>';
  }
}

/** 初始化星星評分選擇器 */
function initStarPicker() {
  const stars       = document.querySelectorAll('.star-opt');
  const ratingInput = document.getElementById('reviewRating');
  if (!stars.length || !ratingInput) return;

  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const val = +star.dataset.val;
      stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= val));
    });
    star.addEventListener('click', () => {
      const val = +star.dataset.val;
      ratingInput.value = val;
      stars.forEach(s => s.classList.toggle('selected', +s.dataset.val <= val));
    });
  });

  document.getElementById('starPicker')?.addEventListener('mouseleave', () => {
    const selected = +ratingInput.value;
    stars.forEach(s => s.classList.toggle('active', +s.dataset.val <= selected));
  });
}

/** 初始化評價送出表單 */
function initReviewForm() {
  const form  = document.getElementById('reviewForm');
  const hint  = document.getElementById('reviewLoginHint');
  const msgEl = document.getElementById('reviewMsg');
  if (!form) return;

  const token = localStorage.getItem('forma_token');
  if (!token) {
    form.style.display = 'none';
    if (hint) hint.style.display = 'block';
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rating = +document.getElementById('reviewRating').value;
    if (rating < 1 || rating > 5) {
      msgEl.textContent = '請選擇 1 到 5 顆星';
      msgEl.style.color = 'red';
      return;
    }

    const body = {
      productId:  currentProductId,
      authorName: document.getElementById('reviewAuthor').value.trim() || '匿名',
      rating,
      comment:    document.getElementById('reviewComment').value.trim(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body:    JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || '送出失敗');
      }

      msgEl.textContent = '評價已送出，感謝您的分享！';
      msgEl.style.color = 'green';
      form.reset();
      document.getElementById('reviewRating').value = 0;
      document.querySelectorAll('.star-opt').forEach(s => s.classList.remove('active', 'selected'));
      loadReviews(currentProductId);
    } catch (err) {
      msgEl.textContent = err.message;
      msgEl.style.color = 'red';
    }
  });
}
