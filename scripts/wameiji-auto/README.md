# 挖煤姬自动签到（agent-browser 版）

已按你要求改为 **agent-browser** 实现。

## 前置

确保 `agent-browser` 可用：

```bash
agent-browser --version
```

若未安装：

```bash
npm i -g agent-browser
agent-browser install
```

---

## 1) 首次手动登录并保存会话

```bash
cd /root/.openclaw/workspace/scripts/wameiji-auto
./login_once_agent-browser.sh
```

会打开可视化浏览器，你手动完成登录后回终端按 Enter。
登录态会保存到：`state/wameiji-auth.json`

---

## 2) 测试自动签到

```bash
./checkin_agent-browser.sh
```

脚本会：
- 加载已保存登录态
- 尝试进入“我的 / 每日签到”
- 点击“立即签到”
- 保存截图到 `screenshots/`

---

## 3) 加入每日定时任务（cron）

北京时间 09:00 = UTC 01:00：

```cron
0 1 * * * cd /root/.openclaw/workspace/scripts/wameiji-auto && ./checkin_agent-browser.sh >> logs/checkin.log 2>&1
```

---

## 常见问题

1. **提示找不到按钮**
   - 挖煤姬页面文案改了，更新 `checkin_agent-browser.sh` 中的 `find text` 关键词即可。

2. **登录失效**
   - 重新运行：`./login_once_agent-browser.sh`

3. **脚本返回警告但你实际已签到**
   - 有时页面提示文案不固定，先看 `screenshots/` 截图确认；再把成功文案补到 grep 条件里。
