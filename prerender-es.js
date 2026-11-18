// Renders index.html in Spanish and saves it as a static es.html, so Google can index the Spanish page.
// Usage: node prerender-es.js dist/index.html dist/es.html
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const [src, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.route(/^https?:/, r => r.abort()); // no network needed (fonts load on the real site)
  await page.goto('file://' + path.resolve(src) + '?lang=es', { waitUntil: 'load' });
  await page.waitForTimeout(300);
  const html = await page.evaluate(() => {
    document.documentElement.dataset.pageLang = 'es';
    document.querySelectorAll('.stick, .top').forEach(el => el.classList.remove('show', 'solid'));
    // strip scroll-animation state so the saved page is fully visible without JavaScript
    document.querySelectorAll('.reveal, img.fade').forEach(el => { el.classList.remove('reveal', 'in', 'fade', 'loaded'); el.style.transitionDelay = ''; if (!el.getAttribute('style')) el.removeAttribute('style'); });
    return '<!doctype html>\n' + document.documentElement.outerHTML;
  });
  await browser.close();
  if (!html.includes('data-page-lang="es"') || !html.includes('Definido por el sonido')) throw new Error('Spanish render failed');
  fs.writeFileSync(out, html);
})().catch(e => { console.error(e.message); process.exit(1); });
