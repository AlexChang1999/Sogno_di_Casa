# FORMA 精品家具電商 — 專案文件

本資料夾收錄 FORMA（Sogno di Casa）專案的完整技術文件與設計說明。

---

## 文件索引

| 檔案 | 內容 |
|------|------|
| [01-project-overview.md](./01-project-overview.md) | 專案簡介、功能摘要、技術選型 |
| [02-architecture.md](./02-architecture.md) | 系統架構、前後端溝通流程、JWT 認證流程 |
| [03-features.md](./03-features.md) | 所有頁面的完整功能說明（含管理後台） |
| [04-frontend-guide.md](./04-frontend-guide.md) | 前端檔案結構、路由方式、各 JS 模組說明 |
| [05-backend-guide.md](./05-backend-guide.md) | 後端分層架構、Spring Security、檔案上傳 |
| [06-database-schema.md](./06-database-schema.md) | 所有資料表欄位定義與關聯說明 |
| [07-api-reference.md](./07-api-reference.md) | 完整 API 端點清單（路徑、方法、權限、格式） |
| [08-design-system.md](./08-design-system.md) | 色彩系統、字體、元件風格、CSS 變數 |
| [09-dev-setup.md](./09-dev-setup.md) | 本地開發環境建置步驟 |
| [10-claude-context.md](./10-claude-context.md) | 給 Claude 的完整專案提示詞（新對話可直接貼上） |

---

## 專案快速資訊

- **專案名稱**：FORMA 精品家具電商（Sogno di Casa）
- **後端**：Java 17 + Spring Boot 3.2 + PostgreSQL，運行於 `localhost:8080`
- **前端**：Vanilla HTML/CSS/JavaScript，由 `npx serve` 運行於 `localhost:3333`
- **Git 倉庫**：`D:\Projects\Sogno di Casa`
- **文件更新日期**：2026-04-27
