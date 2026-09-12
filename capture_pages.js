const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const USERNAME = 'screencap_test';
const PASSWORD = 'Capture#2026';

const OUT = path.join(__dirname, 'captures');
const SHOTS_DIR = path.join(OUT, 'screenshots');
const VIDEO_DIR = path.join(OUT, 'video');

fs.mkdirSync(SHOTS_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE ERR:', m.text().slice(0, 300)); });
  page.on('pageerror', (e) => console.log('PAGE ERR:', String(e).slice(0, 400)));
  page.on('requestfailed', (r) => console.log('REQ FAIL:', r.method(), r.url(), r.failure()?.errorText));
  page.on('response', (r) => {
    if (r.url().includes('/api/')) console.log('API:', r.status(), r.request().method(), r.url().replace('http://localhost:8000', ''));
  });

  const shot = (name) =>
    page.screenshot({ path: path.join(SHOTS_DIR, `${name}.png`), fullPage: true });

  const go = async (route, name) => {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await shot(name);
  };

  try {
    // Public pages
    await go('/', '01-home');
    await go('/about', '02-about');
    await go('/register', '03-register');

    // Login
    await go('/login', '04-login');
    await page.fill('#username', USERNAME);
    await page.fill('#password', PASSWORD);
    await Promise.all([
      page.waitForURL('**', { timeout: 30000 }),
      page.click('button[type=submit]'),
    ]);
    await page.waitForTimeout(1500);
    console.log('after login URL:', page.url());
    console.log('stored token:', await page.evaluate(() => localStorage.getItem('aiipp_access_token') ? 'yes' : 'no'));
    const errText = await page.locator('.login-error-alert').innerText().catch(() => '(none)');
    console.log('login error alert:', errText);
    await shot('05-home-after-login');

    // Logged-in pages
    await go('/profile', '06-profile');
    console.log('profile URL:', page.url());
    await go('/predict', '07-predict-form');
    console.log('predict URL:', page.url());
    console.log('tab count:', await page.locator('button[role=tab]').count());
    if ((await page.locator('button[role=tab]').count()) === 0) {
      console.log('BODY:', (await page.locator('body').innerText()).slice(0, 400));
    }

    // Model performance tab
    await page.click('button[role=tab]:has-text("AI Model Performance")');
    await page.waitForTimeout(2500);
    await shot('08-predict-model-performance');

    // Run a real prediction
    await page.click('button[role=tab]:has-text("Run a Prediction")');
    await page.waitForTimeout(600);
    await page.fill('#age', '35');
    await page.fill('#salary', '87000');
    await Promise.all([
      page.waitForURL(/\/prediction-results/, { timeout: 60000 }),
      page.click('button[type=submit].prediction-submit'),
    ]);
    await page.waitForTimeout(1500);
    await shot('09-prediction-results');

    // History now has the prediction recorded
    await go('/history', '10-history');

    console.log('Captures complete.');
    console.log('Screenshots:');
    console.log(fs.readdirSync(SHOTS_DIR).map((f) => '  ' + f).join('\n'));
  } catch (err) {
    console.error('ERROR:', err.message);
  } finally {
    await context.close();
    await browser.close();
  }
})();