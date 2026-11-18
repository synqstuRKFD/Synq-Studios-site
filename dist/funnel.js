// ===== Funnel behaviour: booking quiz, package pre-select, sticky CTA, conversion tracking =====

// Fire a conversion event to whatever analytics is installed (GA4 / Meta Pixel / TikTok Pixel).
// Nothing is sent anywhere until you add those tags to the page.
function track(event, data = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event, ...data });
    if (window.gtag) window.gtag('event', event, data);
    if (window.fbq) window.fbq('trackCustom', event, data);
    if (window.ttq) window.ttq.track(event, data);
  } catch (e) { /* analytics must never break the page */ }
}
document.querySelectorAll('[data-track]').forEach(el =>
  el.addEventListener('click', () => track(el.dataset.track, { label: el.textContent.trim().slice(0, 40) }))
);

// Translate helper (from i18n.js); falls back to English
const tr = (en, es) => (window.t ? window.t(en, es) : en);

// Send a form to Netlify Forms. On previews (localhost / claude.ai) nothing is sent: it just shows the thank-you.
const PREVIEW = /localhost|127\.0\.0\.1|claude/i.test(location.hostname);
async function sendForm(form) {
  const action = form.getAttribute('action');
  if (PREVIEW || !action || action === '#') return true;
  const isNetlify = form.hasAttribute('data-netlify');
  const r = await fetch(action, isNetlify
    ? { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() }
    : { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
  if (!r.ok) throw new Error(r.status);
  return true;
}

// ---- Booking quiz ----
const quiz = document.querySelector('.quiz');
if (quiz) {
  const steps = [...quiz.querySelectorAll('.quiz__step')];
  const bar = quiz.querySelector('.quiz__bar span');
  const back = quiz.querySelector('.quiz__back');
  const next = quiz.querySelector('.quiz__next');
  const err = quiz.querySelector('.quiz__err');
  const done = quiz.querySelector('.quiz__done');
  let i = 0, started = false;

  const show = n => {
    i = n;
    steps.forEach((s, k) => (s.hidden = k !== i));
    bar.style.width = `${((i + 1) / steps.length) * 100}%`;
    back.hidden = i === 0;
    next.textContent = i === steps.length - 1 ? tr('Send', 'Enviar') : tr('Next', 'Siguiente');
    err.textContent = '';
  };
  const valid = () => {
    const s = steps[i];
    const radios = s.querySelectorAll('input[type=radio]');
    if (radios.length && ![...radios].some(r => r.checked)) { err.textContent = tr('Pick one to keep going.', 'Escoge una para seguir.'); return false; }
    for (const f of s.querySelectorAll('[required]')) {
      if (!f.value.trim()) { err.textContent = tr('Add your name and a number we can text.', 'Pon tu nombre y un número para mandarte texto.'); f.focus(); return false; }
    }
    const tel = s.querySelector('input[type=tel]');
    if (tel && tel.value.replace(/\D/g, '').length < 10) { err.textContent = tr('Enter a 10-digit phone number.', 'Escribe un número de 10 dígitos.'); tel.focus(); return false; }
    return true;
  };

  // Picking an answer moves straight to the next step (fewer taps = more bookings)
  quiz.addEventListener('change', e => {
    if (!started) { started = true; track('quiz_start'); }
    if (e.target.type === 'radio' && i < steps.length - 1) setTimeout(() => { track('quiz_step', { step: i + 1 }); show(i + 1); }, 180);
  });
  back.addEventListener('click', () => show(Math.max(0, i - 1)));

  quiz.addEventListener('submit', async e => {
    e.preventDefault();
    if (!valid()) return;
    if (i < steps.length - 1) { show(i + 1); return; }

    const data = Object.fromEntries(new FormData(quiz));
    {
      next.disabled = true; next.textContent = tr('Sending…', 'Enviando…');
      try {
        await sendForm(quiz);
        next.disabled = false;
      } catch (x) {
        next.disabled = false; next.textContent = tr('Send', 'Enviar');
        err.textContent = tr("Couldn't send. Try again, or use the Text us button.", 'No se pudo enviar. Intenta otra vez o usa el botón Mandar texto.');
        return;
      }
    }
    track('lead', { service: data.service, group: data.group, when: data.when });
    steps.forEach(s => (s.hidden = true));
    err.textContent = '';
    quiz.querySelector('.quiz__nav').hidden = true;
    quiz.querySelector('.quiz__bar').hidden = true;
    const nm = (data.name || '').trim();
    // Grupos go by their full name ("Los Claveles"); people by their first name
    const who = /^(los|las|la|el|grupo|banda|conjunto|the)\s/i.test(nm) ? nm.slice(0, 40) : (nm.split(' ')[0] || tr('artist', 'artista'));
    done.querySelector('.quiz__done-title').textContent = tr(`Thanks, ${who}. Got it.`, `Gracias, ${who}. Ya lo recibimos.`);
    done.hidden = false;
  });

  // Package buttons pre-select the matching service and jump to the quiz
  document.querySelectorAll('[data-pick]').forEach(btn =>
    btn.addEventListener('click', () => {
      const r = quiz.querySelector(`input[name=service][value="${btn.dataset.pick}"]`);
      if (r) { r.checked = true; show(1); started = true; track('package_click', { pack: btn.dataset.pick }); }
      (document.getElementById('contact') || document.getElementById('book'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    })
  );
  show(0);
  // Keep the Next button's language in sync when the visitor switches EN/ES
  document.addEventListener('langchange', () => { if (!quiz.querySelector('.quiz__nav').hidden) show(i); });
}

// ---- Sticky mobile CTA: appears after the hero, hides at the booking section ----
const stick = document.querySelector('.stick');
const hero = document.querySelector('.hero');
const book = document.getElementById('contact') || document.getElementById('book');
if (stick && hero && book && 'IntersectionObserver' in window) {
  let pastHero = false, atBook = false;
  const upd = () => stick.classList.toggle('show', pastHero && !atBook);
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; upd(); }).observe(hero);
  new IntersectionObserver(([e]) => { atBook = e.isIntersecting; upd(); }, { threshold: .15 }).observe(book);
}

// ---- Text list signup ----
document.querySelectorAll('.textclub__form').forEach(f => f.addEventListener('submit', async e => {
  e.preventDefault();
  const msg = f.querySelector('.textclub__msg');
  const tel = f.querySelector('input[type=tel]');
  if (tel.value.replace(/\D/g, '').length < 10) { msg.textContent = tr('Enter a 10-digit phone number.', 'Escribe un número de 10 dígitos.'); tel.focus(); return; }
  {
    try { await sendForm(f); }
    catch { msg.textContent = tr("Couldn't join right now. Try again in a minute.", 'No se pudo ahora. Intenta en un minuto.'); return; }
  }
  track('text_list_join');
  msg.textContent = tr("You're on the list.", 'Ya estás en la lista.');
  f.reset();
}));

// ---- Netlify free plan adds a "Powered by Netlify" badge in the bottom-right corner.
// On phones it would sit on top of the Book / Text bar, so lift the bar above it.
function markBadge() {
  if (document.querySelector('script[data-nf-variant="public"]')) document.body.classList.add('has-nf-badge');
}
if (document.readyState === 'complete') markBadge(); else addEventListener('load', markBadge);


// ---- "Text us": ask for their name first, then open their messages app with a short, natural text ----
(function () {
  const dlg = document.querySelector('.textdlg');
  if (!dlg) return;
  const PHONE = '+18155660962';
  const form = dlg.querySelector('form');
  const who = form.elements.who, act = form.elements.act, err = dlg.querySelector('.textdlg__err');

  document.querySelectorAll('.js-text').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    err.textContent = '';
    dlg.showModal();
    setTimeout(() => who.focus(), 50);
    track('text_open_box', { from: a.dataset.track || '' });
  }));
  dlg.querySelector('.textdlg__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = who.value.trim();
    if (name.length < 2) { err.textContent = tr('Add your name so we know who is texting.', 'Pon tu nombre para saber quién escribe.'); who.focus(); return; }
    const band = act.value.trim();
    const me = band ? `${name} (${band})` : name;
    const msg = tr(
      `Hi, this is ${me}. I'm interested in booking a session at SYNQ Studios.`,
      `Hola, soy ${me}. Me interesa reservar una sesión en SYNQ Studios.`
    );
    track('sms_ready', { with_act: !!band });
    dlg.close();
    form.reset();
    location.href = `sms:${PHONE}?&body=${encodeURIComponent(msg)}`;
  });
})();
