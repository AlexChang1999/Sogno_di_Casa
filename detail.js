/* detail.js — 商品詳情功能
   所有商品資料全部從後端 API 動態載入，不再使用硬編碼資料
   資料架構：
     galleryJson    → 圖片陣列 [{url:"..."}, ...]（最多4張）
     colorsJson     → 顏色選項 [{name:"...", hex:"#..."}]
     woodOptionsJson→ 木材選項 [{wood:"..."}]
*/

// API_BASE 由 auth.js 定義（http://localhost:8080）

let qty = 1;
let currentProductId = 1;
let currentProductPrice = 0;

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

// ── 顏色選擇（只更新標籤，顏色與圖片分離） ──
function selectColor(btn, name) {
  document.querySelectorAll('#colorSwatchGroup .swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('colorSelected').textContent = name;
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

// ── 根據 colorsJson 產生顏色色票按鈕（有就顯示，無就隱藏） ──
function generateColorButtons(colors) {
  const section     = document.getElementById('colorSection');
  const swatchGroup = document.getElementById('colorSwatchGroup');
  const colorLabel  = document.getElementById('colorSelected');

  if (!section || !swatchGroup) return;

  // 沒有設定顏色 → 隱藏整個顏色區塊
  if (!colors || colors.length === 0) {
    section.style.display = 'none';
    return;
  }

  // 有顏色資料 → 顯示並產生色票
  section.style.display = '';

  swatchGroup.innerHTML = colors.map((item, i) => {
    const hex  = item.hex  || '#cccccc';
    const name = item.name || '';
    return `
      <button class="swatch ${i === 0 ? 'active' : ''}"
              onclick="selectColor(this, '${name}')"
              title="${name}"
              style="background:${hex};">
      </button>
    `;
  }).join('');

  // 預設選中第一個顏色
  if (colorLabel) colorLabel.textContent = colors[0].name || '';
}

// ── 根據 woodOptionsJson 產生木材按鈕（有就顯示，無就隱藏） ──
function generateWoodButtons(woodOptions) {
  const section  = document.getElementById('woodSection');
  const btnGroup = document.getElementById('woodBtnGroup');
  const woodLabel= document.getElementById('woodSelected');

  if (!section || !btnGroup) return;

  // 沒有木材選項 → 隱藏
  if (!woodOptions || woodOptions.length === 0) {
    section.style.display = 'none';
    return;
  }

  // 有木材選項 → 顯示並產生按鈕
  section.style.display = '';

  btnGroup.innerHTML = woodOptions.map((item, i) => `
    <button class="opt-btn ${i === 0 ? 'active' : ''}"
            onclick="selectOption(this, 'woodSelected', '${item.wood}')">
      ${item.wood}
    </button>
  `).join('');

  if (woodLabel) woodLabel.textContent = woodOptions[0].wood || '';
}

// ── 同步縮圖列（從 galleryJson 圖片陣列填入，最多4張） ──
function syncThumbStrip(images, mainImageUrl) {
  const thumbEls = document.querySelectorAll('#thumbStrip .thumb');
  const mainImg  = document.getElementById('mainImage');

  // 若後端沒有圖片資料，只用主圖填第一格
  const imgs = (images && images.length > 0)
    ? images
    : (mainImageUrl ? [{ url: mainImageUrl }] : []);

  thumbEls.forEach((el, i) => {
    const img = imgs[i];
    if (img && img.url) {
      el.src          = img.url;
      el.dataset.full = img.url;
      el.style.display = '';
      el.classList.toggle('active', i === 0);
    } else {
      // 沒有這張圖 → 隱藏
      el.style.display = 'none';
    }
  });

  // 主圖顯示第一張（若有）
  if (mainImg && imgs.length > 0) {
    mainImg.src = imgs[0].url;
  }
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

// ── 從後端 API 動態載入商品資料 ──
async function loadProductData(id) {
  const numId = Number(id);
  if (!Number.isFinite(numId)) return;

  try {
    const res = await fetch(`${API_BASE}/api/products/${numId}`);
    if (!res.ok) throw new Error('API 回傳錯誤');
    const data = await res.json();

    // 解析圖片陣列（galleryJson）
    let images = [];
    if (data.galleryJson) {
      try { images = JSON.parse(data.galleryJson); } catch (e) {}
    }

    // 解析顏色選項（colorsJson）
    let colors = [];
    if (data.colorsJson) {
      try { colors = JSON.parse(data.colorsJson); } catch (e) {}
    }

    // 解析木材選項（woodOptionsJson）
    let woodOptions = [];
    if (data.woodOptionsJson) {
      try { woodOptions = JSON.parse(data.woodOptionsJson); } catch (e) {}
    }

    // 更新基本文字資訊
    const brandEl    = document.getElementById('detailBrand');
    const nameEl     = document.getElementById('detailName');
    const priceEl    = document.getElementById('detailPrice');
    const breadcrumb = document.getElementById('breadcrumbProduct');
    const descEl     = document.getElementById('detailDescription');
    const mainImg    = document.getElementById('mainImage');

    if (brandEl)    brandEl.textContent = data.brand       || '';
    if (nameEl)     nameEl.textContent  = data.name        || '';
    if (priceEl)    priceEl.textContent = `NT$ ${(data.price || 0).toLocaleString()}`;
    if (breadcrumb) breadcrumb.textContent = data.name     || '';
    if (descEl && data.description) descEl.textContent = data.description;

    // 先把主圖設好（syncThumbStrip 會用第一張圖片覆蓋）
    if (mainImg && data.mainImage) mainImg.src = data.mainImage;

    document.title      = `${data.name || '商品'} — FORMA`;
    currentProductPrice = data.price || 0;

    // 圖片縮圖列（galleryJson 的圖片，若無則用 mainImage）
    syncThumbStrip(images, data.mainImage);

    // 顏色選項（colorsJson，有就顯示，無就隱藏）
    generateColorButtons(colors);

    // 木材選項（woodOptionsJson，有就顯示，無就隱藏）
    generateWoodButtons(woodOptions);

    // 商品尺寸
    renderDimensions({ widthCm: data.widthCm, depthCm: data.depthCm, heightCm: data.heightCm });

  } catch (e) {
    console.warn('[detail.js] 無法從 API 載入商品，請確認後端已啟動。', e);
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
