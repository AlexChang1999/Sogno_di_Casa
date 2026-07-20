# 🛋️ FORMA — 精品家具電商平台 (Sogno di Casa)

<div align="center">

![Java](https://img.shields.io/badge/Java%2021-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

</div>

## 專案簡介

Sogno di Casa（義大利文「家的夢想」）是一個高端設計家具電商平台，提供商品瀏覽、購物車、會員系統與後台管理等完整電商功能，前端採用原生 JavaScript 打造、後端以 Spring Boot 提供 RESTful API 與 JWT 驗證。

## 技術棧

| 類別 | 技術 |
|---|---|
| 後端 | Java 21 + Spring Boot 3.2 + Spring Security (JWT) |
| 資料庫 | PostgreSQL |
| 前端 | Vanilla HTML / CSS / JavaScript（無框架） |
| 認證 | JWT Stateless + Email OTP 驗證碼 |
| 圖片上傳 | Spring Multipart → 本機 uploads/ 資料夾 |

## 主要功能

• 商品瀏覽：依類別、品牌、設計師、價格篩選與排序
• 商品詳情：圖片輪播、款式選擇、加入購物車
• 購物車與結帳：本地儲存、運費計算
• 會員系統：Email + OTP 驗證註冊、JWT 持久登入
• 訂單查詢、品牌 / 設計師介紹頁
• 管理後台：商品 / 品牌 / 設計師 CRUD、圖片上傳、訂單管理

## 安裝與設定

前置需求：Java 21+、Maven 3.9+、PostgreSQL（建立資料庫 sognodicasa）、Node.js

**1. 建立環境變數檔**

```
cp .env.example .env
```

填入資料庫密碼、JWT 密鑰、Gmail 應用程式密碼等真實值。

**2. 啟動後端**

```
cd backend
mvn spring-boot:run
```

**3. 啟動前端**

```
npx serve -p 3333 .
```

或直接執行 start.bat（Windows 一鍵啟動）。

| 服務 | 網址 |
|---|---|
| 前端 | http://localhost:3333 |
| 後端 API | http://localhost:8080 |

**4. 建立第一個管理員帳號**：先於 login.html 註冊帳號，再呼叫 /api/auth/setup-admin 並帶入管理員密鑰。

## 專案結構（節錄）

```
Sogno di Casa/
├── *.html / *.js / style.css   前端頁面與邏輯
├── backend/                    Spring Boot 後端（controller / service / repository / model / security）
├── docs/                       架構說明、API 參考、資安手冊
└── .env.example                環境變數範本
```

## 安全須知

所有密碼、密鑰均透過環境變數注入，不寫入程式碼，詳見 docs/SECURITY.md。
