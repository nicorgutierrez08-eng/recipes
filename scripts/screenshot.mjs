// Dev-only helper used to review the site visually at desktop + mobile widths.
// Requires Playwright: `npm i -D playwright && npx playwright install chromium`.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://127.0.0.1:4321/recipes';
const OUT = 'screenshots';
mkdirSync(OUT, { recursive: true });

const shots = [
  { name: '01-library-desktop', url: `${BASE}/`, w: 1280, h: 900, full: true },
  { name: '02-library-desktop-filtered', url: `${BASE}/?mealType=dinner&protein=chicken`, w: 1280, h: 900, full: true, openFilters: true },
  { name: '03-library-mobile', url: `${BASE}/`, w: 390, h: 844, full: true },
  { name: '04-library-mobile-empty', url: `${BASE}/?q=zzzznotfound`, w: 390, h: 844, full: true },
  { name: '05-recipe-desktop', url: `${BASE}/miso-glazed-salmon/`, w: 1280, h: 900, full: true },
  { name: '06-recipe-mobile', url: `${BASE}/silky-tomato-ramen/`, w: 390, h: 844, full: true },
  { name: '07-recipe-noimage-desktop', url: `${BASE}/smashed-cucumber-salad/`, w: 1280, h: 900, full: true },
];

const browser = await chromium.launch();
for (const s of shots) {
  const page = await browser.newPage({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2 });
  await page.goto(s.url, { waitUntil: 'networkidle' });
  if (s.openFilters) {
    const btn = page.locator('.filters-toggle');
    if (await btn.count()) await btn.first().click();
  }
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log('shot', s.name);
  await page.close();
}
await browser.close();
console.log('done');
