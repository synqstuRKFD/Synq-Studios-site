// Gentle motion: sections ease in as they scroll into view, lazy images fade in.
// Content is fully visible without JavaScript, and nothing moves for people who turn off animations.
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

  const done = el => { el.classList.remove('reveal', 'in'); el.style.transitionDelay = ''; };
  const reveal = (el, delay) => {
    el.classList.add('reveal');
    el.style.transitionDelay = delay + 'ms';
    el.addEventListener('transitionend', e => { if (e.propertyName === 'opacity') done(el); }, { once: false });
  };

  // Hero: a short staggered entrance on load
  document.querySelectorAll('.hero__content > *').forEach((el, i) => {
    reveal(el, 80 + i * 90);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  });

  // Everything else: ease in on scroll, small stagger within each group
  const groups = ['.strip > div', '.row__head', '.rail > *', '.row__cta', '.block__title', '.block__head', '.svc li', '.also',
    '.rate', '.pay', '.rates__note', '.studio__img img', '.studio__text > *', '.vs > *', '.artists > .kicker', '.featured',
    '.names li', '.steps li', '.faq details', '.book > div > *', '.quiz', '.textclub > *'];
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
  groups.forEach(sel => document.querySelectorAll(sel).forEach((el, i) => {
    if (el.closest('.hero') || el.classList.contains('reveal')) return;
    reveal(el, (i % 6) * 60);
    io.observe(el);
  }));

  // Lazy images fade in instead of popping
  document.querySelectorAll('img[loading=lazy]').forEach(img => {
    if (img.complete) return;
    img.classList.add('fade');
    const show = () => img.classList.add('loaded');
    img.addEventListener('load', show, { once: true });
    img.addEventListener('error', show, { once: true });
  });
})();
