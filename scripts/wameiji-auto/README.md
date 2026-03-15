# 挖煤姬自动签到脚本（Playwright）

> 本方案不需要在聊天里提供账号密码。

## 1) 安装依赖

```bash
cd scripts/wameiji-auto
npm install
npx playwright install
```

## 2) 首次手动登录并保存会话

```bash
npm run login
```

会打开可视化浏览器，你手动登录挖煤姬后回到终端按 Enter，保存 `storageState.json`。

## 3) 测试签到

```bash
npm run checkin
```

脚本会：
- 尝试进入“我的/签到”页面
- 点击“立即签到”
- 输出结果
- 自动保存截图到 `screenshots/`

## 4) 定时执行（cron）

北京时间 09:00 = UTC 01:00：

```cron
0 1 * * * cd /root/.openclaw/workspace/scripts/wameiji-auto && /usr/bin/node checkin.js >> checkin.log 2>&1
```

## 说明

- 若页面文案或结构变动，选择器可能失效，需要更新 `checkin.js`。
- 若登录态过期，重新执行 `npm run login` 即可。
