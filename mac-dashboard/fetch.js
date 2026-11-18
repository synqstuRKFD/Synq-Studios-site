// SYNQ Dashboard data fetcher.
// Runs on a Mac with:  osascript -l JavaScript fetch.js
// Reads your keys from the macOS Keychain (service "synq-dashboard"), pulls numbers from
// Square, GoatCounter and YouTube, and writes data.js next to dashboard.html.
// Keys never leave your Mac except to the service they belong to.

const IS_JXA = typeof Application !== 'undefined';
const ENV = IS_JXA ? {} : process.env; // node is only used for testing

const SQUARE = ENV.SYNQ_SQUARE_BASE || 'https://connect.squareup.com';
const GOAT = ENV.SYNQ_GOAT_BASE || 'https://synqstudiosrkfd.goatcounter.com';
const YT = ENV.SYNQ_YT_BASE || 'https://www.googleapis.com/youtube/v3';
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
  if (!IS_JXA) return ENV.SYNQ_DIR || __dirname;
  const p = $.NSProcessInfo.processInfo.arguments.js.map(a => a.js).find(a => a.endsWith('fetch.js'));
  return p ? p.replace(/\/[^/]*$/, '') : sh('echo "$HOME/Library/Application Support/SYNQ Dashboard"').trim();
}
function key(name) {
  if (!IS_JXA) return ENV['SYNQ_KEY_' + name.toUpperCase()] || '';
  try { return sh('security find-generic-password -s synq-dashboard -a ' + q(name) + ' -w').trim(); }
  catch (e) { return ''; }
}

// HTTP through curl. Secret headers go in a private temp file, not on the command line.
function http(method, url, headers, body) {
  const tmp = sh('mktemp -d').trim();
  try {
    const hfile = tmp + '/h';
    writeFile(hfile, Object.entries(headers || {}).map(([k, v]) => k + ': ' + v).join('\n') + '\n');
    sh('chmod 600 ' + q(hfile));
    let cmd = 'curl -sS --max-time 25 -X ' + method + ' -H @' + q(hfile) + ' -w ' + q('\n%{http_code}');
    if (body !== undefined) {
      const bfile = tmp + '/b';
      writeFile(bfile, JSON.stringify(body));
      cmd += ' -H ' + q('Content-Type: application/json') + ' --data-binary @' + q(bfile);
    }
    const out = sh(cmd + ' ' + q(url));
    const cut = out.lastIndexOf('\n');
    const code = +out.slice(cut + 1).trim();
    const text = out.slice(0, cut);
    let json = null;
    try { json = text ? JSON.parse(text) : {}; } catch (e) { /* not json */ }
    if (code >= 400 || code === 0) {
      let msg = 'HTTP ' + code;
      if (json && json.errors) msg += ': ' + (json.errors.map ? json.errors.map(e => e.detail || e.message || e.code || JSON.stringify(e)).join('; ') : JSON.stringify(json.errors));
      else if (json && json.error) msg += ': ' + (json.error.message || json.error);
      if (code === 401 || code === 403) msg = 'The key was rejected (' + msg + '). Re-enter it with "SYNQ Dashboard Keys".';
      throw new Error(msg);
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
  catch (e) { return { ok: false, error: String(e.message || e) }; }
}

// ---------- Square: money + bookings ----------
function square() {
  const token = key('square');
  if (!token) return { ok: false, missing: true };
  return safe('square', () => {
    const H = { Authorization: 'Bearer ' + token, 'Square-Version': '2025-01-23', Accept: 'application/json' };
    const get = path => http('GET', SQUARE + path, H);
    const post = (path, body) => http('POST', SQUARE + path, H, body);

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

    // Names for customers and services
    const custIds = [...new Set(upcoming.map(b => b.customer_id).filter(Boolean))];
    const names = {};
    if (custIds.length) {
      try {
        const r = post('/v2/customers/bulk-retrieve', { customer_ids: custIds.slice(0, 100) });
        Object.entries(r.responses || {}).forEach(([id, v]) => {
          const c = v.customer || {};
          names[id] = [c.given_name, c.family_name].filter(Boolean).join(' ') || c.company_name || c.nickname || '';
        });
      } catch (e) { /* names are a nice-to-have */ }
    }
    const varIds = [...new Set([].concat(...upcoming.map(b => (b.appointment_segments || []).map(s => s.service_variation_id))).filter(Boolean))];
    const services = {};
    if (varIds.length) {
      try {
        const r = post('/v2/catalog/batch-retrieve', { object_ids: varIds.slice(0, 1000), include_related_objects: true });
        const items = {};
        (r.related_objects || []).forEach(o => { if (o.type === 'ITEM') items[o.id] = (o.item_data || {}).name; });
        (r.objects || []).forEach(o => {
          const v = o.item_variation_data || {};
          const item = items[v.item_id] || '';
          services[o.id] = item && v.name && !/^regular$/i.test(v.name) ? item + ' · ' + v.name : item || v.name || '';
        });
      } catch (e) { /* names are a nice-to-have */ }
    }
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
  const token = key('goatcounter');
  if (!token) return { ok: false, missing: true };
  return safe('goat', () => {
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
  const k = key('youtube');
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

// ---------- main ----------
function run() {
  const dir = here();
  const data = {
    updatedAt: new Date().toISOString(),
    square: square(),
    site: goat(),
    youtube: youtube(dir + '/youtube-history.json'),
  };
  writeFile(dir + '/data.js', 'window.SYNQ = ' + JSON.stringify(data) + ';\n');
  return 'ok';
}
if (!IS_JXA) { run(); }
