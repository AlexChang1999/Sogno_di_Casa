/* detail.js — 商品詳情功能
   所有商品資料全部從後端 API 動態載入，不再使用硬編碼資料
*/

// API_BASE 由 auth.js 定義（http://localhost:8080）

let qty = 1;
let currentProductId = 1;
let currentProductPrice = 0;
let dynamicColorImages = {}; // 由 API gallery 建立的顏色 → 圖片對照表

// ── 放大鏡功能 ──
function initMagnifier() {
  const container = document.getElementById('magnifierContainer');
  const mainImg   = document.getElementById('mainImage');
  const lens      = document.getElementById('magnifierLens');
  const result    = document.getElementById('magnifierResult');
  if (!container || !mainImg || !lens || !result) return;

  const ZOOM = 3;
  const LENS_SIZE = 120;
  lens.style.width  = LENS_SIZE + 'px';
  lens.style.height = LENS_SIZE + 'px';

  function updateMagnifier(e) {
    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    const halfLens = LENS_SIZE / 2;
    x = Math.max(halfLens, Math.min(rect.width  - halfLens, x));
    y = Math.max(halfLens, Math.min(rect.height - halfLens, y));
    lens.style.left = (x - halfLens) + 'px';
    lens.style.top  = (y - halfLens) + 'px';
    const bgX = -(x * ZOOM - result.offsetWidth  / 2);
    const bgY = -(y * ZOOM - result.offsetHeight / 2);
    result.style.backgroundImage    = `url('${mainImg.src}')`;
    result.style.backgroundSize     = `${rect.width * ZOOM}px ${rect.height * ZOOM}px`;
    result.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }

  container.addEventListener('mousemove', updateMagnifier);
  container.addEventListener('mouseenter', () => { lens.style.opacity = '1'; result.style.opacity = '1'; });
  container.addEventListener('mouseleave', () => { lens.style.opacity = '0'; result.style.opacity = '0'; });
}

// ── 切換縮圖 ──
function switchImage(thumbEl) {
  const mainImg = document.getElementById('mainImage');
  const result  = document.getElementById('magnifierResult');
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

// ── 顏色選擇 ──
function selectColor(btn, name) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('colorSelected').textContent = name;

  // 使用從 API gallery 建立的動態對照表
  const colorData = dynamicColorImages[name];
  if (!colorData) return;

  const mainImg    = document.getElementById('mainImage');
  const result     = document.getElementById('magnifierResult');
  const firstThumb = document.querySelector('.thumb');

  mainImg.style.opacity = '0';
  setTimeout(() => {
    const src = colorData.main || colorData.full;
    mainImg.src = src;
    mainImg.style.opacity = '1';
    if (result) result.style.backgroundImage = `url('${src}')`;
  }, 150);

  if (firstThumb) {
    const src = colorData.main || colorData.full;
    firstThumb.src = colorData.thumb || src;
    firstThumb.dataset.full = src;
    document.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
    firstThumb.classList.add('active');
  }
}

// ── 選項選擇（木材等）──
function selectOption(btn, targetId, name) {
  btn.closest('.option-group').querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(targetId).textContent = name;
}

// ── 加入購物車 ──
function addToCartDetail() {
  const color   = document.getElementById('colorSelected')?.textContent?.trim() || '';
  const wood    = document.getElementById('woodSelected')?.textContent?.trim()  || '';
  const variant = (color || wood) ? { color, wood } : null;

  addToCart(
    currentProductId,
    document.getElementById('detailName')?.textContent  || 'Product',
    currentProductPrice,
    qty,
    document.getElementById('detailBrand')?.textContent || '',
    document.getElementById('mainImage')?.src           || '',
    variant
  );
}

// ── 根據 gallery 動態產生顏色色票按鈕 ──
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

// ── 根據 woodOptionsJson 動態產生木材按鈕 ──
function generateWoodButtons(woodOptions) {
  const woodGroup = document.querySelector('.wood-option-group');
  if (!woodGroup) return;

  if (!woodOptions || woodOptions.length === 0) {
    // 沒有木材選項，隱藏整個木材區塊
    const woodSection = document.getElementById('woodSection');
    if (woodSection) woodSection.style.display = 'none';
    return;
  }

  // 有木材選項，顯示區塊並產生按鈕
  const woodSection = document.getElementById('woodSection');
  if (woodSection) woodSection.style.display = '';

  woodGroup.innerHTML = woodOptions.map((item, i) => `
    <button class="opt-btn ${i === 0 ? 'active' : ''}"
            onclick="selectOption(this, 'woodSelected', '${item.wood}')">
      ${item.wood}
    </button>
  `).join('');

  const woodLabel = document.getElementById('woodSelected');
  if (woodLabel && woodOptions.length > 0) woodLabel.textContent = woodOptions[0].wood;
}

// ── 顯示商品尺寸 ──
function renderDimensions(product) {
  const dimSection = document.getElementById('dimensionSection');
  if (!dimSection) return;

  const { widthCm, depthCm, heightCm } = product;
  if (!widthCm && !depthCm && !heightCm) {
    dimSection.style.display = 'none';
    return;
  }

  dimSection.style.display = '';
  const parts = [];
  if (widthCm)  parts.push(`W ${widthCm} cm`);
  if (depthCm)  parts.push(`D ${depthCm} cm`);
  if (heightCm) parts.push(`H ${heightCm} cm`);

  const el = document.getElementById('dimensionText');
  if (el) el.textContent = parts.join('  ×  ');
}

// ── 同步縮圖列 ──
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

// ── 從後端 API 動態載入商品資料 ──
async function loadProductData(id) {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${numId}`);
    if (!res.ok) throw new Error('API 回傳錯誤');
    const data = await res.json();

    // 解析 galleryJson
    let gallery = [];
    if (data.galleryJson) {
      try { gallery = JSON.parse(data.galleryJson); } catch (e) {}
    }

    // 解析 woodOptionsJson
    let woodOptions = [];
    if (data.woodOptionsJson) {
      try { woodOptions = JSON.parse(data.woodOptionsJson); } catch (e) {}
    }

    const product = {
      id:          data.id,
      name:        data.name        || '',
      brand:       data.brand       || '',
      price:       data.price       || 0,
      img:         data.mainImage   || '',
      gallery,
      woodOptions,
      description: data.description || '',
      widthCm:     data.widthCm,
      depthCm:     data.depthCm,
      heightCm:    data.heightCm,
    };

    // 建立顏色 → 圖片對照表
    dynamicColorImages = {};
    if (gallery.length > 0) {
      gallery.forEach(item => {
        if (item.color) {
          dynamicColorImages[item.color] = { main: item.full, thumb: item.thumb };
        }
      });
      generateColorButtons(gallery);
    }

    // 產生木材按鈕
    generateWoodButtons(woodOptions);

    // 更新 DOM
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

    // 顯示尺寸
    renderDimensions(product);

    syncThumbStrip(product);

  } catch (e) {
    console.warn('[detail.js] 無法從 API 載入商品，請確認後端已啟動。', e);
    // 顯示提示
    const nameEl = document.getElementById('detailName');
    if (nameEl) nameEl.textContent = '商品載入失敗，請確認後端已啟動';
  }
}

// ── Init ──
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const parsed = parseInt(params.get('id'), 10);
  currentProductId = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;

  await loadProductData(currentProductId);
  initMagnifier();
});
