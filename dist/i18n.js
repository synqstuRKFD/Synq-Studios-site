// ===== English / Español switch =====
// Any element with data-es="..." swaps its content to Spanish. data-es-placeholder swaps placeholders.
// The choice is remembered; first-time visitors whose phone/browser is set to Spanish get Spanish automatically.
(function () {
  const TITLES = {
    en: 'Recording Studio in Rockford, Illinois | SYNQ Studios',
    es: 'Estudio de Grabación en Rockford, Illinois | SYNQ Studios',
  };
  const KEY = 'synq-lang';

  function saved() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(l) { try { localStorage.setItem(KEY, l); } catch (e) { /* private mode: fine */ } }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-es]').forEach(el => {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'es' ? el.dataset.es : el.dataset.en;
    });
    document.querySelectorAll('[data-es-placeholder]').forEach(el => {
      if (el.dataset.enPlaceholder === undefined) el.dataset.enPlaceholder = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', lang === 'es' ? el.dataset.esPlaceholder : el.dataset.enPlaceholder);
    });
    document.querySelectorAll('[data-es-content]').forEach(el => {
      if (el.dataset.enContent === undefined) el.dataset.enContent = el.getAttribute('content') || '';
      el.setAttribute('content', lang === 'es' ? el.dataset.esContent : el.dataset.enContent);
    });
    document.querySelectorAll('[data-es-href]').forEach(el => {
      if (el.dataset.enHref === undefined) el.dataset.enHref = el.getAttribute('href') || '';
      el.setAttribute('href', lang === 'es' ? el.dataset.esHref : el.dataset.enHref);
    });
    document.querySelectorAll('.lang [data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang));
    document.querySelectorAll('input[name=language]').forEach(i => (i.value = lang === 'es' ? 'Español' : 'English'));
    document.title = TITLES[lang] || TITLES.en;
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  // Translate helper for text set from JavaScript
  window.t = (en, es) => (document.documentElement.lang === 'es' ? es : en);

  document.querySelectorAll('.lang [data-lang]').forEach(b =>
    b.addEventListener('click', () => {
      save(b.dataset.lang);
      apply(b.dataset.lang);
      if (window.dataLayer) window.dataLayer.push({ event: 'language', lang: b.dataset.lang });
    })
  );

  const params = new URLSearchParams(location.search);
  // es.html is the Spanish page (pre-rendered for Google); index.html is English.
  const pageLang = document.documentElement.dataset.pageLang || 'en';
  const start = params.get('lang') || (pageLang === 'es' ? 'es' : saved() || ((navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en'));
  if (start !== pageLang || pageLang === 'es') apply(start);
})();
