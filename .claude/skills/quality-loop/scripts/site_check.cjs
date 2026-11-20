#!/usr/bin/env node
/*
 * Site checker — loads a page in headless Chromium at phone and desktop widths and reports
 * real problems: console/page errors, failed requests, horizontal overflow, missing SEO basics,
 * images without alt, unlabeled controls, broken local links, heavy assets.
 *
 * Usage:
 *   node site_check.cjs <file.html | http(s)://url> [more...] [--json] [--screenshots DIR] [--block-external]
 *
 * Exit code: 0 = no errors (warnings allowed), 1 = errors found, 2 = could not run.
 * Requires Playwright (`require('playwright')`). Lighthouse/axe give deeper audits if installed.
 */
const path = require('path');
const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) {
  console.error('Playwright not found. Install it (npm i -D playwright && npx playwright install chromium) or run where it is preinstalled.');
  process.exit(2);
}

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const blockExternal = args.includes('--block-external');
const shotIdx = args.indexOf('--screenshots');
const shotDir = shotIdx >= 0 ? args[shotIdx + 1] : null;
const targets = args.filter((a, i) => !a.startsWith('--') && !(shotIdx >= 0 && i === shotIdx + 1));
if (!targets.length) { console.error('usage: node site_check.cjs <file|url> [...] [--json] [--screenshots DIR] [--block-external]'); process.exit(2); }

const VIEWPORTS = [{ name: 'phone', width: 375, height: 812 }, { name: 'desktop', width: 1280, height: 800 }];
const toUrl = (t) => /^https?:\/\//.test(t) ? t : 'file://' + path.resolve(t);

async function checkPage(browser, target, vp) {
  const url = toUrl(target);
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errors = [], warnings = [];
  const bytes = { total: 0, big: [] };
  if (blockExternal && url.startsWith('file://')) {
    await page.route(/^https?:\/\//, (r) => r.abort());
  }
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`console: ${m.text().slice(0, 200)}`); });
  page.on('pageerror', (e) => errors.push(`js error: ${e.message.slice(0, 200)}`));
  page.on('requestfailed', (r) => {
    const f = r.failure() && r.failure().errorText;
    if (blockExternal && /ERR_FAILED|ERR_ABORTED/.test(f || '')) return;
    warnings.push(`request failed: ${r.url().slice(0, 120)} (${f})`);
  });
  page.on('response', async (res) => {
    if (res.status() >= 400) errors.push(`HTTP ${res.status()}: ${res.url().slice(0, 120)}`);
    try {
      const len = Number(res.headers()['content-length']) || (await res.body()).length;
      bytes.total += len;
      if (len > 300 * 1024) bytes.big.push(`${(len / 1024).toFixed(0)} KB ${res.url().split('/').pop().slice(0, 60)}`);
    } catch (_) { /* body unavailable (redirect/aborted) */ }
  });

  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(800);
  } catch (e) {
    errors.push(`could not load: ${e.message.split('\n')[0]}`);
    await ctx.close();
    return { target, viewport: vp.name, errors, warnings, info: {} };
  }

  const info = await page.evaluate(() => {
    const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.value ||
      (el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.innerText) ||
      [...el.querySelectorAll('img[alt],svg title')].map((i) => i.alt || i.textContent).join(' ') || '').trim();
    const overflowers = [];
    const vw = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > vw + 1) {
      for (const el of document.body.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && vis(el) && getComputedStyle(el).position !== 'fixed') {
          overflowers.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : '')));
          if (overflowers.length >= 5) break;
        }
      }
    }
    const labelled = (el) => el.labels?.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.getAttribute('title');
    return {
      title: document.title,
      lang: document.documentElement.lang,
      metaDescription: document.querySelector('meta[name="description"]')?.content || '',
      viewportMeta: !!document.querySelector('meta[name="viewport"]'),
      h1Count: document.querySelectorAll('h1').length,
      horizontalOverflow: document.documentElement.scrollWidth > vw + 1,
      scrollWidth: document.documentElement.scrollWidth, clientWidth: vw,
      overflowers,
      imgsNoAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).map((i) => i.currentSrc.split('/').pop()).slice(0, 10),
      unnamedControls: [...document.querySelectorAll('a[href],button,[role=button]')].filter((el) => vis(el) && !name(el))
        .map((el) => el.outerHTML.slice(0, 100)).slice(0, 10),
      unlabeledInputs: [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea')]
        .filter((el) => vis(el) && !labelled(el)).map((el) => el.outerHTML.slice(0, 100)).slice(0, 10),
      smallTapTargets: [...document.querySelectorAll('a[href],button')].filter((el) => {
        if (!vis(el)) return false; const r = el.getBoundingClientRect();
        return (r.width < 24 || r.height < 24) && getComputedStyle(el).display !== 'inline'; }).length,
      localLinks: [...document.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith('file://')),
    };
  });

  // Local link existence (file:// targets only)
  for (const href of [...new Set(info.localLinks)]) {
    const p = decodeURIComponent(href.replace('file://', '').split('#')[0].split('?')[0]);
    if (!p) continue;
    const exists = fs.existsSync(p) && (fs.statSync(p).isFile() || fs.existsSync(path.join(p, 'index.html')));
    if (!exists) errors.push(`broken local link: ${path.relative(process.cwd(), p)}`);
  }
  delete info.localLinks;

  if (!info.title) errors.push('missing <title>');
  if (!info.viewportMeta) errors.push('missing viewport meta tag');
  if (!info.lang) warnings.push('missing <html lang>');
  if (!info.metaDescription) warnings.push('missing meta description');
  if (info.h1Count !== 1) warnings.push(`expected 1 <h1>, found ${info.h1Count}`);
  if (info.horizontalOverflow) errors.push(`horizontal overflow: page is ${info.scrollWidth}px wide in ${info.clientWidth}px viewport (${info.overflowers.join(', ') || 'source unclear'})`);
  if (info.imgsNoAlt.length) errors.push(`images without alt: ${info.imgsNoAlt.join(', ')}`);
  if (info.unnamedControls.length) errors.push(`links/buttons without accessible name: ${info.unnamedControls.length} (e.g. ${info.unnamedControls[0]})`);
  if (info.unlabeledInputs.length) errors.push(`form fields without label: ${info.unlabeledInputs.length} (e.g. ${info.unlabeledInputs[0]})`);
  if (vp.name === 'phone' && info.smallTapTargets) warnings.push(`${info.smallTapTargets} tap targets smaller than 24px`);
  if (bytes.big.length) warnings.push(`large assets (>300 KB): ${bytes.big.slice(0, 6).join('; ')}`);
  info.transferKB = Math.round(bytes.total / 1024);

  if (shotDir) {
    fs.mkdirSync(shotDir, { recursive: true });
    const file = path.join(shotDir, `${path.basename(target).replace(/[^\w.-]/g, '_')}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    info.screenshot = file;
  }
  await ctx.close();
  return { target, viewport: vp.name, errors: [...new Set(errors)], warnings: [...new Set(warnings)], info };
}

(async () => {
  const browser = await chromium.launch();
  const results = [];
  for (const t of targets) for (const vp of VIEWPORTS) results.push(await checkPage(browser, t, vp));
  await browser.close();
  if (asJson) { console.log(JSON.stringify(results, null, 2)); }
  else {
    for (const r of results) {
      console.log(`\n## ${r.target} @ ${r.viewport}  —  ${r.errors.length} errors, ${r.warnings.length} warnings`);
      if (r.info.title !== undefined) console.log(`title: "${r.info.title}" · lang: ${r.info.lang || '-'} · transferred ≈ ${r.info.transferKB} KB`);
      r.errors.forEach((e) => console.log(`  ✗ ${e}`));
      r.warnings.forEach((w) => console.log(`  ! ${w}`));
      if (r.info.screenshot) console.log(`  screenshot: ${r.info.screenshot}`);
    }
    const ne = results.reduce((n, r) => n + r.errors.length, 0);
    console.log(`\nTOTAL: ${ne} errors, ${results.reduce((n, r) => n + r.warnings.length, 0)} warnings across ${results.length} page loads`);
  }
  process.exit(results.some((r) => r.errors.length) ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
