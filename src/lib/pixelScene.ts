/**
 * 程序化 320×224（MVS 原生解析度）點陣場景產生器。
 * 在尚未放入真實截圖前作為「示意畫面」使用 —— 每款遊戲依 slug 產生固定且不同的畫面。
 * 這些都是原創抽象圖形，不包含任何遊戲的實際美術資產。
 */
export type SceneKind = 'fight' | 'shmup-v' | 'shmup-h' | 'run' | 'puzzle' | 'sports' | 'race';

export function sceneKindFor(genre: string, subgenre: string): SceneKind {
  if (genre === 'fighting') return 'fight';
  if (genre === 'action') {
    if (/縱向|對戰射擊/.test(subgenre)) return 'shmup-v';
    if (/橫向射擊|斜角/.test(subgenre)) return 'shmup-h';
    return 'run';
  }
  if (/益智/.test(subgenre)) return 'puzzle';
  if (/賽車|賽馬/.test(subgenre)) return 'race';
  return 'sports';
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PALETTES = [
  { sky: ['#0b1446', '#1a2f7a', '#3557b8', '#e88a4a'], far: '#141a3a', ground: '#3a2416', ink: '#0a0a14' }, // dusk
  { sky: ['#14061f', '#33104d', '#6d1f7a', '#d9457a'], far: '#1b0a26', ground: '#2a1a2e', ink: '#08040c' }, // neon night
  { sky: ['#03060c', '#0b1a28', '#173548', '#3d6f80'], far: '#06101a', ground: '#1d2a2a', ink: '#020406' }, // harbour
  { sky: ['#1f0505', '#4d0f0f', '#962a18', '#efa030'], far: '#260808', ground: '#3d1a0a', ink: '#100202' }, // fire
  { sky: ['#06210f', '#0f4428', '#2a7a4a', '#a6d27a'], far: '#08200f', ground: '#2c3a14', ink: '#030a05' }, // jungle
  { sky: ['#2b5fb0', '#4f88d4', '#8cbde8', '#f2e3b3'], far: '#3d5a7a', ground: '#7a5a32', ink: '#1a1208' }, // daylight
];
const HEROES = [
  ['#ffffff', '#e4202a'], ['#ffd200', '#1a1a1a'], ['#e4202a', '#ffd200'],
  ['#3aa0ff', '#ffffff'], ['#7a3cff', '#ffd200'], ['#2fae4a', '#111'],
];
const BUBBLES = ['#e4202a', '#ffd200', '#2fae4a', '#2f7bff', '#d14dff', '#ff8a1f'];

const W = 320, H = 224;
const FONT = `font-family="'Press Start 2P',monospace"`;

export function pixelScene(slug: string, kind: SceneKind): string {
  const R = rng(hash(slug));
  const ri = (a: number, b: number) => Math.floor(a + R() * (b - a + 1));
  const pick = <T,>(arr: T[]) => arr[Math.floor(R() * arr.length)];
  const pal = PALETTES[hash(slug) % PALETTES.length];
  const out: string[] = [];
  const rect = (x: number, y: number, w: number, h: number, fill: string, extra = '') => {
    if (w < 0) { x += w; w = -w; }
    out.push(`<rect x="${x | 0}" y="${y | 0}" width="${Math.max(1, w | 0)}" height="${Math.max(1, h | 0)}" fill="${fill}"${extra}/>`);
  };
  const text = (x: number, y: number, s: string, fill = '#fff', size = 8, anchor = 'start') =>
    out.push(`<text x="${x}" y="${y}" ${FONT} font-size="${size}" fill="${fill}" text-anchor="${anchor}">${s}</text>`);
  const skyBands = (top: number, bottom: number) => {
    const n = 8, h = (bottom - top) / n;
    for (let i = 0; i < n; i++) {
      const c = pal.sky[Math.min(pal.sky.length - 1, Math.floor((i / n) * pal.sky.length))];
      rect(0, top + i * h, W, h + 1, c);
      // 抖動過渡（dither）
      if (i % 2 === 1) {
        const nc = pal.sky[Math.min(pal.sky.length - 1, Math.floor(((i + 1) / n) * pal.sky.length))];
        for (let x = 0; x < W; x += 4) rect(x + ((i * 2) % 4), top + (i + 1) * h - 2, 2, 2, nc);
      }
    }
  };
  const stars = (n: number, maxY = H) => {
    for (let i = 0; i < n; i++) rect(ri(0, W), ri(0, maxY), R() > 0.85 ? 2 : 1, R() > 0.85 ? 2 : 1, R() > 0.7 ? '#ffd200' : '#cfd8ff');
  };
  const boom = (cx: number, cy: number, r: number) => {
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e4202a"/>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="#ff8a1f"/>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="#ffd200"/>`);
    out.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.15}" fill="#fff"/>`);
  };
  const score = () => {
    text(8, 14, '1UP', '#ffd200');
    text(40, 14, String(ri(1, 99) * 1000).padStart(7, '0'));
    text(312, 14, 'HI ' + String(ri(100, 999) * 1000).padStart(7, '0'), '#fff', 8, 'end');
  };

  out.push(`<rect width="${W}" height="${H}" fill="${pal.ink}"/>`);

  if (kind === 'fight') {
    skyBands(0, 150);
    out.push(`<circle cx="${ri(40, 280)}" cy="${ri(30, 60)}" r="${ri(10, 18)}" fill="${pal.sky[3]}" opacity=".9"/>`);
    // 城市剪影
    for (let x = -4; x < W; ) {
      const w = ri(14, 36), h = ri(30, 96);
      rect(x, 150 - h, w, h, pal.far);
      for (let wy = 150 - h + 6; wy < 146; wy += 8)
        for (let wx = x + 3; wx < x + w - 3; wx += 6) if (R() > 0.62) rect(wx, wy, 2, 3, '#ffd200', ' opacity=".75"');
      x += w + ri(0, 4);
    }
    // 地板與透視線
    rect(0, 150, W, 74, pal.ground);
    for (let i = 0; i < 7; i++) rect(0, 150 + i * i * 1.6, W, 1, '#000', ' opacity=".35"');
    for (let i = -8; i <= 8; i++)
      out.push(`<line x1="${160 + i * 10}" y1="150" x2="${160 + i * 48}" y2="224" stroke="#000" stroke-opacity=".3"/>`);
    // 角色
    const fighter = (x: number, f: 1 | -1, col: string[], pose: number) => {
      const y = 200;
      out.push(`<ellipse cx="${x}" cy="${y + 2}" rx="20" ry="4" fill="#000" opacity=".45"/>`);
      rect(x - 9, y - 38, 7, 38, '#1a1a2a'); // legs
      rect(x + 2, y - 38, 7, 38, '#1a1a2a');
      if (pose === 1) rect(x + 2 * f, y - 40, 30 * f, 7, '#1a1a2a'); // kick
      rect(x - 11, y - 70, 22, 34, col[0]); // torso
      rect(x - 11, y - 42, 22, 5, col[1]); // belt
      rect(x - 6, y - 84, 12, 14, '#f0c8a0'); // head
      rect(x - 7, y - 88, 14, 6, '#2a1a10'); // hair
      rect(x - 7, y - 81, 14, 2, col[1]); // headband
      rect(x + 10 * f, y - 66, 22 * f, 6, col[0]); // punch arm
      rect(x + 31 * f, y - 67, 6 * f, 8, '#f0c8a0');
      rect(x - 12 * f, y - 64, -6 * f, 18, col[0]);
    };
    const [c1, c2] = [pick(HEROES), pick(HEROES)];
    fighter(110, 1, c1, ri(0, 1));
    fighter(210, -1, c2, 0);
    if (R() > 0.4) boom(150, 132, 9);
    // HUD
    const hp1 = ri(40, 118), hp2 = ri(40, 118);
    rect(10, 22, 122, 10, '#fff'); rect(11, 23, 120, 8, '#e4202a'); rect(131 - hp1, 23, hp1, 8, '#ffd200');
    rect(188, 22, 122, 10, '#fff'); rect(189, 23, 120, 8, '#e4202a'); rect(189, 23, hp2, 8, '#ffd200');
    rect(146, 16, 28, 22, '#000'); rect(147, 17, 26, 20, '#005bac');
    text(160, 32, String(ri(10, 99)), '#fff', 10, 'middle');
    text(10, 44, 'P1', '#ffd200'); text(310, 44, 'P2', '#ffd200', 8, 'end');
    text(160, 218, 'CREDIT 01', '#fff', 6, 'middle');
  } else if (kind === 'shmup-v' || kind === 'shmup-h') {
    stars(90);
    out.push(`<circle cx="${ri(40, 280)}" cy="${ri(40, 140)}" r="${ri(20, 46)}" fill="${pal.sky[2]}" opacity=".55"/>`);
    const vertical = kind === 'shmup-v';
    const ship = (x: number, y: number, c: string, dir: 'up' | 'right' | 'down' | 'left') => {
      const p = (dx: number, dy: number, w: number, h: number, fill: string) => {
        if (dir === 'up') rect(x + dx, y + dy, w, h, fill);
        else if (dir === 'down') rect(x + dx, y - dy - h, w, h, fill);
        else if (dir === 'right') rect(x - dy - h, y + dx, h, w, fill);
        else rect(x + dy, y + dx, h, w, fill);
      };
      p(-2, -12, 4, 22, '#fff'); p(-10, 0, 20, 6, c); p(-4, -6, 8, 8, c); p(-1, -8, 2, 4, '#3aa0ff'); p(-6, 8, 3, 4, '#ff8a1f'); p(3, 8, 3, 4, '#ff8a1f');
    };
    if (vertical) {
      ship(160, 190, '#e4202a', 'up');
      for (let i = 0; i < 6; i++) rect(158 + (i % 2) * 4 - 2, 170 - i * 18, 2, 8, '#ffd200');
      for (let i = 0; i < 7; i++) ship(ri(30, 290), ri(30, 120), pick(['#2fae4a', '#7a3cff', '#3aa0ff']), 'down');
      for (let i = 0; i < 26; i++) out.push(`<circle cx="${ri(20, 300)}" cy="${ri(40, 170)}" r="2" fill="#ff5fa0"/>`);
    } else {
      ship(64, 112, '#e4202a', 'right');
      for (let i = 0; i < 7; i++) rect(84 + i * 22, 111, 10, 2, '#ffd200');
      for (let i = 0; i < 7; i++) ship(ri(180, 300), ri(30, 200), pick(['#2fae4a', '#7a3cff', '#3aa0ff']), 'left');
      // 地形
      for (let x = 0; x < W; x += 8) rect(x, 210 - (Math.sin(x / 23) * 6 + 6), 8, 30, pal.far);
    }
    if (R() > 0.3) boom(ri(140, 260), ri(50, 140), ri(8, 14));
    score();
  } else if (kind === 'run') {
    skyBands(0, 176);
    // 山脈層
    const ridge = (base: number, amp: number, col: string) => {
      let d = `M0 ${base}`;
      for (let x = 0; x <= W; x += 16) d += ` L${x} ${base - ri(0, amp)}`;
      out.push(`<path d="${d} L${W} 176 L0 176Z" fill="${col}"/>`);
    };
    ridge(120, 40, pal.far);
    ridge(150, 26, pal.ink);
    // 地面磚塊
    for (let x = 0; x < W; x += 16) {
      rect(x, 176, 16, 48, pal.ground);
      rect(x, 176, 16, 3, '#000', ' opacity=".35"');
      rect(x + 15, 176, 1, 48, '#000', ' opacity=".3"');
    }
    // 箱子
    for (let i = 0; i < 3; i++) { const x = ri(130, 300); rect(x, 160, 16, 16, '#8a5a2a'); rect(x + 2, 162, 12, 12, '#a8743a'); rect(x + 7, 160, 2, 16, '#5a3a1a'); }
    // 士兵
    const soldier = (x: number, f: 1 | -1, body: string) => {
      rect(x - 4, 166, 3, 10, '#1a1a2a'); rect(x + 1, 166, 3, 10, '#1a1a2a');
      rect(x - 5, 152, 10, 14, body); rect(x - 4, 144, 8, 8, '#f0c8a0'); rect(x - 5, 142, 10, 3, body);
      rect(x + 3 * f, 155, 12 * f, 3, '#333');
    };
    soldier(70, 1, '#3a6aa8');
    for (let i = 0; i < 4; i++) soldier(ri(170, 300), -1, '#6a7a3a');
    for (let i = 0; i < 6; i++) rect(88 + i * 16, 156, 6, 2, '#ffd200');
    boom(ri(200, 280), ri(130, 160), ri(10, 18));
    score();
    text(8, 214, 'ARMS', '#ffd200', 6); text(40, 214, 'INF', '#fff', 6); text(66, 214, 'BOMB ' + ri(5, 10), '#fff', 6);
  } else if (kind === 'puzzle') {
    for (let y = 0; y < H; y += 16) for (let x = 0; x < W; x += 16) rect(x, y, 16, 16, ((x + y) / 16) % 2 ? pal.far : pal.ink);
    rect(92, 8, 136, 212, '#ffd200'); rect(96, 12, 128, 204, '#05070d');
    const rows = ri(5, 8);
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < 8 - (r % 2); c++) {
        if (r > 3 && R() > 0.55) continue;
        const cx = 104 + c * 16 + (r % 2) * 8, cy = 20 + r * 14;
        const col = pick(BUBBLES);
        out.push(`<circle cx="${cx}" cy="${cy}" r="7" fill="${col}"/>`);
        rect(cx - 4, cy - 5, 3, 3, '#fff', ' opacity=".7"');
      }
    // 發射器
    const ang = (ri(-55, 55) * Math.PI) / 180;
    out.push(`<line x1="160" y1="200" x2="${160 + Math.sin(ang) * 40}" y2="${200 - Math.cos(ang) * 40}" stroke="#fff" stroke-width="3"/>`);
    out.push(`<circle cx="160" cy="200" r="7" fill="${pick(BUBBLES)}"/>`);
    rect(96, 168, 128, 1, '#e4202a', ' opacity=".7"');
    text(46, 30, 'SCORE', '#ffd200', 8, 'middle'); text(46, 44, String(ri(10, 999) * 10), '#fff', 8, 'middle');
    text(274, 30, 'ROUND', '#ffd200', 8, 'middle'); text(274, 44, String(ri(1, 30)), '#fff', 8, 'middle');
  } else if (kind === 'sports') {
    const g1 = pick(['#1f7a3a', '#2a8a3a', '#2f6aa8', '#a85a2a']);
    rect(0, 0, W, H, g1);
    for (let y = 0; y < H; y += 28) rect(0, y, W, 14, '#000', ' opacity=".12"');
    out.push(`<rect x="16" y="28" width="288" height="180" fill="none" stroke="#fff" stroke-width="2"/>`);
    out.push(`<line x1="160" y1="28" x2="160" y2="208" stroke="#fff" stroke-width="2"/>`);
    out.push(`<circle cx="160" cy="118" r="26" fill="none" stroke="#fff" stroke-width="2"/>`);
    out.push(`<rect x="16" y="82" width="34" height="72" fill="none" stroke="#fff" stroke-width="2"/>`);
    out.push(`<rect x="270" y="82" width="34" height="72" fill="none" stroke="#fff" stroke-width="2"/>`);
    const player = (x: number, y: number, c: string) => { out.push(`<ellipse cx="${x}" cy="${y + 9}" rx="6" ry="2" fill="#000" opacity=".4"/>`); rect(x - 3, y - 6, 6, 12, c); rect(x - 2, y - 10, 4, 4, '#f0c8a0'); };
    for (let i = 0; i < 5; i++) player(ri(40, 150), ri(40, 200), '#e4202a');
    for (let i = 0; i < 5; i++) player(ri(170, 290), ri(40, 200), '#ffd200');
    out.push(`<circle cx="${ri(120, 200)}" cy="${ri(80, 160)}" r="4" fill="#fff" stroke="#000"/>`);
    rect(0, 0, W, 20, '#000', ' opacity=".7"');
    text(8, 14, 'TIME ' + ri(10, 89) + ':00', '#ffd200');
    text(312, 14, `${ri(0, 4)} - ${ri(0, 4)}`, '#fff', 8, 'end');
  } else {
    // race
    skyBands(0, 120);
    let d = 'M0 120';
    for (let x = 0; x <= W; x += 20) d += ` L${x} ${120 - ri(4, 30)}`;
    out.push(`<path d="${d} L${W} 120Z" fill="${pal.far}"/>`);
    rect(0, 120, W, 104, '#3a7a2a');
    for (let i = 0; i < 12; i++) {
      const t0 = i / 12, t1 = (i + 1) / 12;
      const y0 = 120 + t0 * t0 * 104, y1 = 120 + t1 * t1 * 104;
      const hw0 = 10 + t0 * t0 * 150, hw1 = 10 + t1 * t1 * 150;
      out.push(`<polygon points="${160 - hw0},${y0} ${160 + hw0},${y0} ${160 + hw1},${y1} ${160 - hw1},${y1}" fill="${i % 2 ? '#444' : '#4d4d4d'}"/>`);
      out.push(`<polygon points="${160 - hw0 - 4 - t0 * 12},${y0} ${160 - hw0},${y0} ${160 - hw1},${y1} ${160 - hw1 - 4 - t1 * 12},${y1}" fill="${i % 2 ? '#e4202a' : '#fff'}"/>`);
      out.push(`<polygon points="${160 + hw0},${y0} ${160 + hw0 + 4 + t0 * 12},${y0} ${160 + hw1 + 4 + t1 * 12},${y1} ${160 + hw1},${y1}" fill="${i % 2 ? '#e4202a' : '#fff'}"/>`);
      if (i % 2) rect(159 - t1 * 2, y0, 2 + t1 * 4, y1 - y0, '#ffd200');
    }
    const car = (x: number, y: number, c: string) => { rect(x - 22, y, 44, 14, c); rect(x - 14, y - 8, 28, 8, '#111'); rect(x - 24, y + 10, 10, 8, '#000'); rect(x + 14, y + 10, 10, 8, '#000'); rect(x - 20, y + 3, 6, 3, '#ffd200'); rect(x + 14, y + 3, 6, 3, '#ffd200'); };
    car(ri(120, 200), 140, '#2f7bff');
    car(160, 186, '#e4202a');
    rect(0, 0, W, 20, '#000', ' opacity=".6"');
    text(8, 14, 'LAP ' + ri(1, 3) + '/3', '#ffd200');
    text(312, 14, ri(180, 320) + ' KM/H', '#fff', 8, 'end');
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges" preserveAspectRatio="xMidYMid slice" role="img">${out.join('')}</svg>`;
}
