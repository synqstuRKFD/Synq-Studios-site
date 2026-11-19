// SYNQ Trajes: the designer screen. Holds the design, builds the controls, and handles
// saving, sharing, downloading the image and printing the sheet for the tailor.
(function () {
  // ---------- words (Spanish first, English switch) ----------
  const T = {
    es: {
      title: 'Diseña tu traje', mine: 'Mis diseños', save: 'Guardar', share: 'Compartir', sheet: 'Hoja para el sastre', front: 'Frente', back: 'Espalda', both: 'Ambos',
      download: 'Descargar imagen', close: 'Cerrar', mineHelp: 'Se guardan en este teléfono o computadora.', madeBy: 'Hecho por SYNQ Studios · estudio de grabación en Rockford, IL', visit: 'Visita el estudio',
      tStyles: 'Estilos', tCut: 'Corte', tFabric: 'Tela y color', tEmb: 'Bordado', tStones: 'Pedrería', tDetails: 'Detalles', tAcc: 'Accesorios', tBand: 'Grupo',
      stylesHelp: 'Empieza con un estilo y cámbialo a tu gusto.', jacket: 'Saco', jClassic: 'Largo (clásico)', jShort: 'Corto (vaquero)', lapel: 'Solapa', lNotch: 'Muesca', lPeak: 'Pico', lShawl: 'Chal', lNone: 'Sin solapa',
      yoke: 'Canesú vaquero', yokeHelp: 'La pieza de los hombros, típica de los trajes norteños.', buttons: 'Botones', btnColor: 'Color de botones', gold: 'Oro', silver: 'Plata', black: 'Negro', match: 'Igual al saco',
      stripe: 'Franja del pantalón', sNone: 'Sin franja', sSolid: 'Una franja', sDouble: 'Doble franja',
      part: 'Parte', fabric: 'Tela', color: 'Color', exact: 'Color exacto', applyAll: 'Usar en todo el traje',
      zJacket: 'Saco', zLapel: 'Solapas y cuello', zYoke: 'Canesú', zCuffs: 'Puños', zPants: 'Pantalón', zStripe: 'Franja', zShirt: 'Camisa', zNeck: 'Moño / corbata', zPiping: 'Vivos', zHat: 'Tejana', zBoots: 'Botas',
      mSuede: 'Gamuza', mVelvet: 'Terciopelo', mSatin: 'Satín brillante', mGlitter: 'Glitter', mMetallic: 'Metálico', mWool: 'Casimir clásico',
      thread: 'Hilo del bordado', threadColor: 'De color', where: 'Dónde va', design: 'Diseño', none: 'Ninguno',
      pFrontYoke: 'Canesú (frente)', pLapels: 'Solapas', pCuffs: 'Puños', pPockets: 'Bolsas', pBackYoke: 'Canesú (espalda)', pBackCenter: 'Centro de la espalda', pPants: 'Piernas del pantalón',
      techThread: 'Hilo', techStones: 'Pedrería', techBoth: 'Los dos',
      text: 'Nombre en la espalda', textHelp: 'El nombre del grupo, tu nombre o iniciales.', font: 'Letra', fWestern: 'Vaquera', fScript: 'Cursiva', fBlock: 'Bloque',
      stoneColor: 'Color de las piedras', trims: 'Orillas con pedrería', trLapels: 'Orilla de las solapas', trYoke: 'Línea del canesú', trCuffs: 'Puños', trStripe: 'Franja del pantalón', trHem: 'Bajo del saco',
      sCrystal: 'Cristal', sAb: 'Tornasol (AB)', sGold: 'Oro', sSilver: 'Plata', sBlack: 'Negro', sRed: 'Rojo', sBlue: 'Azul', sGreen: 'Verde', sPink: 'Rosa',
      piping: 'Vivos (orillas de otro color)', topstitch: 'Pespunte (costura que se ve)', fringe: 'Flecos', fringeYoke: 'Flecos en la espalda', fringeSleeves: 'Flecos en las mangas',
      neck: 'Cuello', nBow: 'Moño', nTie: 'Corbata', nBolo: 'Corbatín vaquero', nScarf: 'Mascada', nNone: 'Nada', hat: 'Tejana', hatShow: 'Mostrar tejana', boots: 'Botas', leather: 'Piel', suede: 'Gamuza',
      bandHelp: 'Pon las medidas de cada miembro. Salen en la hoja para el sastre.', mName: 'Nombre', mSize: 'Talla', mChest: 'Pecho', mWaist: 'Cintura', mSleeve: 'Manga', mInseam: 'Largo pant.', addMember: '+ Agregar miembro',
      notes: 'Notas para el sastre', notesPh: 'Ej.: pedrería Swarovski, forro rojo, entrega para el 15 de diciembre…', units: 'Medidas en pulgadas',
      saved: 'Diseño guardado', copied: 'Link copiado. Pégalo en un mensaje.', shareText: 'Mira el traje que diseñé', noSaved: 'Todavía no guardas diseños.', open: 'Abrir', del: 'Borrar',
      myDesign: 'Mi traje', image: 'Imagen', mineShort: 'Mis trajes', zoomHint: 'Pellizca para acercar.', downloading: 'Preparando imagen…', sheetTitle: 'Hoja para el sastre', specs: 'Especificaciones', members: 'Medidas del grupo', link: 'Ver el diseño en línea',
      cut: 'Corte', placement: 'Lugar', technique: 'Técnica', yes: 'Sí', no: 'No', made: 'Diseñado en synqstudios815.com/trajes',
    },
    en: {
      title: 'Design your suit', mine: 'My designs', save: 'Save', share: 'Share', sheet: 'Tailor sheet', front: 'Front', back: 'Back', both: 'Both',
      download: 'Download image', close: 'Close', mineHelp: 'Saved on this phone or computer.', madeBy: 'Made by SYNQ Studios · recording studio in Rockford, IL', visit: 'Visit the studio',
      tStyles: 'Styles', tCut: 'Cut', tFabric: 'Fabric & color', tEmb: 'Embroidery', tStones: 'Rhinestones', tDetails: 'Details', tAcc: 'Accessories', tBand: 'Band',
      stylesHelp: 'Start from a style and make it yours.', jacket: 'Jacket', jClassic: 'Long (classic)', jShort: 'Short (western)', lapel: 'Lapel', lNotch: 'Notch', lPeak: 'Peak', lShawl: 'Shawl', lNone: 'No lapel',
      yoke: 'Western yoke', yokeHelp: 'The shoulder panel you see on norteño suits.', buttons: 'Buttons', btnColor: 'Button color', gold: 'Gold', silver: 'Silver', black: 'Black', match: 'Match jacket',
      stripe: 'Pant stripe', sNone: 'No stripe', sSolid: 'One stripe', sDouble: 'Double stripe',
      part: 'Part', fabric: 'Fabric', color: 'Color', exact: 'Exact color', applyAll: 'Use on the whole suit',
      zJacket: 'Jacket', zLapel: 'Lapels & collar', zYoke: 'Yoke', zCuffs: 'Cuffs', zPants: 'Pants', zStripe: 'Stripe', zShirt: 'Shirt', zNeck: 'Bow / tie', zPiping: 'Piping', zHat: 'Hat', zBoots: 'Boots',
      mSuede: 'Suede', mVelvet: 'Velvet', mSatin: 'Glossy satin', mGlitter: 'Glitter', mMetallic: 'Metallic', mWool: 'Classic wool',
      thread: 'Embroidery thread', threadColor: 'Colored', where: 'Where it goes', design: 'Design', none: 'None',
      pFrontYoke: 'Yoke (front)', pLapels: 'Lapels', pCuffs: 'Cuffs', pPockets: 'Pockets', pBackYoke: 'Yoke (back)', pBackCenter: 'Center of the back', pPants: 'Pant legs',
      techThread: 'Thread', techStones: 'Rhinestones', techBoth: 'Both',
      text: 'Name on the back', textHelp: 'Your band name, your name or initials.', font: 'Lettering', fWestern: 'Western', fScript: 'Script', fBlock: 'Block',
      stoneColor: 'Stone color', trims: 'Rhinestone edges', trLapels: 'Lapel edges', trYoke: 'Yoke line', trCuffs: 'Cuffs', trStripe: 'Pant stripe', trHem: 'Jacket hem',
      sCrystal: 'Crystal', sAb: 'Iridescent (AB)', sGold: 'Gold', sSilver: 'Silver', sBlack: 'Black', sRed: 'Red', sBlue: 'Blue', sGreen: 'Green', sPink: 'Pink',
      piping: 'Piping (contrast edges)', topstitch: 'Topstitching (visible stitches)', fringe: 'Fringe', fringeYoke: 'Fringe on the back', fringeSleeves: 'Fringe on the sleeves',
      neck: 'Neck', nBow: 'Bow tie', nTie: 'Tie', nBolo: 'Bolo tie', nScarf: 'Scarf', nNone: 'None', hat: 'Hat', hatShow: 'Show hat', boots: 'Boots', leather: 'Leather', suede: 'Suede',
      bandHelp: "Add each member's measurements. They print on the tailor sheet.", mName: 'Name', mSize: 'Size', mChest: 'Chest', mWaist: 'Waist', mSleeve: 'Sleeve', mInseam: 'Inseam', addMember: '+ Add member',
      notes: 'Notes for the tailor', notesPh: 'E.g. Swarovski stones, red lining, needed by December 15…', units: 'Measurements in inches',
      saved: 'Design saved', copied: 'Link copied. Paste it in a message.', shareText: 'Check out the suit I designed', noSaved: 'No saved designs yet.', open: 'Open', del: 'Delete',
      myDesign: 'My suit', image: 'Image', mineShort: 'My suits', zoomHint: 'Pinch to zoom in.', downloading: 'Getting the image ready…', sheetTitle: 'Tailor sheet', specs: 'Specifications', members: 'Band measurements', link: 'See the design online',
      cut: 'Cut', placement: 'Placement', technique: 'Technique', yes: 'Yes', no: 'No', made: 'Designed at synqstudios815.com/trajes',
    },
  };
  let lang = 'es';
  try { lang = localStorage.getItem('synq-lang') || ((navigator.language || '').toLowerCase().startsWith('en') ? 'en' : 'es'); } catch (e) {}
  const t = k => (T[lang] && T[lang][k]) || T.es[k] || k;

  // ---------- choices ----------
  const COLORS = [
    ['#111111', 'Negro', 'Black'], ['#f5f2ea', 'Blanco', 'White'], ['#e9dcc6', 'Hueso', 'Bone'], ['#c9ab7c', 'Arena', 'Sand'], ['#8a6b45', 'Camel', 'Camel'],
    ['#5a3a22', 'Café', 'Brown'], ['#5b0f1d', 'Vino', 'Wine'], ['#b3121f', 'Rojo', 'Red'], ['#e88aa8', 'Rosa', 'Pink'], ['#4b1f6e', 'Morado', 'Purple'],
    ['#1e4fb3', 'Azul rey', 'Royal blue'], ['#14213d', 'Azul marino', 'Navy'], ['#8ec5ff', 'Celeste', 'Sky blue'], ['#1ba3a3', 'Turquesa', 'Turquoise'], ['#0f6b43', 'Verde esmeralda', 'Emerald'],
    ['#9fe3c4', 'Verde menta', 'Mint'], ['#4a5a2a', 'Verde olivo', 'Olive'], ['#7a7f86', 'Gris', 'Gray'], ['#c9ced6', 'Plata', 'Silver'], ['#d4a63c', 'Oro', 'Gold'],
    ['#e0661b', 'Naranja', 'Orange'], ['#f2c230', 'Amarillo', 'Yellow'],
  ];
  const MATERIALS = ['suede', 'velvet', 'satin', 'glitter', 'metallic', 'wool'];
  const MAT_KEY = { suede: 'mSuede', velvet: 'mVelvet', satin: 'mSatin', glitter: 'mGlitter', metallic: 'mMetallic', wool: 'mWool' };
  const ZONES = [ // key, label, has material?
    ['jacket', 'zJacket', true], ['lapel', 'zLapel', true], ['yoke', 'zYoke', true], ['cuffs', 'zCuffs', true], ['pants', 'zPants', true], ['stripe', 'zStripe', true],
    ['shirt', 'zShirt', false], ['neckwear', 'zNeck', false], ['piping', 'zPiping', false], ['hat', 'zHat', false], ['boots', 'zBoots', false],
  ];
  const MOTIF_NAMES = { arabesco: ['Arabesco', 'Scrollwork'], rosas: ['Rosas', 'Roses'], grecas: ['Grecas', 'Greek key'], llamas: ['Llamas', 'Flames'], herradura: ['Herradura', 'Horseshoe'],
    estrellas: ['Estrellas', 'Stars'], enredadera: ['Enredadera', 'Vines'], cruz: ['Cruz', 'Cross'], diamantes: ['Diamantes', 'Diamonds'], aguila: ['Águila', 'Eagle'] };
  const PLACES = [['frontYoke', 'pFrontYoke'], ['lapels', 'pLapels'], ['cuffs', 'pCuffs'], ['pockets', 'pPockets'], ['backYoke', 'pBackYoke'], ['backCenter', 'pBackCenter'], ['pants', 'pPants']];
  const STONE_KEYS = [['crystal', 'sCrystal'], ['ab', 'sAb'], ['gold', 'sGold'], ['silver', 'sSilver'], ['black', 'sBlack'], ['red', 'sRed'], ['blue', 'sBlue'], ['green', 'sGreen'], ['pink', 'sPink']];

  const clone = o => JSON.parse(JSON.stringify(o));
  const BASE = {
    v: 1, name: '', cut: 'classic', lapel: 'notch', buttons: 2, buttonColor: 'gold', yoke: true, stripe: 'solid',
    piping: true, topstitch: false, topstitchColor: '#d4a63c',
    colors: { jacket: '#5b0f1d', lapel: '#2a0509', yoke: '#2a0509', cuffs: '#2a0509', pants: '#5b0f1d', stripe: '#2a0509', shirt: '#f5f2ea', neckwear: '#2a0509', piping: '#d4a63c', hat: '#e9dcc6', boots: '#2b1a10' },
    materials: { jacket: 'suede', lapel: 'velvet', yoke: 'velvet', cuffs: 'velvet', pants: 'suede', stripe: 'velvet' },
    neckwear: 'bow', thread: 'gold', threadColor: '#d4a63c', stoneColor: 'crystal',
    trims: { lapels: true, yoke: true, cuffs: true, stripe: true, hem: false },
    fringe: { yoke: false, sleeves: false, color: '#2a0509' },
    emb: { frontYoke: { motif: 'arabesco', tech: 'both' }, lapels: { motif: 'rosas', tech: 'thread' }, cuffs: { motif: 'grecas', tech: 'thread' }, pockets: { motif: 'none', tech: 'thread' },
      backYoke: { motif: 'arabesco', tech: 'both' }, backCenter: { motif: 'aguila', tech: 'both' }, pants: { motif: 'enredadera', tech: 'thread' } },
    text: '', textFont: 'western', textTech: 'both', hat: true, bootMaterial: 'leather',
    members: [], notes: '',
  };
  const noEmb = () => ({ frontYoke: { motif: 'none', tech: 'thread' }, lapels: { motif: 'none', tech: 'thread' }, cuffs: { motif: 'none', tech: 'thread' }, pockets: { motif: 'none', tech: 'thread' }, backYoke: { motif: 'none', tech: 'thread' }, backCenter: { motif: 'none', tech: 'thread' }, pants: { motif: 'none', tech: 'thread' } });
  const allColor = (c, extra) => Object.assign({ jacket: c, lapel: c, yoke: c, cuffs: c, pants: c, stripe: c }, extra || {});
  const allMat = (m, extra) => Object.assign({ jacket: m, lapel: m, yoke: m, cuffs: m, pants: m, stripe: m }, extra || {});
  function preset(name, over) { const d = clone(BASE); Object.keys(over).forEach(k => { d[k] = (typeof over[k] === 'object' && !Array.isArray(over[k]) && d[k]) ? Object.assign(d[k], over[k]) : over[k]; }); d.name = name; return d; }
  const PRESETS = [
    preset('Vino con pedrería', {}),
    preset('Clásico negro', { cut: 'classic', lapel: 'peak', yoke: false, stripe: 'solid', piping: false, buttons: 1, buttonColor: 'black', hat: false, neckwear: 'bow',
      colors: allColor('#111111', { lapel: '#0a0a0a', stripe: '#0a0a0a', shirt: '#f5f2ea', neckwear: '#0a0a0a', boots: '#0d0d0d' }), materials: allMat('wool', { lapel: 'satin', stripe: 'satin' }),
      trims: { lapels: false, yoke: false, cuffs: false, stripe: false, hem: false }, emb: noEmb() }),
    preset('Azul rey y oro', { cut: 'short', lapel: 'none', yoke: true, stripe: 'double', buttons: 3, buttonColor: 'gold', neckwear: 'bolo', hat: true,
      colors: allColor('#1e4fb3', { lapel: '#14213d', yoke: '#14213d', cuffs: '#14213d', stripe: '#d4a63c', neckwear: '#1e4fb3', piping: '#d4a63c', hat: '#111111', boots: '#111111' }),
      materials: allMat('velvet', { stripe: 'metallic' }), thread: 'gold', stoneColor: 'gold',
      emb: { frontYoke: { motif: 'arabesco', tech: 'thread' }, lapels: { motif: 'none', tech: 'thread' }, cuffs: { motif: 'grecas', tech: 'thread' }, pockets: { motif: 'none', tech: 'thread' }, backYoke: { motif: 'estrellas', tech: 'both' }, backCenter: { motif: 'arabesco', tech: 'both' }, pants: { motif: 'arabesco', tech: 'thread' } } }),
    preset('Sierreño arena', { cut: 'short', lapel: 'none', yoke: true, stripe: 'none', buttons: 3, buttonColor: 'match', neckwear: 'scarf', hat: true, piping: false, topstitch: true, topstitchColor: '#5a3a22',
      colors: allColor('#c9ab7c', { lapel: '#8a6b45', yoke: '#8a6b45', cuffs: '#8a6b45', neckwear: '#b3121f', hat: '#e9dcc6', boots: '#5a3a22' }), materials: allMat('suede'),
      fringe: { yoke: true, sleeves: true, color: '#8a6b45' }, thread: 'color', threadColor: '#5a3a22', trims: { lapels: false, yoke: false, cuffs: false, stripe: false, hem: false }, bootMaterial: 'suede',
      emb: { frontYoke: { motif: 'enredadera', tech: 'thread' }, lapels: { motif: 'none', tech: 'thread' }, cuffs: { motif: 'none', tech: 'thread' }, pockets: { motif: 'none', tech: 'thread' }, backYoke: { motif: 'none', tech: 'thread' }, backCenter: { motif: 'herradura', tech: 'thread' }, pants: { motif: 'none', tech: 'thread' } } }),
    preset('Blanco con rosas', { cut: 'classic', lapel: 'shawl', yoke: true, stripe: 'solid', buttons: 1, buttonColor: 'silver', neckwear: 'tie', hat: true,
      colors: allColor('#f5f2ea', { lapel: '#f5f2ea', stripe: '#b3121f', shirt: '#111111', neckwear: '#b3121f', piping: '#b3121f', hat: '#f5f2ea', boots: '#f5f2ea' }),
      materials: allMat('satin'), thread: 'color', threadColor: '#b3121f', stoneColor: 'red',
      emb: { frontYoke: { motif: 'rosas', tech: 'both' }, lapels: { motif: 'none', tech: 'thread' }, cuffs: { motif: 'rosas', tech: 'thread' }, pockets: { motif: 'none', tech: 'thread' }, backYoke: { motif: 'rosas', tech: 'both' }, backCenter: { motif: 'rosas', tech: 'both' }, pants: { motif: 'rosas', tech: 'thread' } } }),
    preset('Glitter plata', { cut: 'classic', lapel: 'peak', yoke: false, stripe: 'solid', buttons: 1, buttonColor: 'silver', neckwear: 'bow', hat: false, piping: false,
      colors: allColor('#c9ced6', { lapel: '#111111', stripe: '#111111', pants: '#111111', shirt: '#111111', neckwear: '#c9ced6', boots: '#111111' }),
      materials: allMat('glitter', { lapel: 'satin', pants: 'wool', stripe: 'glitter' }), thread: 'silver', stoneColor: 'crystal', trims: { lapels: true, yoke: false, cuffs: false, stripe: true, hem: false }, emb: noEmb() }),
    preset('Verde esmeralda', { cut: 'short', lapel: 'notch', yoke: true, stripe: 'double', buttons: 2, buttonColor: 'gold', neckwear: 'bow', hat: true,
      colors: allColor('#0f6b43', { lapel: '#111111', yoke: '#111111', cuffs: '#111111', stripe: '#d4a63c', neckwear: '#111111', piping: '#d4a63c', hat: '#111111', boots: '#111111' }),
      materials: allMat('velvet', { stripe: 'metallic' }), thread: 'gold', stoneColor: 'gold',
      emb: { frontYoke: { motif: 'grecas', tech: 'thread' }, lapels: { motif: 'none', tech: 'thread' }, cuffs: { motif: 'grecas', tech: 'thread' }, pockets: { motif: 'grecas', tech: 'thread' }, backYoke: { motif: 'grecas', tech: 'thread' }, backCenter: { motif: 'cruz', tech: 'both' }, pants: { motif: 'grecas', tech: 'thread' } } }),
    preset('Negro y oro', { cut: 'short', lapel: 'none', yoke: true, stripe: 'solid', buttons: 3, buttonColor: 'gold', neckwear: 'bolo', hat: true,
      colors: allColor('#111111', { stripe: '#d4a63c', piping: '#d4a63c', neckwear: '#111111', hat: '#111111', boots: '#111111' }), materials: allMat('suede', { stripe: 'metallic' }),
      thread: 'gold', stoneColor: 'gold', trims: { lapels: false, yoke: true, cuffs: true, stripe: true, hem: true },
      emb: { frontYoke: { motif: 'llamas', tech: 'both' }, lapels: { motif: 'none', tech: 'thread' }, cuffs: { motif: 'llamas', tech: 'thread' }, pockets: { motif: 'none', tech: 'thread' }, backYoke: { motif: 'llamas', tech: 'thread' }, backCenter: { motif: 'llamas', tech: 'both' }, pants: { motif: 'llamas', tech: 'both' } } }),
  ];

  // ---------- state ----------
  function merge(def, got) { // keep new fields working with older saved designs
    const out = clone(def);
    if (!got || typeof got !== 'object') return out;
    Object.keys(def).forEach(k => {
      if (got[k] === undefined) return;
      if (def[k] && typeof def[k] === 'object' && !Array.isArray(def[k])) out[k] = merge(def[k], got[k]);
      else out[k] = got[k];
    });
    return out;
  }
  const b64 = { enc: s => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
                dec: s => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/')))) };
  const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  let D;
  (function init() {
    const m = location.hash.match(/d=([\w-]+)/);
    if (m) { try { D = merge(BASE, JSON.parse(b64.dec(m[1]))); history.replaceState(null, '', location.pathname); } catch (e) { D = null; } }
    if (!D) D = store.get('synq-traje-current') ? merge(BASE, store.get('synq-traje-current')) : clone(PRESETS[0]);
    if (!D.name) D.name = t('myDesign');
  })();

  // ---------- drawing ----------
  const svgF = document.getElementById('svgFront'), svgB = document.getElementById('svgBack');
  let raf = 0;
  function draw() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      Suit.render(svgF, D, 'front');
      Suit.render(svgB, D, 'back');
      store.set('synq-traje-current', D);
    });
  }
  function change(fn, rebuild) { fn(D); draw(); if (rebuild !== false) buildPane(current); }

  // ---------- small UI builders ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const h = (tag, attrs, kids) => {
    const e = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k === 'on') Object.entries(v).forEach(([ev, fn]) => e.addEventListener(ev, fn));
      else if (k === 'html') e.innerHTML = v;
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(c => c != null && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  };
  const group = (title, kids, hint) => h('div', { class: 'group' }, [h('h3', {}, [title]), hint ? h('p', { class: 'hint' }, [hint]) : null].concat(kids));
  const opts = (items, value, onPick) => h('div', { class: 'opts' }, items.map(([v, label]) => h('button', { type: 'button', class: 'opt', 'aria-pressed': String(v === value), on: { click: () => onPick(v) } }, [label])));
  const seg = (items, value, onPick) => h('span', { class: 'seg' }, items.map(([v, label]) => h('button', { type: 'button', 'aria-pressed': String(v === value), on: { click: () => onPick(v) } }, [label])));
  const colorName = hex => { const c = COLORS.find(x => x[0].toLowerCase() === String(hex).toLowerCase()); return c ? (lang === 'es' ? c[1] : c[2]) : String(hex).toUpperCase(); };
  function swatches(value, onPick, small) {
    const wrap = h('div', { class: small ? 'mini' : 'swatches' }, COLORS.map(([hex, es, en]) =>
      h('button', { type: 'button', class: 'sw', title: lang === 'es' ? es : en, 'aria-label': lang === 'es' ? es : en, 'aria-pressed': String(hex.toLowerCase() === String(value).toLowerCase()), style: 'background:' + hex, on: { click: () => onPick(hex) } })));
    return wrap;
  }
  function exact(value, onPick) {
    const txt = h('input', { type: 'text', value: String(value).toUpperCase(), maxlength: 7, 'aria-label': t('exact') });
    const pick = h('input', { type: 'color', value, 'aria-label': t('exact') });
    pick.addEventListener('input', () => { txt.value = pick.value.toUpperCase(); onPick(pick.value, true); });
    pick.addEventListener('change', () => onPick(pick.value));
    txt.addEventListener('change', () => { let v = txt.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v)) onPick(v.toLowerCase()); else txt.value = String(value).toUpperCase(); });
    return h('div', { class: 'exact' }, [h('span', {}, [t('exact')]), pick, txt]);
  }
  function toggle(label, checked, onSet) {
    const i = h('input', { type: 'checkbox' }); i.checked = !!checked;
    i.addEventListener('change', () => onSet(i.checked));
    return h('label', { class: 'switch' }, [h('span', {}, [label]), i]);
  }
  function motifIcon(name) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '-55 -55 110 110');
    if (name === 'none') s.innerHTML = '<circle r="30" fill="none" stroke="currentColor" stroke-width="5" opacity=".5"/><path d="M-22 22 L22 -22" stroke="currentColor" stroke-width="5" opacity=".5"/>';
    else s.innerHTML = `<path d="${Suit.MOTIF_PATHS[name]}" fill="none" stroke="#e2b84a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    return s;
  }

  // ---------- tabs and panes ----------
  const TABS = [['styles', 'tStyles'], ['cut', 'tCut'], ['fabric', 'tFabric'], ['emb', 'tEmb'], ['stones', 'tStones'], ['details', 'tDetails'], ['acc', 'tAcc'], ['band', 'tBand']];
  let current = store.get('synq-traje-tab') || 'styles', zone = 'jacket';
  const tabsEl = $('#tabs'), panes = $('#panes');
  function buildTabs() {
    tabsEl.innerHTML = '';
    TABS.forEach(([k, label]) => tabsEl.appendChild(h('button', { type: 'button', role: 'tab', 'aria-selected': String(k === current), on: { click: () => { current = k; store.set('synq-traje-tab', k); buildTabs(); buildPane(k); panes.scrollIntoView({ block: 'nearest' }); } } }, [t(label)])));
  }

  const PANES = {
    styles() {
      const wrap = h('div', { class: 'presets' });
      PRESETS.forEach((p, i) => {
        const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.id = 'pre' + i;
        const b = h('button', { type: 'button', class: 'preset', on: { click: () => { const keep = { members: D.members, notes: D.notes, text: D.text }; D = Object.assign(clone(p), keep); D.name = p.name; $('#designName').value = D.name; draw(); toast(p.name); } } }, [s, h('div', {}, [p.name])]);
        wrap.appendChild(b);
        requestAnimationFrame(() => Suit.render(s, Object.assign(clone(p), { hat: false }), 'front'));
      });
      return [group(t('tStyles'), [wrap], t('stylesHelp'))];
    },
    cut() {
      return [
        group(t('jacket'), [opts([['classic', t('jClassic')], ['short', t('jShort')]], D.cut, v => change(d => { d.cut = v; }))]),
        group(t('lapel'), [opts([['notch', t('lNotch')], ['peak', t('lPeak')], ['shawl', t('lShawl')], ['none', t('lNone')]], D.lapel, v => change(d => { d.lapel = v; }))]),
        group(t('yoke'), [toggle(t('yoke'), D.yoke, v => change(d => { d.yoke = v; }))], t('yokeHelp')),
        group(t('buttons'), [opts([[1, '1'], [2, '2'], [3, '3']], D.buttons, v => change(d => { d.buttons = v; }))]),
        group(t('btnColor'), [opts([['gold', t('gold')], ['silver', t('silver')], ['black', t('black')], ['match', t('match')]], D.buttonColor, v => change(d => { d.buttonColor = v; }))]),
        group(t('stripe'), [opts([['none', t('sNone')], ['solid', t('sSolid')], ['double', t('sDouble')]], D.stripe, v => change(d => { d.stripe = v; }))]),
      ];
    },
    fabric() {
      const zinfo = ZONES.find(z => z[0] === zone) || ZONES[0];
      const zones = h('div', { class: 'zones' }, ZONES.map(([k, label, hasMat]) => h('button', { type: 'button', class: 'zone', 'aria-pressed': String(k === zone), on: { click: () => { zone = k; buildPane('fabric'); } } },
        [h('i', { style: 'background:' + D.colors[k] }), h('span', {}, [t(label), h('small', {}, [hasMat ? t(MAT_KEY[D.materials[k]]) : colorName(D.colors[k])])])])));
      const kids = [group(t('part'), [zones])];
      if (zinfo[2]) kids.push(group(t('fabric') + ' · ' + t(zinfo[1]), [opts(MATERIALS.map(m => [m, t(MAT_KEY[m])]), D.materials[zone], v => change(d => { d.materials[zone] = v; }))]));
      kids.push(group(t('color') + ' · ' + t(zinfo[1]), [
        swatches(D.colors[zone], v => change(d => { d.colors[zone] = v; })),
        exact(D.colors[zone], (v, live) => change(d => { d.colors[zone] = v; }, !live)),
      ]));
      if (zinfo[2]) kids.push(h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => change(d => { ['jacket', 'lapel', 'yoke', 'cuffs', 'pants', 'stripe'].forEach(k => { d.colors[k] = d.colors[zone]; d.materials[k] = d.materials[zone]; }); }) } }, [t('applyAll')]));
      return kids;
    },
    emb() {
      const kids = [group(t('thread'), [opts([['gold', t('gold')], ['silver', t('silver')], ['color', t('threadColor')]], D.thread, v => change(d => { d.thread = v; })),
        D.thread === 'color' ? swatches(D.threadColor, v => change(d => { d.threadColor = v; }), true) : null,
        D.thread === 'color' ? exact(D.threadColor, (v, live) => change(d => { d.threadColor = v; }, !live)) : null])];
      const list = PLACES.filter(([k]) => !(k === 'lapels' && D.lapel === 'none') && !((k === 'frontYoke' || k === 'backYoke') && !D.yoke)).map(([k, label]) => {
        const e = D.emb[k];
        const tiles = h('div', { class: 'motifs' }, ['none'].concat(Suit.MOTIFS).map(m => h('button', { type: 'button', class: 'opt opt--tile', 'aria-pressed': String(e.motif === m), on: { click: () => change(d => { d.emb[k].motif = m; }) } },
          [motifIcon(m), m === 'none' ? t('none') : MOTIF_NAMES[m][lang === 'es' ? 0 : 1]])));
        return h('div', { class: 'place' }, [h('div', { class: 'place__head' }, [h('span', {}, [t(label)]),
          e.motif === 'none' ? null : seg([['thread', t('techThread')], ['stones', t('techStones')], ['both', t('techBoth')]], e.tech, v => change(d => { d.emb[k].tech = v; }))]), tiles]);
      });
      kids.push(group(t('where'), list));
      const txt = h('input', { type: 'text', value: D.text || '', maxlength: 24, placeholder: 'Los Serenos', 'aria-label': t('text') });
      txt.addEventListener('input', () => change(d => { d.text = txt.value; }, false));
      kids.push(group(t('text'), [h('div', { class: 'field' }, [txt]),
        opts([['western', t('fWestern')], ['script', t('fScript')], ['block', t('fBlock')]], D.textFont, v => change(d => { d.textFont = v; })),
        h('div', { style: 'margin-top:8px' }, [seg([['thread', t('techThread')], ['stones', t('techStones')], ['both', t('techBoth')]], D.textTech, v => change(d => { d.textTech = v; }))])], t('textHelp')));
      return kids;
    },
    stones() {
      const sw = h('div', { class: 'opts' }, STONE_KEYS.map(([k, label]) => {
        const c = Suit.STONES[k];
        return h('button', { type: 'button', class: 'opt', 'aria-pressed': String(D.stoneColor === k), on: { click: () => change(d => { d.stoneColor = k; }) } },
          [h('i', { style: `width:16px;height:16px;border-radius:50%;background:radial-gradient(circle at 35% 35%, ${c[0]}, ${c[1]} 45%, ${c[2]})` }), t(label)]);
      }));
      return [group(t('stoneColor'), [sw]),
        group(t('trims'), [['lapels', 'trLapels'], ['yoke', 'trYoke'], ['cuffs', 'trCuffs'], ['stripe', 'trStripe'], ['hem', 'trHem']]
          .filter(([k]) => !(k === 'lapels' && D.lapel === 'none') && !(k === 'yoke' && !D.yoke) && !(k === 'stripe' && D.stripe === 'none'))
          .map(([k, label]) => toggle(t(label), D.trims[k], v => change(d => { d.trims[k] = v; }))))];
    },
    details() {
      return [
        group(t('piping'), [toggle(t('piping'), D.piping, v => change(d => { d.piping = v; })), D.piping ? swatches(D.colors.piping, v => change(d => { d.colors.piping = v; }), true) : null]),
        group(t('topstitch'), [toggle(t('topstitch'), D.topstitch, v => change(d => { d.topstitch = v; })), D.topstitch ? swatches(D.topstitchColor, v => change(d => { d.topstitchColor = v; }), true) : null]),
        group(t('fringe'), [D.yoke ? toggle(t('fringeYoke'), D.fringe.yoke, v => change(d => { d.fringe.yoke = v; })) : null, toggle(t('fringeSleeves'), D.fringe.sleeves, v => change(d => { d.fringe.sleeves = v; })),
          (D.fringe.yoke || D.fringe.sleeves) ? swatches(D.fringe.color, v => change(d => { d.fringe.color = v; }), true) : null]),
      ];
    },
    acc() {
      return [
        group(t('neck'), [opts([['bow', t('nBow')], ['tie', t('nTie')], ['bolo', t('nBolo')], ['scarf', t('nScarf')], ['none', t('nNone')]], D.neckwear, v => change(d => { d.neckwear = v; })),
          D.neckwear !== 'none' ? swatches(D.colors.neckwear, v => change(d => { d.colors.neckwear = v; }), true) : null]),
        group(t('hat'), [toggle(t('hatShow'), D.hat, v => change(d => { d.hat = v; })), D.hat ? swatches(D.colors.hat, v => change(d => { d.colors.hat = v; }), true) : null]),
        group(t('boots'), [opts([['leather', t('leather')], ['suede', t('suede')]], D.bootMaterial, v => change(d => { d.bootMaterial = v; })), swatches(D.colors.boots, v => change(d => { d.colors.boots = v; }), true)]),
      ];
    },
    band() {
      const cols = [['name', 'mName'], ['size', 'mSize'], ['chest', 'mChest'], ['waist', 'mWaist'], ['sleeve', 'mSleeve'], ['inseam', 'mInseam']];
      const table = h('table', { class: 'members' }, [h('thead', {}, [h('tr', {}, cols.map(([, l]) => h('th', {}, [t(l)])).concat([h('th', {})]))]),
        h('tbody', {}, D.members.map((m, i) => h('tr', {}, cols.map(([k]) => {
          const inp = h('input', { value: m[k] || '', inputmode: k === 'name' || k === 'size' ? 'text' : 'decimal', 'aria-label': t(cols.find(c => c[0] === k)[1]) });
          inp.addEventListener('input', () => change(d => { d.members[i][k] = inp.value; }, false));
          return h('td', { style: k === 'name' ? 'min-width:110px' : 'min-width:58px' }, [inp]);
        }).concat([h('td', {}, [h('button', { type: 'button', class: 'del', 'aria-label': t('del'), on: { click: () => change(d => { d.members.splice(i, 1); }) } }, ['×'])])]))))]);
      const notes = h('textarea', { rows: 4, placeholder: t('notesPh') }); notes.value = D.notes || '';
      notes.addEventListener('input', () => change(d => { d.notes = notes.value; }, false));
      return [group(t('tBand'), [h('div', { class: 'scrollx' }, [table]), h('p', { class: 'hint', style: 'margin-top:8px' }, [t('units')]),
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: () => change(d => { d.members.push({ name: '', size: '', chest: '', waist: '', sleeve: '', inseam: '' }); }) } }, [t('addMember')])], t('bandHelp')),
        group(t('notes'), [h('div', { class: 'field' }, [notes])])];
    },
  };
  function buildPane(k) {
    const y = panes.parentElement.scrollTop, wy = scrollY;
    panes.innerHTML = '';
    (PANES[k] || PANES.styles)().forEach(n => n && panes.appendChild(n));
    panes.parentElement.scrollTop = y; if (Math.abs(scrollY - wy) > 2) scrollTo(0, wy);
  }

  // ---------- view switch ----------
  const paper = $('#paper');
  function setView(v) {
    paper.dataset.view = v;
    document.querySelectorAll('.stage__views button').forEach(b => b.classList.toggle('on', b.dataset.view === v));
    store.set('synq-traje-view', v);
  }
  document.querySelectorAll('.stage__views button').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));
  setView(store.get('synq-traje-view') || (innerWidth > 1200 ? 'both' : 'front'));

  // ---------- language ----------
  function applyLang() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
    document.querySelectorAll('.lang button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    document.title = t('title') + ' | SYNQ Studios';
    buildTabs(); buildPane(current);
  }
  document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => { lang = b.dataset.lang; try { localStorage.setItem('synq-lang', lang); } catch (e) {} applyLang(); }));

  // ---------- name ----------
  const nameEl = $('#designName');
  nameEl.value = D.name;
  nameEl.addEventListener('input', () => { D.name = nameEl.value; store.set('synq-traje-current', D); });

  // ---------- toast ----------
  let tt;
  function toast(msg) { const e = $('#toast'); e.textContent = msg; e.classList.add('on'); clearTimeout(tt); tt = setTimeout(() => e.classList.remove('on'), 2400); }
  const count = (path, title) => { try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path, title, event: true }); } catch (e) {} };

  // ---------- save / my designs ----------
  $('#btnSave').addEventListener('click', () => {
    const list = store.get('synq-trajes') || [];
    const i = list.findIndex(x => x.d.name === D.name);
    const item = { at: Date.now(), d: clone(D) };
    if (i >= 0) list[i] = item; else list.unshift(item);
    store.set('synq-trajes', list.slice(0, 40));
    toast(t('saved')); count('trajes-save', 'Saved a suit design');
  });
  $('#btnMine').addEventListener('click', () => {
    const ul = $('#mineList'); ul.innerHTML = '';
    const list = store.get('synq-trajes') || [];
    if (!list.length) ul.appendChild(h('li', {}, [h('span', { class: 'muted' }, [t('noSaved')])]));
    list.forEach((x, i) => ul.appendChild(h('li', {}, [h('b', {}, [x.d.name || t('myDesign'), h('small', {}, [new Date(x.at).toLocaleString(lang === 'es' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })])]),
      h('button', { type: 'button', class: 'btn btn--sm', on: { click: () => { D = merge(BASE, x.d); nameEl.value = D.name; draw(); buildPane(current); $('#dlgMine').close(); } } }, [t('open')]),
      h('button', { type: 'button', class: 'btn btn--ghost btn--sm', on: { click: e => { list.splice(i, 1); store.set('synq-trajes', list); e.target.closest('li').remove(); } } }, [t('del')])])));
    $('#dlgMine').showModal();
  });

  // ---------- share ----------
  const shareURL = () => location.origin + location.pathname + '#d=' + b64.enc(JSON.stringify(D));
  $('#btnShare').addEventListener('click', share);
  async function share() {
    const url = shareURL();
    count('trajes-share', 'Shared a suit design');
    if (navigator.share) { try { await navigator.share({ title: D.name, text: t('shareText') + ': ' + D.name, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(url); toast(t('copied')); } catch (e) { prompt(t('share'), url); }
  }

  // ---------- download image ----------
  let fontCSS = null;
  async function embeddedFonts() {
    if (fontCSS !== null) return fontCSS;
    try {
      let css = await (await fetch('https://fonts.googleapis.com/css2?family=Anton&family=Rye&family=Great+Vibes&display=swap')).text();
      const urls = [...new Set((css.match(/url\((https:[^)]+)\)/g) || []).map(u => u.slice(4, -1)))];
      for (const u of urls) {
        const blob = await (await fetch(u)).blob();
        const data = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
        css = css.split(u).join(data);
      }
      fontCSS = css;
    } catch (e) { fontCSS = ''; }
    return fontCSS;
  }
  async function svgImage(svg, css) {
    const c = svg.cloneNode(true);
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const vb = svg.viewBox.baseVal;
    c.setAttribute('width', vb.width); c.setAttribute('height', vb.height);
    if (css) { const st = document.createElementNS('http://www.w3.org/2000/svg', 'style'); st.textContent = css; c.insertBefore(st, c.firstChild); }
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(c)], { type: 'image/svg+xml' }));
    const img = new Image();
    await new Promise((ok, bad) => { img.onload = ok; img.onerror = bad; img.src = url; });
    return { img, url, w: vb.width, h: vb.height };
  }
  async function makePNG() {
    const css = await embeddedFonts();
    const a = await svgImage(svgF, css), b = await svgImage(svgB, css);
    const S = 2, pad = 40, head = 110, foot = 60, H = 1100, wEach = a.w * (H / a.h);
    const cv = document.createElement('canvas');
    cv.width = (wEach * 2 + pad * 3) * S; cv.height = (H + head + foot) * S;
    const x = cv.getContext('2d'); x.scale(S, S);
    x.fillStyle = '#f3efe9'; x.fillRect(0, 0, cv.width, cv.height);
    x.fillStyle = '#1a0d0a'; x.font = '400 46px Anton, Impact, sans-serif'; x.fillText((D.name || t('myDesign')).toUpperCase(), pad, 70);
    x.fillStyle = '#8a6a5f'; x.font = '600 18px Inter, system-ui, sans-serif'; x.fillText(t('front') + '  ·  ' + t('back'), pad, 98);
    x.drawImage(a.img, pad, head, wEach, H); x.drawImage(b.img, pad * 2 + wEach, head, wEach, H);
    x.fillStyle = '#8a6a5f'; x.font = '600 16px Inter, system-ui, sans-serif'; x.fillText(t('made'), pad, head + H + 38);
    URL.revokeObjectURL(a.url); URL.revokeObjectURL(b.url);
    return new Promise(r => cv.toBlob(r, 'image/png'));
  }
  $('#btnDownload').addEventListener('click', async () => {
    toast(t('downloading'));
    try {
      const blob = await makePNG();
      const file = new File([blob], (D.name || 'traje').replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '-') + '.png', { type: 'image/png' });
      count('trajes-download', 'Downloaded a suit image');
      if (navigator.canShare && navigator.canShare({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
        try { await navigator.share({ files: [file], title: D.name }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
      }
      const a = h('a', { href: URL.createObjectURL(blob), download: file.name }); document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { toast('Error: ' + (e && e.message || e)); }
  });

  // ---------- sheet for the tailor (printable) ----------
  $('#btnSheet').addEventListener('click', () => {
    const sh = $('#sheet');
    const sw = c => `<span class="chip" style="background:${c}"></span>${colorName(c)} <small>(${String(c).toUpperCase()})</small>`;
    const row = (a, b) => `<tr><th>${a}</th><td>${b}</td></tr>`;
    const yn = v => v ? t('yes') : t('no');
    const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const lab = (list, v) => { const f = list.find(x => x[0] === v); return f ? t(f[1]) : v; };
    const fabricRows = ZONES.filter(z => z[2]).map(([k, label]) => `<tr><td>${t(label)}</td><td>${t(MAT_KEY[D.materials[k]])}</td><td>${sw(D.colors[k])}</td></tr>`).join('') +
      [['shirt', 'zShirt'], ['neckwear', 'zNeck'], ['piping', 'zPiping'], ['hat', 'zHat'], ['boots', 'zBoots']].map(([k, label]) => `<tr><td>${t(label)}</td><td>—</td><td>${sw(D.colors[k])}</td></tr>`).join('');
    const embRows = PLACES.filter(([k]) => D.emb[k].motif !== 'none').map(([k, label]) => `<tr><td>${t(label)}</td><td>${MOTIF_NAMES[D.emb[k].motif][lang === 'es' ? 0 : 1]}</td><td>${t({ thread: 'techThread', stones: 'techStones', both: 'techBoth' }[D.emb[k].tech])}</td></tr>`).join('') || `<tr><td colspan="3">${t('none')}</td></tr>`;
    const members = D.members.filter(m => Object.values(m).some(Boolean));
    sh.innerHTML = `
      <h1>${esc(D.name || t('myDesign'))}</h1>
      <div>${t('sheetTitle')} · ${new Date().toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · SYNQ Studios</div>
      <div class="views"></div>
      <div class="cols">
        <div>
          <h2>${t('cut')}</h2>
          <table>${row(t('jacket'), lab([['classic', 'jClassic'], ['short', 'jShort']], D.cut))}${row(t('lapel'), lab([['notch', 'lNotch'], ['peak', 'lPeak'], ['shawl', 'lShawl'], ['none', 'lNone']], D.lapel))}
            ${row(t('yoke'), yn(D.yoke))}${row(t('buttons'), D.buttons + ' · ' + lab([['gold', 'gold'], ['silver', 'silver'], ['black', 'black'], ['match', 'match']], D.buttonColor))}
            ${row(t('stripe'), lab([['none', 'sNone'], ['solid', 'sSolid'], ['double', 'sDouble']], D.stripe))}${row(t('neck'), lab([['bow', 'nBow'], ['tie', 'nTie'], ['bolo', 'nBolo'], ['scarf', 'nScarf'], ['none', 'nNone']], D.neckwear))}
            ${row(t('boots'), lab([['leather', 'leather'], ['suede', 'suede']], D.bootMaterial))}${row(t('hat'), yn(D.hat))}</table>
          <h2>${t('tDetails')}</h2>
          <table>${row(t('piping'), D.piping ? sw(D.colors.piping) : t('no'))}${row(t('topstitch'), D.topstitch ? sw(D.topstitchColor) : t('no'))}
            ${row(t('fringe'), (D.fringe.yoke || D.fringe.sleeves) ? [D.fringe.yoke ? t('fringeYoke') : '', D.fringe.sleeves ? t('fringeSleeves') : ''].filter(Boolean).join(', ') + ' · ' + sw(D.fringe.color) : t('no'))}</table>
        </div>
        <div>
          <h2>${t('tFabric')}</h2>
          <table><tr><th>${t('part')}</th><th>${t('fabric')}</th><th>${t('color')}</th></tr>${fabricRows}</table>
        </div>
      </div>
      <div class="cols">
        <div>
          <h2>${t('tEmb')}</h2>
          <table><tr><th>${t('placement')}</th><th>${t('design')}</th><th>${t('technique')}</th></tr>${embRows}</table>
          <table>${row(t('thread'), D.thread === 'color' ? sw(D.threadColor) : t(D.thread))}${D.text ? row(t('text'), '“' + esc(D.text) + '” · ' + lab([['western', 'fWestern'], ['script', 'fScript'], ['block', 'fBlock']], D.textFont) + ' · ' + t({ thread: 'techThread', stones: 'techStones', both: 'techBoth' }[D.textTech])) : ''}</table>
        </div>
        <div>
          <h2>${t('tStones')}</h2>
          <table>${row(t('stoneColor'), lab(STONE_KEYS, D.stoneColor))}${[['lapels', 'trLapels'], ['yoke', 'trYoke'], ['cuffs', 'trCuffs'], ['stripe', 'trStripe'], ['hem', 'trHem']].map(([k, l]) => row(t(l), yn(D.trims[k]))).join('')}</table>
        </div>
      </div>
      ${members.length ? `<h2>${t('members')}</h2><table><tr><th>${t('mName')}</th><th>${t('mSize')}</th><th>${t('mChest')}</th><th>${t('mWaist')}</th><th>${t('mSleeve')}</th><th>${t('mInseam')}</th></tr>
        ${members.map(m => `<tr><td>${esc(m.name)}</td><td>${esc(m.size)}</td><td>${esc(m.chest)}</td><td>${esc(m.waist)}</td><td>${esc(m.sleeve)}</td><td>${esc(m.inseam)}</td></tr>`).join('')}</table><div>${t('units')}</div>` : ''}
      ${D.notes ? `<h2>${t('notes')}</h2><div>${esc(D.notes).replace(/\n/g, '<br>')}</div>` : ''}
      <h2>${t('link')}</h2><div style="word-break:break-all">${esc(shareURL())}</div>`;
    const views = sh.querySelector('.views');
    [svgF, svgB].forEach((s, i) => views.appendChild(copySVG(s, 'p' + i)));
    count('trajes-sheet', 'Printed a tailor sheet');
    setTimeout(() => window.print(), 50);
  });

  // A copy of a drawing with its own internal names, so its textures and shapes don't
  // point back at the original (which may be hidden)
  function copySVG(s, prefix) {
    const c = s.cloneNode(true); c.removeAttribute('id');
    const map = {};
    c.querySelectorAll('[id]').forEach(n => { const nid = prefix + '-' + n.id; map[n.id] = nid; n.id = nid; });
    c.querySelectorAll('*').forEach(n => ['fill', 'stroke', 'filter', 'clip-path', 'href'].forEach(a => {
      const val = n.getAttribute(a); if (!val) return;
      const m = val.match(/^url\(#(.+)\)$/) || val.match(/^#(.+)$/);
      if (m && map[m[1]]) n.setAttribute(a, val.replace('#' + m[1], '#' + map[m[1]]));
    }));
    return c;
  }

  // ---------- phone action bar + tap to see it big ----------
  document.querySelectorAll('.mobilebar [data-act]').forEach(b => b.addEventListener('click', () => document.getElementById(b.dataset.act).click()));
  $('#paper').addEventListener('click', () => {
    const wrap = $('#zoomWrap'); wrap.innerHTML = '';
    const v = $('#paper').dataset.view;
    (v === 'back' ? [svgB, svgF] : [svgF, svgB]).forEach((s, i) => wrap.appendChild(copySVG(s, 'z' + i)));
    $('#dlgZoom').showModal();
    count('trajes-zoom', 'Opened the big view');
  });

  // ---------- go ----------
  applyLang();
  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); // redraw once the lettering fonts arrive
})();
