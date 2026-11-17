/* =====================================================================
   SCALA Navidad · Decoración de la página de inicio (versión 2)
   No toca el catálogo, el carrito ni los pedidos: eso lo hace app.js.

   Índice
     1. Ayudantes
     2. Franja de suéter navideño
     3. Cuenta regresiva
     4. Motor de pixel art + dibujos (pino, regalos, muñeco, trineo…)
     5. Colocar los dibujos en la página
     6. Guirnalda de luces (al tocarlas suena «Noche de Paz»)
     7. Nieve suave y trineo volador
     8. Las 20 tarjetas (y sus precios)
     9. El regalo de la portada que se abre
    10. Menú que marca la sección visible
    11. Secciones que aparecen al bajar
    12. El carrito salta al agregar
    13. Barra con el botón principal en celulares
    14. Enlace al panel del vendedor (solo en tu computadora)
   ===================================================================== */
(() => {
'use strict';

/* ---------- 1. Ayudantes ---------- */
const byId = id => document.getElementById(id);
const put = (id, html) => { const n = byId(id); if (n) n.innerHTML = html; };
const rand = (a, b) => a + Math.random() * (b - a);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
function toast(msg){ // usa el mismo aviso que app.js
  const t = byId('toast'); if (!t) return;
  t.textContent = msg; t.classList.add('visible');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('visible'), 3400);
}

/* ---------- 2. Franja de suéter navideño (pixel por pixel) ---------- */
(function sweaterBand(){
  const COPO = ['.....x.....','..x..x..x..','...x.x.x...','....xxx....','.x...x...x.','xxxxxxxxxxx','.x...x...x.','....xxx....','...x.x.x...','..x..x..x..','.....x.....'];
  const PINO = ['.....w.....','....ggg....','...ggggg...','.....g.....','....ggg....','..ggggggg..','....ggg....','..ggggggg..','ggggggggggg','.....w.....','.....w.....'];
  const rows = ['g'.repeat(24), 'g'.repeat(24), 'w.'.repeat(12), '.'.repeat(24)];
  for (let i = 0; i < 11; i++) rows.push(COPO[i].replace(/x/g, 'w') + '.' + PINO[i] + '.');
  rows.push('.'.repeat(24), '.w'.repeat(12), 'g'.repeat(24), 'g'.repeat(24));
  const u = 4, C = { w: '#fff6e8', g: '#0f4a2c' };
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${24*u}" height="${rows.length*u}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#c8102e"/>`;
  rows.forEach((r, y) => { let x = 0; while (x < r.length) { const ch = r[x]; if (ch === '.') { x++; continue; } let e = x; while (e < r.length && r[e] === ch) e++; s += `<rect x="${x*u}" y="${y*u}" width="${(e-x)*u}" height="${u}" fill="${C[ch]}"/>`; x = e; } });
  s += '</svg>';
  document.documentElement.style.setProperty('--band', `url("data:image/svg+xml,${encodeURIComponent(s)}")`);
  document.documentElement.style.setProperty('--band-h', rows.length * u + 'px');
})();

/* ---------- 3. Cuenta regresiva a Nochebuena ---------- */
function updateCountdown(){
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), d = now.getDate();
  let text;
  if (m === 11 && d === 24) text = '🎄 ¡Hoy es Nochebuena!';
  else if (m === 11 && d === 25) text = '🎁 ¡Feliz Navidad!';
  else if (m === 11 && d > 25) text = '✨ ¡Ya casi llega el 2027!';
  else if (m === 0 && d <= 6) text = '🎆 ¡Feliz año nuevo!';
  else { const days = Math.round((new Date(y, 11, 24) - new Date(y, m, d)) / 864e5); text = days === 1 ? '¡Mañana es Nochebuena!' : `Faltan ${days} días para Nochebuena`; }
  const n = byId('countdownText'); if (n) n.textContent = text;
}
updateCountdown(); setInterval(updateCountdown, 36e5);

/* ---------- 4. Motor de pixel art ----------
   Cada dibujo es una cuadrícula de pixeles. Se pinta con figuras simples
   (rectángulos, óvalos, líneas), se le pone contorno y se convierte en SVG. */
class Pix {
  constructor(w, h){ this.w = w; this.h = h; this.d = new Array(w * h).fill(null); }
  set(x, y, c){ x = Math.round(x); y = Math.round(y); if (!c || x < 0 || y < 0 || x >= this.w || y >= this.h) return; this.d[y * this.w + x] = c; }
  clr(x, y){ if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = null; }
  get(x, y){ return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? null : this.d[y * this.w + x]; }
  rect(x, y, w, h, c){ for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, typeof c === 'function' ? c(i, j, w, h) : c); }
  ell(cx, cy, rx, ry, c){ for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) { const nx = (x - cx) / rx, ny = (y - cy) / ry; if (nx * nx + ny * ny <= 1) { if (c === null) this.clr(x, y); else this.set(x, y, typeof c === 'function' ? c(nx, ny, x, y) : c); } } }
  line(x0, y0, x1, y1, c){ x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (;;) { this.set(x0, y0, c); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } }
  poly(pts, c){ const ys = pts.map(p => p[1]); for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) { const yc = y + .5, xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); } xs.sort((a, b) => a - b); for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.round(xs[k]); x < Math.round(xs[k + 1]); x++) this.set(x, y, typeof c === 'function' ? c(x, y) : c); } }
  outline(c){ const add = []; for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) { if (this.get(x, y)) continue; if (this.get(x + 1, y) || this.get(x - 1, y) || this.get(x, y + 1) || this.get(x, y - 1)) add.push([x, y]); } for (const [x, y] of add) this.set(x, y, c); return this; }
  blit(o, ox, oy){ for (let y = 0; y < o.h; y++) for (let x = 0; x < o.w; x++) { const c = o.get(x, y); if (c) this.set(ox + x, oy + y, c); } return this; }
  rects(){ let s = ''; for (let y = 0; y < this.h; y++) { let x = 0; while (x < this.w) { const c = this.d[y * this.w + x]; if (!c) { x++; continue; } let e = x; while (e < this.w && this.d[y * this.w + e] === c) e++; const [f, k] = c.split('|'); s += `<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${f}"${k ? ` class="${k}"` : ''}/>`; x = e; } } return s; }
  svg(scale){ return `<svg viewBox="0 0 ${this.w} ${this.h}" width="${this.w * scale}" height="${this.h * scale}" shape-rendering="crispEdges" aria-hidden="true">${this.rects()}</svg>`; }
}
// sombreado de esfera: luz desde arriba a la izquierda
const shade = p => (nx, ny) => { const l = -(nx * .55 + ny * .75); return l > .62 ? p[0] : l > .12 ? p[1] : l > -.42 ? p[2] : p[3]; };
const seeded = s => () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };

/* --- Pino de Navidad (también pinitos nevados) --- */
const VERDES = ['#74c86e', '#479f50', '#2b8040', '#1d6434', '#124526'];
const LUCES = ['#ff4a4a', '#ffd23f', '#4fb3ff', '#ff7ad1', '#7dff9a'];
const ESFERAS = [['#ffb0b0','#ff5a5a','#d4182c','#7a0a18'],['#fff3b0','#ffd23f','#d9a21c','#8a5a10'],['#c4e4ff','#5fb2ff','#2a72d4','#123a7a'],['#ffd0ec','#ff7ad1','#c8389a','#6a1450'],['#ffffff','#dfe6f0','#a9b6c8','#5c6a80']];
function tree(o){
  const P = new Pix(o.W, o.H), green = new Set(VERDES), rnd = seeded(o.seed || 7);
  if (o.trunk) { // tronco y maceta
    const T = new Pix(o.W, o.H), [ty, th, tw] = o.trunk;
    T.rect(o.cx - (tw >> 1), ty, tw, th, i => i < 1 ? '#b07444' : i < tw - 2 ? '#7a4a26' : '#4f2e14');
    if (o.pot) { const cx = o.cx, py = ty + th - 1;
      T.poly([[cx - 9, py], [cx + 10, py], [cx + 8, py + 8], [cx - 7, py + 8]], x => x < cx - 5 ? '#ff5a5a' : x > cx + 4 ? '#9e1020' : '#d1132f');
      T.rect(cx - 10, py - 1, 21, 1, '#ffe680'); T.rect(cx - 10, py, 21, 1, '#d9a21c'); for (let x = cx - 7; x <= cx + 7; x += 2) T.set(x, py + 4, '#ffd23f'); }
    T.outline(o.pot ? '#3a0a10' : '#2a1608'); P.blit(T, 0, 0);
  }
  for (let ti = o.tiers.length - 1; ti >= 0; ti--) { // niveles de ramas, de abajo hacia arriba
    const [ty, by, hw] = o.tiers[ti], T = new Pix(o.W, o.H), ph = Math.floor(rnd() * 6);
    const wave = dx => { const m = (((Math.round(dx) + ph) % 6) + 6) % 6; return Math.abs(m - 3) * .7; }; // puntas hacia abajo
    for (let y = ty; y <= by + 1; y++) {
      const t = Math.min(1, (y - ty) / Math.max(1, by - ty)); let half = .8 + hw * Math.pow(t, .88);
      if ((y - ty) % 3 === 2) half += 1.3; else if ((y - ty) % 3 === 0 && y > ty) half -= .3;
      for (let x = Math.floor(o.cx - half - 1); x <= Math.ceil(o.cx + half + 1); x++) {
        const dx = x - o.cx; if (Math.abs(dx) > half || y > by + 1 - wave(dx)) continue;
        const u = dx / Math.max(1, half), edge = (by + 1 - wave(dx)) - y;
        let k = u < -.62 ? 0 : u < -.22 ? 1 : u < .3 ? 2 : u < .7 ? 3 : 4;
        if (edge < 1.5 && k < 4) k++;
        if (edge < 2.5 && u > .1 && k < 4) k++;
        if (y < ty + 3 && u < .2 && k > 0) k--;
        if (u < .3 && (x + y) % 4 === 0) k = Math.max(0, k - 1);
        if (u >= -.1 && (x - y + 400) % 4 === 0) k = Math.min(4, k + 1);
        let c = VERDES[k];
        if (o.snowy && u < -.1 && (x * 3 + y * 5) % 7 === 0 && t < .85) c = '#eef4fc';
        if (o.snowy && ti === 0 && y <= ty + 1) c = '#ffffff';
        T.set(x, y, c);
      }
    }
    for (let x = Math.floor(o.cx - hw - 2); x <= Math.ceil(o.cx + hw + 2); x++) { // nieve sobre algunas puntas
      const dx = x - o.cx; if (wave(dx) !== 0 || !T.get(x, by)) continue;
      if (rnd() < (o.snowy ? .85 : .65)) { const w = 1 + Math.floor(rnd() * 2), yb = by - 2;
        for (let i = -w - 1; i <= w; i++) { if (!T.get(x + i, yb)) continue; T.set(x + i, yb, i === -w - 1 ? '#dfe9f6' : '#ffffff'); if (T.get(x + i, yb + 1) && i > -w && i < w) T.set(x + i, yb + 1, i < 0 ? '#eef4fc' : '#c9d9ec'); } }
    }
    T.outline('#0b2e19');
    for (let y = 0; y < o.H; y++) for (let x = 0; x < o.W; x++) { // sombra sobre el nivel de abajo
      if (T.get(x, y) !== '#0b2e19' || T.get(x, y + 1)) continue;
      for (const d of [1, 2]) { const gi = VERDES.indexOf(P.get(x, y + d)); if (gi >= 0 && gi < 4 && (d === 1 || x % 2 === 0)) P.set(x, y + d, VERDES[gi + 1]); }
    }
    P.blit(T, 0, 0);
  }
  if (o.lights) { // guirnalda de luces que titilan
    o.tiers.forEach(([ty, by, hw], ti) => {
      if (ti === 0) return;
      const halfAt = y => .8 + hw * Math.pow((y - ty) / (by - ty), .9), ya = ty + Math.round((by - ty) * .38), yb = ty + Math.round((by - ty) * .7);
      const y0 = ti % 2 ? ya : yb, y1 = ti % 2 ? yb : ya, x0 = o.cx - halfAt(y0) + 2, x1 = o.cx + halfAt(y1) - 2; let n = 0;
      for (let x = Math.ceil(x0); x <= Math.floor(x1); x++, n++) { const s = (x - x0) / (x1 - x0), y = Math.round(y0 + (y1 - y0) * s + 2.4 * Math.sin(Math.PI * s));
        if (!green.has(P.get(x, y))) continue;
        if (n % 3 === 0) { const li = (n / 3 + ti) % LUCES.length; P.set(x, y, LUCES[li] + '|tw' + ((n / 3 + ti) % 3)); } else P.set(x, y, n % 3 === 1 ? '#f2c14e' : '#c99a2e'); }
    });
  }
  if (o.orn) { // esferas de colores
    const placed = []; let tries = 0;
    while (placed.length < o.orn && tries < 900) { tries++;
      const x = Math.floor(rnd() * (o.W - 4)), y = Math.floor(8 + rnd() * (o.H - 20)); let ok = true;
      for (let j = 0; j < 4 && ok; j++) for (let i = 0; i < 4 && ok; i++) if (!green.has(P.get(x + i, y + j))) ok = false;
      if (!ok || placed.some(([a, b]) => Math.abs(a - x) < 6 && Math.abs(b - y) < 6)) continue;
      placed.push([x, y]); const p = ESFERAS[placed.length % ESFERAS.length];
      [['.','L','B','.'],['L','W','B','B'],['B','B','B','D'],['.','B','D','.']].forEach((r, j) => r.forEach((ch, i) => { const c = { L: p[1], W: '#ffffff', B: p[2], D: p[3] }[ch]; if (c) P.set(x + i, y + j, c); }));
    }
  }
  if (o.star) { // estrella que brilla
    ['....o....','...oYo...','...oYo...','oooYWYooo','oYYYWYYYo','.oYYYYYo.','..oYYYo..','.oYYoYYo.','.oYo.oYo.','.oo...oo.'].forEach((r, j) => [...r].forEach((ch, i) => { const c = { o: '#a8640c', Y: '#ffd23f|pxstar', W: '#fff7c2|pxstar' }[ch]; if (c) P.set(o.cx - 4 + i, j, c); }));
  }
  return P;
}
const pine = seed => tree({ W: 29, H: 40, cx: 14, seed, tiers: [[2, 12, 5], [8, 22, 8], [15, 33, 11]], trunk: [32, 5, 5], snowy: true });

/* --- Regalos --- */
function gift(w, h, base, light, dark, rib, ribD, out){
  const P = new Pix(w + 4, h + 7), ox = 2, oy = 5, cx = ox + Math.floor(w / 2) - 1;
  P.rect(ox, oy + 2, w, h - 2, i => i >= w - 2 ? dark : (i === 0 ? light : base));
  P.rect(ox - 1, oy, w + 2, 3, (i, j) => j === 0 ? light : (i >= w ? dark : base));
  P.rect(cx, oy, 2, h, i => i === 0 ? rib : ribD);
  P.rect(ox, oy + 2 + Math.floor((h - 2) / 2), w, 1, i => i >= w - 2 ? ribD : rib);
  P.ell(cx - 1.5, oy - 2, 2.3, 1.6, rib); P.ell(cx + 3.5, oy - 2, 2.3, 1.6, rib); P.rect(cx, oy - 2, 2, 2, ribD);
  P.set(cx - 2, oy - 2, ribD); P.set(cx + 4, oy - 2, ribD); P.set(cx - 1, oy, ribD); P.set(cx + 2, oy, ribD);
  return P.outline(out);
}
const REGALO = {
  rojo:     () => gift(12, 9, '#d1132f', '#ff5a6a', '#8f0b1d', '#ffd23f', '#c08a24', '#3a0a10'),
  verde:    () => gift(10, 8, '#2e9e5b', '#6fd394', '#1d6b40', '#fff6e8', '#cfd6e0', '#0f3a1e'),
  azul:     () => gift(8, 11, '#3a8ee6', '#8fc6ff', '#1f5aa8', '#ff4a5a', '#a50d22', '#0f2a5c'),
  dorado:   () => gift(9, 6, '#ffd23f', '#fff0a0', '#c08a24', '#d1132f', '#8f0b1d', '#5a3208')
};

/* --- Muñeco de nieve --- */
function snowman(){
  const P = new Pix(30, 38), SN = ['#ffffff', '#eef4fb', '#cbd9ea', '#a6b8d2'];
  P.ell(15, 29, 9, 7.5, shade(SN)); P.ell(15, 19, 6.8, 5.6, shade(SN)); P.ell(15, 10.5, 5.2, 4.6, shade(SN));
  P.rect(9, 5, 13, 2, (i, j) => j === 0 ? '#465266' : '#2a3140'); P.rect(11, 0, 9, 5, i => i === 0 ? '#465266' : '#2a3140'); P.rect(11, 4, 9, 1, '#d1132f');
  P.set(18, 3, '#3f8a5f'); P.set(19, 3, '#3f8a5f'); P.set(18, 4, '#ff3b3b');
  P.set(13, 9, '#1d222b'); P.set(17, 9, '#1d222b'); P.set(13, 8, '#5a6478'); P.set(12, 11, '#f7b2b2'); P.set(18, 11, '#f7b2b2');
  P.set(15, 11, '#f08a24'); P.set(16, 11, '#f08a24'); P.set(17, 11, '#e0761a'); P.set(18, 12, '#c85f12');
  for (const [x, y] of [[13, 13], [14, 14], [15, 14], [16, 14], [17, 13]]) P.set(x, y, '#3a3f4a');
  P.rect(10, 15, 11, 2, (i, j) => j === 0 ? (i % 3 === 0 ? '#ff5a6a' : '#d1132f') : (i > 7 ? '#8f0b1d' : '#b80f24'));
  P.rect(17, 17, 3, 6, (i, j) => j % 2 === 1 ? '#fff6e8' : (i === 2 ? '#8f0b1d' : '#d1132f')); P.set(17, 23, '#d1132f'); P.set(19, 23, '#d1132f');
  for (const y of [19, 21, 27, 30]) P.set(15, y, '#2a2f3a');
  P.outline('#41557a');
  const B = '#6b3f1e'; P.line(8, 19, 2, 13, B); P.line(4, 15, 1, 15, B); P.line(3, 14, 3, 11, B); P.line(22, 19, 28, 13, B); P.line(26, 15, 29, 15, B); P.line(27, 14, 27, 11, B);
  return P;
}

/* --- Esfera colgante --- */
function ornament(p){
  const P = new Pix(17, 19);
  P.rect(6, 0, 5, 3, i => i === 0 ? '#fff0b0' : i === 4 ? '#a8822e' : '#d9b25a'); P.rect(7, 0, 3, 1, '#8a6a20');
  P.ell(8, 10.5, 6.6, 6.6, shade(p));
  for (let x = 2; x <= 14; x++) { const y = 10 + ((x >> 1) % 2); if (P.get(x, y)) P.set(x, y, x % 2 ? '#ffd23f' : '#fff3b0'); }
  P.set(5, 6, '#ffffff'); P.set(6, 6, '#ffffff'); P.set(5, 7, '#ffffff'); P.set(4, 8, p[0]);
  return P.outline(p[3]);
}

/* --- Campana --- */
function bell(){
  const P = new Pix(19, 23), sh = x => { const u = (x - 9) / 6; return u < -.5 ? '#fff0a0' : u < .05 ? '#ffd23f' : u < .55 ? '#e0a92a' : '#b07a18'; };
  [2, 3, 4, 4, 5, 5, 5, 5, 5, 6, 6, 7, 8].forEach((hw, i) => { for (let x = 9 - hw; x <= 9 + hw; x++) P.set(x, 5 + i, sh(x)); });
  P.rect(1, 18, 17, 1, i => i < 5 ? '#fff4b8' : '#ffd84a'); P.rect(2, 19, 15, 1, '#c48a1c'); P.ell(9, 20.6, 1.5, 1.2, '#8a5a10');
  P.set(6, 8, '#fffbe0'); P.set(6, 9, '#fffbe0'); P.set(5, 11, '#fffbe0');
  P.ell(6, 2.5, 2.4, 1.6, '#d1132f'); P.ell(12, 2.5, 2.4, 1.6, '#d1132f'); P.rect(8, 2, 3, 3, '#a50d22'); P.set(5, 2, '#ff6070'); P.set(11, 2, '#ff6070');
  return P.outline('#5a3208');
}

/* --- Ramita de acebo --- */
function holly(){
  const P = new Pix(26, 18);
  const leaf = (cx, cy, ang, len, wid) => { const ca = Math.cos(ang), sa = Math.sin(ang); for (let y = 0; y < 18; y++) for (let x = 0; x < 26; x++) { const dx = x - cx, dy = y - cy, a = (dx * ca + dy * sa) / len, b = -dx * sa + dy * ca; if (Math.abs(a) > 1) continue; let w = wid * Math.sqrt(1 - a * a); if (((a + 1) * 2.6) % 1 < .32) w -= 1; if (Math.abs(b) <= w) P.set(x, y, Math.abs(b) < .6 && Math.abs(a) < .85 ? '#9fe08a' : b < 0 ? '#4fae5c' : '#2b7a3c'); } };
  leaf(7, 10, -.35, 7, 3.4); leaf(19, 10, .35, 7, 3.4);
  const BAYA = ['#ffc0c0', '#ff4a5a', '#d4182c', '#8e0f1e'];
  P.ell(11.5, 7, 2.3, 2.3, shade(BAYA)); P.ell(15, 6.5, 2.3, 2.3, shade(BAYA)); P.ell(13.2, 10, 2.3, 2.3, shade(BAYA));
  return P.outline('#12331c');
}

/* --- Moño verde --- */
function bow(){
  const P = new Pix(28, 20), GR = ['#9ff0b8', '#3fbf6e', '#1f8a4c', '#0b4524'];
  P.poly([[12, 10], [8, 19], [10, 18], [12, 20], [14, 11]], x => x < 11 ? '#3fbf6e' : '#1f8a4c');
  P.poly([[15, 10], [19, 19], [17, 18], [15, 20], [13, 11]], x => x > 16 ? '#1f8a4c' : '#2a9a58');
  P.ell(7.5, 7, 6.5, 4.6, shade(GR)); P.ell(20.5, 7, 6.5, 4.6, shade(GR));
  P.ell(8, 7, 2.6, 1.6, '#0f5a30'); P.ell(20, 7, 2.6, 1.6, '#0f5a30');
  P.rect(12, 4, 4, 6, (i, j) => i === 0 ? '#5fd38a' : i === 3 ? '#14703c' : '#26a35a');
  P.set(4, 4, '#e9fff0'); P.set(5, 4, '#e9fff0'); P.set(17, 4, '#e9fff0');
  return P.outline('#0b2e19');
}

/* --- Sobre con corazón --- */
function envelope(){
  const P = new Pix(24, 18), L = '#b98a55';
  P.rect(1, 2, 22, 14, (i, j) => j > 11 ? '#ead6b0' : (i === 0 ? '#fffaf0' : '#fff1d6'));
  P.line(1, 2, 11, 10, L); P.line(22, 2, 12, 10, L); P.line(1, 15, 8, 10, '#dcc49c'); P.line(22, 15, 15, 10, '#dcc49c');
  P.ell(11.5, 10, 2.6, 2.4, shade(['#ffb0b0', '#ff4a5a', '#d4182c', '#8e0f1e'])); P.set(11, 9, '#ffd0d0');
  return P.outline('#6b4a2a');
}

/* --- Celular con QR --- */
function phone(){
  const P = new Pix(18, 26), r = seeded(42);
  P.rect(2, 0, 14, 25, (i, j) => i === 0 ? '#3d4c5c' : '#24303c'); P.clr(2, 0); P.clr(15, 0); P.clr(2, 24); P.clr(15, 24);
  P.rect(4, 3, 10, 16, '#ffffff');
  for (let y = 4; y < 18; y++) for (let x = 5; x < 13; x++) if (r() < .45) P.set(x, y, '#1d222b');
  for (const [fx, fy] of [[5, 4], [10, 4], [5, 15]]) { P.rect(fx, fy, 3, 3, '#1d222b'); P.set(fx + 1, fy + 1, '#ffffff'); } // esquinas del QR
  P.rect(7, 21, 4, 2, '#5a6a7c'); P.rect(6, 1, 6, 1, '#5a6a7c');
  return P.outline('#0e141b');
}

/* --- Reno y trineo de Papá Noel --- */
function reindeer(rudolph){
  const P = new Pix(36, 30), BR = ['#e8b07a', '#b8783e', '#94592a', '#6a3d1a'];
  const A = new Pix(36, 30), AC = '#ecd3a0';
  A.line(25, 6, 23, 1, AC); A.line(24, 3, 21, 2, AC); A.line(27, 6, 29, 1, AC); A.line(28, 3, 31, 2, AC); A.set(23, 1, '#fff2d0'); A.set(29, 1, '#fff2d0');
  A.outline('#5a3a14'); P.blit(A, 0, 0);
  const D = new Pix(36, 30), leg = (pts, c) => { for (let i = 0; i < pts.length - 1; i++) { D.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], c); D.line(pts[i][0] + 1, pts[i][1], pts[i + 1][0] + 1, pts[i + 1][1], c); } };
  leg([[8, 21], [5, 24], [2, 26]], '#7a4a22'); leg([[11, 21], [9, 25], [7, 27]], '#94592a'); leg([[18, 21], [21, 24], [24, 24]], '#7a4a22'); leg([[20, 21], [22, 25], [26, 26]], '#94592a');
  for (const [x, y] of [[2, 27], [3, 27], [7, 28], [8, 28], [25, 24], [27, 26]]) D.set(x, y, '#2b1a10');
  D.ell(14, 18, 9, 4.6, shade(BR));
  for (let x = 8; x <= 20; x++) if (D.get(x, 22)) D.set(x, 22, '#ecd6b4');
  D.poly([[19, 16], [22, 9], [26, 10], [24, 18]], x => x < 22 ? '#b8783e' : '#94592a');
  D.ell(26, 9, 3.6, 2.8, shade(BR)); D.ell(29.5, 10.2, 2.2, 1.7, shade(['#f6d6ae', '#dcae7c', '#b8783e', '#8a5a2e']));
  D.set(23, 6, '#94592a'); D.set(22, 6, '#6a3d1a'); D.ell(4.5, 15, 1.6, 1.3, '#fffaf0');
  D.set(27, 8, '#1a0f08'); D.set(26, 8, '#ffffff');
  D.rect(31, 9, 2, 2, rudolph ? '#ff2a2a|nose' : '#2b1a10'); if (rudolph) D.set(31, 9, '#ffb0b0|nose');
  D.outline('#2a1608'); P.blit(D, 0, 0);
  for (let y = 14; y <= 22; y++) for (const x of [16, 17]) if (P.get(x, y) && P.get(x, y) !== '#2a1608') P.set(x, y, x === 16 ? '#ff3b4a' : '#c8102e');
  P.set(16, 20, '#ffd23f'); P.set(17, 20, '#c08a24');
  P.line(20, 17, 24, 18, '#d1132f'); P.set(21, 18, '#ffd23f'); P.set(23, 18, '#ffd23f');
  return P;
}
function santaSleigh(){
  const P = new Pix(48, 32), RED = ['#ff8a8a', '#f03a3a', '#d42a2a', '#8f1622'];
  const g1 = new Pix(48, 32); g1.rect(3, 4, 6, 6, (i, j) => j === 0 ? '#6fd394' : i === 5 ? '#1d6b40' : '#2e9e5b'); g1.rect(5, 4, 2, 6, '#ffd23f'); g1.outline('#0f3a1e');
  const g2 = new Pix(48, 32); g2.rect(9, 2, 6, 7, (i, j) => j === 0 ? '#9fd2ff' : i === 5 ? '#2a6fc4' : '#4aa3ff'); g2.rect(11, 2, 2, 7, '#fff6e8'); g2.outline('#14315c');
  P.blit(g1, 0, 0); P.blit(g2, 0, 0);
  const S = new Pix(48, 32); S.ell(9, 16, 7.5, 7.5, shade(['#e2b27c', '#c08a52', '#9a6a3a', '#6b4423'])); S.rect(6, 8, 6, 2, '#6b4423'); S.set(7, 8, '#9a6a3a'); S.outline('#2a1608'); P.blit(S, 0, 0);
  const N = new Pix(48, 32);
  N.ell(22, 18, 7, 7, shade(RED)); N.rect(15, 18, 14, 2, '#2b1a10'); N.rect(21, 18, 3, 2, '#ffd23f'); N.set(22, 18, '#2b1a10');
  N.ell(25, 10, 4.2, 4.2, shade(['#ffe0c4', '#f6c39b', '#e0a47e', '#c4825e']));
  N.ell(25, 14, 4.8, 3.8, shade(['#ffffff', '#fffaf0', '#e6e4ee', '#c4c6d4'])); N.rect(25, 11, 5, 1, '#ffffff'); N.set(29, 11, '#e6e4ee');
  N.set(27, 9, '#2b1414'); N.set(26, 8, '#ffffff'); N.set(28, 10, '#f49a9a'); N.set(30, 10, '#f2a07a');
  N.poly([[20, 6], [31, 6], [27, 2], [22, 1], [18, 3]], (x, y) => y < 4 ? '#f03a3a' : '#d42a2a'); N.rect(20, 6, 11, 2, (i, j) => j === 0 ? '#ffffff' : '#e0e2ea');
  N.ell(16.5, 4, 2, 2, shade(['#ffffff', '#ffffff', '#e6e8f0', '#c4c8d6']));
  N.outline('#2a0f12'); P.blit(N, 0, 0);
  const R = new Pix(48, 32); R.line(6, 28, 41, 28, '#ffd23f'); R.line(6, 29, 41, 29, '#c08a24'); R.rect(11, 25, 2, 3, '#c08a24'); R.rect(32, 25, 2, 3, '#c08a24');
  for (const [x, y, c] of [[42, 27, '#ffd23f'], [43, 26, '#ffd23f'], [44, 25, '#ffd23f'], [44, 24, '#ffd23f'], [43, 23, '#c08a24'], [5, 27, '#ffd23f'], [4, 26, '#c08a24']]) R.set(x, y, c);
  R.outline('#4a2a08'); P.blit(R, 0, 0);
  const B = new Pix(48, 32);
  B.poly([[1, 15], [5, 15], [8, 21], [33, 21], [37, 17], [40, 13], [43, 12], [45, 14], [43, 19], [39, 26], [6, 26], [1, 21]], (x, y) => y <= 22 ? '#f03a3a' : y >= 25 ? '#8f1622' : '#d42a2a');
  B.line(9, 23, 37, 23, '#ffd23f'); B.line(9, 24, 36, 24, '#c08a24'); B.ell(41.5, 15, 1.6, 1.6, '#ffd23f'); B.set(41, 15, '#c08a24'); B.set(3, 17, '#ffd23f'); B.set(3, 18, '#ffd23f');
  B.outline('#2a0f12'); P.blit(B, 0, 0);
  const M = new Pix(48, 32); for (const d of [0, 1, 2]) M.line(24, 15 + d, 34, 17 + d, d === 0 ? '#f03a3a' : '#d42a2a');
  M.ell(35.5, 18, 2, 2, shade(['#9ff0b8', '#3fbf6e', '#2e9e5b', '#1d6b40'])); M.rect(24, 17, 2, 2, '#fffaf0');
  M.outline('#2a0f12'); P.blit(M, 0, 0);
  return P;
}
function sleighScene(){
  const S = new Pix(120, 34);
  S.line(36, 22, 74, 23, '#6b3410'); S.line(36, 21, 108, 19, '#6b3410');
  S.blit(santaSleigh(), 0, 2); S.blit(reindeer(false), 50, 4); S.blit(reindeer(true), 84, 0);
  return S;
}

/* --- Foco de la guirnalda --- */
function bulbPx(c){
  const P = new Pix(9, 13); P.rect(3, 0, 3, 3, i => i === 0 ? '#6b7d6f' : '#3a4a3e'); P.rect(3, 3, 3, 1, '#24302a');
  [2, 3, 3, 3, 3, 2, 2, 1].forEach((hw, i) => { const y = 4 + i; for (let x = 4 - hw; x <= 4 + hw; x++) P.set(x, y, (x === 4 - hw ? c[1] : x === 4 + hw ? c[2] : c[0]) + '|glass'); });
  P.set(3, 5, '#ffffff|glass'); P.set(3, 6, '#ffffff|glass');
  return P.outline(c[3]);
}

/* ---------- 5. Colocar los dibujos en la página ---------- */
// Pie de página: pino grande con regalos, pinitos, muñeco de nieve
const scene = new Pix(80, 72);
scene.blit(tree({ W: 52, H: 70, cx: 25, seed: 24, tiers: [[7, 19, 8], [14, 31, 13], [24, 43, 18], [35, 56, 23]], trunk: [55, 5, 7], pot: true, lights: true, orn: 16, star: true }), 14, 0);
scene.blit(REGALO.rojo(), 1, 56); scene.blit(REGALO.dorado(), 12, 59); scene.blit(REGALO.verde(), 59, 57); scene.blit(REGALO.azul(), 66, 54);
put('pxScene', scene.svg(5));
put('pxPines', pine(3).svg(4) + pine(11).svg(3) + pine(19).svg(2));
const snowmanGifts = new Pix(48, 38); snowmanGifts.blit(snowman(), 0, 0); snowmanGifts.blit(REGALO.verde(), 30, 24);
put('pxSnowman', snowmanGifts.svg(3));
// Portada, pasos, invitación al estudio y aviso
put('sleigh', sleighScene().svg(3));
put('heroHolly', holly().svg(4));
put('heroBow', bow().svg(5));
put('noticeBell', bell().svg(1));
const studioArt = new Pix(42, 28); studioArt.blit(envelope(), 0, 6); studioArt.blit(REGALO.rojo(), 24, 9); studioArt.blit(holly(), 2, 0);
put('studioArt', studioArt.svg(5));
const STEP_SPRITES = { ornament: () => ornament(ESFERAS[0]).svg(4), envelope: () => envelope().svg(4), phone: () => phone().svg(3), gift: () => REGALO.rojo().svg(4) };
document.querySelectorAll('[data-sprite]').forEach(n => { const f = STEP_SPRITES[n.dataset.sprite]; if (f) n.innerHTML = f(); });

/* ---------- 6. Guirnalda y esferas: tocan «Noche de Paz» ---------- */
const NOTAS = [392, 440, 392, 329.63, 392, 440, 392, 329.63, 587.33, 587.33, 493.88, 523.25, 523.25, 392, 440, 440, 523.25, 493.88, 440, 392, 440, 392, 329.63];
const FOCOS = [['#ff3d3d','#ff9a8f','#c41f2a','#5a0a10'],['#ffc928','#fff0a0','#d99a10','#5a3a04'],['#2fd27a','#a0f5c4','#1a9a52','#0a3a1e'],['#3aa0ff','#b0dcff','#1f6ac4','#0a2a5a'],['#ff5fa8','#ffc0dc','#c8387a','#5a0a34'],['#ff8a1f','#ffcc8a','#d0600a','#5a2604']];
const FOCO_PX = FOCOS.map(c => bulbPx(c).rects());
let audio = null, nota = 0, tocado = false;
function audioCtx(){ audio = audio || new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === 'suspended') audio.resume(); return audio; }
function campanita(freq){
  try {
    const a = audioCtx(), t = a.currentTime, out = a.createGain();
    out.gain.setValueAtTime(.0001, t); out.gain.exponentialRampToValueAtTime(.2, t + .012); out.gain.exponentialRampToValueAtTime(.0001, t + 1.8); out.connect(a.destination);
    for (const [m, g] of [[1, 1], [2.01, .32], [3.03, .12], [4.2, .05]]) { const o = a.createOscillator(), gg = a.createGain(); o.type = 'sine'; o.frequency.value = freq * m; gg.gain.value = g; o.connect(gg).connect(out); o.start(t); o.stop(t + 1.9); }
  } catch {}
}
function cascabeles(){
  try {
    const a = audioCtx(), t0 = a.currentTime;
    for (let i = 0; i < 12; i++) { const t = t0 + i * .075 + Math.random() * .03;
      for (const fq of [2637, 3136, 3951]) { const o = a.createOscillator(), g = a.createGain(); o.type = 'triangle'; o.frequency.value = fq * (1 + Math.random() * .03);
        g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.045, t + .004); g.gain.exponentialRampToValueAtTime(.0001, t + .22); o.connect(g).connect(a.destination); o.start(t); o.stop(t + .25); } }
  } catch {}
}
function siguienteNota(){
  campanita(NOTAS[nota]); nota++;
  if (!tocado) { tocado = true; byId('garlandHint')?.classList.add('hide'); }
  if (nota === NOTAS.length) { nota = 0; setTimeout(() => toast('  ¡Tocaste «Noche de Paz» completa! Qué buen oído.'), 500); }
}
function buildGarland(){
  const svg = byId('garlandSvg'); if (!svg) return;
  const W = document.documentElement.clientWidth, H = 80, spans = Math.max(2, Math.round(W / 230)), sw = W / spans, per = W < 520 ? 3 : 4;
  let defs = '<defs>' + FOCOS.map((c, i) => `<radialGradient id="gg${i}"><stop offset="0" stop-color="${c[1]}" stop-opacity="1"/><stop offset=".45" stop-color="${c[0]}" stop-opacity=".45"/><stop offset="1" stop-color="${c[0]}" stop-opacity="0"/></radialGradient>`).join('') + '</defs>';
  let wire = '', bulbs = '', k = 0;
  for (let i = 0; i < spans; i++) {
    const x0 = i * sw, x1 = x0 + sw, mx = (x0 + x1) / 2, sag = 18 + (i % 2) * 8, cy = 2 + 2 * sag;
    wire += `M${x0.toFixed(1)} 2Q${mx.toFixed(1)} ${cy} ${x1.toFixed(1)} 2`;
    for (let j = 1; j <= per; j++) {
      const t = j / (per + 1), x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1, y = (1 - t) * (1 - t) * 2 + 2 * (1 - t) * t * cy + t * t * 2, ci = k++ % FOCOS.length;
      bulbs += `<g transform="translate(${Math.round(x)} ${Math.round(y)})"><g class="bulb" style="--d:${rand(-3, 0).toFixed(2)}s;--t:${rand(1.4, 3).toFixed(2)}s"><g class="bulb-in"><circle class="glow" cx="0" cy="13" r="19" fill="url(#gg${ci})"/><g transform="translate(-9 -1) scale(2)" shape-rendering="crispEdges">${FOCO_PX[ci]}</g></g></g></g>`;
    }
  }
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = defs + `<path class="wire" d="${wire}"/>` + bulbs;
}
buildGarland();
let gTimer; addEventListener('resize', () => { clearTimeout(gTimer); gTimer = setTimeout(buildGarland, 200); }, { passive: true });
byId('garlandSvg')?.addEventListener('pointerdown', e => {
  const b = e.target.closest('.bulb'); if (!b) return;
  b.classList.remove('pop'); void b.getBBox(); b.classList.add('pop'); setTimeout(() => b.classList.remove('pop'), 600);
  siguienteNota();
});

/* ---------- 7. Nieve de fondo, chispas del mouse y trineo ---------- */
const sky = byId('sky'), ctx = sky.getContext('2d');
const copoSuave = (() => { const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(.3, 'rgba(255,255,255,.9)'); gr.addColorStop(.6, 'rgba(255,255,255,.28)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s; })();
const copoCristal = (() => { const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d'); g.translate(32, 32); g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineWidth = 3.4; g.shadowColor = 'rgba(255,255,255,.9)'; g.shadowBlur = 5; for (let i = 0; i < 6; i++) { g.rotate(Math.PI / 3); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -25); g.moveTo(0, -14); g.lineTo(-7, -21); g.moveTo(0, -14); g.lineTo(7, -21); g.moveTo(0, -6); g.lineTo(-4, -10); g.moveTo(0, -6); g.lineTo(4, -10); g.stroke(); } return s; })();
let W = 0, H = 0, dpr = 1, flakes = [], sparks = [];
function sizeSky(){
  dpr = Math.min(1.5, devicePixelRatio || 1); const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
  if (w === W && h === H) return; W = w; H = h; sky.width = W; sky.height = H;
  flakes = Array.from({ length: Math.round(Math.min(90, innerWidth / 15)) }, () => { const z = Math.random(); return { x: Math.random() * W, y: Math.random() * H, z, r: .7 + z * z * 2.4, vy: 12 + z * 34 + rand(0, 8), sw: rand(4, 14), sp: rand(.5, 1.4), ph: rand(0, 6.28), a: .3 + z * .55, c: Math.random() < .2, rot: rand(0, 6.28), vr: rand(-1.2, 1.2) }; });
}
function estrella(x, y, r){ ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, rr = i % 2 ? r * .32 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
function spark(x, y, o = {}){ sparks.push({ x, y, vx: o.vx ?? rand(-30, 30), vy: o.vy ?? rand(-20, 50), life: 0, max: o.max ?? rand(.6, 1.1), r: o.r ?? rand(3, 7), c: o.c ?? (Math.random() < .55 ? '#ffe27a' : '#ffffff'), star: o.star ?? Math.random() < .6 }); }
const sleigh = byId('sleigh'), calma = reduced ? .5 : 1;
let last = 0;
function frame(ts){
  const dt = Math.min(.05, last ? (ts - last) / 1000 : .016) * calma; last = ts; const t = ts / 1000;
  const wind = (Math.sin(t * .17) * 6 + Math.sin(t * .051) * 4) * .6;
  ctx.clearRect(0, 0, W, H);
  for (const p of flakes) {
    p.y += p.vy * dpr * dt; p.x += (wind * (.4 + p.z) + Math.sin(t * p.sp + p.ph) * p.sw) * dpr * dt;
    if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
    if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
    ctx.globalAlpha = p.a;
    if (p.c) { const s = p.r * dpr * 5.2; p.rot += p.vr * dt; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.drawImage(copoCristal, -s / 2, -s / 2, s, s); ctx.restore(); }
    else { const s = p.r * dpr * 2.5; ctx.drawImage(copoSuave, p.x - s / 2, p.y - s / 2, s, s); }
  }
  if (sleigh.classList.contains('fly') && Math.random() < .8) {
    const r = sleigh.getBoundingClientRect();
    if (r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight) spark((r.left + r.width * .1) * dpr, (r.top + r.height * .82) * dpr, { vx: rand(-60, -20), vy: rand(-10, 30), max: rand(.8, 1.4) });
  }
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i]; p.life += dt; if (p.life > p.max) { sparks.splice(i, 1); continue; }
    p.vy += 60 * dt; p.x += p.vx * dt * dpr; p.y += p.vy * dt * dpr; const k = 1 - p.life / p.max;
    ctx.globalAlpha = k; ctx.fillStyle = p.c;
    if (p.star) estrella(p.x, p.y, p.r * dpr * (.6 + k * .6)); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * dpr * .35, 0, 6.283); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(frame);
}
sizeSky(); addEventListener('resize', sizeSky, { passive: true });
requestAnimationFrame(frame);

// Papá Noel cruza el cielo cada ~30 segundos; si lo tocas, suenan cascabeles
function volar(){ if (document.hidden || sleigh.classList.contains('fly')) return; void sleigh.offsetWidth; sleigh.classList.add('fly'); }
sleigh.addEventListener('animationend', e => { if (e.animationName === 'volar') sleigh.classList.remove('fly'); });
sleigh.addEventListener('click', () => {
  cascabeles(); toast('¡Jo, jo, jo! 🎅 ¡Feliz Navidad!');
  const r = sleigh.getBoundingClientRect();
  for (let i = 0; i < 30; i++) spark((r.left + r.width * .3) * dpr, (r.top + r.height * .5) * dpr, { vx: rand(-200, 200), vy: rand(-220, 60), max: rand(.8, 1.5), r: rand(4, 8) });
});
setTimeout(volar, 4000); setInterval(volar, 40000);

/* ---------- 8. Las 20 tarjetas (se generan desde esta lista) ---------- */
const TARJETAS = [
  [2001, 'navidad_magica', 'Navidad Mágica'], [2002, 'navidad_dorada', 'Navidad Dorada'], [2003, 'feliz_navidad_pueblo', 'Feliz Navidad Gamer'],
  [2004, 'feliz_navidad_aldea', 'Aldea Nevada'], [2005, 'feliz_navidad_aldea2', 'Noche de Regalos'], [2006, 'aldea_regalo', 'Regalo Mágico'],
  [2007, 'jengibre', 'Dulce Jengibre'], [2008, 'reno', 'Reno Navideño'], [2009, 'muneco', 'Muñeco de Nieve'], [2010, 'gamer', 'Aventura Gamer'],
  [2011, 'feliz_navidad_nieve', 'Navidad de Fantasía'], [2012, 'navidad_nieve', 'Navidad de Nieve'], [2013, 'dulce_navidad', 'Dulce Navidad'],
  [2014, 'reno_alegria', 'Reno de la Alegría'], [2015, 'navidad_gigante', 'Navidad Gigante'], [2016, 'magia_traviesa', 'Magia Traviesa'],
  [2017, 'brisa_invierno', 'Brisa de Invierno'], [2018, 'noche_esperanza', 'Noche de Esperanza'], [2019, 'regalo_villa', 'Regalo de la Villa'],
  [2020, 'aventura_2', 'Aventura en la Nieve']
];
const grid = byId('cardsGrid');
const VISIBLES = 8; // al inicio se ven 8; el botón "Ver las 20" muestra el resto
if (grid) grid.innerHTML = TARJETAS.map(([id, slug, name], i) => `
  <button type="button" class="card${i >= VISIBLES ? ' is-extra' : ''}" data-g20-view="${id}" data-reveal aria-label="Ver y personalizar ${name}">
    <span class="card-photo"><img src="gamer20/miniaturas/${slug}.webp" alt="" loading="lazy">
      <span class="card-num">${String(i + 1).padStart(2, '0')}</span><span class="card-price" data-price="${id}">Bs 22</span>
      <span class="card-play">▶ Verla en movimiento</span></span>
    <span class="card-name">${name}</span>
    <span class="card-cta">Personalizar →</span>
  </button>`).join('');
const moreCards = byId('cardsMore');
moreCards?.addEventListener('click', () => {
  const open = grid.classList.toggle('show-all');
  grid.querySelectorAll('.is-extra').forEach(c => c.classList.add('is-visible'));
  moreCards.textContent = open ? 'Ver menos ↑' : 'Ver las 20 tarjetas ↓';
  moreCards.setAttribute('aria-expanded', String(open));
  if (!open) byId('tarjetas').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});

// Precios reales del catálogo (del servidor si está activo; si no, de la copia local)
function fillPrices(){
  const list = (typeof state !== 'undefined' && state.products && state.products.length) ? state.products : (window.SCALA_CATALOG || []);
  if (!list.length) return;
  document.querySelectorAll('[data-price]').forEach(n => { const p = list.find(x => x.id === Number(n.dataset.price)); if (p && p.price) n.textContent = 'Bs ' + Math.round(p.price); });
  const live = list.find(x => x.id === 2001), prices = list.map(x => Number(x.price)).filter(x => x > 0);
  if (live && live.price) { const t = 'Bs ' + Math.round(live.price); put('heroPrice', t); put('livePrice', t); put('liveCount', t); }
  if (prices.length) put('minPrice', 'Bs ' + Math.round(Math.min(...prices)));
}
fillPrices(); setTimeout(fillPrices, 1500); setTimeout(fillPrices, 5000);

/* ---------- 9. El regalo de la portada se abre ---------- */
const heroWrap = byId('heroWrap'), heroRewrap = byId('heroRewrap');
let heroTimer = 0;
heroWrap?.addEventListener('click', () => {
  heroWrap.classList.add('opening'); cascabeles(); byId('heroCaption')?.classList.add('hide');
  const r = heroWrap.getBoundingClientRect();
  for (let i = 0; i < 46; i++) spark((r.left + r.width / 2) * dpr, (r.top + r.height * .4) * dpr, { vx: rand(-260, 260), vy: rand(-300, 40), max: rand(.9, 1.7), r: rand(4, 9), c: ['#ffd23f', '#ffffff', '#ff5a6a', '#6fd394'][i % 4] });
  clearTimeout(heroTimer); heroTimer = setTimeout(() => { heroWrap.classList.add('gone'); heroRewrap.hidden = false; }, 1500);
});
heroRewrap?.addEventListener('click', () => {
  clearTimeout(heroTimer); heroWrap.classList.remove('gone'); void heroWrap.offsetWidth; heroWrap.classList.remove('opening'); heroRewrap.hidden = true;
  byId('heroCaption')?.classList.remove('hide');
});

/* ---------- 13. Barra "Elegir mi tarjeta" en celulares (aparece al bajar de la portada) ---------- */
const bar = byId('mobileBar'), portada = byId('portada');
if (bar && portada && 'IntersectionObserver' in window) {
  new IntersectionObserver(([en]) => bar.classList.toggle('show', !en.isIntersecting), { threshold: 0 }).observe(portada);
}

/* ---------- 14. El enlace al panel del vendedor solo se ve en tu computadora ---------- */
if (['localhost', '127.0.0.1', ''].includes(location.hostname)) document.querySelectorAll('[data-local-only]').forEach(n => n.hidden = false);

/* ---------- 10. Menú que marca la sección visible ---------- */
const links = [...document.querySelectorAll('.nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    for (const en of entries) if (en.isIntersecting) links.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
  }, { rootMargin: '-45% 0px -50% 0px' });
  links.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) io.observe(s); });

  /* ---------- 11. Las secciones aparecen suave al bajar ---------- */
  const rv = new IntersectionObserver(entries => { for (const en of entries) if (en.isIntersecting) { en.target.classList.add('is-visible'); rv.unobserve(en.target); } }, { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => rv.observe(el));
} else document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));

/* ---------- 12. El carrito salta cuando agregas una tarjeta ---------- */
const count = byId('cartCount'), cartBtn = byId('openCart');
if (count && cartBtn && 'MutationObserver' in window) {
  let last = count.textContent;
  new MutationObserver(() => { if (Number(count.textContent) > Number(last)) { cartBtn.classList.remove('bump'); void cartBtn.offsetWidth; cartBtn.classList.add('bump'); } last = count.textContent; }).observe(count, { childList: true, characterData: true, subtree: true });
}
})();
