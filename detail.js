/* detail.js — 商品詳情功能
   使用技術：
   - CSS position (absolute/relative) → 放大鏡定位
   - JavaScript mousemove 事件
   - DOM manipulation
   - URL params
*/

let qty = 1;
let currentProductId = 1;
const PRODUCT_PRICE = 128000;

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

// ── 顏色選擇 ──
function selectColor(btn, name) {
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('colorSelected').textContent = name;
}

// ── 選項選擇 ──
function selectOption(btn, targetId, name) {
  btn.closest('.option-group').querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(targetId).textContent = name;
}

// ── 加入購物車（詳情頁） ──
function addToCartDetail() {
  addToCart(
    currentProductId,
    document.getElementById('detailName')?.textContent || 'Product',
    PRODUCT_PRICE,
    qty,
    document.getElementById('detailBrand')?.textContent || '',
    document.getElementById('mainImage')?.src || ''
  );
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  initMagnifier();

  // 從 URL 參數讀取 id（模擬路由）
  const params = new URLSearchParams(window.location.search);
  currentProductId = parseInt(params.get('id')) || 1;
});
