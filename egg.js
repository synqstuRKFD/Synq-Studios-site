// Easter egg: someone is asleep on the studio couch.
// Find it: tap the tiny "z" in the footer, tap the logo 5 times fast, or type "zzz".
(function () {
  const dlg = document.querySelector('.egg');
  if (!dlg) return;
  const t = (en, es) => (window.t ? window.t(en, es) : en);
  const msg = dlg.querySelector('.egg__msg'), count = dlg.querySelector('.egg__count');
  const wake = dlg.querySelector('.egg__wake'), book = dlg.querySelector('.egg__book');
  const sleeper = dlg.querySelector('.egg__sleeper');
  const LINES = [
    ['Still asleep.', 'Sigue dormido.'],
    ['He rolled over. That counts as a no.', 'Se volteó. Eso cuenta como un no.'],
    ['He had a 9-hour session last night.', 'Anoche tuvo una sesión de 9 horas.'],
    ['Pretty sure he just said "five more minutes."', 'Creo que dijo "cinco minutos más."'],
    ['Louder won\'t help. Trust us.', 'Más fuerte no va a servir. Créenos.'],
    ['He\'s dreaming about a perfect mix.', 'Está soñando con una mezcla perfecta.'],
    ['Okay, this is getting sad.', 'Ok, esto ya da tristeza.'],
  ];
  let taps = 0;

  function reset() {
    taps = 0;
    msg.textContent = t('Think you can wake him up?', '¿Crees que lo puedes despertar?');
    count.textContent = '';
    wake.hidden = false; wake.disabled = false; book.hidden = true;
    wake.textContent = t('Wake him up', 'Despiértalo');
  }
  let openedAt = 0;
  function open(from) {
    if (dlg.open || Date.now() - openedAt < 1200) return;
    openedAt = Date.now();
    reset();
    dlg.showModal();
    if (window.dataLayer) window.dataLayer.push({ event: 'easter_egg', from });
  }

  wake.addEventListener('click', () => {
    taps++;
    sleeper.classList.remove('egg__sleeper--nudge'); void sleeper.offsetWidth; sleeper.classList.add('egg__sleeper--nudge');
    if (taps <= LINES.length) {
      msg.textContent = t(...LINES[taps - 1]);
      count.textContent = t(`Attempts: ${taps}`, `Intentos: ${taps}`);
    } else {
      msg.textContent = t('He wins. He\'s off the clock. Book your own session while he rests.',
                          'Él gana. Ya salió de turno. Reserva tu propia sesión mientras descansa.');
      count.textContent = '';
      // The wake button stays where it is (disabled), so leftover fast taps hit nothing.
      wake.disabled = true;
      wake.textContent = t('He wins', 'Él gana');
      setTimeout(() => { book.hidden = false; }, 500);
    }
  });
  dlg.querySelector('.egg__close').addEventListener('click', () => dlg.close());
  // No tap-outside-to-close: people tap a lot in this game, so only the ✕ (or Esc) closes it.

  // Trigger 1: the faint "z" in the footer
  const z = document.querySelector('.egg-z');
  if (z) z.addEventListener('click', () => open('footer'));

  // Trigger 2: tap the logo 5 times within 2 seconds
  const logo = document.querySelector('.brand');
  let hits = [];
  if (logo) logo.addEventListener('click', e => {
    if (dlg.open) return;
    const now = Date.now();
    hits = hits.filter(h => now - h < 2000).concat(now);
    if (hits.length >= 5) { hits = []; open('logo'); }
  });

  // Trigger 3: type "zzz" (not while typing in a form)
  let typed = '';
  document.addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select') || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-3);
    if (typed === 'zzz') { typed = ''; open('keys'); }
  });
})();
