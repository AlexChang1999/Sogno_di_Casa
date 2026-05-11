# 10 — Claude 專案提示詞

## 說明

這份文件提供開啟新 Claude 對話時可以直接貼上的完整 context prompt。  
建議在對話開頭貼上「快速版」，需要深入修改時改用「完整版」。

---

## 快速版（日常使用，約 400 字）

```
你好，我在開發一個全端電商專案，以下是專案概要：

## 專案：FORMA 精品家具電商（Sogno di Casa）

**技術棧**：
- 後端：Java 17 + Spring Boot 3.2 + PostgreSQL（port 8080）
- 前端：Vanilla HTML/CSS/JavaScript，npx serve（port 3333）
- 認證：JWT（存於 localStorage），Spring Security

**專案位置**：D:\Projects\Sogno di Casa

**前端頁面**（11個）：index, products, product-detail, cart, login, account, brands, brand-detail, designers, designer-detail, admin

**後端分層**：Controller → Service → Repository → Entity，修改時需同步更新 DTO。

**重要規則**：
1. 路由傳 ID 用 Hash（#），不用 query string（?），因為 npx serve 會丟失 query string
2. 新增 API 時必須更新 SecurityConfig，確認路徑有被允許（admin 路徑用 /api/admin/**）
3. 後端修改後執行 mvn compile（不是 mvnw）確認編譯成功
4. 管理員 API 路徑以 /api/admin/ 或 /api/orders/admin/ 開頭，Spring Security 用 hasRole('ADMIN') 保護

**資料庫**：PostgreSQL，資料庫名稱 sognodicasa，user: postgres

**管理後台功能**：商品管理（含圖片上傳/顏色/木材變體）、訂單管理（狀態更新）、品牌管理（Logo/封面圖上傳）、設計師管理（肖像上傳）、管理員升級

請用繁體中文回答。我是新手全端工程師，解釋時請由淺入深。
```

---

## 完整版（深入修改/新功能開發用，約 1200 字）

```
你好，請幫我開發一個全端電商專案。以下是完整的專案 context：

## 專案基本資訊

- **名稱**：FORMA 精品家具電商（倉庫名：Sogno di Casa）
- **位置**：D:\Projects\Sogno di Casa
- **前端**：http://localhost:3333（npx serve）
- **後端**：http://localhost:8080（Spring Boot）
- **資料庫**：PostgreSQL localhost:5432 / 資料庫：sognodicasa

## 技術棧

後端：Java 17、Spring Boot 3.2.0、Spring Security（JWT）、Spring Data JPA、PostgreSQL、JJWT 0.11.5、Lombok、Spring Mail（Gmail SMTP）

前端：Vanilla JavaScript（ES6+）、HTML5/CSS3、Bootstrap 5.3（管理後台用）、Google Fonts（Cormorant Garamond + Jost）

## 目錄結構

前端檔案在根目錄（*.html, *.js, style.css）
後端在 backend/src/main/java/com/sognodicasa/
- controller/：AuthController, ProductController, OrderController, BrandController, DesignerController, ReviewController
- service/：AuthService, ProductService, OrderService, BrandService, DesignerService, EmailService, ReviewService
- repository/：各實體對應的 JpaRepository 介面
- model/：Product, User, Order, OrderItem, OrderHistory, Brand, Designer, Review
- dto/：各請求/回應的 DTO 類別
- security/：JwtUtil, JwtFilter, UserDetailsServiceImpl
- config/：SecurityConfig, WebConfig, BrandDesignerSeeder

## 關鍵設定（application.properties）

JWT secret：FormaJwtSecretKey2025MustBe32CharsLongAtLeast!!
JWT 有效期：86400000 ms（24小時）
管理員密碼：FORMA_ADMIN_2025（app.admin-setup-secret）
圖片上傳目錄：./uploads/（可由 /uploads/** 直接存取）
上傳大小上限：20MB
CORS 允許來源：http://localhost:3333

## API 路由規則

公開（不需 token）：/api/auth/**, GET /api/products/**, GET /api/brands/**, GET /api/designers/**, GET /api/reviews, /uploads/**
需登入：POST /api/orders, GET /api/orders, POST /api/reviews
需 ADMIN：/api/orders/admin/**, /api/admin/**（品牌/設計師 CRUD）, POST/PUT/DELETE /api/products/**

## 前端路由

使用 Hash Fragment 傳遞 ID（npx serve 會丟失 query string）：
- 商品詳情：product-detail.html#5
- 品牌詳情：brand-detail.html#3
- 設計師詳情：designer-detail.html#2

認證 token 存放：localStorage.jwtToken, userName, userEmail, userRole
authFetch() 函數封裝 fetch，自動帶入 Authorization header

## 主要頁面功能

首頁：Hero 輪播、品牌跑馬燈、精選商品（本季主打/設計經典 tabs）、Collection 區塊
商品列表：類別/品牌/設計師/價格篩選 + 排序 + 分頁（每頁15件）
商品詳情：圖片輪播、顏色/木材選擇器、加入購物車、規格/品牌故事/評價 tabs
購物車：商品清單、優惠碼、運費計算（滿50000免運）、結帳 Modal（填收件資訊）
管理後台：商品CRUD（含主圖/副圖/顏色/木材上傳）、訂單狀態管理、品牌管理（logo/封面圖）、設計師管理（肖像）

## 資料庫重點

products 表的 JSON 欄位：
- gallery_json：副圖 URL 陣列
- colors_json：顏色選項（name/hex/image 物件陣列）
- wood_options_json：木材名稱字串陣列
- specs_json：規格 key-value 物件

訂單明細（order_items）採用快照方式儲存商品名稱/品牌/價格，防止商品被刪後歷史資料遺失。

## 開發規則（請嚴格遵守）

1. 修改後端 Entity 時，一定要同步更新：Entity → DTO → Repository → Service → Controller
2. 新增 API 路徑時，必須在 SecurityConfig 確認路徑權限設定正確
3. 後端修改後用 mvn compile 驗證（非 mvnw）
4. Admin 專用 API 路徑統一加上 /api/admin/ 前綴
5. 前端傳 ID 給下一頁，一律用 hash（#），不用 query string（?）
6. 合併其他分支的程式碼時，要確認 API 路徑前後端一致

## 常見陷阱

- SecurityConfig OPTIONS 請求（CORS preflight）必須允許
- Spring Security role 名稱需加 ROLE_ 前綴（程式用 "ADMIN"，資料庫存 "ADMIN"，hasRole('ADMIN') 內部會加）
- npx serve 只支援 hash 路由，不支援 history API
- 圖片 URL 要用完整路徑（http://localhost:8080/uploads/...），不能用相對路徑
- JSON 欄位存入前要 JSON.stringify，取出後要 JSON.parse

請用繁體中文回答。我是新手工程師，請由淺入深說明，並在程式碼加上中文註解。
```

---

## 特定情境的補充 Prompt

### 新增功能時
```
我要在 FORMA 專案新增「[功能名稱]」功能。
目前的技術棧是 Java Spring Boot（後端）+ Vanilla JS（前端）。
請先說明做法，我確認後再實作。
```

### 修 Bug 時
```
FORMA 專案出現問題：[描述問題]
相關檔案：[檔案名稱]
預期行為：[預期什麼]
實際行為：[發生什麼]
請幫我診斷原因。
```

### 確認 API 路徑時
```
我在 FORMA 專案新增了一個 API 路徑：[路徑]
請幫我確認：
1. SecurityConfig 是否需要更新？
2. 前端呼叫時需要帶 token 嗎？
3. 路徑命名是否符合現有慣例？
```

---

## MotorVia 專案補充 Context（二手車平台）

### 專案基本資訊

- **名稱**：MotorVia 二手車電商
- **位置**：D:\Projects\MotorVia
- **前端**：http://localhost:4200（npx serve）
- **後端**：http://localhost:8081（Spring Boot）
- **資料庫**：PostgreSQL localhost:5432 / 資料庫：motorvia
- **Java**：21（JAVA_HOME=C:\Program Files\Java\jdk-21.0.11）

### 啟動後端

```bash
cd "D:\Projects\MotorVia\backend"
JAVA_HOME="/c/Program Files/Java/jdk-21.0.11" mvn spring-boot:run
```

---

## 關鍵教訓（踩過的坑）

### ❌ 錯誤 1：前端多個 `const API` 重複宣告

**問題**：`auth.js` 宣告了 `const API = 'http://localhost:8081'`，每個 HTML 頁面的 `<script>` 標籤又重複宣告一次，導致 JavaScript SyntaxError，整個頁面的 JS 全部失效（包含 tab 切換按鈕）。

**症狀**：按鈕完全沒有反應，包含「切換到註冊」、「發送驗證碼」等全部失效。

**正確做法**：`const API` **只在 `auth.js` 宣告一次**，所有 HTML 頁面的 `<script>` 不得重複宣告。

```javascript
// auth.js — 唯一宣告點
const API = 'http://localhost:8081';
```

**修復指令**（若不小心又重複）：
```bash
for f in *.html admin.js; do
  sed -i "s/const API = 'http:\/\/localhost:8081';//g" "$f"
done
```

---

### ❌ 錯誤 2：CORS 只設在 WebConfig，沒有設在 SecurityConfig

**問題**：Spring Security 6 的請求比 Spring MVC 更早攔截，如果只在 `WebConfig` 設 CORS，Security 層會先拒絕 OPTIONS preflight，導致前端所有 API 呼叫失敗（CORS blocked）。

**症狀**：前端呼叫後端 API 時，瀏覽器 console 出現 CORS error，即使 WebConfig 已有設定。

**正確做法**：在 `SecurityConfig` 加入 `CorsConfigurationSource` Bean，並在 filterChain 明確綁定：

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOriginPatterns(List.of("*"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(false);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}

// filterChain 裡：
http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

---

## 設計模式參考

### 驗證碼 60 秒冷卻限制

**後端（EmailService.java）**：

```java
// 加一個 Map 記錄上次發送時間
private final Map<String, Long> cooldownStore = new ConcurrentHashMap<>();

public long getCooldownRemaining(String email) {
    Long lastSent = cooldownStore.get(email);
    if (lastSent == null) return 0;
    return Math.max(lastSent + 60_000 - System.currentTimeMillis(), 0);
}

public void sendVerificationCode(String email) {
    // ... 原本的發送邏輯 ...
    cooldownStore.put(email, System.currentTimeMillis()); // 記錄時間
}
```

**後端（Controller）**：在呼叫 sendCode 前先檢查，超過限制回傳 HTTP 429：

```java
long remaining = emailService.getCooldownRemaining(req.getEmail());
if (remaining > 0) {
    long seconds = (remaining / 1000) + 1;
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(Map.of("message", "請等待 " + seconds + " 秒後再重新發送"));
}
```

**前端（JavaScript）**：用 localStorage 存冷卻結束時間，頁面刷新後也能繼續倒數：

```javascript
const COOLDOWN_KEY = 'mvCodeCooldown';

function startCooldown(btnId, seconds) {
    localStorage.setItem(COOLDOWN_KEY, Date.now() + seconds * 1000);
    runCountdown(btnId);
}

function runCountdown(btnId) {
    const tick = () => {
        const remaining = Math.ceil((parseInt(localStorage.getItem(COOLDOWN_KEY)) - Date.now()) / 1000);
        const btn = document.getElementById(btnId);
        if (remaining <= 0) {
            localStorage.removeItem(COOLDOWN_KEY);
            btn.disabled = false;
            btn.textContent = '發送驗證碼';
            return;
        }
        btn.disabled = true;
        btn.textContent = `${remaining} 秒後可重新發送`;
        setTimeout(tick, 1000);
    };
    tick();
}
```

---

### 忘記密碼：Reset Token 設計

**流程**：
1. 用戶輸入 Email → `POST /api/auth/forgot-password`
2. 後端產生 UUID token（15 分鐘有效），存在記憶體 Map，寄送含連結的 Email
3. 用戶點連結 → `reset-password.html#<token>` 開啟
4. 用戶輸入新密碼 → `POST /api/auth/reset-password` 帶 `{ token, newPassword }`
5. 後端驗證 token → 更新密碼 → token 立即作廢（防止重複使用）

**後端（EmailService.java）**：

```java
private final Map<String, String> resetTokenStore  = new ConcurrentHashMap<>();
private final Map<String, Long>   resetExpireStore = new ConcurrentHashMap<>();

public void sendPasswordResetLink(String email, String frontendBase) {
    String token = UUID.randomUUID().toString();
    resetTokenStore.put(token, email);
    resetExpireStore.put(token, System.currentTimeMillis() + 15 * 60 * 1000);
    // 寄送帶 token 的 Email 連結
}

public String validateResetToken(String token) {
    // 驗證有效性，回傳 email 或 null
}

public void invalidateResetToken(String token) {
    resetTokenStore.remove(token);
    resetExpireStore.remove(token);
}
```

**安全注意事項**：
- 不論帳號是否存在，`forgot-password` endpoint 都回傳相同訊息（避免洩漏用戶資料）
- token 使用一次後立即作廢，不可重複使用
- Reset link 格式：`http://localhost:4200/reset-password.html#<token>`（用 hash，因 npx serve 不支援 query string）

**SecurityConfig 設定**：`/api/auth/**` 全部 permitAll()，兩個新 endpoint 自動包含，無需額外設定。
