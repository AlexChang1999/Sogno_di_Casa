# FORMA 電商網站 — 開發文件

> 高端設計家具電商平台，品牌名稱 **Sogno di Casa**（義大利文「家的夢想」）
> 公司設於台中

---

## 目錄

1. [專案概覽](#1-專案概覽)
2. [技術棧](#2-技術棧)
3. [目錄結構](#3-目錄結構)
4. [後端架構](#4-後端架構)
5. [前端架構](#5-前端架構)
6. [資料庫 Schema](#6-資料庫-schema)
7. [API 端點一覽](#7-api-端點一覽)
8. [開發環境設定](#8-開發環境設定)
9. [商家管理後台使用說明](#9-商家管理後台使用說明)
10. [集中式圖片管理](#10-集中式圖片管理)
11. [開發歷程紀錄](#11-開發歷程紀錄)

---

## 1. 專案概覽

| 項目 | 說明 |
|------|------|
| 網站類型 | 高端設計家具電商 |
| 前端技術 | 原生 HTML / CSS / JavaScript（無框架） |
| 後端技術 | Java Spring Boot 3.2 |
| 資料庫 | PostgreSQL 16 |
| 認證機制 | JWT（JSON Web Token）|
| 目前商品 | Eames Lounge Chair（Herman Miller）|

---

## 2. 技術棧

### 前端
- Bootstrap 5.3（CDN）
- Bootstrap Icons 1.11
- Google Fonts：Cormorant Garamond + Jost
- 純 Vanilla JavaScript（ES6+）

### 後端
- Java 17 + Spring Boot 3.2
- Spring Security 6（JWT Stateless）
- Spring Data JPA + Hibernate
- JJWT 0.11.5（JWT 簽發/驗證）
- Lombok（減少樣板程式碼）
- BCrypt（密碼雜湊）

### 資料庫
- PostgreSQL 16
- 連線：`localhost:5432/sognodicasa`
- 帳號：`postgres`

---

## 3. 目錄結構

```
Sogno di Casa/
├── index.html              首頁
├── products.html           商品列表頁
├── product-detail.html     商品詳情頁
├── cart.html               購物車頁
├── login.html              登入/註冊頁
├── account.html            我的訂單頁
├── admin.html              【商家管理後台】
│
├── style.css               全站樣式
├── cart.js                 購物車邏輯
├── cart-page.js            購物車頁面邏輯
├── products.js             商品列表邏輯（從 API 讀取）
├── detail.js               商品詳情邏輯（從 API 讀取）
├── auth.js                 會員認證（JWT）
├── admin.js                商家後台邏輯
├── product-images.js       集中式圖片管理（本地圖片覆蓋）
│
├── image-mapper.html       圖片路徑設定工具（開發用）
├── pics/                   本地商品圖片
│   ├── Black.jpg
│   ├── Brown.jpg
│   ├── camel.jpg
│   └── Navy_blue.jpg
│
├── shipping.html           運費說明（台灣法規）
│
└── backend/
    └── src/main/java/com/sognodicasa/
        ├── model/
        │   ├── User.java           會員實體
        │   ├── Product.java        商品實體
        │   ├── Order.java          訂單實體
        │   └── OrderItem.java      訂單明細實體
        ├── repository/
        │   ├── UserRepository.java
        │   ├── ProductRepository.java
        │   └── OrderRepository.java
        ├── dto/
        │   ├── LoginRequest / LoginResponse
        │   ├── RegisterRequest
        │   ├── ProductDto / ProductRequest
        │   └── OrderRequest / OrderItemDto
        ├── service/
        │   ├── AuthService.java
        │   ├── ProductService.java
        │   └── OrderService.java
        ├── controller/
        │   ├── AuthController.java
        │   ├── ProductController.java
        │   └── OrderController.java
        ├── security/
        │   ├── JwtUtil.java
        │   ├── JwtFilter.java
        │   └── UserDetailsServiceImpl.java
        └── config/
            ├── SecurityConfig.java
            └── WebConfig.java
```

---

## 4. 後端架構

### 資料流向

```
瀏覽器 → Controller → Service → Repository → PostgreSQL
                              ↑
                           JwtFilter（每次請求先驗證 token）
```

### 角色權限

| 角色 | 可存取 |
|------|--------|
| 未登入 | GET /api/products、GET /api/products/{id}、/uploads/** |
| USER（一般會員）| 上述 + 訂單 CRUD |
| ADMIN（管理員）| 全部 + 商品 POST/PUT/DELETE、圖片上傳 |

### JWT 流程

1. 使用者 POST `/api/auth/login`
2. 後端驗證密碼（BCrypt），回傳 JWT token + 使用者資訊（含 role）
3. 前端把 token 存入 `localStorage.forma_token`
4. 之後每次 API 請求帶上 `Authorization: Bearer <token>`
5. `JwtFilter` 解析 token，驗證合法後放行

### 圖片上傳機制

- 管理員 POST `/api/products/upload-image`（multipart/form-data）
- 圖片儲存到後端執行目錄下的 `./uploads/` 資料夾
- 回傳 URL：`http://localhost:8080/uploads/<timestamp>_<uuid>.<ext>`
- `WebConfig` 把 `/uploads/**` 對應到本機檔案系統，讓前端可存取

---

## 5. 前端架構

### localStorage 儲存結構

```javascript
// 登入 token
localStorage.forma_token = "eyJhbGci..."

// 使用者資訊（含角色）
localStorage.forma_user = {
  name:  "王小明",
  email: "user@example.com",
  role:  "USER"  // 或 "ADMIN"
}

// 購物車
localStorage.forma_cart = [
  {
    id: 1,
    _key: "1_黑色皮革_胡桃木",  // 複合鍵（相同商品不同款式算不同項目）
    name: "Eames Lounge Chair",
    price: 128000,
    qty: 1,
    brand: "Herman Miller",
    img: "pics/Black.jpg",
    variant: { color: "黑色皮革", wood: "胡桃木" }
  }
]
```

### sessionStorage 使用

```javascript
// 未登入時點結帳，記錄導向目標（避免 serve 工具截斷 query string）
sessionStorage.loginRedirect = "cart.html"
```

### 頁面間資料傳遞

- 商品詳情：`product-detail.html?id=1`（URL query string）
- 登入後重導：先讀 `sessionStorage.loginRedirect`，再讀 URL `?redirect=`

---

## 6. 資料庫 Schema

Spring Boot 使用 `ddl-auto=update`，會自動建立/更新資料表。

### `users` 資料表

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL PK | 主鍵，自動遞增 |
| name | VARCHAR(100) | 姓名 |
| email | VARCHAR(255) UNIQUE | 電子郵件 |
| password | TEXT | BCrypt 雜湊密碼 |
| role | VARCHAR(20) | `USER` 或 `ADMIN`，預設 `USER` |
| created_at | TIMESTAMP | 建立時間 |

### `products` 資料表

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | BIGSERIAL PK | 主鍵 |
| name | VARCHAR(200) | 商品名稱（必填）|
| brand | VARCHAR(100) | 品牌 |
| category | VARCHAR(50) | `chair` / `sofa` / `table` / `storage` |
| price | INTEGER | 售價（台幣，必填）|
| description | TEXT | 商品描述 |
| main_image | VARCHAR(500) | 主圖 URL |
| gallery_json | TEXT | 顏色款式 JSON，格式如下 |
| in_stock | BOOLEAN | 是否有庫存，預設 `true` |
| created_at | TIMESTAMP | 建立時間 |

`gallery_json` 格式範例：
```json
[
  {"color": "黑色", "thumb": "http://localhost:8080/uploads/black.jpg", "full": "http://localhost:8080/uploads/black.jpg"},
  {"color": "棕色", "thumb": "http://localhost:8080/uploads/brown.jpg", "full": "http://localhost:8080/uploads/brown.jpg"}
]
```

### `orders` / `order_items` 資料表

| 欄位 | 說明 |
|------|------|
| orders.id | 訂單編號（顯示為 `ORD-{id}`）|
| orders.user_id | 關聯的會員 |
| orders.total | 訂單總金額 |
| order_items.product_name | 商品名稱快照（下單時的名稱）|
| order_items.price / qty | 單價 / 數量 |
| order_items.color / wood | 顏色 / 材質款式 |

---

## 7. API 端點一覽

### 認證

| 方法 | 路徑 | 說明 | 需要登入 |
|------|------|------|---------|
| POST | `/api/auth/register` | 註冊 | 否 |
| POST | `/api/auth/login` | 登入 | 否 |
| POST | `/api/auth/setup-admin` | 升級為管理員 | 否（需 secret）|

`setup-admin` 請求格式：
```json
{ "email": "your@email.com", "secret": "FORMA_ADMIN_2025" }
```

### 商品

| 方法 | 路徑 | 說明 | 需要登入 |
|------|------|------|---------|
| GET | `/api/products` | 取得所有商品 | 否 |
| GET | `/api/products/{id}` | 取得單一商品 | 否 |
| POST | `/api/products` | 新增商品 | ADMIN |
| PUT | `/api/products/{id}` | 更新商品 | ADMIN |
| DELETE | `/api/products/{id}` | 刪除商品 | ADMIN |
| POST | `/api/products/upload-image` | 上傳圖片 | ADMIN |

### 訂單

| 方法 | 路徑 | 說明 | 需要登入 |
|------|------|------|---------|
| POST | `/api/orders` | 建立訂單 | USER |
| GET | `/api/orders` | 取得我的訂單 | USER |

---

## 8. 開發環境設定

### 前置條件

- Node.js v24+（前端靜態伺服器）
- Java 17+
- Maven（或用 `./mvnw` wrapper）
- PostgreSQL 16

### PostgreSQL 設定

```sql
-- 建立資料庫（第一次）
CREATE DATABASE sognodicasa;
```

`application.properties` 連線設定：
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sognodicasa
spring.datasource.username=postgres
spring.datasource.password=（你的密碼）
```

### 啟動步驟

**步驟 1：啟動後端**
```bash
cd backend
./mvnw spring-boot:run
# 或 Windows：mvnw.cmd spring-boot:run
```
後端啟動後：`http://localhost:8080`

**步驟 2：啟動前端**
```bash
npx serve -p 3333 .
```
前端啟動後：`http://localhost:3333`

**步驟 3：設定第一個管理員**
```bash
curl -X POST http://localhost:8080/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"你的帳號@email.com","secret":"FORMA_ADMIN_2025"}'
```
或直接在 `admin.html` → 設定頁面操作。

---

## 9. 商家管理後台使用說明

### 進入後台

1. 先在 `login.html` 以管理員帳號登入
2. 點導覽列頭像 → **商家後台**（非管理員看不到此選項）
3. 或直接開啟 `admin.html`

### 新增商品

1. 點右上角「**新增商品**」
2. 填寫必填欄位：商品名稱、售價
3. 主圖：貼上圖片 URL，或點「上傳」選擇本機圖片
4. 顏色款式：點「新增顏色」→ 填顏色名稱 + 上傳對應圖片
   - 顧客在商品詳情頁點選顏色時，會自動切換圖片
5. 點「儲存商品」

### 編輯 / 刪除商品

- 點商品列右側的「**編輯**」按鈕修改
- 點「**垃圾桶**」按鈕並確認刪除

### 商品類別對照

| 後台選項 | 前台篩選 |
|---------|---------|
| 椅子 | chair |
| 沙發 | sofa |
| 桌子 | table |
| 收納 | storage |

---

## 10. 集中式圖片管理

### product-images.js 說明

`product-images.js` 是一個**全站圖片覆蓋層**，修改這個檔案可以讓首頁、列表頁、詳情頁的圖片同步更新。

```javascript
window.PRODUCT_IMAGE_MAP = {
  1: {
    img: 'pics/Black.jpg',           // 列表頁主圖
    gallery: [                        // 詳情頁縮圖（對應顏色款式）
      { thumb: 'pics/Black.jpg',     full: 'pics/Black.jpg' },
      { thumb: 'pics/Brown.jpg',     full: 'pics/Brown.jpg' },
      { thumb: 'pics/camel.jpg',     full: 'pics/camel.jpg' },
      { thumb: 'pics/Navy_blue.jpg', full: 'pics/Navy_blue.jpg' },
    ],
  },
  // 其他商品 ID 對應...
};
```

> **注意**：當後端 API 有商品資料時，API 的圖片優先。`product-images.js` 作為本地開發階段的補充/覆蓋機制。

### image-mapper.html 工具

開啟 `image-mapper.html`，可以透過 UI 選擇商品 ID 和圖片路徑，自動產生要貼入 `product-images.js` 的程式碼。

---

## 11. 開發歷程紀錄

| 版本 | Commit | 功能 |
|------|--------|------|
| v1.0 | `c291ed7` | 初始網站建立（首頁、列表、詳情、購物車）|
| v1.1 | `53b9ef2` | 上傳 Eames Lounge Chair 實拍圖片 |
| v1.2 | `c18b9f9` | 新增會員系統（JWT + Spring Boot）、修復購物車邏輯與商品篩選 |
| v1.3 | `aa67e68` | 集中式圖片管理（product-images.js）、圖片路徑工具 |
| v1.4 | `d7570ae` | **商家管理後台**（admin.html）+ 商品資料庫（products 資料表）|

### 已解決的主要 Bug

| Bug | 原因 | 解法 |
|-----|------|------|
| 放大鏡無法使用 | `.magnifier-container` 的 `overflow: hidden` 截斷了放大結果 | 改為 `overflow: visible` |
| 購物車相同商品覆蓋 | 只用 `id` 作為辨識鍵 | 改用複合鍵 `${id}_${color}_${wood}` |
| 篩選器無效 | `filterProducts()` 沒有讀取 checkbox 狀態 | 完整重寫篩選邏輯 |
| 結帳後 redirect 遺失 | `serve` 工具截斷 URL query string | 改用 `sessionStorage` 傳遞重導目標 |
| 優惠券無效 | `applyCoupon()` 只顯示訊息，沒有重算金額 | 加入全域 `activeDiscount` 並呼叫 `updateSummary()` |
| 結帳 Modal 錯誤 | `bootstrap.Modal.getInstance().hide()` 當 Modal 未開啟時 crash | 改用 `?.hide()` optional chaining |

### 重要設計決策

- **無 DB session**：採用 JWT Stateless，每次請求靠 token 驗證，不佔伺服器記憶體
- **密碼不可逆**：使用 BCrypt 雜湊，即使資料庫外洩也無法還原明文密碼
- **商品圖片兩層機制**：`product-images.js`（本地靜態）+ PostgreSQL gallery JSON（動態），前者為開發/補充用，後者為正式來源
- **顏色款式複合鍵**：讓同一商品的不同顏色可各自加入購物車，不互相覆蓋

---

*最後更新：2026-04-13*
