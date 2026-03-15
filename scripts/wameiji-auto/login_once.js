const { chromium } = require('playwright');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'storageState.json');
const HOME_URL = 'https://www.meruki.cn/';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  console.log('请在浏览器中手动完成登录（含二次验证）。完成后回终端按 Enter 保存登录态。');

  await new Promise((resolve) => process.stdin.once('data', resolve));

  await context.storageState({ path: STATE_FILE });
  console.log(`登录态已保存: ${STATE_FILE}`);

  await browser.close();
})();
