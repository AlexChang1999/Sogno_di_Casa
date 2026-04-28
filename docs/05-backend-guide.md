# 05 — 後端結構說明

## 專案位置

```
D:\Projects\Sogno di Casa\backend\
├── src/main/java/com/sognodicasa/
│   ├── SognoDiCasaApplication.java   ← 程式進入點
│   ├── controller/                   ← REST API 控制器
│   ├── service/                      ← 商業邏輯層
│   ├── repository/                   ← 資料庫存取介面
│   ├── model/                        ← Entity（資料表對應）
│   ├── dto/                          ← 資料傳輸物件
│   ├── security/                     ← JWT 認證相關
│   └── config/                       ← 設定類別
├── src/main/resources/
│   └── application.properties        ← 環境設定
├── uploads/                          ← 上傳圖片存放處
└── pom.xml                           ← Maven 依賴設定
```

---

## 修改後端的標準流程

新增或修改功能時，依序更新以下 5 個層次：

```
1. Model（Entity）   ← 資料表欄位
       ↓
2. DTO              ← API 輸入/輸出格式
       ↓
3. Repository       ← 查詢方法（如有需要）
       ↓
4. Service          ← 商業邏輯
       ↓
5. Controller       ← API 路徑與方法

完成後執行：mvn compile
（注意：使用 mvn 不是 mvnw）
```

---

## Controller 層說明

### `AuthController` — `/api/auth/**`（全部公開）

| 方法 | 路徑 | 說明 |
|------|------|------|
| POST | `/api/auth/send-code` | 發送 Email 驗證碼 |
| POST | `/api/auth/register` | 會員註冊（需驗證碼） |
| POST | `/api/auth/login` | 登入，回傳 JWT Token |
| POST | `/api/auth/setup-admin` | 升級指定帳號為管理員（需管理員密碼） |

---

### `ProductController` — `/api/products`

| 方法 | 路徑 | 權限 | 說明 |
|------|------|------|------|
| GET | `/api/products` | 公開 | 取得所有商品（可帶篩選參數） |
| GET | `/api/products/featured` | 公開 | 取得本季主打商品（首頁用） |
| GET | `/api/products/classic` | 公開 | 取得設計經典商品（首頁用） |
| GET | `/api/products/hero` | 公開 | 取得 Hero 輪播商品（首頁用） |
| GET | `/api/products/{id}` | 公開 | 取得單一商品詳情 |
| POST | `/api/products` | ADMIN | 新增商品 |
| PUT | `/api/products/{id}` | ADMIN | 更新商品 |
| DELETE | `/api/products/{id}` | ADMIN | 刪除商品 |
| POST | `/api/products/upload-image` | ADMIN | 上傳商品圖片 |

---

### `OrderController` — `/api/orders`

| 方法 | 路徑 | 權限 | 說明 |
|------|------|------|------|
| POST | `/api/orders` | 需登入 | 建立新訂單 |
| GET | `/api/orders` | 需登入 | 取得目前使用者的訂單列表 |
| GET | `/api/orders/admin/all` | ADMIN | 取得所有訂單（管理後台） |
| DELETE | `/api/orders/{id}` | ADMIN | 刪除訂單 |
| PATCH | `/api/orders/{id}/status` | ADMIN | 更新訂單狀態 |
| GET | `/api/orders/{id}/history` | ADMIN | 取得訂單狀態歷史紀錄 |

---

### `BrandController` — `/api/brands`

| 方法 | 路徑 | 權限 | 說明 |
|------|------|------|------|
| GET | `/api/brands` | 公開 | 取得所有品牌 |
| GET | `/api/brands/{id}` | 公開 | 取得單一品牌詳情 |
| POST | `/api/admin/brands` | ADMIN | 新增品牌 |
| PUT | `/api/admin/brands/{id}` | ADMIN | 更新品牌 |
| DELETE | `/api/admin/brands/{id}` | ADMIN | 刪除品牌 |
| POST | `/api/brands/upload-image` | 需登入 | 上傳品牌圖片 |

---

### `DesignerController` — `/api/designers`

| 方法 | 路徑 | 權限 | 說明 |
|------|------|------|------|
| GET | `/api/designers` | 公開 | 取得所有設計師（依 sortOrder 排序） |
| GET | `/api/designers/{id}` | 公開 | 取得單一設計師詳情 |
| POST | `/api/admin/designers` | ADMIN | 新增設計師 |
| PUT | `/api/admin/designers/{id}` | ADMIN | 更新設計師 |
| DELETE | `/api/admin/designers/{id}` | ADMIN | 刪除設計師 |

---

### `ReviewController` — `/api/reviews`

| 方法 | 路徑 | 權限 | 說明 |
|------|------|------|------|
| GET | `/api/reviews` | 公開 | 取得商品評價（帶 `?productId=` 參數） |
| POST | `/api/reviews` | 需登入 | 新增商品評價 |

---

## Service 層說明

Service 是商業邏輯的核心，Controller 只負責接收請求並呼叫 Service。

### `AuthService`
- 驗證碼管理（`Map<String, VerificationEntry>` 存於記憶體）
- 密碼 BCrypt 加密/驗證
- JWT Token 產生（呼叫 JwtUtil）
- 使用者建立與角色設定

### `ProductService`
- 商品 CRUD（透過 ProductRepository）
- 圖片檔案儲存（UUID + 時間戳記命名）
- 回傳 ProductDto（不直接暴露 Entity）

### `OrderService`
- 建立訂單（拆解購物車 items 為 OrderItem 列表）
- 訂單狀態流轉（待處理 → 確認配送 → 配送中 → 已送達）
- 記錄 OrderHistory（狀態變更歷史）

### `BrandService` / `DesignerService`
- 標準 CRUD 操作
- 圖片上傳（與 ProductService 相同機制）

### `EmailService`
- 透過 Gmail SMTP 發送驗證碼郵件
- 寄件者顯示為 `FORMA 家具 <johnjon823@gmail.com>`

### `ReviewService`
- 新增評價（需登入，一個使用者對同一商品可多次評價）
- 依 productId 查詢評價列表

---

## Security 層說明

### `JwtUtil`
- `generateToken(username)` — 產生含 username 與 role 的 JWT
- `validateToken(token)` — 驗證簽名與過期時間
- `extractUsername(token)` — 解析 token 取得 username
- **Secret Key**：`application.properties` 的 `jwt.secret`（至少 32 字元）

### `JwtFilter`（繼承 `OncePerRequestFilter`）
每個 HTTP Request 都會先經過這裡：
1. 從 Header 取出 `Authorization: Bearer <token>`
2. 驗證 token 有效性
3. 載入 UserDetails（查詢資料庫）
4. 設定 SecurityContext（讓後續的 Controller 知道是誰在操作）

### `SecurityConfig`
- **CORS 設定**：允許來源 `http://localhost:3333`
- **CSRF**：關閉（前後端分離架構不需要）
- **Session**：STATELESS（不使用 Server Session）
- **路由權限**：見 [02-architecture.md](./02-architecture.md)

---

## 圖片上傳實作細節

```java
// 圖片儲存邏輯（ProductService 為例）
String filename = System.currentTimeMillis() + "_" 
                + UUID.randomUUID().toString().substring(0, 8) 
                + "." + 副檔名;
Path savePath = Paths.get(uploadDir).resolve(filename);
Files.copy(file.getInputStream(), savePath);

// 回傳可存取的 URL
return "http://localhost:8080/uploads/" + filename;
```

**WebConfig 設定靜態資源路徑**：
```java
// /uploads/** 對應到 backend/uploads/ 資料夾
registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:./uploads/");
```

---

## 資料庫設定（`application.properties`）

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sognodicasa
spring.datasource.username=postgres
spring.datasource.password=4119Kx03

# JPA 自動建立/更新資料表結構（開發用）
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
```

> **注意**：`ddl-auto=update` 會在 Entity 有新欄位時自動 ALTER TABLE，但不會刪除舊欄位。正式環境應改為 `validate`。

---

## 啟動後端

```bash
cd "D:\Projects\Sogno di Casa\backend"
mvn spring-boot:run
```

成功後後端運行於 `http://localhost:8080`

**常見問題**：
- Port 8080 被佔用 → 修改 `server.port`
- PostgreSQL 未啟動 → 先啟動 PostgreSQL 服務
- 資料庫不存在 → 手動建立 `sognodicasa` 資料庫
