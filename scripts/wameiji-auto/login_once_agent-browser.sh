#!/usr/bin/env bash
set -euo pipefail

SESSION="wameiji"
STATE_FILE="$(cd "$(dirname "$0")" && pwd)/state/wameiji-auth.json"

mkdir -p "$(dirname "$STATE_FILE")"

echo "[1/3] 打开挖煤姬首页（可视化浏览器）..."
agent-browser --session "$SESSION" open https://www.meruki.cn/ --headed

echo ""
echo "请在弹出的浏览器中手动完成登录。"
echo "登录完成后，回到终端按 Enter 保存登录态。"
read -r

echo "[2/3] 保存登录态到: $STATE_FILE"
agent-browser --session "$SESSION" state save "$STATE_FILE"

echo "[3/3] 关闭会话"
agent-browser --session "$SESSION" close || true

echo "完成。后续可直接运行 ./checkin_agent-browser.sh"
