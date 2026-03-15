require('dotenv').config();
const { chromium } = require('playwright');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'storageState.json');
const LOGIN_URL = 'https://www.meruki.cn/login';
const DEBUG_DIR = path.join(__dirname, 'debug');

const USER = process.env.WMJ_USERNAME || '';
const PASS = process.env.WMJ_PASSWORD || '';

function ts() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

(async () => {
  if (!USER || !PASS) {
    console.error('缺少账号或密码，请在 .env 中设置 WMJ_USERNAME / WMJ_PASSWORD');
    process.exit(1);
  }

  if (!require('fs').existsSync(DEBUG_DIR)) require('fs').mkdirSync(DEBUG_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1800); // 等前端渲染

    // 若被重定向到首页，补一次点击“登录”
    if (!page.url().includes('/login')) {
      await page.locator('a[href="/login"], text=登录, text=去登录, text=立即登录').first().click({ timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(1500);
    }

    // 有些页面默认是验证码登录，先切到“密码登录”
    await page.locator('text=密码登录, text=账号登录').first().click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);

    const userSelectors = [
      'input[name="username"]',
      'input[name="account"]',
      'input[name="mobile"]',
      'input[autocomplete="username"]',
      'input[placeholder*="账号"]',
      'input[placeholder*="手机号"]',
      'input[placeholder*="手机"]',
      'input[type="text"]'
    ];

    const passSelectors = [
      'input[name="password"]',
      'input[autocomplete="current-password"]',
      'input[type="password"]',
      'input[placeholder*="密码"]'
    ];

    async function fillIn(target) {
      let uf = false;
      let pf = false;

      for (const sel of userSelectors) {
        const el = target.locator(sel).first();
        if (await el.isVisible().catch(() => false)) {
          await el.fill(USER);
          uf = true;
          break;
        }
      }

      for (const sel of passSelectors) {
        const el = target.locator(sel).first();
        if (await el.isVisible().catch(() => false)) {
          await el.fill(PASS);
          pf = true;
          break;
        }
      }
      return { uf, pf };
    }

    let { uf: userFilled, pf: passFilled } = await fillIn(page);

    // 有些登录表单在 iframe 内
    if (!userFilled || !passFilled) {
      for (const frame of page.frames()) {
        if (frame === page.mainFrame()) continue;
        const ret = await fillIn(frame);
        userFilled = userFilled || ret.uf;
        passFilled = passFilled || ret.pf;
        if (userFilled && passFilled) break;
      }
    }

    if (!userFilled || !passFilled) {
      throw new Error('未找到账号/密码输入框，可能是滑块/短信验证码登录或页面结构变化');
    }

    await page.locator('button:has-text("登录"), text=登录').first().click({ timeout: 8000 });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    await context.storageState({ path: STATE_FILE });
    console.log(`登录态已保存: ${STATE_FILE}`);
  } catch (e) {
    const stamp = ts();
    const png = path.join(DEBUG_DIR, `login-failed-${stamp}.png`);
    const html = path.join(DEBUG_DIR, `login-failed-${stamp}.html`);
    await page.screenshot({ path: png, fullPage: true }).catch(() => {});
    require('fs').writeFileSync(html, await page.content().catch(() => ''), 'utf8');

    console.error('自动登录失败:', e.message);
    console.error(`调试截图: ${png}`);
    console.error(`调试HTML: ${html}`);
    console.error('建议：若页面有滑块/短信验证码，请改用可视化环境手动登录一次后保存会话。');
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
