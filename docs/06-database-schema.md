# 06 — 資料庫 Schema

## 資料庫資訊

- **類型**：PostgreSQL
- **資料庫名稱**：`sognodicasa`
- **連線位址**：`localhost:5432`
- **使用者**：`postgres`
- **JPA 策略**：`ddl-auto=update`（新欄位自動 ALTER TABLE）

---

## 資料表關聯圖

```
users ──────< orders ──────< order_items
                │
                └── (order_id → order_history)

products ──────< reviews
products (id 記錄於 order_items.product_id，非 FK)

brands     （獨立，無 FK）
designers  （獨立，無 FK）
```

---

## 資料表詳細說明

### `users`（會員）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `name` | VARCHAR(100) | NOT NULL | 顯示名稱 |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | 登入 Email |
| `password` | TEXT | NOT NULL | BCrypt 加密後的密碼 |
| `role` | VARCHAR(20) | 預設 `USER` | 角色（`USER` 或 `ADMIN`） |
| `created_at` | TIMESTAMP | 預設現在時間 | 建立時間 |

**一對多關聯**：一個 user 可有多個 orders

---

### `products`（商品）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `name` | VARCHAR(200) | NOT NULL | 商品名稱 |
| `brand` | VARCHAR(100) | | 品牌名稱（文字，非 FK） |
| `designer` | VARCHAR(100) | | 設計師名稱（文字，非 FK） |
| `category` | VARCHAR(50) | | 類別（chair/sofa/table/storage） |
| `price` | INTEGER | NOT NULL | 售價（新台幣） |
| `description` | TEXT | | 商品說明 |
| `main_image` | VARCHAR(500) | | 主圖 URL |
| `gallery_json` | TEXT | | 副圖 URL 陣列（JSON 格式） |
| `colors_json` | TEXT | | 顏色選項（JSON 格式，含 name/hex/image） |
| `specs_json` | TEXT | | 規格資料（JSON 格式，含尺寸等） |
| `brand_story` | TEXT | | 品牌故事段落 |
| `wood_options_json` | TEXT | | 木材款式（JSON 格式，字串陣列） |
| `width_cm` | INTEGER | | 寬度（公分） |
| `depth_cm` | INTEGER | | 深度（公分） |
| `height_cm` | INTEGER | | 高度（公分） |
| `is_featured` | BOOLEAN | 預設 false | 本季主打（首頁精選 tab1） |
| `is_classic` | BOOLEAN | 預設 false | 設計經典（首頁精選 tab2） |
| `is_hero` | BOOLEAN | 預設 false | Hero 大輪播（首頁 Banner） |
| `in_stock` | BOOLEAN | 預設 true | 庫存狀態 |
| `created_at` | TIMESTAMP | 預設現在時間 | 建立時間 |

**JSON 欄位格式說明**：

```json
// gallery_json
["http://localhost:8080/uploads/img1.jpg", "http://localhost:8080/uploads/img2.jpg"]

// colors_json
[
  { "name": "黑色皮革", "hex": "#1a1a1a", "image": "http://localhost:8080/uploads/black.jpg" },
  { "name": "棕色皮革", "hex": "#8B4513", "image": "" }
]

// wood_options_json
["黑胡桃木", "白梣木", "橡木"]

// specs_json
{
  "width": "84", "depth": "84", "height": "84",
  "weight": "31", "material": "真皮 / 胡桃木",
  "origin": "美國密西根州", "designer": "Charles & Ray Eames",
  "year": "1956", "seatHeight": "40", "warranty": "5 年"
}
```

---

### `orders`（訂單）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `user_id` | BIGINT | FK → users.id, NOT NULL | 下單會員 |
| `total` | DECIMAL(12,2) | NOT NULL | 訂單總金額 |
| `status` | VARCHAR(50) | 預設「待處理」 | 訂單狀態（中文） |
| `recipient_name` | VARCHAR(100) | | 收件人姓名 |
| `recipient_phone` | VARCHAR(20) | | 聯絡電話 |
| `recipient_address` | VARCHAR(300) | | 收件地址 |
| `note` | TEXT | | 訂單備註 |
| `delivery_time` | TIMESTAMP | | 預計送達時間 |
| `is_test` | BOOLEAN | 預設 false | 是否為測試訂單 |
| `created_at` | TIMESTAMP | 預設現在時間 | 下單時間 |

**訂單狀態流程**：待處理 → 確認配送方式 → 配送中 → 已送達

**一對多關聯**：一個 order 包含多個 order_items

---

### `order_items`（訂單明細）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `order_id` | BIGINT | FK → orders.id, NOT NULL | 所屬訂單 |
| `product_id` | INTEGER | | 商品 ID（軟參考，非嚴格 FK） |
| `product_name` | VARCHAR(255) | NOT NULL | 商品名稱（快照，防止商品被刪後遺失） |
| `brand` | VARCHAR(100) | | 品牌名稱（快照） |
| `price` | DECIMAL(12,2) | NOT NULL | 單件售價（快照） |
| `qty` | INTEGER | NOT NULL | 購買數量 |
| `color` | VARCHAR(50) | | 選擇的顏色 |
| `wood` | VARCHAR(50) | | 選擇的木材款式 |

> **設計說明**：`product_name`、`brand`、`price` 都是下單當時的快照值，即使日後商品被修改或刪除，歷史訂單仍保留正確資料。

---

### `order_history`（訂單狀態歷史）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `order_id` | BIGINT | FK → orders.id | 所屬訂單 |
| `status` | VARCHAR(50) | | 當時的狀態值 |
| `changed_at` | TIMESTAMP | | 狀態變更時間 |

---

### `brands`（品牌）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `name` | VARCHAR(100) | NOT NULL | 品牌名稱 |
| `country` | VARCHAR(50) | | 所屬國家 |
| `founded_year` | INTEGER | | 創立年份 |
| `tagline` | VARCHAR(200) | | 一句話介紹 |
| `description` | TEXT | | 品牌故事詳文 |
| `logo_url` | VARCHAR(500) | | Logo 圖片 URL |
| `cover_image_url` | VARCHAR(500) | | 封面圖 URL |
| `website_url` | VARCHAR(500) | | 官網網址 |
| `sort_order` | INTEGER | 預設 0 | 排列順序（數字越小越前面） |
| `created_at` | TIMESTAMP | 預設現在時間 | 建立時間 |

---

### `designers`（設計師）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `name` | VARCHAR(100) | NOT NULL | 設計師全名 |
| `nationality` | VARCHAR(50) | | 國籍 |
| `birth_year` | INTEGER | | 出生年份 |
| `death_year` | INTEGER | | 逝世年份（NULL 表示在世） |
| `tagline` | VARCHAR(200) | | 一句話介紹 |
| `biography` | TEXT | | 個人簡介詳文 |
| `portrait_url` | VARCHAR(500) | | 肖像圖片 URL |
| `associated_brands` | VARCHAR(500) | | 合作品牌（逗號分隔字串） |
| `famous_works` | VARCHAR(500) | | 代表作（逗號分隔字串） |
| `sort_order` | INTEGER | 預設 0 | 排列順序 |
| `created_at` | TIMESTAMP | 預設現在時間 | 建立時間 |

---

### `reviews`（商品評價）

| 欄位 | 類型 | 限制 | 說明 |
|------|------|------|------|
| `id` | BIGINT | PK, AUTO_INCREMENT | 主鍵 |
| `product_id` | BIGINT | FK → products.id, NOT NULL | 被評價的商品 |
| `author_name` | VARCHAR(100) | NOT NULL | 評價者顯示名稱 |
| `rating` | INTEGER | NOT NULL | 評分（1–5） |
| `comment` | TEXT | | 評語內容 |
| `created_at` | TIMESTAMP | 預設現在時間 | 評價時間 |

---

## 常用查詢指令

```sql
-- 查看所有商品（含庫存狀態）
SELECT id, name, brand, designer, category, price, in_stock FROM products;

-- 查看首頁顯示設定
SELECT id, name, is_featured, is_classic, is_hero FROM products;

-- 查看所有訂單（含會員 email）
SELECT o.id, u.email, o.total, o.status, o.created_at
FROM orders o JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- 查看商品評價
SELECT r.id, p.name AS product, r.author_name, r.rating, r.comment
FROM reviews r JOIN products p ON r.product_id = p.id;

-- 將指定帳號升級為管理員
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```
