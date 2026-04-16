#!/bin/bash

# ================================================
# Sogno di Casa — 一鍵啟動前後端開發環境
# 使用方式：bash start.sh 或 ./start.sh
# 結束方式：Ctrl+C（會自動關閉前後端）
# ================================================

# 顏色設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# 專案根目錄（這個檔案所在的位置）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 前後端目錄（目前在 crazy-carson worktree，之後合併到 main 後兩者都改為 "$SCRIPT_DIR/..."）
WORKTREE_DIR="$SCRIPT_DIR/.claude/worktrees/crazy-carson"
BACKEND_DIR="$WORKTREE_DIR/backend"
FRONTEND_DIR="$WORKTREE_DIR"

echo -e "${CYAN}================================================${NC}"
echo -e "${CYAN}  Sogno di Casa — 啟動開發環境${NC}"
echo -e "${CYAN}================================================${NC}"
echo ""

# 確認後端目錄存在
if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${YELLOW}找不到後端目錄：$BACKEND_DIR${NC}"
  echo "請確認 backend/ 資料夾的位置是否正確"
  exit 1
fi

# ---- 啟動後端 Spring Boot (port 8080) ----
echo -e "${YELLOW}[1/2] 啟動後端 Spring Boot (port 8080)...${NC}"
(cd "$BACKEND_DIR" && mvn spring-boot:run) &
BACKEND_PID=$!

# ---- 啟動前端靜態伺服器 (port 3333) ----
echo -e "${YELLOW}[2/2] 啟動前端靜態伺服器 (port 3333)...${NC}"
python -m http.server 3333 --directory "$FRONTEND_DIR" &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}伺服器啟動中，請稍候約 15 秒讓 Spring Boot 完成初始化...${NC}"
echo ""
echo -e "  前端網站：${CYAN}http://localhost:3333${NC}"
echo -e "  後端 API：${CYAN}http://localhost:8080${NC}"
echo ""
echo -e "${YELLOW}按 Ctrl+C 可關閉所有伺服器${NC}"
echo ""

# 等 15 秒後自動開啟瀏覽器
sleep 15
echo -e "${GREEN}開啟瀏覽器...${NC}"
cmd //c start "http://localhost:3333" 2>/dev/null || \
  echo "請手動開啟瀏覽器：http://localhost:3333"

# 捕捉 Ctrl+C，關閉前後端
cleanup() {
  echo ""
  echo -e "${YELLOW}關閉中...${NC}"
  kill $BACKEND_PID 2>/dev/null
  kill $FRONTEND_PID 2>/dev/null
  pkill -f "spring-boot:run" 2>/dev/null
  pkill -f "http.server 3333" 2>/dev/null
  echo -e "${GREEN}已關閉所有伺服器，掰掰！${NC}"
  exit 0
}

trap cleanup INT TERM

wait
