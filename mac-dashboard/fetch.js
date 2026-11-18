// SYNQ Dashboard data fetcher.
// On a Mac:   osascript -l JavaScript fetch.js          (refresh data.js)
//             osascript -l JavaScript fetch.js --test   (check each connection)
// Anywhere with Node:  node fetch.js [--test]
//
// Keys come from environment variables only. If a variable isn't already set in the
// environment, it's loaded from the .env file next to this script (same as dotenv).
// Keys are never written to data.js, never printed and never put on a command line.
// Square is read-only here: every Square request is a GET.

const IS_JXA = typeof Application !== 'undefined';
const YT = 'https://www.googleapis.com/youtube/v3';
const YT_HANDLE = 'SynqStudios';

// ---------- platform helpers ----------
let app;
if (IS_JXA) {
  ObjC.import('Foundation');
  app = Application.currentApplication();
  app.includeStandardAdditions = true;
}
function sh(cmd) {
  if (IS_JXA) return app.doShellScript(cmd, { alteringLineEndings: false });
  return require('child_process').execSync(cmd, { encoding: 'utf8', shell: '/bin/bash' });
}
const q = s => "'" + String(s).replace(/'/g, "'\\''") + "'";
function readFile(p) {
  if (IS_JXA) {
    const s = $.NSString.stringWithContentsOfFileEncodingError(p, $.NSUTF8StringEncoding, null);
    return s.isNil() ? null : s.js;
  }
  try { return require('fs').readFileSync(p, 'utf8'); } catch (e) { return null; }
}
function writeFile(p, text) {
  if (IS_JXA) {
    $.NSString.alloc.initWithUTF8String(text).writeToFileAtomicallyEncodingError(p, true, $.NSUTF8StringEncoding, null);
  } else require('fs').writeFileSync(p, text);
}
function here() {
  if (!IS_JXA) return process.env.SYNQ_DIR || __dirname;
  const p = $.NSProcessInfo.processInfo.arguments.js.map(a => a.js).find(a => a.endsWith('fetch.js'));
  return p ? p.replace(/\/[^/]*$/, '') : sh('echo "$HOME/Library/Application Support/SYNQ Dashboard"').trim();
}
// ---------- configuration (environment variables, filled from .env) ----------
let ENV = null;
function loadEnv() {
  if (ENV) return ENV;
  const fromFile = {};
  const text = readFile(here() + '/.env') || '';
  text.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m || line.trim().startsWith('#')) return;
    let v = m[2];
    if (/^(["']).*\1$/.test(v)) v = v.slice(1, -1);
    fromFile[m[1]] = v;
  });
  const real = IS_JXA ? {} : process.env;
  ENV = new Proxy({}, { get: (_, k) => (real[k] !== undefined && real[k] !== '' ? real[k] : fromFile[k]) || '' });
  return ENV;
}
const cfg = name => String(loadEnv()[name] || '').trim();
const SECRET_NAMES = ['GOATCOUNTER_API_KEY', 'SQUARE_ACCESS_TOKEN', 'YOUTUBE_API_KEY'];
// Strip any key value out of a message before it can be shown or saved
function scrub(msg) {
  let out = String(msg);
  SECRET_NAMES.forEach(n => { const v = cfg(n); if (v && v.length > 3) out = out.split(v).join('[hidden]'); });
  return out.replace(/([?&]key=)[^&\s"']+/g, '$1[hidden]').replace(/(Bearer\s+)\S+/g, '$1[hidden]');
}

// HTTP through curl. The URL and headers (which carry keys) go in a private temp config
// file read with -K, so they never appear on a command line or in the process list.
function http(method, url, headers) {
  if (!IS_JXA && process.env.SYNQ_TEST_BASE) url = url.replace(/^https:\/\/[^/]+/, process.env.SYNQ_TEST_BASE); // local tests only
  const tmp = sh('mktemp -d').trim();
  const cq = v => '"' + String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
  try {
    const conf = tmp + '/curl.conf';
    const lines = ['url = ' + cq(url), 'request = ' + cq(method)]
      .concat(Object.entries(headers || {}).map(([k, v]) => 'header = ' + cq(k + ': ' + v)));
    sh('umask 077; : > ' + q(conf));
    writeFile(conf, lines.join('\n') + '\n');
    let out;
    try { out = sh('curl -sS --max-time 25 -K ' + q(conf) + ' -w ' + q('\n%{http_code}') + ' 2>&1'); }
    catch (e) { throw new Error('Could not reach ' + url.split('/')[2]); }
    const cut = out.lastIndexOf('\n');
    const code = +out.slice(cut + 1).trim();
    const text = out.slice(0, cut);
    let json = null;
    try { json = text ? JSON.parse(text) : {}; } catch (e) { /* not json */ }
    if (!code || code >= 400) {
      let msg = code ? 'HTTP ' + code : 'Could not reach ' + url.split('/')[2];
      if (json && json.errors) msg += ': ' + (json.errors.map ? json.errors.map(e => e.detail || e.message || e.code || '').join('; ') : JSON.stringify(json.errors));
      else if (json && json.error) msg += ': ' + (json.error.message || json.error);
      throw new Error(scrub(msg));
    }
    if (json === null) throw new Error('Unexpected reply from ' + url.split('/')[2]);
    return json;
  } finally { sh('rm -rf ' + q(tmp)); }
}

// ---------- dates (Mac local time) ----------
const DAY = 864e5;
const now = new Date();
const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const today0 = startOfDay(now);
const week0 = new Date(today0.getTime() - ((today0.getDay() + 6) % 7) * DAY); // Monday
const month0 = new Date(now.getFullYear(), now.getMonth(), 1);
const lastMonth0 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const year0 = new Date(now.getFullYear(), 0, 1);
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const hourIso = d => { const x = new Date(d); x.setUTCMinutes(0, 0, 0); return x.toISOString().replace('.000Z', 'Z'); };

function safe(name, fn) {
  try { return Object.assign({ ok: true }, fn()); }
  catch (e) { return { ok: false, error: scrub(e.message || e) }; }
}

// ---------- Square: money + bookings ----------
function square() {
  const token = cfg('SQUARE_ACCESS_TOKEN');
  if (!token) return { ok: false, missing: true };
  return safe('square', () => {
    const SQUARE = /^sandbox$/i.test(cfg('SQUARE_ENVIRONMENT')) ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com';
    const H = { Authorization: 'Bearer ' + token, 'Square-Version': '2025-01-23', Accept: 'application/json' };
    const get = path => http('GET', SQUARE + path, H); // read-only: GET requests only

    const locs = (get('/v2/locations').locations || []).filter(l => l.status !== 'INACTIVE');
    const loc = locs[0] || {};

    // Payments since Jan 1 (or since last month's start, whichever is earlier)
    const from = lastMonth0 < year0 ? lastMonth0 : year0;
    let payments = [], cursor = '', pages = 0;
    do {
      const r = get('/v2/payments?sort_order=DESC&limit=100&begin_time=' + encodeURIComponent(from.toISOString()) +
        '&end_time=' + encodeURIComponent(now.toISOString()) + (cursor ? '&cursor=' + encodeURIComponent(cursor) : ''));
      payments = payments.concat(r.payments || []);
      cursor = r.cursor || '';
    } while (cursor && ++pages < 30);

    const net = p => ((p.amount_money || {}).amount || 0) + ((p.tip_money || {}).amount || 0) - ((p.refunded_money || {}).amount || 0);
    const paid = payments.filter(p => p.status === 'COMPLETED');
    const sum = (a, b) => paid.filter(p => { const t = new Date(p.created_at); return t >= a && t < b; }).reduce((s, p) => s + net(p), 0) / 100;
    const end = new Date(now.getTime() + 1000);
    const daily = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today0.getFullYear(), today0.getMonth(), today0.getDate() - i);
      const e = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      daily.push({ day: ymd(d), amount: sum(d, e) });
    }
    const kind = p => p.source_type === 'CASH' ? 'Cash' : p.source_type === 'EXTERNAL' ? ((p.external_details || {}).source || 'Other') :
      p.source_type === 'WALLET' ? 'Wallet' : (p.card_details && p.card_details.card) ? (p.card_details.card.card_brand || 'Card').replace(/_/g, ' ') : 'Card';
    const money = {
      currency: ((paid[0] || {}).amount_money || {}).currency || loc.currency || 'USD',
      today: sum(today0, end), week: sum(week0, end), month: sum(month0, end),
      lastMonth: sum(lastMonth0, month0), year: sum(year0, end), daily,
      recent: paid.slice(0, 8).map(p => ({ at: p.created_at, amount: net(p) / 100, kind: kind(p), note: p.note || '' })),
      countMonth: paid.filter(p => new Date(p.created_at) >= month0).length,
    };

    // Bookings: upcoming 30 days, plus this month so far (each call max 31 days)
    const listBookings = (a, b) => {
      let out = [], c = '', n = 0;
      do {
        const r = get('/v2/bookings?limit=100&start_at_min=' + encodeURIComponent(a.toISOString()) + '&start_at_max=' + encodeURIComponent(b.toISOString()) +
          (loc.id ? '&location_id=' + encodeURIComponent(loc.id) : '') + (c ? '&cursor=' + encodeURIComponent(c) : ''));
        out = out.concat(r.bookings || []); c = r.cursor || '';
      } while (c && ++n < 10);
      return out;
    };
    const live = b => !/CANCELLED|DECLINED|NO_SHOW/.test(b.status || '');
    const upcoming = listBookings(now, new Date(now.getTime() + 30 * DAY)).filter(live).sort((a, b) => a.start_at < b.start_at ? -1 : 1);
    const thisMonth = month0 < now ? listBookings(month0, now).filter(live) : [];

    // Names for customers and services (GET lookups, one per id; at most 12 bookings are listed)
    const shown = upcoming.slice(0, 12);
    const names = {}, services = {};
    [...new Set(shown.map(b => b.customer_id).filter(Boolean))].forEach(id => {
      try {
        const c = get('/v2/customers/' + encodeURIComponent(id)).customer || {};
        names[id] = [c.given_name, c.family_name].filter(Boolean).join(' ') || c.company_name || c.nickname || '';
      } catch (e) { /* names are a nice-to-have */ }
    });
    [...new Set([].concat(...shown.map(b => (b.appointment_segments || []).map(x => x.service_variation_id))).filter(Boolean))].forEach(id => {
      try {
        const r = get('/v2/catalog/object/' + encodeURIComponent(id) + '?include_related_objects=true');
        const v = (r.object || {}).item_variation_data || {};
        const item = ((r.related_objects || []).find(o => o.type === 'ITEM') || {}).item_data || {};
        services[id] = item.name && v.name && !/^regular$/i.test(v.name) ? item.name + ' · ' + v.name : item.name || v.name || '';
      } catch (e) { /* names are a nice-to-have */ }
    });
    const week7 = new Date(today0.getTime() + 7 * DAY);
    const bookings = {
      next7: upcoming.filter(b => new Date(b.start_at) < week7).length,
      next30: upcoming.length,
      thisMonth: thisMonth.length,
      list: upcoming.slice(0, 12).map(b => {
        const seg = (b.appointment_segments || [])[0] || {};
        return {
          at: b.start_at, minutes: (b.appointment_segments || []).reduce((s, x) => s + (x.duration_minutes || 0), 0),
          who: names[b.customer_id] || 'Customer', service: services[seg.service_variation_id] || 'Appointment',
          status: b.status === 'PENDING' ? 'Needs your OK' : '',
        };
      }),
    };
    return { location: loc.name || '', money, bookings };
  });
}

// ---------- GoatCounter: website ----------
function goat() {
  const token = cfg('GOATCOUNTER_API_KEY');
  if (!token) return { ok: false, missing: true };
  return safe('goat', () => {
    const GOAT = (cfg('GOATCOUNTER_SITE') || 'https://synqstudiosrkfd.goatcounter.com').replace(/\/+$/, '');
    const H = { Authorization: 'Bearer ' + token, Accept: 'application/json', 'Content-Type': 'application/json' };
    const get = path => http('GET', GOAT + '/api/v0' + path, H);
    const range = (a, b) => 'start=' + encodeURIComponent(hourIso(a)) + '&end=' + encodeURIComponent(hourIso(new Date(b.getTime() + 3600e3)));
    const d30 = new Date(today0.getTime() - 29 * DAY);
    const total = (a) => { const r = get('/stats/total?' + range(a, now)); return { all: r.total || 0, events: r.total_events || 0, stats: r.stats || [] }; };
    const t30 = total(d30), t7 = total(new Date(today0.getTime() - 6 * DAY)), t1 = total(today0);
    const visitors = t => Math.max(0, t.all - t.events);
    const daily = t30.stats.map(s => ({ day: s.day, visitors: s.daily || 0 }));
    const hits = (get('/stats/hits?limit=100&' + range(d30, now)).hits || []);
    const pages = hits.filter(h => !h.event).map(h => ({ name: h.title || h.path, path: h.path, count: h.count || 0 })).sort((a, b) => b.count - a.count).slice(0, 6);
    const taps = hits.filter(h => h.event).map(h => ({ name: h.title || h.path, count: h.count || 0 })).sort((a, b) => b.count - a.count);
    let refs = [];
    try { refs = (get('/stats/toprefs?limit=8&' + range(d30, now)).stats || []).map(s => ({ name: s.name || '(direct / typed in)', count: s.count || 0 })); } catch (e) { /* optional */ }
    let places = [];
    try { places = (get('/stats/locations?limit=6&' + range(d30, now)).stats || []).map(s => ({ name: s.name || 'Unknown', count: s.count || 0 })); } catch (e) { /* optional */ }
    return { today: visitors(t1), week: visitors(t7), month: visitors(t30), daily, pages, taps, refs, places };
  });
}

// ---------- YouTube ----------
function youtube(histPath) {
  const k = cfg('YOUTUBE_API_KEY');
  if (!k) return { ok: false, missing: true };
  return safe('yt', () => {
    const get = path => http('GET', YT + path + (path.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(k), {});
    const ch = (get('/channels?part=statistics,contentDetails,snippet&forHandle=' + YT_HANDLE).items || [])[0];
    if (!ch) throw new Error('Could not find the @' + YT_HANDLE + ' channel');
    const st = ch.statistics || {};
    const views = +st.viewCount || 0, subs = +st.subscriberCount || 0;
    const up = ((ch.contentDetails || {}).relatedPlaylists || {}).uploads;
    let videos = [];
    if (up) {
      const ids = (get('/playlistItems?part=contentDetails&maxResults=8&playlistId=' + up).items || []).map(i => i.contentDetails.videoId);
      if (ids.length) videos = (get('/videos?part=statistics,snippet&id=' + ids.join(',')).items || []).map(v => ({
        title: v.snippet.title, at: v.snippet.publishedAt, views: +(v.statistics || {}).viewCount || 0, url: 'https://www.youtube.com/watch?v=' + v.id,
      }));
    }
    // Keep a small daily history so we can show views gained this week
    let hist = {};
    try { hist = JSON.parse(readFile(histPath) || '{}'); } catch (e) { hist = {}; }
    hist[ymd(now)] = { views, subs };
    Object.keys(hist).sort().slice(0, -400).forEach(d => delete hist[d]);
    writeFile(histPath, JSON.stringify(hist));
    const days = Object.keys(hist).sort();
    const back = d => { const target = ymd(new Date(today0.getTime() - d * DAY)); const k2 = days.filter(x => x <= target).pop(); return k2 ? hist[k2] : null; };
    const w = back(7), m = back(30);
    return {
      views, subs, videoCount: +st.videoCount || 0,
      viewsWeek: w ? views - w.views : null, viewsMonth: m ? views - m.views : null,
      since: days[0], videos,
    };
  });
}

// ---------- test each connection (prints only OK / problem, never key values) ----------
function test() {
  const line = (name, varName, fn) => {
    if (!cfg(varName)) return '- ' + name + ': not set (' + varName + ' is empty in .env)';
    try { return '✓ ' + name + ': ' + fn(); } catch (e) { return '✗ ' + name + ': ' + scrub(e.message || e); }
  };
  const out = [
    line('GoatCounter', 'GOATCOUNTER_API_KEY', () => {
      const site = (cfg('GOATCOUNTER_SITE') || 'https://synqstudiosrkfd.goatcounter.com').replace(/\/+$/, '');
      const r = http('GET', site + '/api/v0/stats/total?start=' + encodeURIComponent(hourIso(new Date(now - 7 * DAY))), { Authorization: 'Bearer ' + cfg('GOATCOUNTER_API_KEY'), 'Content-Type': 'application/json' });
      return 'connected to ' + site.replace(/^https?:\/\//, '') + ' (' + (r.total || 0) + ' visits in the last 7 days)';
    }),
    line('Square', 'SQUARE_ACCESS_TOKEN', () => {
      const sb = /^sandbox$/i.test(cfg('SQUARE_ENVIRONMENT'));
      const r = http('GET', (sb ? 'https://connect.squareupsandbox.com' : 'https://connect.squareup.com') + '/v2/locations', { Authorization: 'Bearer ' + cfg('SQUARE_ACCESS_TOKEN'), 'Square-Version': '2025-01-23' });
      const l = (r.locations || [])[0] || {};
      return 'connected (' + (sb ? 'sandbox' : 'production') + ', location: ' + (l.name || 'none found') + ')';
    }),
    line('YouTube', 'YOUTUBE_API_KEY', () => {
      const r = http('GET', YT + '/channels?part=statistics&forHandle=' + YT_HANDLE + '&key=' + encodeURIComponent(cfg('YOUTUBE_API_KEY')), {});
      const c = (r.items || [])[0];
      if (!c) throw new Error('key works, but the @' + YT_HANDLE + ' channel was not found');
      return 'connected (@' + YT_HANDLE + ', ' + Number(c.statistics.viewCount).toLocaleString('en-US') + ' total views)';
    }),
  ];
  return out.join('\n');
}

// ---------- main ----------
function run(argv) {
  if ((argv || []).indexOf('--test') !== -1) return test();
  const dir = here();
  const data = {
    updatedAt: new Date().toISOString(),
    square: square(),
    site: goat(),
    youtube: youtube(dir + '/youtube-history.json'),
  };
  writeFile(dir + '/data.js', 'window.SYNQ = ' + JSON.stringify(data) + ';\n');
  return 'Dashboard numbers updated.';
}
if (!IS_JXA) console.log(run(process.argv.slice(2)));
