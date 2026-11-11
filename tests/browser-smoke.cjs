// Real Chromium visual smoke test. Screenshots are build artifacts, NOT visual approval.
// Runs against the complete, unchanged, single-file Wildframe application.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');
const { PNG } = require('pngjs');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'));
assert(html.byteLength > 3_500_000, 'Bundled game source may be truncated');
const shots = path.join(__dirname, '..', 'artifacts', 'browser');
fs.mkdirSync(shots, { recursive: true });
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(html);
  } else {
    res.writeHead(404); res.end('not found');
  }
});
function listen() {
  return new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
}
function closeServer() {
  return new Promise(resolve => server.close(resolve));
}
function inspectScreenshot(filename) {
  const shot = PNG.sync.read(fs.readFileSync(filename));
  const buckets = new Set();
  const stride = Math.max(1, Math.floor((shot.width * shot.height) / 3000));
  for (let i = 0; i < shot.width * shot.height; i += stride) {
    const p = i * 4;
    buckets.add((shot.data[p] >> 4) + ',' + (shot.data[p + 1] >> 4) + ',' + (shot.data[p + 2] >> 4));
  }
  assert(buckets.size >= 35, 'Screenshot looks blank or single-color: ' + filename + ' (' + buckets.size + ' color groups)');
  return { width: shot.width, height: shot.height, colorGroups: buckets.size };
}
async function run() {
  await listen();
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  try {
    const sizes = [
      { name: 'iphone-landscape', width: 844, height: 390 },
      { name: 'iphone-portrait', width: 390, height: 844 },
    ];
    for (const size of sizes) {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        screen: { width: size.width, height: size.height },
        deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(String(error)));
      const url = 'http://127.0.0.1:' + server.address().port + '/';
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.locator('#ui [data-action="new"]').waitFor({ timeout: 45000 });
      const titleFile = path.join(shots, size.name + '-title.png');
      await page.screenshot({ path: titleFile, animations: 'disabled', timeout: 30000 });
      const titleInfo = inspectScreenshot(titleFile);
      await page.locator('#ui [data-action="new"]').click();
      await page.locator('#ui [data-action="intro-skip"]').waitFor({ timeout: 20000 });
      await page.locator('#ui [data-action="intro-skip"]').click();
      await page.waitForFunction(() => {
        const c = document.querySelector('#game canvas');
        return Boolean(c && c.width >= 100 && c.height >= 100);
      }, { timeout: 30000 });
      await page.waitForTimeout(1200);
      const gameFile = path.join(shots, size.name + '-gameplay.png');
      await page.screenshot({ path: gameFile, animations: 'disabled', timeout: 30000 });
      const gameInfo = inspectScreenshot(gameFile);
      const gameBounds = await page.evaluate(() => {
        const c = document.querySelector('#game canvas');
        const r = c.getBoundingClientRect();
        return { width: r.width, height: r.height, canvasWidth: c.width, canvasHeight: c.height };
      });
      assert(gameBounds.width > 100 && gameBounds.height > 100, 'Game canvas has invalid layout');
      assert(errors.length === 0, 'Browser JS exceptions: ' + errors.slice(0, 5).join(' | '));
      console.log('VISUAL SMOKE PASS ' + size.name + ': ' + JSON.stringify({ titleInfo, gameInfo, gameBounds }));
      await context.close();
    }
    console.log('Wildframe Chromium visual smoke PASS. Inspect screenshot artifacts before accepting art.');
  } finally { await browser.close(); }
}
run().catch(err => { console.error('Wildframe Chromium visual smoke FAIL:', err); process.exitCode = 1; })
  .finally(() => closeServer());