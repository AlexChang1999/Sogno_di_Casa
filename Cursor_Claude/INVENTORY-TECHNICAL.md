# 技術盤點附錄（自動／手動蒐集）

> 路徑相對於專案根目錄 `Sogno di Casa/`。後端套件：Spring Boot 3.2、Java 17、PostgreSQL、JJWT。

---

## 1. 後端 REST 端點

### 1.1 認證 `/api/auth`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| POST | `/api/auth/register` | 否 | 註冊；Body：`RegisterRequest` |
| POST | `/api/auth/login` | 否 | 登入；Body：`LoginRequest` |
| POST | `/api/auth/setup-admin` | 否（需 body 內 `secret`） | 將指定 email 升級為 `ADMIN` |

**成功回應（register/login）**：`LoginResponse` — `token`, `name`, `email`, `role`（`USER` \| `ADMIN`）。

**錯誤**：`IllegalArgumentException` → HTTP 400，`{ "message": "..." }`。

### 1.2 商品 `/api/products`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| GET | `/api/products` | 否 | 全部商品，`createdAt` 降序 |
| GET | `/api/products/{id}` | 否 | 單筆 |
| POST | `/api/products` | `ROLE_ADMIN` | Body：`ProductRequest` |
| PUT | `/api/products/{id}` | `ROLE_ADMIN` | Body：`ProductRequest`（null 不覆蓋） |
| DELETE | `/api/products/{id}` | `ROLE_ADMIN` | |
| POST | `/api/products/upload-image` | `ROLE_ADMIN` | `multipart/form-data`，欄位 `file`；回傳 `{ "url": "..." }` |

**上傳圖回傳 URL**：目前程式寫死為 `http://localhost:{port}/uploads/{filename}`（部署時需改為公開網域）。

### 1.3 訂單 `/api/orders`

| 方法 | 路徑 | 認證 | 說明 |
|------|------|------|------|
| POST | `/api/orders` | JWT | Body：`OrderRequest`（`items` + `total`） |
| GET | `/api/orders` | JWT | 目前使用者訂單，新→舊 |

**GET 回應列舉**：每筆含 `id`（字串，格式 `ORD-{數字}`）、`date`（ISO 日期字串）、`total`、`items[]`。

**JWT Header**：`Authorization: Bearer <token>`。

---

## 2. DTO／JSON 形狀摘要

### RegisterRequest
`name`, `email`, `password`（密碼 ≥ 6 字元，Bean Validation）

### LoginRequest
`email`, `password`

### ProductDto / ProductRequest
`name`, `brand`, `category`, `price`, `description`, `mainImage`, `galleryJson`（字串，內為 JSON 陣列）, `inStock`；Dto 另含 `id`, `createdAt`。

**galleryJson 建議格式**（前端 `detail.js` 解析）：
```json
[
  { "color": "黑色皮革", "thumb": "https://...", "full": "https://..." }
]
```
亦支援無 `color` 僅 `thumb`/`full` 的項目（列表用）。

### OrderRequest
`items`: `OrderItemDto[]`，`total`: `BigDecimal`

### OrderItemDto
`productId`, `productName`, `brand`, `price`, `qty`, `color`, `wood`

---

## 3. 資料庫實體（JPA 表名）

| 表名 | Entity | 重點欄位 |
|------|--------|----------|
| `users` | User | id, name, email(unique), password(BCrypt), created_at, role |
| `products` | Product | id, name, brand, category, price, description, main_image, gallery_json, in_stock, created_at |
| `orders` | Order | id, user_id → users, total, created_at |
| `order_items` | OrderItem | id, order_id, product_id, product_name, brand, price, qty, color, wood |

**關聯**：User 1—N Order；Order 1—N OrderItem。訂單明細以**快照字串**保存品名／價格，避免商品刪除影響歷史。

**已知型別**：`OrderItem.productId` 為 `Integer`，`Product.id` 為 `Long` — 前端傳數字時應一致。

---

## 4. 設定鍵（`backend/.../application.properties`）

| 鍵 | 用途 |
|----|------|
| `spring.datasource.*` | PostgreSQL |
| `spring.jpa.hibernate.ddl-auto` | 開發常用 `update` |
| `jwt.secret`, `jwt.expiration` | JWT 簽章與效期 |
| `server.port` | 預設 8080 |
| `cors.allowed-origins` | 前端來源 |
| `app.upload-dir` | 上傳檔目錄 |
| `app.admin-setup-secret` | setup-admin 用密鑰 |

正式環境請勿將密鑰提交版控；以環境變數或私密設定檔注入。

---

## 5. 前端頁面與腳本

| 檔案 | 角色 |
|------|------|
| `index.html` | 首頁 |
| `products.html` + `products.js` | 列表（API `GET /api/products`） |
| `product-detail.html` + `detail.js` | 詳情（優先 `GET /api/products/{id}`，失敗則 fallback 內嵌 `PRODUCTS_DATA`） |
| `cart.html` + `cart-page.js` | 購物車／結帳 |
| `login.html` | 登入（`auth.js`） |
| `account.html` | 訂單列表（內嵌腳本硬編碼 `http://localhost:8080/api/orders`，應改為與 `API_BASE` 一致） |
| `admin.html` + `admin.js` | 後台（`API_BASE` 在 `admin.js`） |
| `auth.js` | `API_BASE`、JWT、導覽列登入狀態、`saveOrderToUser` |
| `cart.js` | 購物車 localStorage、`addToCart` |
| `product-images.js` | 可選：`PRODUCT_IMAGE_MAP` 覆寫靜態圖（與 API 並存時為輔助） |
| `style.css` | 全域樣式與 CSS 變數（換皮主戰場） |

---

## 6. 瀏覽器儲存

| 鍵 | 內容 |
|----|------|
| `forma_token` | JWT |
| `forma_user` | JSON：`name`, `email`, `role` |
| `forma_cart` | 購物車陣列：`id`, `_key`, `name`, `price`, `qty`, `brand`, `img`, `variant?` |

換品牌時若需並行營運，可考慮加上前綴避免網域下同 path 衝突。

---

## 7. 靜態資源

- 專案內 `pics/` 等本機圖檔供詳情 fallback 與 `product-images.js` 使用。
- Bootstrap / Icons / Google Fonts 由 CDN 載入。
