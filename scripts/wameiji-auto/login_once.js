const { chromium } = require('playwright');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'storageState.json');
const HOME_URL = 'https://www.meruki.cn/';

(async () => {
  if (!process.env.DISPLAY) {
    console.error('当前环境没有图形界面（$DISPLAY 为空），无法直接打开可视化浏览器。');
    console.error('可选方案：');
    console.error('1) 在有桌面的机器上运行 npm run login');
    console.error('2) 改用账号密码自动登录：先写 .env，再运行 npm run login:auto');
    process.exit(1);
  }

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
