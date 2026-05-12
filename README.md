# FORMA — 精品家具電商平台

> **Sogno di Casa**（義大利文「家的夢想」）  
> 高端設計家具電商，提供商品瀏覽、購物車、會員系統與後台管理。

---

## 技術棧

| 類型 | 技術 |
|------|------|
| 後端 | Java 21 + Spring Boot 3.2 + Spring Security（JWT）|
| 資料庫 | PostgreSQL |
| 前端 | Vanilla HTML / CSS / JavaScript（無框架）|
| 認證 | JWT Stateless + Email OTP 驗證碼 |
| 圖片上傳 | Spring Multipart → 本機 `uploads/` 資料夾 |

---

## 快速啟動（本機開發）

### 前置需求

- Java 21+
- Maven 3.9+
- PostgreSQL（建立資料庫 `sognodicasa`）
- Node.js（前端靜態伺服器用）

### 步驟

**1. 建立環境變數檔**

```bash
cp .env.example .env
```

用編輯器開啟 `.env`，填入真實值：

```env
DB_PASSWORD=你的資料庫密碼
JWT_SECRET=至少32字元的隨機字串
GMAIL_USERNAME=你的gmail@gmail.com
GMAIL_APP_PASSWORD=你的16碼應用程式密碼
ADMIN_SETUP_SECRET=你的管理員密鑰
APP_BASE_URL=http://localhost:8080
CORS_ALLOWED_ORIGINS=http://localhost:3333
```

**2. 設定環境變數並啟動後端**

```powershell
# PowerShell
$env:DB_PASSWORD="你的密碼"
$env:JWT_SECRET="你的密鑰"
$env:GMAIL_USERNAME="你的gmail"
$env:GMAIL_APP_PASSWORD="你的應用密碼"
$env:ADMIN_SETUP_SECRET="你的管理員密鑰"
$env:APP_BASE_URL="http://localhost:8080"
$env:CORS_ALLOWED_ORIGINS="http://localhost:3333"

cd backend
mvn spring-boot:run
```

**3. 啟動前端**

```bash
npx serve -p 3333 .
```

或直接執行 `start.bat`（Windows 一鍵啟動）。

| 服務 | 網址 |
|------|------|
| 前端 | http://localhost:3333 |
| 後端 API | http://localhost:8080 |

**4. 設定第一個管理員帳號**

先在 `login.html` 註冊一個帳號，再執行：

```bash
curl -X POST http://localhost:8080/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"你的帳號@email.com","secret":"你的ADMIN_SETUP_SECRET"}'
```

---

## 主要功能

| 功能 | 說明 |
|------|------|
| 商品瀏覽 | 依類別、品牌、設計師、價格篩選與排序 |
| 商品詳情 | 圖片輪播、顏色款式選擇、加入購物車 |
| 購物車 | 本地儲存、運費計算、結帳填寫收件資訊 |
| 會員系統 | Email + OTP 驗證碼註冊、JWT 持久登入 |
| 訂單查詢 | 會員查看歷史訂單 |
| 品牌 / 設計師 | 品牌故事、設計師介紹頁 |
| 管理後台 | 商品 / 品牌 / 設計師 CRUD、圖片上傳、訂單管理 |

---

## 專案結構

```
Sogno di Casa/
├── index.html              首頁
├── products.html           商品列表
├── product-detail.html     商品詳情
├── cart.html               購物車
├── login.html              登入 / 註冊
├── account.html            我的帳號
├── brands.html             品牌列表
├── designers.html          設計師列表
├── admin.html              管理後台
│
├── auth.js                 JWT 認證邏輯（API_BASE 定義於此）
├── cart.js / cart-page.js  購物車邏輯
├── admin.js                後台管理邏輯
├── style.css               全站樣式
│
├── .env.example            環境變數範本
├── start.bat               Windows 一鍵啟動
├── start.sh                跨平台啟動腳本
│
├── backend/                Spring Boot 後端
│   ├── src/main/java/com/sognodicasa/
│   │   ├── controller/     REST API 控制器
│   │   ├── service/        商業邏輯
│   │   ├── repository/     資料庫存取
│   │   ├── model/          JPA Entity
│   │   ├── dto/            資料傳輸物件
│   │   ├── security/       JWT 工具與過濾器
│   │   └── config/         Security / CORS 設定
│   └── src/main/resources/
│       ├── application.properties       主設定（讀取環境變數）
│       └── application-prod.properties  正式環境覆寫設定
│
└── docs/                   開發文件
    ├── 01-project-overview.md
    ├── 02-architecture.md
    ├── 05-backend-guide.md
    ├── 08-design-system.md
    └── SECURITY.md         資安操作手冊
```

---

## 資安說明

- 所有密碼、密鑰均透過環境變數注入，不寫入程式碼
- 詳見 [docs/SECURITY.md](docs/SECURITY.md)

---

## 文件

詳細的架構說明、API 參考、設計系統請參考 [`docs/`](docs/) 資料夾。
