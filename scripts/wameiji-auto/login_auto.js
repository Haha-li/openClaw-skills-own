require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'storageState.json');
const LOGIN_URL = 'https://www.meruki.cn/';

const USER = process.env.WMJ_USERNAME || '';
const PASS = process.env.WMJ_PASSWORD || '';

(async () => {
  if (!USER || !PASS) {
    console.error('缺少账号或密码，请在 .env 中设置 WMJ_USERNAME / WMJ_PASSWORD');
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 尝试进入登录流程
    await page.locator('text=登录, text=去登录').first().click({ timeout: 8000 }).catch(() => {});

    const userSelectors = [
      'input[name="username"]',
      'input[name="account"]',
      'input[placeholder*="账号"]',
      'input[placeholder*="手机"]',
      'input[type="text"]'
    ];

    const passSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[placeholder*="密码"]'
    ];

    let userFilled = false;
    for (const sel of userSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(USER);
        userFilled = true;
        break;
      }
    }

    let passFilled = false;
    for (const sel of passSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible().catch(() => false)) {
        await el.fill(PASS);
        passFilled = true;
        break;
      }
    }

    if (!userFilled || !passFilled) {
      throw new Error('未找到账号/密码输入框，可能页面结构变化或需要验证码登录');
    }

    await page.locator('button:has-text("登录"), text=登录').first().click({ timeout: 8000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    await context.storageState({ path: STATE_FILE });
    console.log(`登录态已保存: ${STATE_FILE}`);
  } catch (e) {
    console.error('自动登录失败:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
