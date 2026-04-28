# 01 — 專案簡介

## 專案名稱

**FORMA 精品家具電商**（對外品牌名稱：FORMA）  
**倉庫名稱**：Sogno di Casa（義大利文「家的夢想」）

---

## 專案目標

FORMA 是一個以北歐設計美學為核心的精品家具電商平台。目標是讓消費者能夠瀏覽、了解並購買全球頂尖設計品牌的家具，同時透過品牌故事與設計師介紹，傳遞每件作品背後的設計哲學。

---

## 核心功能摘要

| 模組 | 說明 |
|------|------|
| 商品瀏覽 | 依類別、品牌、設計師、價格篩選，支援排序與分頁 |
| 商品詳情 | 圖片輪播、顏色/木材選擇、加入購物車、商品評價 |
| 購物車 | 本地儲存購物清單、計算小計/運費/稅金、填寫收件資訊後下單 |
| 會員系統 | 註冊/登入（Email + 驗證碼）、JWT 持久登入、訂單查詢 |
| 品牌介紹 | 品牌故事、封面圖、官網連結、旗下商品列表 |
| 設計師介紹 | 設計師生平、代表作、合作品牌、相關商品 |
| 管理後台 | 商品/品牌/設計師 CRUD、訂單狀態管理、圖片上傳、管理員升級 |

---

## 技術選型

### 後端

| 技術 | 版本 | 選擇原因 |
|------|------|---------|
| Java | 17 | LTS 版本，Spring Boot 3.x 最低要求 |
| Spring Boot | 3.2.0 | 快速建立 REST API，整合 Security / JPA / Mail |
| Spring Security | 內建 | JWT 認證、角色權限（USER / ADMIN）、CORS 設定 |
| Spring Data JPA | 內建 | ORM，減少手寫 SQL，Repository 介面自動查詢 |
| PostgreSQL | 最新版 | 關聯式資料庫，支援中文全文搜尋與 JSONB |
| JJWT | 0.11.5 | JWT 產生與驗證 |
| Lombok | 最新版 | 減少 getter/setter 樣板程式碼 |
| Spring Mail | 內建 | Gmail SMTP 發送 Email 驗證碼 |

### 前端

| 技術 | 說明 |
|------|------|
| HTML5 / CSS3 | 語意化標籤、Flexbox / Grid 排版 |
| Vanilla JavaScript (ES6+) | 無框架，fetch API 串接後端 |
| Bootstrap 5.3 | 管理後台 Modal、Grid 系統 |
| Bootstrap Icons | 圖示庫 |
| Google Fonts | Cormorant Garamond（標題）、Jost（內文） |

### 開發工具

| 工具 | 用途 |
|------|------|
| Maven | 後端依賴管理與建置 |
| npx serve | 前端靜態伺服器（去除 .html 副檔名） |
| Git | 版本控制 |
| PostgreSQL 18 | 本機資料庫 |

---

## 專案目錄結構（頂層）

```
D:\Projects\Sogno di Casa\
├── docs/                   ← 本文件資料夾
├── backend/                ← Spring Boot 後端
│   ├── src/main/java/      ← Java 原始碼
│   ├── src/main/resources/ ← application.properties、靜態資源
│   ├── uploads/            ← 上傳圖片存放處
│   └── pom.xml             ← Maven 設定
├── index.html              ← 首頁
├── products.html           ← 商品列表
├── product-detail.html     ← 商品詳情
├── cart.html               ← 購物車
├── login.html              ← 登入/註冊
├── account.html            ← 我的帳號
├── brands.html             ← 品牌列表
├── brand-detail.html       ← 品牌詳情
├── designers.html          ← 設計師列表
├── designer-detail.html    ← 設計師詳情
├── admin.html              ← 管理後台
├── style.css               ← 全站樣式
├── auth.js                 ← 認證邏輯
├── home.js                 ← 首頁邏輯
├── products.js             ← 商品列表邏輯
├── detail.js               ← 商品詳情邏輯
├── cart.js                 ← 購物車工具函數
├── cart-page.js            ← 購物車頁面邏輯
├── brands.js               ← 品牌頁面邏輯
├── designers.js            ← 設計師頁面邏輯
├── admin.js                ← 管理後台邏輯
├── product-images.js       ← 圖片工具
├── CLAUDE.md               ← Claude Code 工作指引
├── README.md               ← 環境建置說明
└── DEVELOPMENT.md          ← 開發流程說明
```

---

## 運行位址

| 服務 | 位址 |
|------|------|
| 前端 | http://localhost:3333 |
| 後端 API | http://localhost:8080 |
| 資料庫 | localhost:5432 / 資料庫名稱：`sognodicasa` |

---

## 重要設定值（`application.properties`）

| 設定 | 值 |
|------|-----|
| JWT 有效期 | 24 小時（86400000 ms） |
| 圖片上傳大小上限 | 20 MB |
| Email 驗證碼有效期 | 10 分鐘 |
| 管理員升級密碼 | `FORMA_ADMIN_2025`（`app.admin-setup-secret`） |
| CORS 允許來源 | `http://localhost:3333` |
