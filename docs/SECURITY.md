# 資安指南 — Sogno di Casa (FORMA)

> 上次更新：2026-05-11

---

## 目錄

1. [環境變數設定（最重要）](#1-環境變數設定)
2. [本機開發設定](#2-本機開發設定)
3. [上架正式環境設定](#3-上架正式環境設定)
4. [CI/CD 密鑰管理](#4-cicd-密鑰管理)
5. [已修復的資安問題](#5-已修復的資安問題)
6. [待辦資安事項](#6-待辦資安事項)
7. [網站功能會有什麼變化](#7-網站功能會有什麼變化)

---

## 1. 環境變數設定

`application.properties` 中所有敏感資料已改為讀取環境變數，**絕對不能把真實密碼放進 git**。

| 環境變數名稱 | 說明 | 是否有預設值 |
|------------|------|------------|
| `DB_PASSWORD` | PostgreSQL 資料庫密碼 | 無（必填） |
| `JWT_SECRET` | JWT 簽名密鑰，至少 32 字元 | 無（必填） |
| `GMAIL_USERNAME` | Gmail 帳號 | 無（必填） |
| `GMAIL_APP_PASSWORD` | Gmail 應用程式密碼（16碼）| 無（必填） |
| `ADMIN_SETUP_SECRET` | 管理員升級端點的秘密密鑰 | 無（必填） |
| `DB_URL` | 資料庫連線字串 | `jdbc:postgresql://localhost:5432/sognodicasa` |
| `DB_USERNAME` | 資料庫帳號 | `postgres` |
| `CORS_ALLOWED_ORIGINS` | 允許的前端來源 | `http://localhost:3333` |

---

## 2. 本機開發設定

### 步驟一：建立 `.env` 檔案

```bash
# 在專案根目錄執行
cp .env.example .env
```

然後用記事本或 VSCode 開啟 `.env`，填入真實值：

```env
DB_PASSWORD=你的資料庫密碼
JWT_SECRET=至少32字元的隨機字串
GMAIL_USERNAME=你的gmail@gmail.com
GMAIL_APP_PASSWORD=你的16碼應用程式密碼
ADMIN_SETUP_SECRET=你的管理員密鑰
CORS_ALLOWED_ORIGINS=http://localhost:3333
```

> `.env` 已在 `.gitignore` 中，不會被 git 追蹤。

### 步驟二：產生強隨機密鑰

**JWT_SECRET**（PowerShell）：
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 48 | ForEach-Object { [char]$_ })
```

**ADMIN_SETUP_SECRET**（PowerShell）：
```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
```

### 步驟三：啟動方式

**Windows（設定環境變數後啟動）：**
```powershell
# 在 backend 目錄執行
$env:DB_PASSWORD="你的密碼"
$env:JWT_SECRET="你的密鑰"
$env:GMAIL_USERNAME="你的gmail"
$env:GMAIL_APP_PASSWORD="你的應用密碼"
$env:ADMIN_SETUP_SECRET="你的管理員密鑰"
mvn spring-boot:run
```

**或修改 `start.bat`，在啟動前設定環境變數（不要把真實值 commit 進去）。**

---

## 3. 上架正式環境設定

### 在 VPS 上設定環境變數

推薦用 **systemd service** 管理後端，並在 service 設定檔中注入環境變數：

```ini
# /etc/systemd/system/sognodicasa.service
[Unit]
Description=Sogno di Casa Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/app
ExecStart=/usr/bin/java -jar /home/ubuntu/app/sognodicasa.jar
Restart=always

# 在這裡填入環境變數（此檔案只有 root 可讀）
Environment="DB_PASSWORD=正式資料庫密碼"
Environment="JWT_SECRET=正式JWT密鑰"
Environment="GMAIL_USERNAME=你的gmail"
Environment="GMAIL_APP_PASSWORD=你的應用密碼"
Environment="ADMIN_SETUP_SECRET=正式管理員密鑰"
Environment="CORS_ALLOWED_ORIGINS=https://你的網域.com"

[Install]
WantedBy=multi-user.target
```

設定後執行：
```bash
sudo systemctl daemon-reload
sudo systemctl enable sognodicasa
sudo systemctl start sognodicasa
```

### CORS 設定

正式上架後務必將 `CORS_ALLOWED_ORIGINS` 改為正式網域：
```
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

不能留 `http://localhost:3333`，否則任何人都能從本機呼叫你的 API。

---

## 4. CI/CD 密鑰管理

使用 **GitHub Actions** 時，所有密鑰存放在 **GitHub Secrets**，不要寫在 `workflow.yml` 中：

### 設定位置
Repository → Settings → Secrets and variables → Actions → New repository secret

### 需要新增的 Secrets

| Secret 名稱 | 對應環境變數 |
|------------|------------|
| `DB_PASSWORD` | `DB_PASSWORD` |
| `JWT_SECRET` | `JWT_SECRET` |
| `GMAIL_USERNAME` | `GMAIL_USERNAME` |
| `GMAIL_APP_PASSWORD` | `GMAIL_APP_PASSWORD` |
| `ADMIN_SETUP_SECRET` | `ADMIN_SETUP_SECRET` |
| `VPS_HOST` | VPS 的 IP 位址 |
| `VPS_USER` | VPS 登入帳號 |
| `VPS_SSH_KEY` | SSH 私鑰（`cat ~/.ssh/id_rsa`）|

### 在 workflow.yml 中使用

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.VPS_SSH_KEY }}
    script: |
      export DB_PASSWORD="${{ secrets.DB_PASSWORD }}"
      export JWT_SECRET="${{ secrets.JWT_SECRET }}"
      systemctl restart sognodicasa
```

---

## 5. 已修復的資安問題

### ✅ 2026-05-11 修復

| 問題 | 嚴重程度 | 修復方式 |
|------|---------|---------|
| 資料庫密碼硬編碼在 git | 🔴 嚴重 | 改用 `${DB_PASSWORD}` 環境變數 |
| Gmail 應用密碼硬編碼 | 🔴 嚴重 | 改用 `${GMAIL_APP_PASSWORD}` 環境變數 |
| 管理員密鑰硬編碼 | 🔴 嚴重 | 改用 `${ADMIN_SETUP_SECRET}` 環境變數 |
| JWT 密鑰硬編碼 | 🔴 嚴重 | 改用 `${JWT_SECRET}` 環境變數 |
| 商品圖片上傳無 MIME 驗證 | 🟠 高風險 | `ProductController` 加入 MIME 類型 + 副檔名白名單驗證 |
| admin.js 商品列表 XSS 漏洞 | 🟡 中等 | 統一套用 `escapeHtml()` 防止 XSS |

---

## 6. 待辦資安事項

上架前建議完成：

- [ ] **HTTPS 強制**：在 Nginx 或 Spring Security 設定 HTTP → HTTPS 跳轉
- [ ] **更換舊密鑰**：git 歷史中已曝光的密碼（`4119Kx03`、`qdlmqxbdyipgnwbt`、`FORMA_ADMIN_2025`）必須更換，舊密碼即使從程式碼移除，git log 中仍然可見
- [ ] **正式環境關閉 SQL log**：`application.properties` 的 `spring.jpa.show-sql=true` 在正式環境應改為 `false`
- [ ] **ddl-auto 改為 validate**：正式環境 `spring.jpa.hibernate.ddl-auto=update` 應改為 `validate` 或 `none`，避免意外修改資料表結構

---

## 7. 網站功能會有什麼變化

### 對一般訪客（不登入）

**完全沒有影響。** 瀏覽商品、查看品牌、設計師頁面的功能和外觀完全相同。

### 對管理員（後台）

**功能相同，但有一個行為改變：**

上傳圖片時，若選擇的檔案**不是圖片格式**（例如 .pdf、.exe），現在會顯示錯誤訊息：
- `"只允許上傳圖片檔案"` — 非圖片 MIME 類型
- `"不支援的圖片格式，請使用 jpg、png、gif 或 webp"` — 副檔名不在白名單

只要上傳正常的 jpg / png 圖片，完全不受影響。

### 本機開發啟動方式改變

**啟動後端前需要先設定環境變數**（見第 2 節），否則 Spring Boot 啟動時會報錯：

```
Could not resolve placeholder 'DB_PASSWORD' in value "${DB_PASSWORD}"
```

解法：設定好 `.env` 並在啟動前 `source` 或在 PowerShell 中 `$env:DB_PASSWORD="..."` 即可。
