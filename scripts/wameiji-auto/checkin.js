const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'storageState.json');
const HOME_URL = 'https://www.meruki.cn/';
const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
const DEBUG_DIR = path.join(__dirname, 'debug');

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
  if (!fs.existsSync(DEBUG_DIR)) fs.mkdirSync(DEBUG_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ storageState: STATE_FILE });
  const page = await context.newPage();

  let success = false;
  let message = '';

  try {
    await page.goto(HOME_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1800);

    // 处理 cookie 弹层
    await page.locator('text=同意').first().click({ timeout: 2500 }).catch(() => {});

    // 优先走可确定的个人积分页
    await page.goto('https://www.meruki.cn/personal/card', { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 12000 }).catch(() => {});
    await page.waitForTimeout(1200);

    // 若被重定向回首页，再尝试点击个人中心入口
    if (page.url().includes('/mall') || page.url() === HOME_URL || page.url() === `${HOME_URL}/`) {
      await clickFirst(page, [
        'a[href="/personal/card"]',
        'a[href*="/personal"]',
        'text=我的',
        'a:has-text("我的")',
        'button:has-text("我的")',
        '[href*="/user"]',
        '[href*="/mine"]'
      ]);
      await page.waitForTimeout(1200);
    }

    // 尝试进入签到入口
    await clickFirst(page, [
      'text=每日签到',
      'text=签到领积分',
      'text=去签到',
      'text=签到',
      'a:has-text("每日签到")',
      'button:has-text("每日签到")',
      'a[href*="sign"]',
      'a[href*="check"]'
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

    const pageText = await page.locator('body').innerText().catch(() => '');
    const ok = /签到成功|今日已签到|已签到/.test(pageText);

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
    const stamp = ts();
    const shot = path.join(SCREENSHOT_DIR, `checkin-${stamp}.png`);
    const html = path.join(DEBUG_DIR, `checkin-${stamp}.html`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});
    fs.writeFileSync(html, await page.content().catch(() => ''), 'utf8');

    await context.close();
    await browser.close();

    const prefix = success ? '✅' : '⚠️';
    console.log(`${prefix} ${new Date().toISOString()} ${message}`);
    console.log(`截图: ${shot}`);
    if (!success) console.log(`调试HTML: ${html}`);

    if (!success) process.exitCode = 1;
  }
})();
