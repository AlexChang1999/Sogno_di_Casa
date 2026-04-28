# 09 — 本地開發環境建置

## 必要工具清單

| 工具 | 版本 | 下載 |
|------|------|------|
| Java JDK | 17（LTS） | https://adoptium.net |
| Maven | 3.8+ | https://maven.apache.org |
| PostgreSQL | 14+（本機使用 18） | https://www.postgresql.org |
| Node.js | 18+（本機使用 v24） | https://nodejs.org |
| Git | 任意版本 | https://git-scm.com |

---

## 第一次建置步驟

### 步驟 1：確認 Java 環境

```bash
java -version
# 應顯示：openjdk version "17.x.x"

mvn -version
# 應顯示：Apache Maven 3.x.x
```

---

### 步驟 2：建立 PostgreSQL 資料庫

啟動 PostgreSQL 服務後，開啟 psql 或 pgAdmin：

```sql
-- 建立資料庫（如果尚未存在）
CREATE DATABASE sognodicasa;

-- 確認建立成功
\l
```

> **本機設定**：
> - 使用者：`postgres`
> - 密碼：`4119Kx03`
> - Port：`5432`

---

### 步驟 3：確認後端設定

確認 `backend/src/main/resources/application.properties` 中的設定：

```properties
# 資料庫連線
spring.datasource.url=jdbc:postgresql://localhost:5432/sognodicasa
spring.datasource.username=postgres
spring.datasource.password=4119Kx03

# 伺服器 Port
server.port=8080

# 前端 CORS 來源
cors.allowed-origins=http://localhost:3333
```

---

### 步驟 4：啟動後端

```bash
cd "D:\Projects\Sogno di Casa\backend"
mvn spring-boot:run
```

**成功標誌**：
```
Started SognoDiCasaApplication in X.XXX seconds
Tomcat started on port 8080
```

**第一次啟動**：JPA 的 `ddl-auto=update` 會自動建立所有資料表，並執行 `BrandDesignerSeeder` 填入初始品牌/設計師資料。

> ⚠️ **注意**：使用 `mvn`，不是 `mvnw`（本專案沒有 Maven Wrapper）

---

### 步驟 5：啟動前端

```bash
# 在專案根目錄（admin.html、index.html 所在的位置）
cd "D:\Projects\Sogno di Casa"
npx serve -p 3333
```

**成功標誌**：
```
Serving!
- Local:    http://localhost:3333
- Network:  http://192.168.x.x:3333
```

> `npx serve` 會自動去除 `.html` 副檔名，讓 `products.html` 以 `/products` 存取。

---

### 步驟 6：確認正常運作

1. 開啟瀏覽器進入 `http://localhost:3333`
2. 應看到 FORMA 首頁（含商品、品牌列表）
3. 開啟 `http://localhost:8080/api/products` 應回傳 JSON 資料

---

## 日常開發啟動流程

每次開發前：

```bash
# 終端機 1：啟動後端
cd "D:\Projects\Sogno di Casa\backend"
mvn spring-boot:run

# 終端機 2：啟動前端
cd "D:\Projects\Sogno di Casa"
npx serve -p 3333
```

---

## 建立第一個管理員帳號

後端啟動後，透過以下任一方式建立管理員：

**方法 A：透過網站前端**
1. 開啟 `http://localhost:3333/login`，先完成 Email 驗證並註冊帳號
2. 開啟 `http://localhost:3333/admin`
3. 點選左側「設定」→ 輸入 Email + 管理員密碼 `FORMA_ADMIN_2025`
4. 點擊「升級為管理員」

**方法 B：直接修改資料庫**
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 後端開發常用指令

```bash
# 只編譯，確認有無語法錯誤
cd backend
mvn compile

# 執行測試
mvn test

# 打包成 JAR（不執行測試）
mvn package -DskipTests

# 清除 target 資料夾後重新編譯
mvn clean compile
```

---

## 圖片上傳目錄

上傳的圖片存放於：
```
D:\Projects\Sogno di Casa\backend\uploads\
```

此目錄已被 Spring Boot 設定為靜態資源路徑，可透過以下 URL 存取：
```
http://localhost:8080/uploads/<filename>
```

> `.gitignore` 建議忽略 `backend/uploads/`（圖片不應進版本控制）

---

## 常見問題排除

| 問題 | 原因 | 解決方式 |
|------|------|---------|
| `Port 8080 already in use` | 上一次的後端還在執行 | 在工作管理員結束 java 程序，或改用其他 port |
| `Connection refused localhost:5432` | PostgreSQL 未啟動 | 開啟 Windows 服務，啟動 PostgreSQL 服務 |
| `database "sognodicasa" does not exist` | 資料庫尚未建立 | 執行 `CREATE DATABASE sognodicasa;` |
| 前端 API 回傳 `401 Unauthorized` | JWT Token 過期或遺失 | 重新登入，或檢查 localStorage 是否有 `jwtToken` |
| 前端 API 回傳 `403 Forbidden` | 帳號沒有 ADMIN 角色 | 確認帳號已升級為管理員 |
| `CORS error` 出現在 Console | 後端 CORS 設定與前端 port 不符 | 確認 `cors.allowed-origins=http://localhost:3333` |
| 商品圖片無法顯示（404） | 圖片檔案不在 uploads/ 目錄 | 確認 uploads/ 目錄存在，或重新上傳圖片 |
| `mvn: command not found` | Maven 未安裝或未加入 PATH | 安裝 Maven 並設定環境變數 |
