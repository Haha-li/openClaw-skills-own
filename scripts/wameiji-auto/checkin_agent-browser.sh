#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION="wameiji"
STATE_FILE="$BASE_DIR/state/wameiji-auth.json"
LOG_DIR="$BASE_DIR/logs"
SHOT_DIR="$BASE_DIR/screenshots"

mkdir -p "$LOG_DIR" "$SHOT_DIR" "$(dirname "$STATE_FILE")"

TS="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
SHOT_FILE="$SHOT_DIR/checkin-$TS.png"

echo "[$TS] 开始执行签到"

# 尝试加载历史登录态
if [[ -f "$STATE_FILE" ]]; then
  agent-browser --session "$SESSION" state load "$STATE_FILE" || true
fi

agent-browser --session "$SESSION" open https://www.meruki.cn/
agent-browser --session "$SESSION" wait 1500

# 导航到我的/签到页（文案变化时可追加）
agent-browser --session "$SESSION" find text "我的" click || true
agent-browser --session "$SESSION" wait 800
agent-browser --session "$SESSION" find text "每日签到" click \
  || agent-browser --session "$SESSION" find text "签到领积分" click \
  || agent-browser --session "$SESSION" find text "签到" click \
  || true

agent-browser --session "$SESSION" wait 800

CLICKED=0
if agent-browser --session "$SESSION" find text "立即签到" click; then
  CLICKED=1
elif agent-browser --session "$SESSION" find role button click --name "立即签到"; then
  CLICKED=1
elif agent-browser --session "$SESSION" find text "签到" click; then
  CLICKED=1
fi

agent-browser --session "$SESSION" wait 1800
SNAP="$(agent-browser --session "$SESSION" snapshot -c || true)"

SUCCESS=0
if echo "$SNAP" | grep -Eq "签到成功|今日已签到|已签到"; then
  SUCCESS=1
fi

agent-browser --session "$SESSION" screenshot "$SHOT_FILE" || true
agent-browser --session "$SESSION" state save "$STATE_FILE" || true
agent-browser --session "$SESSION" close || true

if [[ "$SUCCESS" -eq 1 ]]; then
  echo "✅ $TS 签到成功（或今日已签到）"
  echo "截图: $SHOT_FILE"
  exit 0
fi

if [[ "$CLICKED" -eq 1 ]]; then
  echo "⚠️ $TS 已点击签到按钮，但未检测到成功文案"
else
  echo "❌ $TS 未找到签到入口/按钮，请先手动检查页面文案是否变更"
fi

echo "截图: $SHOT_FILE"
exit 1
