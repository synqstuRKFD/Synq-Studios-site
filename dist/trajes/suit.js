// SYNQ Trajes: draws the suit as a front and back "flat" (the drawing style tailors use),
// with real-looking fabrics, embroidery, rhinestones, fringe, piping and topstitching.
// Pure SVG, no libraries. window.Suit.render(svgElement, design, 'front' | 'back')
(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const W = 600, CX = 300;

  // ---------- tiny path helpers (left half is drawn, right half is mirrored) ----------
  const fmt = n => Math.round(n * 10) / 10;
  function P(cmds) { // [['M',x,y],['C',x1,y1,x2,y2,x,y],['L',x,y],['Q',...],['Z']]
    return cmds.map(c => c[0] + (c.length > 1 ? c.slice(1).map(fmt).join(' ') : '')).join(' ');
  }
  function mirror(cmds) { return cmds.map(c => c.map((v, i) => (i > 0 && i % 2 === 1 ? W - v : v))); }
  const both = cmds => P(cmds) + ' ' + P(mirror(cmds));
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  let uid = 0, pre = '';
  const id = p => pre + p + '-' + (++uid); // unique per picture, so two drawings on one page never mix up

  // ---------- colors ----------
  function hexToRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function rgbToHex(r, g, b) { return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
  function shade(h, amt) { const [r, g, b] = hexToRgb(h); return amt >= 0 ? rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt) : rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt)); }
  const lum = h => { const [r, g, b] = hexToRgb(h); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };

  const THREAD = { gold: ['#fff2b0', '#e2b84a', '#8a6414'], silver: ['#ffffff', '#c9ced6', '#6f7782'] };
  const STONES = {
    crystal: ['#ffffff', '#dfe9f5', '#8fa3bd'], ab: ['#ffffff', '#cfe7ff', '#c79be8'], gold: ['#fff6c8', '#e8c050', '#8c6512'],
    black: ['#9aa0a8', '#2a2c31', '#050506'], red: ['#ffd2d2', '#e0283a', '#6b0610'], blue: ['#d6ecff', '#2f7de0', '#0b2a63'],
    green: ['#d9ffe6', '#22b05e', '#063d1d'], pink: ['#ffe1f0', '#f06aa8', '#7a1446'], silver: ['#ffffff', '#c9ced6', '#6f7782'],
  };

  // ---------- fabric filters (the color comes from the fill; the filter adds texture and light) ----------
  function defs(svg) {
    const d = el('defs', {}, svg);
    const volume = `<feGaussianBlur in="SourceAlpha" stdDeviation="11" result="bl"/>
      <feDiffuseLighting in="bl" surfaceScale="4" diffuseConstant="1.15" lighting-color="#fff" result="dif"><feDistantLight azimuth="235" elevation="62"/></feDiffuseLighting>`;
    d.innerHTML = `
    <filter id="m-suede" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      ${volume}
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="7" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0" result="g"/>
      <feComponentTransfer in="g" result="g2"><feFuncR type="linear" slope=".55" intercept=".62"/><feFuncG type="linear" slope=".55" intercept=".62"/><feFuncB type="linear" slope=".55" intercept=".62"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="2" result="w"/>
      <feColorMatrix in="w" type="saturate" values="0" result="wg"/>
      <feComponentTransfer in="wg" result="w2"><feFuncR type="linear" slope=".35" intercept=".8"/><feFuncG type="linear" slope=".35" intercept=".8"/><feFuncB type="linear" slope=".35" intercept=".8"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
      <feBlend in="SourceGraphic" in2="g2" mode="multiply" result="a"/>
      <feBlend in="a" in2="w2" mode="multiply" result="b"/>
      <feBlend in="b" in2="dif" mode="multiply" result="c"/>
      <feComposite in="c" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="m-wool" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      ${volume}
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.08" numOctaves="2" seed="4" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0" result="g"/>
      <feComponentTransfer in="g" result="g2"><feFuncR type="linear" slope=".3" intercept=".82"/><feFuncG type="linear" slope=".3" intercept=".82"/><feFuncB type="linear" slope=".3" intercept=".82"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
      <feBlend in="SourceGraphic" in2="g2" mode="multiply" result="a"/>
      <feBlend in="a" in2="dif" mode="multiply" result="b"/>
      <feComposite in="b" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="m-velvet" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="16" result="bl"/>
      <feDiffuseLighting in="bl" surfaceScale="7" diffuseConstant="1.25" lighting-color="#fff" result="dif"><feDistantLight azimuth="235" elevation="50"/></feDiffuseLighting>
      <feSpecularLighting in="bl" surfaceScale="7" specularConstant=".55" specularExponent="9" lighting-color="#fff" result="sp"><feDistantLight azimuth="235" elevation="48"/></feSpecularLighting>
      <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="9" result="n"/>
      <feColorMatrix in="n" type="saturate" values="0" result="g"/>
      <feComponentTransfer in="g" result="g2"><feFuncR type="linear" slope=".18" intercept=".88"/><feFuncG type="linear" slope=".18" intercept=".88"/><feFuncB type="linear" slope=".18" intercept=".88"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
      <feBlend in="SourceGraphic" in2="dif" mode="multiply" result="a"/>
      <feBlend in="a" in2="g2" mode="multiply" result="b"/>
      <feComposite in="b" in2="sp" operator="arithmetic" k2="1" k3=".32" result="c"/>
      <feComposite in="c" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="m-satin" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="bl"/>
      <feDiffuseLighting in="bl" surfaceScale="5" diffuseConstant="1.15" lighting-color="#fff" result="dif"><feDistantLight azimuth="235" elevation="58"/></feDiffuseLighting>
      <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves="2" seed="5" result="fold"/>
      <feComposite in="bl" in2="fold" operator="arithmetic" k2="1" k3=".9" result="bump"/>
      <feSpecularLighting in="bump" surfaceScale="9" specularConstant="1.05" specularExponent="22" lighting-color="#fff" result="sp"><feDistantLight azimuth="230" elevation="40"/></feSpecularLighting>
      <feBlend in="SourceGraphic" in2="dif" mode="multiply" result="a"/>
      <feComposite in="a" in2="sp" operator="arithmetic" k2="1" k3=".7" result="c"/>
      <feComposite in="c" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="m-metallic" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="bl"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.01 0.035" numOctaves="3" seed="11" result="fold"/>
      <feComposite in="bl" in2="fold" operator="arithmetic" k2="1" k3="1.6" result="bump"/>
      <feDiffuseLighting in="bump" surfaceScale="5" diffuseConstant="1.2" lighting-color="#fff" result="dif"><feDistantLight azimuth="235" elevation="55"/></feDiffuseLighting>
      <feSpecularLighting in="bump" surfaceScale="8" specularConstant="1.4" specularExponent="30" lighting-color="#fff" result="sp"><feDistantLight azimuth="225" elevation="38"/></feSpecularLighting>
      <feBlend in="SourceGraphic" in2="dif" mode="multiply" result="a"/>
      <feComposite in="a" in2="sp" operator="arithmetic" k2="1" k3=".85" result="c"/>
      <feComposite in="c" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="m-glitter" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
      ${volume}
      <feTurbulence type="fractalNoise" baseFrequency="1.9" numOctaves="1" seed="13" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 14 -8.9" result="spark"/>
      <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="29" result="t2"/>
      <feColorMatrix in="t2" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 9 -5.6" result="dark"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="31" result="t3"/>
      <feColorMatrix in="t3" type="saturate" values="0" result="g"/>
      <feComponentTransfer in="g" result="g2"><feFuncR type="linear" slope=".7" intercept=".55"/><feFuncG type="linear" slope=".7" intercept=".55"/><feFuncB type="linear" slope=".7" intercept=".55"/><feFuncA type="linear" slope="0" intercept="1"/></feComponentTransfer>
      <feBlend in="SourceGraphic" in2="g2" mode="multiply" result="a"/>
      <feBlend in="a" in2="dif" mode="multiply" result="b"/>
      <feComposite in="dark" in2="b" operator="over" result="c"/>
      <feComposite in="spark" in2="c" operator="over" result="d"/>
      <feComposite in="d" in2="SourceAlpha" operator="in"/>
    </filter>
    <filter id="emb" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx=".6" dy=".9" stdDeviation=".6" flood-color="#000" flood-opacity=".55"/>
    </filter>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".35"/></filter>
    `;
    return d;
  }
  const MAT = { suede: 'm-suede', wool: 'm-wool', velvet: 'm-velvet', satin: 'm-satin', metallic: 'm-metallic', glitter: 'm-glitter' };

  function gradient(d, kind, colors) {
    const gid = id(kind);
    if (kind === 'thread') {
      const g = el('linearGradient', { id: gid, x1: 0, y1: 0, x2: 1, y2: 1 }, d);
      [[0, colors[0]], [0.45, colors[1]], [1, colors[2]]].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g));
    } else {
      const g = el('radialGradient', { id: gid, cx: 0.38, cy: 0.35, r: 0.75 }, d);
      [[0, colors[0]], [0.35, colors[1]], [1, colors[2]]].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g));
    }
    return 'url(#' + gid + ')';
  }

  // ---------- garment geometry ----------
  function geo(dz) {
    const short = dz.cut !== 'classic';
    const hem = short ? 468 : 588;
    const brk = dz.lapel === 'none' ? 250 : short ? 332 : 392; // where the lapels meet (top button)
    const g = { short, hem, brk };

    g.body = [['M', 266, 150], ['L', 180, 176], ['C', 190, 210, 200, 245, 204, 272], ['C', 211, 320, 215, 360, 213, short ? 380 : 400],
      ['C', 211, short ? 420 : 480, 207, short ? 450 : 550, 206, hem], ['L', 286, hem + 2], ['Q', 300, hem + 2, 300, hem - 14], ['L', 300, brk], ['L', 272, 152], ['Z']];
    g.bodyBack = [['M', 266, 150], ['L', 180, 176], ['C', 190, 210, 200, 245, 204, 272], ['C', 211, 320, 215, 360, 213, short ? 380 : 400],
      ['C', 211, short ? 420 : 480, 207, short ? 450 : 550, 206, hem], ['L', 300, hem + 4], ['L', 300, 146], ['Q', 284, 146, 266, 150], ['Z']];
    const cuffTop = short ? 470 : 478;
    g.sleeve = [['M', 180, 176], ['C', 160, 190, 148, 232, 145, 300], ['L', 131, 512], ['L', 187, 518], ['L', 199, 312], ['C', 201, 296, 203, 284, 204, 272], ['Z']];
    g.cuff = [['M', 133.2, cuffTop], ['L', 188.6, cuffTop + 6], ['L', 187, 518], ['L', 131, 512], ['Z']];
    g.cuffSeam = [['M', 133.2, cuffTop], ['L', 188.6, cuffTop + 6]];
    // lapels (left side; the right is mirrored)
    const L = {
      notch: [['M', 300, brk], ['C', 270, brk - 52, 242, brk - 110, 233, brk - (short ? 150 : 165)], ['L', 236, 206], ['L', 252, 216], ['L', 260, 192], ['L', 272, 152], ['Z']],
      peak: [['M', 300, brk], ['C', 268, brk - 52, 238, brk - 110, 229, brk - (short ? 145 : 160)], ['L', 220, 188], ['L', 251, 214], ['L', 260, 192], ['L', 272, 152], ['Z']],
      shawl: [['M', 300, brk], ['C', 262, brk - 55, 232, brk - 120, 238, 214], ['C', 242, 182, 258, 160, 272, 152], ['Z']],
    };
    g.lapel = L[dz.lapel] || null;
    g.lapelEdge = g.lapel ? g.lapel.slice(0, 3) : null; // outer edge for trims
    g.collar = dz.lapel === 'none'
      ? [['M', 268, 150], ['Q', 300, 140, 332, 150], ['L', 330, 168], ['Q', 300, 160, 270, 168], ['Z']]
      : [['M', 260, 192], ['L', 252, 216], ['L', 246, 200], ['C', 246, 176, 256, 158, 272, 152], ['Z']];
    // western yoke (front, back)
    g.yokeF = [['M', 160, 150], ['L', 300, 120], ['L', 300, 236], ['C', 286, 228, 268, 230, 256, 250], ['C', 246, 228, 222, 222, 190, 238], ['Z']];
    g.yokeFLine = [['M', 192, 238], ['C', 222, 222, 246, 228, 256, 250], ['C', 268, 230, 286, 228, 300, 236]];
    g.yokeB = [['M', 160, 150], ['L', 300, 130], ['L', 300, 300], ['C', 284, 270, 262, 262, 240, 270], ['C', 222, 262, 206, 262, 194, 268], ['Z']];
    g.yokeBLine = [['M', 196, 268], ['C', 206, 262, 222, 262, 240, 270], ['C', 262, 262, 284, 270, 300, 300]];
    // pockets
    g.flap = short ? [['M', 222, 404], ['L', 278, 401], ['L', 279, 416], ['L', 251, 428], ['L', 223, 419], ['Z']]
      : [['M', 218, 474], ['L', 282, 470], ['L', 283, 488], ['L', 219, 492], ['Z']];
    g.welt = [['M', 226, 300], ['L', 264, 297], ['L', 264, 304], ['L', 226, 307], ['Z']];
    // pants
    const top = hem - 40, crotch = hem + (short ? 74 : 42);
    g.leg = [['M', 213, top], ['L', 300, top], ['L', 300, crotch], ['C', 292, crotch + 8, 291, crotch + 30, 290, crotch + 50], ['L', 281, 1040], ['L', 205, 1040], ['C', 205, 900, 211, 700, 213, top], ['Z']];
    g.stripe = [['M', 213, top], ['C', 211, 700, 205, 900, 205, 1040], ['L', 219, 1040], ['C', 219, 900, 225, 700, 227, top], ['Z']];
    g.stripeA = [['M', 214, top], ['C', 212, 700, 206, 900, 206, 1040], ['L', 211, 1040], ['C', 211, 900, 217, 700, 219, top], ['Z']];
    g.stripeB = [['M', 222, top], ['C', 220, 700, 214, 900, 214, 1040], ['L', 219, 1040], ['C', 219, 900, 225, 700, 227, top], ['Z']];
    g.stripeLine = [['M', 220, top], ['C', 218, 700, 212, 900, 212, 1040]];
    g.hemLine = [['M', 206, hem], ['L', 286, hem + 2]];
    g.boot = [['M', 212, 1032], ['L', 280, 1032], ['L', 282, 1062], ['C', 284, 1078, 268, 1088, 248, 1088], ['L', 186, 1088], ['C', 172, 1088, 172, 1074, 186, 1068], ['L', 210, 1058], ['Z']];
    g.bootBack = [['M', 212, 1032], ['L', 280, 1032], ['L', 282, 1080], ['L', 266, 1088], ['L', 226, 1088], ['L', 210, 1080], ['Z']];
    return g;
  }

  // ---------- embroidery motifs: drawn in a 100x100 box centered on 0,0 ----------
  const MOTIFS = {
    arabesco: 'M-46 18 C-36 -26 -6 -30 0 0 C 6 30 36 26 46 -18 M-46 18 C-52 34 -32 40 -28 28 C-25 20 -34 16 -37 22 M46 -18 C52 -34 32 -40 28 -28 C25 -20 34 -16 37 -22 M-18 -14 C-10 -30 8 -34 14 -22 M18 14 C10 30 -8 34 -14 22 M-30 2 C-22 -6 -14 -2 -16 6 M30 -2 C22 6 14 2 16 -6',
    rosas: 'M0 -8 C6 -8 8 -2 4 2 C0 6 -6 4 -6 -1 C-6 -6 -1 -9 3 -7 M0 -16 C12 -18 18 -6 14 4 C10 14 -4 16 -12 10 C-20 4 -16 -12 -6 -16 Z M-12 10 C-20 22 -30 26 -40 24 M-22 20 C-30 14 -38 16 -40 22 C-34 26 -26 26 -22 20 Z M10 12 C18 24 30 28 40 26 M24 22 C30 14 38 16 40 22 C34 28 28 28 24 22 Z M-30 -20 C-24 -30 -14 -32 -8 -26 M30 -22 C24 -32 14 -32 8 -26',
    grecas: 'M-48 12 L-48 -12 L-24 -12 L-24 4 L-36 4 L-36 -4 M-24 12 L-24 -12 M-24 12 L0 12 L0 -12 L24 -12 L24 4 L12 4 L12 -4 M0 12 L24 12 L24 -12 L48 -12 L48 4 L36 4 L36 -4 M24 12 L48 12',
    llamas: 'M-30 40 C-44 18 -38 -6 -28 -22 C-26 -6 -18 2 -14 6 C-16 -14 -10 -32 2 -46 C2 -26 12 -14 16 0 C20 -10 26 -16 32 -22 C40 -2 38 22 26 40 Z M-18 40 C-24 26 -20 14 -14 8 M10 40 C16 26 14 14 8 6',
    herradura: 'M-28 40 L-34 0 C-38 -30 -20 -46 0 -46 C20 -46 38 -30 34 0 L28 40 L16 40 L20 2 C22 -20 12 -32 0 -32 C-12 -32 -22 -20 -20 2 L-16 40 Z M-27 22 L-25 22 M-29 4 L-27 4 M-28 -14 L-26 -14 M27 22 L25 22 M29 4 L27 4 M28 -14 L26 -14',
    estrellas: 'M0 -40 L9 -12 L38 -12 L15 6 L23 34 L0 17 L-23 34 L-15 6 L-38 -12 L-9 -12 Z M-38 -38 L-35 -30 L-27 -30 L-33 -25 L-31 -17 L-38 -22 L-45 -17 L-43 -25 L-49 -30 L-41 -30 Z M38 26 L41 34 L49 34 L43 39 L45 47 L38 42 L31 47 L33 39 L27 34 L35 34 Z',
    enredadera: 'M-48 24 C-30 -8 -10 30 6 0 C20 -26 34 8 48 -20 M-34 6 C-38 -6 -30 -14 -22 -10 C-24 -2 -28 4 -34 6 Z M-14 18 C-6 26 4 24 6 16 C-2 12 -8 14 -14 18 Z M14 -14 C10 -26 18 -32 26 -28 C24 -20 20 -16 14 -14 Z M32 0 C40 8 48 6 50 -2 C42 -6 36 -4 32 0 Z',
    cruz: 'M-6 -46 L6 -46 L6 -24 L28 -24 L28 -12 L6 -12 L6 46 L-6 46 L-6 -12 L-28 -12 L-28 -24 L-6 -24 Z M0 -46 C-8 -54 8 -54 0 -46 M28 -18 C36 -26 36 -10 28 -18 M-28 -18 C-36 -26 -36 -10 -28 -18 M0 46 C-8 54 8 54 0 46',
    diamantes: 'M-36 0 L-24 -16 L-12 0 L-24 16 Z M-12 0 L0 -16 L12 0 L0 16 Z M12 0 L24 -16 L36 0 L24 16 Z M-24 -16 L-12 -32 L0 -16 M0 -16 L12 -32 L24 -16 M-24 16 L-12 32 L0 16 M0 16 L12 32 L24 16',
    aguila: 'M0 -30 C6 -30 10 -26 10 -20 L22 -26 C30 -30 40 -28 48 -20 C40 -18 34 -14 30 -8 C40 -10 46 -6 48 0 C38 0 30 2 24 8 C30 10 34 14 34 20 C24 18 16 16 10 20 L8 36 L0 30 L-8 36 L-10 20 C-16 16 -24 18 -34 20 C-34 14 -30 10 -24 8 C-30 2 -38 0 -48 0 C-46 -6 -40 -10 -30 -8 C-34 -14 -40 -18 -48 -20 C-40 -28 -30 -30 -22 -26 L-10 -20 C-10 -26 -6 -30 0 -30 Z M4 -24 L12 -22 L6 -19',
  };

  // where each embroidery placement goes: [x, y, width, height, rotation, mirrored?]
  function spots(g, view, dz) {
    const s = g.short;
    if (view === 'front') return {
      frontYoke: [[228, 206, 62, 40, -8, true]],
      lapels: dz.lapel === 'none' ? [] : [[274, g.brk - 82, 70, 18, 70, true]],
      cuffs: [[160, (s ? 470 : 478) + 21, 50, 24, 6, true]],
      pockets: [[250, s ? 412 : 481, 50, 13, -2, true]],
      pants: [[247, 950, 130, 42, 90, true]],
    };
    return {
      backYoke: [[234, 236, 70, 42, -6, true]],
      backCenter: [[300, dz.text && dz.text.trim() ? (s ? 400 : 440) : (s ? 375 : 410), 150, s ? (dz.text && dz.text.trim() ? 96 : 120) : 140, 0, false]],
      cuffs: [[160, (s ? 470 : 478) + 21, 50, 24, -6, true]],
      pants: [[247, 950, 130, 42, 90, true]],
    };
  }

  // ---------- drawing helpers ----------
  function fabric(parent, d, color, material, extra) {
    return el('path', Object.assign({ d, fill: color, filter: 'url(#' + (MAT[material] || MAT.wool) + ')' }, extra || {}), parent);
  }
  function line(parent, d, stroke, w, extra) { return el('path', Object.assign({ d, fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, extra || {}), parent); }

  // stones placed along a path every `gap` units
  function stonesAlong(parent, d, stoneFill, gap, r) {
    const tp = el('path', { d, fill: 'none' }, parent);
    const L = tp.getTotalLength(), pts = [];
    for (let t = gap / 2; t < L; t += gap) pts.push(tp.getPointAtLength(t));
    tp.remove();
    const g = el('g', {}, parent);
    pts.forEach(p => stone(g, p.x, p.y, r, stoneFill));
    return g;
  }
  function stone(parent, x, y, r, fill) {
    el('circle', { cx: fmt(x + 0.5), cy: fmt(y + 0.7), r: fmt(r), fill: '#000', opacity: 0.35 }, parent);
    el('circle', { cx: fmt(x), cy: fmt(y), r: fmt(r), fill }, parent);
    el('circle', { cx: fmt(x - r * 0.35), cy: fmt(y - r * 0.38), r: fmt(r * 0.28), fill: '#fff', opacity: 0.9 }, parent);
  }

  const BOX = {};
  function motifBox(svg, name) {
    if (BOX[name]) return BOX[name];
    // measure by walking along the shape (works even when the picture is hidden)
    const t = el('path', { d: MOTIFS[name] }, svg);
    const L = t.getTotalLength();
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (let i = 0; i <= 400; i++) { const p = t.getPointAtLength(L * i / 400); x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    t.remove();
    return (BOX[name] = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: Math.max(x1 - x0, 1), h: Math.max(y1 - y0, 1) });
  }
  function motif(parent, defsEl, name, box, dz, threadFill) {
    const path = MOTIFS[name];
    if (!path) return;
    const [x, y, w, h, rot, mir] = box;
    const tech = dz.tech || 'thread';
    const bb = motifBox(parent.ownerSVGElement, name);
    const sc = Math.min(w / bb.w, h / bb.h);
    const place = (flip) => {
      const tf = `translate(${fmt(flip ? W - x : x)} ${fmt(y)})${flip ? ' scale(-1 1)' : ''} rotate(${rot}) scale(${fmt(sc * 1000) / 1000}) translate(${fmt(-bb.cx)} ${fmt(-bb.cy)})`;
      const g = el('g', { transform: tf }, parent);
      // sizes below are in screen units, divided by the scale so they look the same at any size
      if (tech !== 'stones') {
        line(g, path, threadFill, 2.3 / sc, { filter: 'url(#emb)' });
        line(g, path, '#000', 0.5 / sc, { opacity: 0.22, 'stroke-dasharray': `${1.1 / sc} ${1.5 / sc}` });
      }
      if (tech !== 'thread') {
        // stones follow the motif's lines
        const p2 = el('path', { d: path, fill: 'none' }, g);
        const L = p2.getTotalLength(), pts = [];
        const step = (tech === 'both' ? 8 : 5.6) / sc;
        for (let t = 1 / sc; t < L; t += step) pts.push(p2.getPointAtLength(t));
        p2.remove();
        pts.forEach(p => stone(g, p.x, p.y, (tech === 'both' ? 2.1 : 2.5) / sc, dz.stoneFill));
      }
    };
    place(false);
    if (mir) place(true);
  }

  function textOnBack(parent, dz, g, threadFill) {
    const t = (dz.text || '').trim();
    if (!t) return;
    const font = { western: 'Rye, serif', script: '"Great Vibes", cursive', block: 'Anton, Impact, sans-serif' }[dz.textFont] || 'Rye, serif';
    const y = (g.short ? 334 : 346) + (dz.fringe && dz.fringe.yoke && dz.yoke ? 16 : 0) + (dz.yoke ? 0 : -60);
    const pid = id('arc');
    el('path', { id: pid, d: `M 214 ${y + 14} Q 300 ${y - 20} 386 ${y + 14}`, fill: 'none' }, parent.ownerSVGElement.querySelector('defs'));
    // size so the whole name fits on the arc (about 170 units long); width per letter differs by lettering
    const perChar = { western: 0.74, script: 0.5, block: 0.5 }[dz.textFont] || 0.74;
    const size = Math.max(9, Math.min(30, 160 / (Math.max(3, t.length) * perChar)));
    const mk = (fill, extra) => {
      const tx = el('text', Object.assign({ 'font-family': font, 'font-size': size, 'text-anchor': 'middle', fill, 'letter-spacing': dz.textFont === 'script' ? 0 : 1.5 }, extra || {}), parent);
      const tp = el('textPath', { href: '#' + pid, startOffset: '50%' }, tx);
      tp.textContent = t;
      return tx;
    };
    if (dz.textTech !== 'stones') mk(threadFill, { filter: 'url(#emb)' });
    if (dz.textTech !== 'thread') mk('none', { stroke: dz.stoneFill, 'stroke-width': 2.6, 'stroke-dasharray': '0.1 5', 'stroke-linecap': 'round' });
  }

  function fringe(parent, d, color, len, gap) {
    const tp = el('path', { d }, parent);
    const L = tp.getTotalLength();
    const g = el('g', { stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round', opacity: 0.95 }, parent);
    let i = 0;
    for (let t = 0; t <= L; t += gap, i++) {
      const p = tp.getPointAtLength(t);
      const sway = Math.sin(i * 1.7) * 3;
      el('path', { d: `M${fmt(p.x)} ${fmt(p.y)} q ${fmt(sway)} ${fmt(len * 0.5)} ${fmt(sway * 0.4)} ${fmt(len + Math.sin(i * 2.3) * 4)}`, fill: 'none', stroke: shade(color, i % 3 === 0 ? -0.25 : 0) }, g);
    }
    tp.remove();
  }

  // ---------- the hat (tejana) ----------
  function hat(parent, color) {
    const g = el('g', { transform: 'translate(0 -6)', filter: 'url(#soft)' }, parent);
    fabric(g, 'M196 118 C 230 128 370 128 404 118 C 418 114 424 104 416 98 C 400 112 360 116 300 116 C 240 116 200 112 184 98 C 176 104 182 114 196 118 Z', color, 'suede');
    fabric(g, 'M238 112 C 236 80 244 52 262 44 C 276 40 288 52 300 52 C 312 52 324 40 338 44 C 356 52 364 80 362 112 C 340 117 260 117 238 112 Z', color, 'suede');
    el('path', { d: 'M240 100 C 270 106 330 106 360 100 L 361 110 C 330 116 270 116 239 110 Z', fill: shade(color, -0.45) }, g);
    line(g, 'M300 52 C 296 70 296 90 300 104', shade(color, -0.35), 2, { opacity: 0.6 });
  }

  // ---------- main render ----------
  function render(svg, dz, view) {
    uid = 0; pre = (svg.id || 'svg') + '-';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute('viewBox', `0 ${dz.hat ? 10 : 110} ${W} ${dz.hat ? 1090 : 990}`);
    const d = defs(svg);
    const g = geo(dz);
    const c = dz.colors, m = dz.materials;
    const threadFill = dz.thread === 'gold' || dz.thread === 'silver' ? gradient(d, 'thread', THREAD[dz.thread]) : dz.threadColor;
    const stoneFill = gradient(d, 'stone', STONES[dz.stoneColor] || STONES.crystal);
    const dzx = Object.assign({}, dz, { stoneFill });
    const root = el('g', {}, svg);
    const front = view === 'front';
    const edge = shade(c.jacket, lum(c.jacket) > 0.5 ? -0.35 : 0.18);
    const pantsEdge = shade(c.pants, lum(c.pants) > 0.5 ? -0.35 : 0.18);
    const shadowG = el('g', { filter: 'url(#soft)' }, root);

    // boots + pants (behind the jacket)
    const bootG = el('g', {}, shadowG);
    fabric(bootG, both(front ? g.boot : g.bootBack), c.boots, dz.bootMaterial === 'suede' ? 'suede' : 'satin');
    if (front) line(bootG, both([['M', 214, 1050], ['L', 278, 1050]]), shade(c.boots, -0.4), 1.2, { opacity: 0.7 });
    const pantsG = el('g', {}, shadowG);
    fabric(pantsG, both(g.leg), c.pants, m.pants);
    line(pantsG, both(g.leg), pantsEdge, 1.1, { opacity: 0.55 });
    if (dz.stripe === 'solid') fabric(pantsG, both(g.stripe), c.stripe, m.stripe);
    if (dz.stripe === 'double') { fabric(pantsG, both(g.stripeA), c.stripe, m.stripe); fabric(pantsG, both(g.stripeB), c.stripe, m.stripe); }
    if (dz.trims.stripe && dz.stripe !== 'none') stonesAlong(pantsG, both(g.stripeLine), stoneFill, 9, 2.6);
    if (front) {
      line(pantsG, P([['M', 300, g.hem], ['L', 300, g.hem + 40]]), pantsEdge, 1, { opacity: 0.5 });
      line(pantsG, both([['M', 253, g.hem + 20], ['L', 245, 1036]]), pantsEdge, 0.8, { opacity: 0.35 }); // crease
    } else {
      line(pantsG, both([['M', 238, g.hem + 30], ['L', 280, g.hem + 30], ['L', 280, g.hem + 36], ['L', 238, g.hem + 36], ['Z']]), pantsEdge, 1, { opacity: 0.5, fill: shade(c.pants, -0.15) });
    }
    if (dz.topstitch) line(pantsG, both([['M', 210, 1028], ['L', 282, 1028]]), dz.topstitchColor, 1, { 'stroke-dasharray': '4 3' });
    const pantsEmb = dz.emb.pants;
    if (pantsEmb && pantsEmb.motif !== 'none') motif(pantsG, d, pantsEmb.motif, spots(g, view, dz).pants[0], Object.assign({}, dzx, { tech: pantsEmb.tech }), threadFill);

    // jacket
    const jG = el('g', {}, shadowG);
    const sleeves = el('g', {}, jG);
    fabric(sleeves, both(g.sleeve), c.jacket, m.jacket);
    line(sleeves, both(g.sleeve), edge, 1.1, { opacity: 0.55 });
    fabric(sleeves, both(g.cuff), c.cuffs, m.cuffs);
    if (dz.piping) line(sleeves, both(g.cuffSeam), c.piping, 2.4);
    if (dz.topstitch) line(sleeves, both([['M', 134, (g.short ? 470 : 478) + 5], ['L', 188, (g.short ? 470 : 478) + 11]]), dz.topstitchColor, 1, { 'stroke-dasharray': '4 3' });
    if (dz.trims.cuffs) stonesAlong(sleeves, both(g.cuffSeam), stoneFill, 7, 2.4);
    if (dz.fringe.sleeves) fringe(sleeves, both([['M', 147, 300], ['L', 133, 470]]), dz.fringe.color, 26, 4);

    const bodyCmds = front ? g.body : g.bodyBack;
    const bodyPath = both(bodyCmds);
    fabric(jG, bodyPath, c.jacket, m.jacket);
    line(jG, bodyPath, edge, 1.1, { opacity: 0.5 });
    const clipId = id('clip');
    el('path', { d: bodyPath }, el('clipPath', { id: clipId }, d));

    if (dz.yoke) {
      const yg = el('g', { 'clip-path': 'url(#' + clipId + ')' }, jG);
      fabric(yg, both(front ? g.yokeF : g.yokeB), c.yoke, m.yoke);
      const yl = both(front ? g.yokeFLine : g.yokeBLine);
      if (dz.piping) line(yg, yl, c.piping, 2.6);
      if (dz.topstitch) line(jG, both((front ? g.yokeFLine : g.yokeBLine).map(cm => cm.map((v, i) => (i > 0 && i % 2 === 0 ? v + 5 : v)))), dz.topstitchColor, 1, { 'stroke-dasharray': '4 3', 'clip-path': 'url(#' + clipId + ')' });
      if (dz.trims.yoke) stonesAlong(jG, yl, stoneFill, 7, 2.4);
      if (!front && dz.fringe.yoke) fringe(jG, yl, dz.fringe.color, 34, 4);
    }
    if (!front) line(jG, P([['M', 300, dz.yoke ? 300 : 172], ['L', 300, g.hem]]), edge, 1, { opacity: 0.45 });

    if (front) {
      // shirt + neckwear in the opening
      const sh = el('g', {}, jG);
      const opening = [['M', 272, 152], ['L', 300, g.brk], ['L', 328, 152], ['Q', 300, 160, 272, 152], ['Z']];
      fabric(sh, P(opening), c.shirt, 'satin');
      fabric(sh, both([['M', 272, 150], ['L', 300, 166], ['L', 292, 184], ['L', 270, 162], ['Z']]), c.shirt, 'satin');
      line(sh, both([['M', 272, 150], ['L', 300, 166], ['L', 292, 184], ['L', 270, 162], ['Z']]), shade(c.shirt, -0.3), 0.8, { opacity: 0.7 });
      if (g.brk > 220) [205, 245, 285, 325].filter(y => y < g.brk - 8).forEach(y => el('circle', { cx: 300, cy: y, r: 2.2, fill: shade(c.shirt, -0.25) }, sh));
      neckwear(sh, dz.neckwear, c.neckwear, g.brk, stoneFill);
      // lapels + collar
      if (g.lapel) {
        fabric(jG, both(g.collar), c.lapel, m.lapel);
        fabric(jG, both(g.lapel), c.lapel, m.lapel);
        line(jG, both(g.lapel), shade(c.lapel, lum(c.lapel) > 0.5 ? -0.35 : 0.2), 1, { opacity: 0.6 });
        if (dz.piping) line(jG, both(g.lapelEdge), c.piping, 2.4);
        if (dz.topstitch) line(jG, both(g.lapelEdge.map((cm, i) => cm.map((v, k) => (k > 0 && k % 2 === 1 && i > 0 ? v + 5 : v)))), dz.topstitchColor, 1, { 'stroke-dasharray': '4 3' });
        if (dz.trims.lapels) stonesAlong(jG, both(g.lapelEdge), stoneFill, 7, 2.5);
      } else {
        fabric(jG, P(g.collar), c.lapel, m.lapel);
        if (dz.piping) line(jG, P([['M', 270, 168], ['Q', 300, 160, 330, 168]]), c.piping, 2.4);
      }
      if (dz.piping) line(jG, both([['M', 300, g.brk], ['L', 300, g.hem - 14], ['Q', 300, g.hem + 2, 286, g.hem + 2], ['L', 206, g.hem]]), c.piping, 2.2);
      if (dz.trims.hem) stonesAlong(jG, both(g.hemLine), stoneFill, 8, 2.4);
      // pockets
      fabric(jG, both(g.flap), c.lapel === c.jacket ? c.jacket : c.lapel, m.lapel);
      line(jG, both(g.flap), edge, 1, { opacity: 0.6 });
      if (!g.short) { fabric(jG, both(g.welt), c.lapel === c.jacket ? c.jacket : c.lapel, m.lapel); line(jG, both(g.welt), edge, 0.8, { opacity: 0.6 }); }
      // buttons
      const ys = g.short ? [g.brk + 10, g.brk + 46, g.brk + 82] : [g.brk + 12, g.brk + 54, g.brk + 96];
      const bf = dz.buttonColor === 'match' ? c.jacket : gradient(d, 'thread', THREAD[dz.buttonColor] || [shade('#222', 0.4), '#1b1b1b', '#000']);
      ys.slice(0, dz.buttons).filter(y => y < g.hem - 18).forEach(y => { el('circle', { cx: 300, cy: y, r: 6, fill: bf, stroke: '#000', 'stroke-opacity': 0.4, 'stroke-width': 0.8, filter: 'url(#emb)' }, jG); });
    } else {
      // back collar
      fabric(jG, P([['M', 266, 150], ['Q', 300, 142, 334, 150], ['L', 332, 172], ['Q', 300, 165, 268, 172], ['Z']]), c.lapel, m.lapel);
      if (dz.piping) line(jG, P([['M', 268, 172], ['Q', 300, 165, 332, 172]]), c.piping, 2.2);
    }

    // embroidery on the jacket
    const sp = spots(g, view, dz);
    const embG = el('g', {}, jG);
    Object.keys(sp).forEach(k => {
      if (k === 'pants') return;
      const e = dz.emb[k];
      if (!e || e.motif === 'none') return;
      sp[k].forEach(box => motif(embG, d, e.motif, box, Object.assign({}, dzx, { tech: e.tech }), threadFill));
    });
    if (!front) textOnBack(embG, dzx, g, threadFill);

    if (dz.hat) hat(root, c.hat);
    return svg;
  }

  function neckwear(parent, type, color, brk, stoneFill) {
    if (type === 'bow') {
      fabric(parent, 'M300 176 L274 164 C268 170 268 184 274 190 Z M300 176 L326 164 C332 170 332 184 326 190 Z', color, 'satin');
      fabric(parent, 'M294 170 L306 170 L306 183 L294 183 Z', color, 'satin');
    } else if (type === 'tie') {
      fabric(parent, `M292 168 L308 168 L304 182 L296 182 Z M296 182 L304 182 L312 ${Math.min(brk - 6, 300)} L300 ${Math.min(brk + 6, 314)} L288 ${Math.min(brk - 6, 300)} Z`, color, 'satin');
    } else if (type === 'bolo') {
      line(parent, `M286 160 C 290 190 294 210 296 ${Math.min(brk - 10, 290)} M314 160 C 310 190 306 210 304 ${Math.min(brk - 10, 290)}`, '#1a1a1a', 1.6);
      el('ellipse', { cx: 300, cy: 196, rx: 10, ry: 12, fill: color, stroke: '#c9ced6', 'stroke-width': 2, filter: 'url(#emb)' }, parent);
      stone(parent, 300, 196, 4, stoneFill);
    } else if (type === 'scarf') {
      fabric(parent, 'M284 162 C 292 174 308 174 316 162 L 312 184 C 306 196 294 196 288 184 Z', color, 'satin');
    }
  }

  window.Suit = { render, STONES, MOTIFS: Object.keys(MOTIFS), MOTIF_PATHS: MOTIFS, shade };
})();
