# 08 — 設計系統

## 設計理念

FORMA 的視覺語言以**北歐極簡主義**為核心，強調：
- 留白與比例
- 細膩的黑白對比
- 暖金色作為精品品味的點綴
- 低調的線條與大寫字母排版

---

## 色彩系統

定義於 `style.css` 的 `:root` CSS 變數：

| 變數名稱 | HEX 值 | 用途 |
|---------|--------|------|
| `--color-black` | `#0d0d0d` | 最深黑（主文字、深色背景） |
| `--color-dark` | `#1a1a1a` | 深灰（內文文字） |
| `--color-mid` | `#4a4a4a` | 中灰（次要文字） |
| `--color-muted` | `#888888` | 淡灰（輔助說明、placeholder） |
| `--color-border` | `#e0dbd5` | 米白邊框（分隔線） |
| `--color-cream` | `#f7f4f0` | 米白背景（區塊底色） |
| `--color-white` | `#ffffff` | 純白 |
| `--color-accent` | `#c9a96e` | **暖金色**（品牌重點色、hover 狀態） |
| `--color-accent-d` | `#a8834a` | 深暖金（按下狀態） |

### 配色邏輯

```
頁面背景   → #ffffff（白）
區塊背景   → #f7f4f0（米白）
主要文字   → #1a1a1a（深灰）
次要文字   → #888888（淡灰）
邊框/分隔  → #e0dbd5（米白邊框）
品牌強調色 → #c9a96e（暖金）
深色區塊   → #0d0d0d（近黑，用於 Hero、Navbar、CTA 按鈕）
```

---

## 字體系統

| 變數 | 字體 | 用途 |
|------|------|------|
| `--font-display` | Cormorant Garamond, serif | 標題、Logo、品牌名稱（優雅襯線體） |
| `--font-body` | Jost, sans-serif | 內文、按鈕、導覽（現代幾何無襯線體） |

### 字體階層

```
品牌 Logo      → Cormorant Garamond, letter-spacing: 0.2em
頁面大標       → Cormorant Garamond, 2.5–4rem
區塊標題       → Cormorant Garamond + section-eyebrow（小字前綴）
商品名稱       → Jost, 1–1.2rem, font-weight: 500
按鈕文字       → Jost, 0.8–0.88rem, letter-spacing: 0.1em, text-transform: uppercase
輔助說明       → Jost, 0.85rem, color: --color-muted
```

---

## 圓角（Border Radius）

全站統一使用 `--radius: 2px`，維持俐落的方正感，避免過度圓潤。

---

## 按鈕系統

所有按鈕 class 前綴為 `btn-forma-`：

| Class | 外觀 | 用途 |
|-------|------|------|
| `.btn-forma` | 黑底白字，hover 變金色 | 主要 CTA（加入購物車、送出） |
| `.btn-forma-full` | 黑底白字，全寬 | 結帳、頁面主要操作 |
| `.btn-forma-outline` | 透明底 + 黑框 | 次要操作（繼續選購） |
| `.btn-forma-outline-sm` | 小尺寸透明底 + 邊框 | 卡片上的小按鈕 |
| `.btn-forma-sm-dark` | 黑底小按鈕，hover 變金色 | 商品卡片「加入購物車」 |
| `.btn-forma-sm-light` | 淺色小按鈕 | 淺色背景區使用 |

---

## 導覽列（Navbar）

- 背景：`#ffffff`，底部 1px `#e0dbd5` 分隔線
- Logo：Cormorant Garamond，letter-spacing 0.2em，黑色
- 導覽連結：Jost，中灰色，hover 時變黑
- 購物車圖示：hover 時變暖金色
- 滾動時：加上 `scrolled` class（陰影效果）

---

## 商品卡片（Product Card）

```
┌─────────────────────┐
│    商品圖片          │
│    （4:3 比例）      │
│    [加入購物車] ←hover才出現
├─────────────────────┤
│ BRAND NAME          │ ← 品牌（大寫、淡色）
│ 商品名稱            │
│ NT$ 128,000         │
└─────────────────────┘
```

- 圖片區：`object-fit: cover`，hover 時出現按鈕覆蓋層
- 品牌名稱：`text-transform: uppercase`，`letter-spacing: 0.1em`
- 售價：暖金色或深色

---

## Hero Banner

- 全寬（100vw）高度約 80–90vh
- 3 種風格輪播：
  - 深色系（`#1c1c1c → #2e2a24`）搭配白色文字
  - 淺色系（`#f7f4f0`）搭配黑色文字
  - 超深色系（`#2c2520 → #1a1310`）搭配白色文字
- 品牌名稱：小字大寫，暖金色
- 主標題：Cormorant Garamond，大字
- 副標：Jost，中等大小

---

## 區塊標題模式（Section Header）

```html
<div class="section-eyebrow">SECTION LABEL</div>  <!-- 暖金色小標 -->
<h2 class="section-title">區塊主標題</h2>          <!-- Cormorant Garamond -->
```

- `section-eyebrow`：Jost，0.72rem，大寫，letter-spacing 0.2em，暖金色
- `section-title`：Cormorant Garamond，2.2rem，黑色

---

## 管理後台配色（`admin.html` 獨立配色）

後台採用**深色主題**，與前台的淺色形成區隔：

| 變數 | 說明 |
|------|------|
| `--bg: #0a0a0a` | 最深背景 |
| `--card: #111111` | 卡片/容器背景 |
| `--text: #e8e8e8` | 主要文字 |
| `--text-soft: #aaaaaa` | 次要文字 |
| `--accent: #d4c39e` | 暖米金（前台暖金的深色版） |
| `--accent-soft: rgba(212,195,158,.08)` | 選中狀態底色 |
| `--border: #1e1e1e` | 微弱邊框 |
| `--border-strong: #2e2e2e` | 強調邊框 |
| `--ok: #7fba7f` | 有貨狀態（綠色） |
| `--danger: #e07676` | 無貨/警告（紅色） |

---

## 響應式設計

全站採用 Bootstrap 5 Grid 系統搭配自定義 CSS：

| 斷點 | 說明 |
|------|------|
| `< 576px` | 手機：單欄，導覽列收合 |
| `576px–768px` | 小平板：部分雙欄 |
| `768px–992px` | 平板：篩選面板收合 |
| `> 992px` | 桌機：完整三欄商品列表，側邊篩選展開 |

---

## 動畫與過渡效果

- 所有按鈕 hover：`transition: all 0.2s`
- 商品卡片覆蓋層：`opacity 0.3s`
- 頁面元素進場：`fadeIn`（opacity 0 → 1，translateY 20px → 0）
- Hero 輪播：淡入淡出切換
- 管理後台頁面切換：`translateX(20px) → 0`，搭配 opacity
