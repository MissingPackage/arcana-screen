import { chromium } from '@playwright/test';

const BASE = process.env.APP_URL || 'http://localhost:5174';
const OUT = process.env.OUT_DIR || '/tmp/claude-1000/-home-neuromancer-Projects-arcana-screen/1e39a154-203c-41bb-9dd2-f8268598f6c1/scratchpad/shots';
const TEMPLATE = process.env.TEMPLATE || 'combat'; // combat gives the richest hero

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1487, height: 1058 }, deviceScaleFactor: 1 });
const log = (...a) => console.log('[shot]', ...a);

try {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE, { waitUntil: 'networkidle' });

  // FirstRun: pick template if available, then create
  const templateRadio = page.locator(`input[name="first-template"][value="${TEMPLATE}"]`);
  if (await templateRadio.count()) {
    await templateRadio.check().catch(() => {});
  }
  const createBtn = page.getByRole('button', { name: /Create .* Screen/ });
  await createBtn.click({ timeout: 8000 });
  await page.waitForTimeout(700);

  // Baseline: Prepare
  await page.screenshot({ path: `${OUT}/00-prepare.png` });
  log('prepare captured');

  // Enter Run
  const runBtn = page.getByRole('button', { name: 'Run', exact: true });
  await runBtn.click({ timeout: 8000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/01-run-default.png` });
  log('run default captured');

  // Each Focus
  for (const focus of ['Narrative', 'Social', 'Exploration', 'Combat']) {
    try {
      const btn = page.getByRole('button', { name: focus, exact: true });
      await btn.click({ timeout: 5000 });
      await page.waitForTimeout(450);
      await page.screenshot({ path: `${OUT}/run-${focus.toLowerCase()}.png` });
      log(`${focus} captured`);
    } catch (e) {
      log(`${focus} FAILED: ${e.message}`);
    }
  }
} catch (e) {
  console.error('[shot] FATAL', e.message);
  await page.screenshot({ path: `${OUT}/zz-error.png` }).catch(() => {});
} finally {
  await browser.close();
}
