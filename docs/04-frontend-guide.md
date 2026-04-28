# 04 — 前端結構說明

## 技術架構概述

前端採用**純 Vanilla JavaScript**（無框架），搭配 HTML5 + CSS3。  
不使用 React / Vue / Angular 等框架，每個頁面對應一個 `.html` 檔與一個（或多個）`.js` 檔。

---

## 路由方式：Hash Fragment

由於前端使用 `npx serve` 靜態伺服器，URL 中的 `.html` 副檔名會被自動去除。

**跨頁面傳遞 ID 的方式：Hash（`#`）**

```
✅ 正確：product-detail.html#5    → 解析為商品 ID = 5
❌ 錯誤：product-detail.html?id=5 → npx serve 會遺失 query string
```

**前端讀取 Hash 的方式**：
```javascript
const id = window.location.hash.slice(1); // 取得 '#' 之後的部分
```

---

## 頁面與 JS 對應關係

| HTML 頁面 | 引用的 JS | 說明 |
|-----------|-----------|------|
| `index.html` | `home.js`, `auth.js`, `cart.js` | 首頁 |
| `products.html` | `products.js`, `auth.js`, `cart.js` | 商品列表 |
| `product-detail.html` | `detail.js`, `auth.js`, `cart.js` | 商品詳情 |
| `cart.html` | `cart-page.js`, `auth.js`, `cart.js` | 購物車 |
| `login.html` | `auth.js` | 登入/註冊 |
| `account.html` | `auth.js` | 帳號/訂單 |
| `brands.html` | `brands.js`, `auth.js`, `cart.js` | 品牌列表 |
| `brand-detail.html` | `brands.js`, `auth.js`, `cart.js` | 品牌詳情 |
| `designers.html` | `designers.js`, `auth.js`, `cart.js` | 設計師列表 |
| `designer-detail.html` | `designers.js`, `auth.js`, `cart.js` | 設計師詳情 |
| `admin.html` | `admin.js`, `auth.js` | 管理後台 |

---

## 各 JS 檔案說明

### `auth.js` — 認證核心（全站引用）

所有需要登入狀態的頁面都會引用此檔。

**主要功能**：
- `login(email, password)` — 呼叫後端 `/api/auth/login`，儲存 JWT 至 localStorage
- `register(name, email, password, code)` — 呼叫 `/api/auth/register`
- `sendVerificationCode(email)` — 呼叫 `/api/auth/send-code`
- `logout()` — 清除 localStorage 中的 token
- `getCurrentUser()` — 從 localStorage 讀取並回傳目前使用者資訊
- `isLoggedIn()` — 回傳布林值，判斷是否已登入
- `isAdmin()` — 判斷目前使用者是否為管理員（role === 'ADMIN'）
- `authFetch(url, options)` — 封裝 fetch，自動帶入 Authorization Header
- 動態更新導覽列（顯示使用者名稱 / 管理員選單 / 登出按鈕）

**localStorage 存放格式**：
```javascript
localStorage.setItem('jwtToken', token);
localStorage.setItem('userName', name);
localStorage.setItem('userEmail', email);
localStorage.setItem('userRole', role);
```

---

### `home.js` — 首頁

- 頁面載入時呼叫 `/api/products?featured=true` 取得本季主打商品
- 呼叫 `/api/products?classic=true` 取得設計經典商品
- 動態渲染商品卡片至 DOM
- Hero Banner 輪播控制（自動輪播 + 手動切換）
- 加入購物車按鈕事件綁定

---

### `products.js` — 商品列表

**主要流程**：
1. 頁面載入 → GET `/api/products`（取得全部商品）
2. GET `/api/brands`（取得品牌列表，動態生成品牌 checkbox）
3. 解析商品資料中的 designer 欄位，動態生成設計師 checkbox
4. 監聽所有篩選條件變化，執行 `filterProducts()`

**`filterProducts()` 邏輯**：
```javascript
// 篩選條件：類別 AND 品牌 AND 設計師 AND 價格區間，全部同時生效
allProducts
  .filter(p => 類別符合)
  .filter(p => 品牌符合)
  .filter(p => 設計師符合)
  .filter(p => 價格區間符合)
  .sort(依排序條件)
```

**分頁**：前端分頁，每頁 15 筆，不重新呼叫 API

---

### `detail.js` — 商品詳情

**主要流程**：
1. 讀取 `window.location.hash` 取得商品 ID
2. GET `/api/products/{id}`（商品詳細資料）
3. GET `/api/reviews?productId={id}`（評價列表）
4. 渲染圖片縮圖列、顏色/木材選項
5. 監聽顏色選擇，切換主圖
6. 加入購物車（含選擇的顏色、木材、數量）
7. 評價送出（POST `/api/reviews`）

---

### `cart.js` — 購物車工具函數（全站引用）

提供操作 localStorage 購物車資料的工具函數，不含 DOM 渲染。

- `getCart()` — 從 localStorage 讀取購物車陣列
- `saveCart(items)` — 儲存至 localStorage
- `addToCart(product)` — 新增或累加數量
- `removeFromCart(cartItemId)` — 移除指定商品
- `clearCart()` — 清空購物車
- `getCartCount()` — 回傳購物車總件數（更新導覽列圖示數字）

**購物車資料結構**（存於 localStorage `"cart"` key）：
```json
[
  {
    "id": 3,
    "name": "Egg Chair 蛋椅",
    "brand": "Fritz Hansen",
    "price": 600000,
    "image": "/uploads/...",
    "color": "黑色皮革",
    "wood": "胡桃木",
    "qty": 1
  }
]
```

---

### `cart-page.js` — 購物車頁面

- 讀取 localStorage 購物車資料，渲染完整購物清單
- 數量 +/- 按鈕即時更新小計
- 計算運費（滿 NT$50,000 免費）、5% 稅金、合計
- 優惠碼套用邏輯
- 清空購物車
- 結帳 Modal：填寫收件人資訊後 POST `/api/orders`（需登入）

---

### `brands.js` — 品牌頁面

- `brands.html`：GET `/api/brands`，動態渲染品牌卡片
- `brand-detail.html`：讀取 hash ID → GET `/api/brands/{id}`，渲染品牌詳情與旗下商品

---

### `designers.js` — 設計師頁面

- `designers.html`：GET `/api/designers`，動態渲染設計師卡片
- `designer-detail.html`：讀取 hash ID → GET `/api/designers/{id}`，渲染設計師詳情

---

### `admin.js` — 管理後台（最大的 JS 檔案，約 46KB）

**主要功能模組**：

| 功能 | 說明 |
|------|------|
| `loadProducts()` | GET `/api/products`，渲染商品列表表格 |
| `openAddModal()` | 開啟空白的新增商品 Modal |
| `openEditModal(id)` | 從 API 取得商品資料，填入 Modal 欄位 |
| `saveProduct()` | 判斷是新增或編輯，呼叫對應 API |
| `deleteProduct(id)` | DELETE `/api/admin/products/{id}` |
| `uploadMainImage(input)` | 上傳主圖至後端，回填 URL 並更新預覽 |
| `addVariantRow()` | 動態新增顏色選項列（名稱 + 色碼 + 圖片上傳） |
| `addWoodRow()` | 動態新增木材款式列 |
| `loadOrders()` | GET `/api/orders/admin/all`，渲染訂單列表 |
| `filterOrders(status)` | 切換訂單狀態 tab，前端篩選顯示 |
| `updateOrderStatus(id, status)` | PATCH `/api/orders/admin/{id}/status` |
| `loadBrands()` | GET `/api/brands`，渲染品牌列表 |
| `openAddBrandModal()` | 開啟新增品牌 Modal |
| `saveBrand()` | POST 或 PUT `/api/admin/brands/{id}` |
| `deleteBrand(id)` | DELETE `/api/admin/brands/{id}` |
| `uploadBrandImage(input, urlId, previewId, placeholderId)` | 通用圖片上傳函數（品牌/設計師共用） |
| `updateImgPreview(urlId, previewId, placeholderId)` | URL 輸入時即時更新預覽圖 |
| `loadDesigners()` | GET `/api/designers`，渲染設計師列表 |
| `openAddDesignerModal()` | 開啟新增設計師 Modal |
| `saveDesigner()` | POST 或 PUT `/api/admin/designers/{id}` |
| `setupAdmin()` | POST `/api/auth/setup-admin`（升級管理員） |

---

### `product-images.js` — 圖片工具

- 商品詳情頁的圖片縮圖列互動（點擊切換主圖）
- 主圖 hover 放大效果輔助邏輯

---

## 導覽列動態更新機制

每個頁面的 `auth.js` 在 `DOMContentLoaded` 時執行：

```javascript
// 已登入：顯示使用者名稱、我的訂單、登出
// 管理員：額外顯示「商家後台」連結
// 未登入：顯示「登入」連結
```

購物車圖示旁的數字由 `cart.js` 的 `getCartCount()` 即時計算。

---

## 常見注意事項

1. **Hash 路由**：傳遞 ID 一律用 `#`，不用 `?`
2. **後端離線**：fetch 失敗時要有 `.catch()` 處理，顯示友善錯誤訊息
3. **未登入導向**：需登入的頁面在 JS 開頭就要檢查 `getCurrentUser()`，未登入立即導向 `login.html`
4. **管理員 API**：路徑含 `/admin/` 的 API 由 Spring Security 強制要求 `ROLE_ADMIN`，前端不要自行做權限判斷來取代後端
