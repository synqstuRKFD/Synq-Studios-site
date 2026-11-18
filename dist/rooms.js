// Studio photo gallery: room tabs + tap-to-enlarge lightbox
(function () {
  const sec = document.getElementById('rooms');
  if (!sec) return;
  const tabs = sec.querySelectorAll('.rooms__tab');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(b => b.setAttribute('aria-selected', b === t));
    sec.querySelectorAll('.rooms__grid').forEach(g => (g.hidden = g.dataset.room !== t.dataset.room));
    if (window.dataLayer) window.dataLayer.push({ event: 'room_tab', room: t.dataset.room });
  }));

  const box = document.querySelector('.lightbox');
  const img = box.querySelector('img');
  let list = [], i = 0, last = null;
  const show = () => { img.src = list[i].src; img.alt = list[i].alt; };
  const close = () => { box.hidden = true; document.body.style.overflow = ''; if (last) last.focus(); };
  const step = d => { i = (i + d + list.length) % list.length; show(); };
  sec.querySelectorAll('.rooms__ph').forEach(b => b.addEventListener('click', () => {
    list = [...b.parentElement.querySelectorAll('img')];
    i = list.indexOf(b.querySelector('img')); last = b;
    show(); box.hidden = false; document.body.style.overflow = 'hidden';
    box.querySelector('.lightbox__x').focus();
  }));
  box.querySelector('.lightbox__x').addEventListener('click', close);
  box.querySelector('.lightbox__prev').addEventListener('click', () => step(-1));
  box.querySelector('.lightbox__next').addEventListener('click', () => step(1));
  box.addEventListener('click', e => { if (e.target === box) close(); });
  document.addEventListener('keydown', e => {
    if (box.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
  let x0 = null;
  box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
  });
})();
