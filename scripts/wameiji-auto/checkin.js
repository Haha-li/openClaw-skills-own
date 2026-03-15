const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'storageState.json');
const HOME_URL = 'https://www.meruki.cn/';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function clickFirst(page, selectors, timeout = 7000) {
  for (const sel of selectors) {
    const loc = page.locator(sel).first();
    try {
      if (await loc.isVisible({ timeout: 1500 }).catch(() => false)) {
        await loc.click({ timeout });
        return sel;
      }
    } catch (_) {
      // try next
    }
  }
  return null;
}

(async () => {
  if (!fs.existsSync(STATE_FILE)) {
    console.error('未找到 storageState.json，请先执行: npm run login');
    process.exit(1);
  }

  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  let success = false;
  let message = '';

  try {
    await page.goto(HOME_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 先尝试进入“我的”或个人中心
    await clickFirst(page, [
      'text=我的',
      'a:has-text("我的")',
      'button:has-text("我的")',
      '[href*="/user"]',
      '[href*="/mine"]'
    ]);

    // 尝试进入签到入口
    await clickFirst(page, [
      'text=每日签到',
      'text=签到领积分',
      'text=签到',
      'a:has-text("每日签到")',
      'button:has-text("每日签到")'
    ]);

    // 尝试点击签到按钮
    const clicked = await clickFirst(page, [
      'text=立即签到',
      'button:has-text("立即签到")',
      'a:has-text("立即签到")',
      'text=签到',
      'button:has-text("签到")'
    ]);

    await page.waitForTimeout(1800);

    const ok = await page
      .locator('text=签到成功, text=今日已签到, text=已签到')
      .first()
      .isVisible()
      .catch(() => false);

    if (ok) {
      success = true;
      message = '签到成功（或今日已签到）';
    } else if (clicked) {
      message = '已点击签到按钮，但未检测到明确成功提示（建议人工检查一次）';
    } else {
      message = '未找到可点击的签到按钮，页面结构可能变化';
    }
  } catch (err) {
    message = `执行异常: ${err.message}`;
  } finally {
    const shot = path.join(SCREENSHOT_DIR, `checkin-${ts()}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});

    await context.close();
    await browser.close();

    const prefix = success ? '✅' : '⚠️';
    console.log(`${prefix} ${new Date().toISOString()} ${message}`);
    console.log(`截图: ${shot}`);

    if (!success) process.exitCode = 1;
  }
})();
