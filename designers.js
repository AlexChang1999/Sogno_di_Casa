/* designers.js — 設計師列表頁 & 設計師詳情頁邏輯 */

// API_BASE 由 auth.js 定義

// ── 判斷目前是哪個頁面 ──
const IS_DESIGNER_DETAIL = document.getElementById('designerName') !== null;

document.addEventListener('DOMContentLoaded', () => {
  if (IS_DESIGNER_DETAIL) {
    initDesignerDetail();
  } else {
    loadDesignerGrid();
  }
});

// ════════════════════════════════
// 設計師列表頁
// ════════════════════════════════

async function loadDesignerGrid() {
  const grid = document.getElementById('designerGrid');
  if (!grid) return;

  try {
    const res       = await fetch(`${API_BASE}/api/designers`);
    const designers = await res.json();

    if (designers.length === 0) {
      grid.innerHTML = '<div class="col-12 text-center py-5 text-muted">目前尚無設計師資料</div>';
      return;
    }

    grid.innerHTML = designers.map(d => designerCardHtml(d)).join('');
  } catch {
    grid.innerHTML = '<div class="col-12 text-center py-5 text-danger">設計師資料載入失敗，請稍後再試。</div>';
  }
}

function designerCardHtml(d) {
  const initial  = d.name ? d.name.charAt(0) : '?';
  const years    = d.deathYear
    ? `${d.birthYear} – ${d.deathYear}`
    : `${d.birthYear} – 現在`;
  const portrait = d.portraitUrl
    ? `<img src="${escHtml(d.portraitUrl)}" class="designer-card-portrait" alt="${escHtml(d.name)}">`
    : `<div class="designer-card-portrait-placeholder"><span class="designer-card-initial">${escHtml(initial)}</span></div>`;

  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="designer-card" onclick="window.location='designer-detail.html#id=${d.id}'">
        <div class="designer-card-header">
          ${portrait}
          <div class="designer-card-info">
            <h3 class="designer-card-name">${escHtml(d.name)}</h3>
            <div class="designer-card-meta">${escHtml(d.nationality || '')} · ${years}</div>
          </div>
        </div>
        <p class="designer-card-tagline">${escHtml(d.tagline || '')}</p>
        ${d.famousWorks ? `<p class="designer-card-works">${escHtml(d.famousWorks)}</p>` : ''}
        <span class="brand-card-link">了解更多 <i class="bi bi-arrow-right"></i></span>
      </div>
    </div>
  `;
}

// ════════════════════════════════
// 設計師詳情頁
// ════════════════════════════════

async function initDesignerDetail() {
  const id = getDesignerIdFromUrl();
  if (!id) {
    document.getElementById('designerName').textContent = '找不到設計師';
    return;
  }

  try {
    const res      = await fetch(`${API_BASE}/api/designers/${id}`);
    if (!res.ok) throw new Error('not found');
    const designer = await res.json();
    renderDesignerDetail(designer);
  } catch {
    document.getElementById('designerName').textContent = '設計師資料載入失敗';
  }
}

function renderDesignerDetail(d) {
  const initial = d.name ? d.name.charAt(0) : '?';
  const years   = d.deathYear
    ? `${d.birthYear} – ${d.deathYear}`
    : `${d.birthYear} – 現在`;

  document.title = `${d.name} — FORMA`;
  setText('breadcrumbName',      d.name);
  setText('designerName',        d.name);
  setText('designerTagline',     d.tagline || '');
  setText('designerNationality', d.nationality || '—');
  setText('designerYears',       years);
  setText('designerBrands',      d.associatedBrands || '—');
  setText('designerBiography',   d.biography || '');

  // 肖像 or 首字占位
  if (d.portraitUrl) {
    document.getElementById('designerPortraitWrap').innerHTML =
      `<img src="${escHtml(d.portraitUrl)}" class="designer-portrait mx-auto mx-md-0" alt="${escHtml(d.name)}">`;
  } else {
    setText('designerInitial', initial);
  }

  // 代表作 chips
  if (d.famousWorks) {
    const wrap    = document.getElementById('designerWorksWrap');
    const chipsEl = document.getElementById('designerWorks');
    wrap.style.display = 'block';
    chipsEl.innerHTML  = d.famousWorks
      .split(',')
      .map(w => `<span class="works-chip">${escHtml(w.trim())}</span>`)
      .join('');
  }
}

// ── 工具函式 ──

function getDesignerIdFromUrl() {
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

window.addEventListener('hashchange', () => {
  if (IS_DESIGNER_DETAIL) initDesignerDetail();
});
