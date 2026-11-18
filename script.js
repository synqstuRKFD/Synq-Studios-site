// Mobile menu
const toggle = document.querySelector('.nav__toggle');
const links = document.querySelector('.nav__links');
if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );
}

// Tabs (used by the Profile layout)
document.querySelectorAll('[role="tablist"]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  tabs.forEach(tab => tab.addEventListener('click', () => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', on);
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }));
});

// Video popup — plays YouTube and TikTok videos right on the site
const player = document.querySelector('.player');
const frame = player.querySelector('.player__frame');
function openVideo(src, vertical, title) {
  frame.innerHTML = `<iframe src="${src}" title="${title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  player.classList.toggle('is-vertical', vertical);
  player.showModal();
}
function closeVideo() { player.close(); }
player.addEventListener('close', () => { frame.innerHTML = ''; });
player.querySelector('.player__close').addEventListener('click', closeVideo);
player.addEventListener('click', e => { if (e.target === player) closeVideo(); });

document.querySelectorAll('[data-yt]').forEach(btn =>
  btn.addEventListener('click', () =>
    openVideo(`https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`, false, btn.getAttribute('aria-label') || 'YouTube video')
  )
);
document.querySelectorAll('[data-tt]').forEach(btn =>
  btn.addEventListener('click', () =>
    openVideo(`https://www.tiktok.com/player/v1/${btn.dataset.tt}?autoplay=1&rel=0`, true, 'TikTok video')
  )
);

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Booking form — demo handler. To actually receive requests, set the form's
// `action` to a form service URL (e.g. https://formspree.io/f/yourid) and remove this block.
document.querySelectorAll('form.form').forEach(form => form.addEventListener('submit', e => {
  if (form.getAttribute('action') !== '#') return; // real endpoint configured: submit normally
  e.preventDefault();
  form.querySelector('.form__status').textContent =
    `Thanks, ${form.elements.name.value.trim().split(' ')[0] || 'friend'}! We'll be in touch soon. 🏆`;
  form.reset();
}));
