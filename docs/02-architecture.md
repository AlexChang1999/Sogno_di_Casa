# 02 — 系統架構

## 整體架構概覽

```
瀏覽器（前端）
    │  HTTP Request（fetch API）
    │  Authorization: Bearer <JWT>
    ▼
Spring Boot 後端（localhost:8080）
    │
    ├── JwtFilter（每個 Request 先過這裡驗證 Token）
    │
    ├── Controller 層（接收 Request，回傳 Response）
    │       │
    │       ▼
    │   Service 層（商業邏輯）
    │       │
    │       ▼
    │   Repository 層（Spring Data JPA）
    │       │
    │       ▼
    │   PostgreSQL 資料庫（localhost:5432）
    │
    └── /uploads/**（本機圖片靜態路徑，公開存取）
```

---

## 前後端溝通方式

- 前端使用 **`fetch()`** 呼叫後端 REST API
- 所有 API 基底路徑為 `http://localhost:8080`
- 需要登入的 API，前端在 Header 帶上 `Authorization: Bearer <token>`
- 後端回傳 JSON 格式資料
- 圖片上傳後存放於後端 `./uploads/` 資料夾，可透過 `/uploads/<filename>` 直接存取

### `authFetch()` 工具函數（`auth.js`）

```javascript
// 自動在 Header 加上 JWT Token 的封裝函數
authFetch(url, options)
// 等同於 fetch(url, { headers: { Authorization: 'Bearer <token>' }, ...options })
```

---

## JWT 認證流程

```
1. 使用者輸入 Email + 密碼
        │
        ▼
2. POST /api/auth/login
        │
        ▼
3. 後端驗證密碼（BCrypt），產生 JWT Token
        │
        ▼
4. 回傳 { token, name, email, role }
        │
        ▼
5. 前端將 token 存入 localStorage（key: "jwtToken"）
        │
        ▼
6. 之後每個需要登入的 API Request，
   前端從 localStorage 取出 token，放入 Header
        │
        ▼
7. 後端 JwtFilter 攔截 Request，驗證 token 有效性
   ├── 有效 → 解析 username 與 role，繼續處理
   └── 無效/過期 → 回傳 401 Unauthorized
```

**Token 有效期**：24 小時  
**儲存位置**：瀏覽器 `localStorage`

---

## Email 驗證碼流程（註冊）

```
1. 使用者輸入 Email
        │
        ▼
2. POST /api/auth/send-code
        │
        ▼
3. 後端產生 6 位數驗證碼，存入記憶體（Map），設定 10 分鐘過期
        │
        ▼
4. 透過 Gmail SMTP 寄送驗證碼到使用者信箱
        │
        ▼
5. 使用者輸入驗證碼 + 密碼完成註冊
        │
        ▼
6. POST /api/auth/register（含驗證碼）
        │
        ▼
7. 後端比對驗證碼，通過後建立帳號（密碼 BCrypt 加密）
```

---

## 後端分層架構

```
com.sognodicasa/
├── controller/     ← 接收 HTTP Request，呼叫 Service，回傳 Response
├── service/        ← 商業邏輯（驗證、計算、組合資料）
├── repository/     ← 資料庫操作（繼承 JpaRepository，自動產生 CRUD）
├── model/          ← Entity 類別，對應資料庫資料表（@Entity）
├── dto/            ← 資料傳輸物件（API 的 Request Body / Response Body）
├── security/       ← JWT 工具、過濾器、UserDetailsService
└── config/         ← SecurityConfig（CORS、路由權限）、WebConfig、Seeder
```

### 各層職責說明

| 層級 | 說明 | 範例 |
|------|------|------|
| Controller | 路由對應，不含邏輯 | `GET /api/products` → `productService.getAll()` |
| Service | 商業規則，呼叫多個 Repository | 建立訂單時同時更新庫存 |
| Repository | JPA 介面，自動生成 SQL | `findByCategory(String category)` |
| Model/Entity | 資料表對應，含欄位定義 | `@Column(name = "in_stock")` |
| DTO | API 輸入輸出格式，與 Entity 分離 | `ProductRequest`（新增）/ `ProductDto`（查詢） |

---

## API 權限規則

| 路徑 | 方法 | 權限 |
|------|------|------|
| `/api/auth/**` | 全部 | 公開（不需登入） |
| `/api/products`, `/api/products/**` | GET | 公開 |
| `/api/brands`, `/api/brands/**` | GET | 公開 |
| `/api/designers`, `/api/designers/**` | GET | 公開 |
| `/api/reviews` | GET | 公開 |
| `/uploads/**` | GET | 公開（圖片直連） |
| `/api/products/**` | POST | 需登入（圖片上傳） |
| `/api/orders/admin/**` | 全部 | 需 ADMIN 角色 |
| 其他 `/api/**` | 全部 | 需登入（USER 以上） |

---

## 圖片上傳架構

```
前端點擊「上傳」→ input[type=file] 選擇檔案
        │
        ▼
multipart/form-data POST → /api/products/{id}/upload-image
（或 /api/brands/upload-image、/api/designers/upload-image）
        │
        ▼
後端接收 MultipartFile，以時間戳記 + 隨機 hex 命名存檔
存放位置：backend/uploads/<timestamp>_<hex>.<ext>
        │
        ▼
回傳圖片 URL：http://localhost:8080/uploads/<filename>
        │
        ▼
前端將 URL 填入對應欄位，即時顯示預覽圖
```

---

## Session 管理策略

後端採用 **Stateless**（無狀態）設計：
- 不使用 Server-side Session
- 每個 Request 都靠 JWT Token 自行驗證身份
- 好處：可水平擴展，不需共享 Session 狀態
