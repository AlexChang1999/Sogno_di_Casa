/* brands.js — 品牌列表頁 & 品牌詳情頁邏輯 */

// API_BASE 由 auth.js 定義

// ── 判斷目前是哪個頁面 ──
const IS_DETAIL_PAGE = document.getElementById('brandName') !== null;

document.addEventListener('DOMContentLoaded', () => {
  if (IS_DETAIL_PAGE) {
    initBrandDetail();
  } else {
    loadBrandGrid();
  }
});

// ════════════════════════════════
// 品牌列表頁
// ════════════════════════════════

async function loadBrandGrid() {
  const grid = document.getElementById('brandGrid');
  if (!grid) return;

  try {
    const res   = await fetch(`${API_BASE}/api/brands`);
    const brands = await res.json();

    if (brands.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">目前尚無品牌資料</div>';
      return;
    }

    grid.innerHTML = brands.map(b => brandCardHtml(b)).join('');
  } catch (err) {
    grid.innerHTML = '<div class="col-12 text-center py-5 text-danger">品牌資料載入失敗，請稍後再試。</div>';
  }
}

function brandCardHtml(b) {
  const initial = b.name ? b.name.charAt(0) : '?';
  const cover   = b.coverImageUrl
    ? `<img src="${escHtml(b.coverImageUrl)}" class="brand-card-img" alt="${escHtml(b.name)}">`
    : `<div class="brand-card-placeholder"><span class="brand-card-initial">${escHtml(initial)}</span></div>`;

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="brand-card" onclick="window.location='brand-detail.html#id=${b.id}'">
        ${cover}
        <div class="brand-card-body">
          <div class="brand-card-meta">${escHtml(b.country || '')} · ${b.foundedYear || ''}</div>
          <h3 class="brand-card-name">${escHtml(b.name)}</h3>
          <p class="brand-card-tagline">${escHtml(b.tagline || '')}</p>
          <span class="brand-card-link">了解更多 <i class="bi bi-arrow-right"></i></span>
        </div>
      </div>
    </div>
  `;
}

// ════════════════════════════════
// 品牌詳情頁
// ════════════════════════════════

async function initBrandDetail() {
  const id = getIdFromUrl();
  if (!id) {
    document.getElementById('brandName').textContent = '找不到品牌';
    return;
  }

  try {
    const res   = await fetch(`${API_BASE}/api/brands/${id}`);
    if (!res.ok) throw new Error('not found');
    const brand = await res.json();
    renderBrandDetail(brand);
  } catch {
    document.getElementById('brandName').textContent = '品牌資料載入失敗';
  }
}

function renderBrandDetail(b) {
  const initial = b.name ? b.name.charAt(0) : '?';

  document.title = `${b.name} — FORMA`;
  setText('breadcrumbName', b.name);
  setText('brandName',      b.name);
  setText('brandTagline',   b.tagline || '');
  setText('brandCountry',   b.country || '—');
  setText('brandFounded',   b.foundedYear ? `${b.foundedYear} 年` : '—');
  setText('brandDescription', b.description || '');

  // 封面圖 or 首字占位
  if (b.coverImageUrl) {
    document.getElementById('brandCoverWrap').innerHTML =
      `<img src="${escHtml(b.coverImageUrl)}" class="brand-cover" alt="${escHtml(b.name)}">`;
  } else {
    setText('brandInitial', initial);
  }

  // 官網連結
  if (b.websiteUrl) {
    const link = document.getElementById('brandWebsite');
    link.href = b.websiteUrl;
    link.style.display = 'inline-flex';
  }
}

// ── 工具函式 ──

function getIdFromUrl() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const id   = parseInt(new URLSearchParams(hash).get('id'), 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// hash 改變時（詳情頁）重新載入
window.addEventListener('hashchange', () => {
  if (IS_DETAIL_PAGE) initBrandDetail();
});
