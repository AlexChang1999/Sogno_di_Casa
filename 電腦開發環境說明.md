# 本機開發與常用軟體環境（可重複使用範本）

> **用途**：給新對話的 AI 或換電腦時快速對齊你的環境。建議在安裝或升級重要工具後，手動更新此檔的「偵測日期」與「版本欄位」。

**最後偵測 / 產生日期**：2026-04-23  
**作業系統帳戶主目錄**：`C:\Users\User`

---

## 1. 作業系統

| 項目 | 內容 |
|------|------|
| OS | Microsoft Windows 11 家用版（系統內顯示字元可能隨地區變體而異） |
| 核心版本 | 10.0.22631（64-bit） |

---

## 2. 終端與 Shell

- **建議主終端**：Windows Terminal / PowerShell 7+（依你實際安裝為準）。
- 本檔產生時的指令環境可正常執行 `java`、`mvn`、`node`、`npm`、`git`、`python` 等（皆已加入 `PATH`）。

---

## 3. 程式語言與執行環境

| 技術 | 路徑 / 偵測版本 | 備註 |
|------|-----------------|------|
| **Java (JDK)** | `C:\Program Files\Java\jdk-17.0.18` | `java -version` → **17.0.18** LTS（Oracle）。另有 Oracle **Java 8** 的 `java8path` 於 `PATH` 中（舊專案可能用到）。 |
| `JAVA_HOME` | `C:\Program Files\Java\jdk-17.0.18` | 建議專案與 Spring/Maven 以此為準。 |
| **Node.js** | `C:\Program Files\nodejs\node.exe` | **v22.22.0**；`npm` **11.11.0**；額外 `npm` 全域目錄：`%AppData%\Roaming\npm`。 |
| **Python** | `C:\Users\User\AppData\Local\Programs\Python\Python313\` | **Python 3.13.12**（`py -0` 顯示 3.13 為預設）。 |
| **Bun** | `C:\Users\User\.bun\bin` | **1.3.12**（若專案使用 Bun）。 |
| **.NET** | `C:\Program Files\dotnet\dotnet.exe` | 目前**未安裝 .NET SDK**（執行 `dotnet --version` 會提示下載 SDK）；路徑上仍有 SQL / 其他相關工具所需之 dotnet 元件。 |

---

## 4. 建置與版本控制

| 工具 | 偵測版本 | 安裝位置 / 說明 |
|------|----------|-----------------|
| **Apache Maven** | **3.9.14** | `C:\ProgramData\chocolatey\lib\maven\apache-maven-3.9.14\`（經 **Chocolatey** 安裝） |
| **Git** | **2.53.0.windows.2** | `C:\Program Files\Git\cmd\` |
| **Chocolatey** | **2.7.1** | 套件目錄常見於 `C:\ProgramData\chocolatey\` |

---

## 5. 資料庫與相關工具（從 PATH 推斷已安裝元件）

- **Microsoft SQL Server** 相關路徑已存在於 `PATH` 中，例如 `...\Microsoft SQL Server\160\...`（工具 / DTS / 用戶端等），實際服務實體名稱與版本以 SSMS 或 `sqlcmd` 為準。

---

## 6. 編輯器與 IDE

| 名稱 | 說明 |
|------|------|
| **Cursor** | `C:\Users\User\AppData\Local\Programs\cursor\`（內建輔助用 `node` 在 resources 下，與系統 Node 分開） |
| **Visual Studio Code** | `C:\Users\User\AppData\Local\Programs\Microsoft VS Code\bin` 已於 `PATH` |
| **IntelliJ IDEA** | 約 **2025.3.4**，啟動器路徑曾見於 `D:\IntelliJ IDEA 2025.3.4\bin`（若你搬移安裝目錄請自行改寫） |

---

## 7. 常用目錄速查

| 用途 | 路徑 |
|------|------|
| 使用者家目錄 | `C:\Users\User` |
| 本機可執行工具（可選） | `C:\Users\User\.local\bin` |
| 專案工作區（範例） | `D:\Projects\`（例如 `D:\Projects\Sogno di Casa`） |

---

## 8. 重新偵測用的指令（複製到 PowerShell 執行即可更新版本欄位）

```powershell
"OS: $([System.Environment]::OSVersion.VersionString)"
"Java: " + (java -version 2>&1 | Out-String)
"JAVA_HOME: $env:JAVA_HOME"
"mvn: " + (mvn -version 2>&1 | Select-Object -First 1)
"node: $(node -v); npm: $(npm -v)"
"git: $(git --version)"
"python: $(python --version 2>&1)"
"py: $(py -0p 2>&1)"
"bun: $(bun -v 2>&1)"
"choco: $(choco -v 2>&1)"
"dotnet: $(dotnet --version 2>&1)"
```

---

## 9. 維護建議

1. 升級 **JDK、Node、Python、Git、Maven** 後，執行上一節指令並把表格中的版本號改為新值。  
2. 若開始做 **.NET 開發**，請安裝對應 **SDK** 後再執行 `dotnet --version` 補寫。  
3. 此檔可連同 OneDrive/雲端備份，但請勿夾帶密碼、金鑰或內部主機名等敏感資訊。

---

*本檔由偵測本機 `PATH` 與版本指令自動整理，實際以你當下終端輸出為準。*
