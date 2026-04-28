# 07 — API 參考文件

## 基本資訊

- **Base URL**：`http://localhost:8080`
- **資料格式**：JSON（`Content-Type: application/json`）
- **認證方式**：JWT Bearer Token
  ```
  Authorization: Bearer <token>
  ```
- **圖片上傳格式**：`multipart/form-data`

---

## 認證 API（`/api/auth`）

### 發送 Email 驗證碼
```
POST /api/auth/send-code
```
**Request Body**：
```json
{ "email": "user@example.com" }
```
**Response**：
```json
{ "message": "驗證碼已發送" }
```

---

### 會員註冊
```
POST /api/auth/register
```
**Request Body**：
```json
{
  "name": "Alex",
  "email": "user@example.com",
  "password": "mypassword",
  "code": "123456"
}
```
**Response**：
```json
{ "message": "註冊成功" }
```

---

### 會員登入
```
POST /api/auth/login
```
**Request Body**：
```json
{
  "email": "user@example.com",
  "password": "mypassword"
}
```
**Response**：
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "name": "Alex",
  "email": "user@example.com",
  "role": "USER"
}
```

---

### 升級管理員帳號
```
POST /api/auth/setup-admin
```
**Request Body**：
```json
{
  "email": "admin@example.com",
  "secret": "FORMA_ADMIN_2025"
}
```
**Response**：
```json
{ "message": "已升級為管理員" }
```

---

## 商品 API（`/api/products`）

### 取得所有商品
```
GET /api/products
```
**Query 參數**（全部選填）：

| 參數 | 類型 | 說明 |
|------|------|------|
| `category` | String | 篩選類別（chair/sofa/table/storage） |
| `brand` | String | 篩選品牌名稱 |
| `featured` | Boolean | 只回傳本季主打商品 |
| `classic` | Boolean | 只回傳設計經典商品 |

**Response**：商品陣列
```json
[
  {
    "id": 1,
    "name": "Egg Chair 蛋椅",
    "brand": "Fritz Hansen",
    "designer": "Arne Jacobsen",
    "category": "chair",
    "price": 600000,
    "mainImage": "http://localhost:8080/uploads/...",
    "inStock": true,
    "isFeatured": true,
    "isClassic": false,
    "isHero": false
  }
]
```

---

### 取得本季主打商品
```
GET /api/products/featured
```

### 取得設計經典商品
```
GET /api/products/classic
```

### 取得 Hero 輪播商品
```
GET /api/products/hero
```

---

### 取得單一商品詳情
```
GET /api/products/{id}
```
**Response**：完整商品資料（含 galleryJson、colorsJson、specsJson 等）

---

### 新增商品（ADMIN）
```
POST /api/products
Authorization: Bearer <admin_token>
```
**Request Body**：
```json
{
  "name": "商品名稱",
  "brand": "品牌",
  "designer": "設計師",
  "category": "chair",
  "price": 120000,
  "description": "商品說明",
  "mainImage": "http://...",
  "galleryJson": "[\"http://...\"]",
  "colorsJson": "[{\"name\":\"黑色\",\"hex\":\"#000\",\"image\":\"\"}]",
  "woodOptionsJson": "[\"胡桃木\"]",
  "specsJson": "{\"width\":\"84\"}",
  "brandStory": "品牌故事",
  "inStock": true,
  "isFeatured": false,
  "isClassic": false,
  "isHero": false
}
```

---

### 更新商品（ADMIN）
```
PUT /api/products/{id}
Authorization: Bearer <admin_token>
```
**Request Body**：同新增商品

---

### 刪除商品（ADMIN）
```
DELETE /api/products/{id}
Authorization: Bearer <admin_token>
```

---

### 上傳商品圖片（ADMIN）
```
POST /api/products/upload-image
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```
**Form Data**：`file`（圖片檔案，JPG/PNG，最大 20MB）

**Response**：
```json
{ "url": "http://localhost:8080/uploads/1777010372812_39b2374e.jpg" }
```

---

## 訂單 API（`/api/orders`）

### 建立訂單（需登入）
```
POST /api/orders
Authorization: Bearer <token>
```
**Request Body**：
```json
{
  "items": [
    {
      "productId": 3,
      "productName": "Egg Chair",
      "brand": "Fritz Hansen",
      "price": 600000,
      "qty": 1,
      "color": "黑色皮革",
      "wood": "胡桃木"
    }
  ],
  "total": 600000,
  "recipientName": "王小明",
  "recipientPhone": "0912345678",
  "recipientAddress": "台中市西區精誠路1號",
  "note": ""
}
```

---

### 取得目前使用者的訂單（需登入）
```
GET /api/orders
Authorization: Bearer <token>
```

---

### 取得所有訂單（ADMIN）
```
GET /api/orders/admin/all
Authorization: Bearer <admin_token>
```

---

### 更新訂單狀態（ADMIN）
```
PATCH /api/orders/{id}/status
Authorization: Bearer <admin_token>
```
**Request Body**：
```json
{ "status": "配送中" }
```
**可用狀態值**：`待處理` / `確認配送方式` / `配送中` / `已送達`

---

### 刪除訂單（ADMIN）
```
DELETE /api/orders/{id}
Authorization: Bearer <admin_token>
```

---

### 取得訂單狀態歷史（ADMIN）
```
GET /api/orders/{id}/history
Authorization: Bearer <admin_token>
```

---

## 品牌 API（`/api/brands`）

### 取得所有品牌
```
GET /api/brands
```
**Response**：品牌陣列（依 `sort_order` 排序）

---

### 取得單一品牌詳情
```
GET /api/brands/{id}
```

---

### 新增品牌（ADMIN）
```
POST /api/admin/brands
Authorization: Bearer <admin_token>
```
**Request Body**：
```json
{
  "name": "Fritz Hansen",
  "country": "丹麥",
  "foundedYear": 1872,
  "tagline": "北歐現代設計的百年傳承",
  "description": "品牌故事...",
  "logoUrl": "http://...",
  "coverImageUrl": "http://...",
  "websiteUrl": "https://www.fritzhansen.com"
}
```

---

### 更新品牌（ADMIN）
```
PUT /api/admin/brands/{id}
Authorization: Bearer <admin_token>
```

---

### 刪除品牌（ADMIN）
```
DELETE /api/admin/brands/{id}
Authorization: Bearer <admin_token>
```

---

### 上傳品牌圖片（需登入）
```
POST /api/brands/upload-image
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data**：`file`

---

## 設計師 API（`/api/designers`）

### 取得所有設計師
```
GET /api/designers
```
**Response**：設計師陣列（依 `sort_order` 排序）

---

### 取得單一設計師詳情
```
GET /api/designers/{id}
```

---

### 新增設計師（ADMIN）
```
POST /api/admin/designers
Authorization: Bearer <admin_token>
```
**Request Body**：
```json
{
  "name": "Hans J. Wegner",
  "nationality": "丹麥",
  "birthYear": 1914,
  "deathYear": 2007,
  "tagline": "椅子的詩人",
  "biography": "個人簡介...",
  "portraitUrl": "http://...",
  "associatedBrands": "PP Møbler, Carl Hansen & Søn",
  "famousWorks": "PP503 The Chair, Papa Bear Chair"
}
```

---

### 更新設計師（ADMIN）
```
PUT /api/admin/designers/{id}
Authorization: Bearer <admin_token>
```

---

### 刪除設計師（ADMIN）
```
DELETE /api/admin/designers/{id}
Authorization: Bearer <admin_token>
```

---

## 評價 API（`/api/reviews`）

### 取得商品評價
```
GET /api/reviews?productId={id}
```
**Response**：
```json
[
  {
    "id": 1,
    "authorName": "Alex",
    "rating": 5,
    "comment": "非常滿意！",
    "createdAt": "2025-04-24T14:30:00"
  }
]
```

---

### 新增評價（需登入）
```
POST /api/reviews
Authorization: Bearer <token>
```
**Request Body**：
```json
{
  "productId": 3,
  "authorName": "Alex",
  "rating": 5,
  "comment": "品質非常好，物超所值！"
}
```

---

## 靜態圖片存取

上傳的圖片可直接透過 URL 存取（無需認證）：
```
GET http://localhost:8080/uploads/{filename}
```
