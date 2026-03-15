# 挖煤姬自动签到（Playwright 版）

按你要求，使用 **Playwright**（不依赖 agent-browser）。

## 1) 安装依赖

```bash
cd /root/.openclaw/workspace/scripts/wameiji-auto
npm install
npx playwright install
```

## 2) 生成登录态（两种方式）

### 方式 A：有桌面环境时手动登录

```bash
npm run login
```

会打开可视化浏览器，你手动完成登录后回终端按 Enter。
登录态会保存到：`storageState.json`

### 方式 B：无桌面服务器（推荐）自动登录

1. 新建 `.env`：

```env
WMJ_USERNAME=你的账号
WMJ_PASSWORD=你的密码
```

2. 执行：

```bash
npm run login:auto
```

登录成功后同样会保存 `storageState.json`。
若失败会在 `debug/` 里输出截图和 HTML，便于定位选择器问题。

## 3) 测试自动签到

```bash
npm run checkin
```

脚本会：
- 尝试进入“我的 / 每日签到”
- 点击“立即签到”
- 保存截图到 `screenshots/`

## 4) 加入每日定时任务（cron）

北京时间 09:00 = UTC 01:00：

```cron
0 1 * * * cd /root/.openclaw/workspace/scripts/wameiji-auto && /usr/bin/node checkin.js >> checkin.log 2>&1
```

## 常见问题

1. **登录失效**
   - 重新执行：`npm run login`

2. **找不到签到按钮**
   - 页面文案变动时，更新 `checkin.js` 里的按钮文本匹配。
