import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const root = resolve('.');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
const server = createServer(async (request, response) => {
  try {
    const file = join(root, decodeURIComponent(request.url === '/' ? '/index.html' : request.url));
    response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch { response.writeHead(404); response.end(); }
});
await new Promise((resolveServer) => server.listen(0, '127.0.0.1', resolveServer));
const { port } = server.address();
const browser = await chromium.launch({ headless: true });

try {
  for (const [label, url] of [['HTTP', `http://127.0.0.1:${port}/`], ['file', `file://${join(root, 'index.html')}`]]) {
    const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    await page.goto(url);
    const initial = await page.evaluate(() => ({ phase: document.querySelector('#game').dataset.phase, y: window.__flappyAsim.getState().birdY }));
    const button = page.getByRole('button', { name: 'Start flying' });
    assert.equal(await button.evaluate((element) => element.tagName), 'BUTTON', `${label}: Start control is a button`);
    await button.click();
    await page.waitForFunction(() => document.querySelector('#game').dataset.phase === 'playing');
    await page.waitForTimeout(100);
    const started = await page.evaluate(() => ({ phase: document.querySelector('#game').dataset.phase, hidden: document.querySelector('#panel').hidden, y: window.__flappyAsim.getState().birdY }));
    assert.equal(initial.phase, 'ready', `${label}: initial phase`);
    assert.equal(started.phase, 'playing', `${label}: Start changes canvas phase`);
    assert.equal(started.hidden, true, `${label}: Start hides panel`);
    assert.notEqual(started.y, initial.y, `${label}: bird moves after animation frames`);
    await page.waitForTimeout(2000);
    assert.equal(await page.evaluate(() => window.__flappyAsim.getState().phase), 'gameover', `${label}: reaches game-over`);
    await page.keyboard.press('ArrowUp');
    await page.waitForFunction(() => document.querySelector('#game').dataset.phase === 'playing');
    assert.equal(await page.evaluate(() => window.__flappyAsim.getState().velocity < 0), true, `${label}: ArrowUp flaps after game-over`);
    assert.deepEqual(errors, [], `${label}: no browser errors`);
    await page.close();
    console.log(`${label} browser smoke: passed`);
  }
} finally {
  await browser.close();
  server.close();
}
