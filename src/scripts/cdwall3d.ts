/**
 * 首頁 CD 封面牆（three.js）
 * - 125 張 Neo Geo CD 封面（無 CD 版者用 AES 封面裁方）隨機拼貼在一面環形內彎牆上；精選遊戲佔 2×2 大格
 * - 全部封面合成一張 atlas，以 InstancedMesh + 自訂 shader 一次繪製（先載 64px 低解析度，再換 256px）
 * - 拖曳旋轉（慣性）、懸停浮起、類型 / 開發商篩選亮燈、閒置光波與 attract mode
 * - 點擊：CD 盒由牆上飛出 → 轉正 → 光碟從盒中滑出旋轉；旁邊 CRT 螢幕播放遊戲畫面
 * - 鍵盤：←/→、Enter、Esc、A/B/C/D、5 投幣
 */
import * as THREE from 'three';
import { play, soundOn } from './sfx';

export interface WallGame {
  id: string; title: string; zh?: string; year: number; dev: string; devKey: string; genre: string;
  href: string; snap: string; cd: string; tile: number; big: boolean;
}
interface AtlasMeta { cols: number; rows: number; logo: number; hi: string; lo: string }

const ROWS = 6, CELL = 1, GAP = 0.1, CAM_Z = 3.2, MAX_BIG = 12;

const COVER_VERT = /* glsl */ `
  attribute float aTile; attribute float aDim; attribute float aHover;
  uniform float uCols; uniform float uRows;
  varying vec2 vUv; varying vec2 vLocal; varying float vDim; varying float vHover; varying vec3 vWorld;
  void main() {
    float col = mod(aTile, uCols); float row = floor(aTile / uCols);
    vUv = vec2((col + uv.x) / uCols, 1.0 - (row + 1.0 - uv.y) / uRows);
    vLocal = uv; vDim = aDim; vHover = aHover;
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;
const COVER_FRAG = /* glsl */ `
  uniform sampler2D uAtlas; uniform float uTime; uniform float uWave; uniform float uGlobal;
  varying vec2 vUv; varying vec2 vLocal; varying float vDim; varying float vHover; varying vec3 vWorld;
  void main() {
    vec3 c = texture2D(uAtlas, vUv).rgb;
    float e = min(min(vLocal.x, 1.0 - vLocal.x), min(vLocal.y, 1.0 - vLocal.y));
    c = mix(vec3(0.015), c, smoothstep(0.0, 0.022, e));                        // 盒邊
    float d = vLocal.x + vLocal.y - 1.25 - 0.35 * sin(uTime * 0.25 + vWorld.x * 0.3);
    float sheen = (1.0 - smoothstep(0.0, 0.18, abs(d))) * 0.10;                // 透明盒反光
    float ang = atan(vWorld.x, -vWorld.z);
    float da = mod(ang - uWave + 3.14159, 6.28318) - 3.14159;
    float wave = exp(-da * da * 14.0) * 0.16;
    c *= mix(1.0, 0.16, vDim) * uGlobal;
    c += (sheen + wave * (1.0 - vDim)) * uGlobal + vHover * 0.10;
    gl_FragColor = vec4(c, 1.0);
  }
`;
const ART_VERT = /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const ART_FRAG = /* glsl */ `
  uniform sampler2D map; uniform vec4 rect; varying vec2 vUv;
  void main() { gl_FragColor = vec4(texture2D(map, rect.xy + vUv * rect.zw).rgb, 1.0); }
`;
const DISC_FRAG = /* glsl */ `
  uniform sampler2D map; uniform vec4 rect; uniform float uTime; varying vec2 vUv;
  vec3 hue(float h) { return clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0); }
  void main() {
    vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
    if (r > 1.0 || r < 0.075) discard;
    vec3 rainbow = hue(fract(a / 6.28318 * 2.0 + r * 1.5 + uTime * 0.05));
    vec3 silver = vec3(0.78, 0.8, 0.84) + 0.12 * sin(a * 2.0 + uTime);
    vec3 data = mix(silver, rainbow, 0.45);
    vec3 col;
    if (r < 0.2) col = mix(vec3(0.25), vec3(0.55), smoothstep(0.075, 0.2, r));          // 透明內環
    else if (r < 0.93) {                                                                  // 印刷標籤 = 封面
      vec2 uv = clamp(vUv, 0.0, 1.0);
      col = texture2D(map, rect.xy + uv * rect.zw).rgb;
      col = mix(col, data, 0.12 + 0.1 * smoothstep(0.85, 0.93, r));
    } else col = data;                                                                    // 外圈資料面
    col *= 1.0 - smoothstep(0.985, 1.0, r) * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`;
const CRT_FRAG = /* glsl */ `
  uniform sampler2D map; uniform float time; uniform float power; uniform float hasMap; varying vec2 vUv;
  vec2 barrel(vec2 uv) { vec2 c = uv * 2.0 - 1.0; c *= 1.0 + dot(c, c) * 0.07; return c * 0.5 + 0.5; }
  void main() {
    vec2 uv = barrel(vUv); float p = clamp(power, 0.0, 1.0);
    uv.y = (uv.y - 0.5) / mix(0.006, 1.0, smoothstep(0.25, 0.75, p)) + 0.5;
    uv.x = (uv.x - 0.5) / max(smoothstep(0.0, 0.25, p), 0.001) + 0.5;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }
    vec3 col = vec3(texture2D(map, uv + vec2(0.0018, 0.0)).r, texture2D(map, uv).g, texture2D(map, uv - vec2(0.0018, 0.0)).b);
    col = mix(vec3(0.02, 0.03, 0.06), col, hasMap);
    col *= 0.72 + 0.28 * sin(uv.y * 224.0 * 6.28318);
    float m = mod(gl_FragCoord.x, 3.0);
    col *= vec3(m < 1.0 ? 1.12 : 0.9, (m >= 1.0 && m < 2.0) ? 1.12 : 0.9, m >= 2.0 ? 1.12 : 0.9);
    vec2 d = vUv - 0.5; col *= 1.0 - dot(d, d) * 1.6;
    col += (1.0 - smoothstep(0.55, 1.0, p)) * 0.9;
    col *= 0.965 + 0.035 * sin(time * 50.0 + uv.y * 4.0);
    gl_FragColor = vec4(col * 1.2, 1.0);
  }
`;

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function shuffle<T>(a: T[]) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function mountCdWall(root: HTMLElement): (() => void) | null {
  const games: WallGame[] = JSON.parse(root.dataset.games || '[]');
  const atlas: AtlasMeta = JSON.parse(root.dataset.atlas || '{}');
  const host = root.querySelector<HTMLElement>('[data-stage]')!;
  const tip = root.querySelector<HTMLElement>('[data-tip]');
  const loadingEl = root.querySelector<HTMLElement>('[data-loading]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!games.length) return null;

  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' }); } catch { return null; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const el = renderer.domElement;
  Object.assign(el.style, { width: '100%', height: '100%', display: 'block', touchAction: 'pan-y', cursor: 'grab' });
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', '互動 3D CD 封面牆：拖曳旋轉，點擊 CD 抽出');
  host.appendChild(el);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.Fog(0x000000, 6, 14);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.05, 60);
  camera.position.set(0, 0, CAM_Z);
  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(o: T) => (disposables.push(o), o);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const keyL = new THREE.DirectionalLight(0xffffff, 1.6);
  keyL.position.set(1, 2, 4);
  const blueL = new THREE.PointLight(0x2f86e0, 6, 8, 1.5);
  blueL.position.set(-2, -1.5, 1.5);
  const redL = new THREE.PointLight(0xff2a2a, 5, 8, 1.5);
  redL.position.set(2.2, 1.6, 1.2);
  scene.add(keyL, blueL, redL);

  // ---------- 載入 ----------
  const manager = new THREE.LoadingManager();
  manager.onProgress = (_u, d, t) => { if (loadingEl) loadingEl.textContent = `LOADING ${String(Math.round((d / t) * 100)).padStart(3, '0')}%`; };
  manager.onLoad = () => loadingEl?.classList.add('opacity-0');
  const loader = new THREE.TextureLoader(manager);
  const rawTex = (t: THREE.Texture) => { t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 4; return track(t); };
  const atlasLo = rawTex(loader.load(atlas.lo));
  let atlasHi: THREE.Texture | null = null;

  // ---------- 拼貼排版 ----------
  const featured = shuffle(games.map((g, i) => (g.big ? i : -1)).filter((i) => i >= 0)).slice(0, MAX_BIG);
  let cols = Math.ceil((games.length + featured.length * 3) / ROWS);
  type Slot = { game: number; tile: number; r: number; c: number; big: boolean };
  let slots: Slot[] = [];
  for (let attempt = 0; attempt < 20; attempt++) {
    const occ = Array.from({ length: ROWS }, () => new Array(cols).fill(-1));
    slots = [];
    const bigs: number[] = [];
    for (const gi of featured) {
      let placed = false;
      for (let k = 0; k < 200 && !placed; k++) {
        const r = Math.floor(Math.random() * (ROWS - 1)), c = Math.floor(Math.random() * (cols - 1));
        if (occ[r][c] < 0 && occ[r + 1][c] < 0 && occ[r][c + 1] < 0 && occ[r + 1][c + 1] < 0) {
          occ[r][c] = occ[r + 1][c] = occ[r][c + 1] = occ[r + 1][c + 1] = slots.length;
          slots.push({ game: gi, tile: games[gi].tile, r, c, big: true });
          bigs.push(gi);
          placed = true;
        }
      }
    }
    const singles = shuffle(games.map((_, i) => i).filter((i) => !bigs.includes(i)));
    const free: [number, number][] = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < cols; c++) if (occ[r][c] < 0) free.push([r, c]);
    if (free.length < singles.length) { cols++; continue; }
    shuffle(free).forEach(([r, c], k) => {
      const gi = k < singles.length ? singles[k] : -1;
      slots.push({ game: gi, tile: gi >= 0 ? games[gi].tile : atlas.logo, r, c, big: false });
    });
    break;
  }
  const S = slots.length;
  const RW = (cols * CELL) / (Math.PI * 2);
  const cellAng = (Math.PI * 2) / cols;

  const wall = new THREE.Group();
  scene.add(wall);
  const base: THREE.Matrix4[] = [];
  const slotAngle: number[] = [];
  const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpV = new THREE.Vector3(), tmpS = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
  slots.forEach((s) => {
    const span = s.big ? 2 : 1;
    const theta = (s.c + span / 2) * cellAng;
    const y = (ROWS / 2 - s.r - span / 2) * CELL;
    const rad = RW - (s.big ? 0.06 : 0);
    const pos = new THREE.Vector3(Math.sin(theta) * rad, y, -Math.cos(theta) * rad);
    const q = new THREE.Quaternion().setFromAxisAngle(up, -theta);
    const size = span * CELL - GAP;
    base.push(new THREE.Matrix4().compose(pos, q, new THREE.Vector3(size, size, size)));
    slotAngle.push(theta);
  });

  const coverGeo = track(new THREE.PlaneGeometry(1, 1));
  const aTile = new Float32Array(S), aDim = new Float32Array(S), aHover = new Float32Array(S);
  slots.forEach((s, i) => { aTile[i] = s.tile; aDim[i] = s.game < 0 ? 0.55 : 0; });
  coverGeo.setAttribute('aTile', new THREE.InstancedBufferAttribute(aTile, 1));
  const dimAttr = new THREE.InstancedBufferAttribute(aDim, 1);
  const hovAttr = new THREE.InstancedBufferAttribute(aHover, 1);
  coverGeo.setAttribute('aDim', dimAttr);
  coverGeo.setAttribute('aHover', hovAttr);
  const coverMat = track(new THREE.ShaderMaterial({
    uniforms: { uAtlas: { value: atlasLo }, uCols: { value: atlas.cols }, uRows: { value: atlas.rows }, uTime: { value: 0 }, uWave: { value: 0 }, uGlobal: { value: 1 } },
    vertexShader: COVER_VERT, fragmentShader: COVER_FRAG,
  }));
  const covers = new THREE.InstancedMesh(coverGeo, coverMat, S);
  const caseGeo = track(new THREE.BoxGeometry(1, 1, 0.09));
  const caseMat = track(new THREE.MeshStandardMaterial({ color: 0x0a0a0d, metalness: 0.4, roughness: 0.35 }));
  const cases = new THREE.InstancedMesh(caseGeo, caseMat, S);
  wall.add(cases, covers);
  const front = new THREE.Matrix4().makeTranslation(0, 0, 0.0465);
  const back = new THREE.Matrix4().makeTranslation(0, 0, 0);
  const hoverAnim = new Float32Array(S);
  const hidden = new Uint8Array(S);
  const writeMatrix = (i: number) => {
    const h = hoverAnim[i];
    tmpM.copy(base[i]);
    if (h > 0.001 || hidden[i]) {
      tmpM.decompose(tmpV, tmpQ, tmpS);
      const inward = tmpV.clone().setY(0).normalize().multiplyScalar(-0.22 * h);
      tmpV.add(inward);
      tmpS.multiplyScalar(hidden[i] ? 0.0001 : 1 + h * 0.06);
      tmpM.compose(tmpV, tmpQ, tmpS);
    }
    covers.setMatrixAt(i, tmpM.clone().multiply(front));
    cases.setMatrixAt(i, tmpM.multiply(back));
  };
  for (let i = 0; i < S; i++) writeMatrix(i);
  covers.instanceMatrix.needsUpdate = cases.instanceMatrix.needsUpdate = true;
  covers.computeBoundingSphere();
  cases.computeBoundingSphere();

  // 上下霓虹環
  const ringGeo = track(new THREE.TorusGeometry(RW - 0.02, 0.012, 6, 160));
  for (const [y, col] of [[ROWS / 2 + 0.12, 0x2f86e0], [-ROWS / 2 - 0.12, 0xd4141e]] as const) {
    const ring = new THREE.Mesh(ringGeo, track(new THREE.MeshBasicMaterial({ color: col, toneMapped: false })));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    wall.add(ring);
  }
  // 地板網格
  const grid = new THREE.GridHelper(40, 80, 0x005bac, 0x0b2347);
  (grid.material as THREE.Material).transparent = true;
  (grid.material as THREE.Material).opacity = 0.35;
  grid.position.y = -ROWS / 2 - 0.6;
  scene.add(grid);
  track(grid.geometry); track(grid.material as THREE.Material);

  // ---------- 抽出的 CD 盒 ----------
  const hero = new THREE.Group();
  hero.visible = false;
  scene.add(hero);
  const caseG = new THREE.Group();
  hero.add(caseG);
  const artUniforms = { map: { value: atlasLo as THREE.Texture }, rect: { value: new THREE.Vector4(0, 0, 1, 1) } };
  const discUniforms = { ...artUniforms, uTime: { value: 0 } };
  const tray = new THREE.Mesh(track(new THREE.BoxGeometry(1, 1, 0.05)), track(new THREE.MeshStandardMaterial({ color: 0x050507, metalness: 0.3, roughness: 0.4 })));
  caseG.add(tray);
  const hub = new THREE.Mesh(track(new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32)), track(new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 0.5 })));
  hub.rotation.x = Math.PI / 2;
  hub.position.z = 0.03;
  caseG.add(hub);
  const disc = new THREE.Mesh(track(new THREE.PlaneGeometry(0.88, 0.88)), track(new THREE.ShaderMaterial({ uniforms: discUniforms, vertexShader: ART_VERT, fragmentShader: DISC_FRAG, side: THREE.DoubleSide })));
  disc.position.z = 0.03;
  caseG.add(disc);
  const lid = new THREE.Group();
  lid.position.set(-0.5, 0, 0.04);
  caseG.add(lid);
  const lidArt = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), track(new THREE.ShaderMaterial({ uniforms: artUniforms, vertexShader: ART_VERT, fragmentShader: ART_FRAG })));
  lidArt.position.set(0.5, 0, 0.002);
  const lidInner = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), track(new THREE.MeshBasicMaterial({ color: 0x0c0c10, side: THREE.BackSide })));
  lidInner.position.set(0.5, 0, 0.002);
  const lidGlass = new THREE.Mesh(track(new THREE.BoxGeometry(1, 1, 0.022)), track(new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.14, roughness: 0.05, metalness: 0, clearcoat: 1 })));
  lidGlass.position.set(0.5, 0, 0.014);
  lid.add(lidArt, lidInner, lidGlass);
  [tray, disc, lidArt, lidGlass].forEach((m) => (m.userData.kind = 'hero'));

  const crt = new THREE.Group();
  hero.add(crt);
  const crtBezel = new THREE.Mesh(track(new THREE.PlaneGeometry(1.24, 0.92)), track(new THREE.MeshStandardMaterial({ color: 0x030304, metalness: 0.2, roughness: 0.2 })));
  const crtUniforms = { map: { value: null as THREE.Texture | null }, time: { value: 0 }, power: { value: 0 }, hasMap: { value: 0 } };
  const crtScreen = new THREE.Mesh(track(new THREE.PlaneGeometry(1.12, 0.784)), track(new THREE.ShaderMaterial({ uniforms: crtUniforms, vertexShader: ART_VERT, fragmentShader: CRT_FRAG })));
  crtScreen.position.z = 0.004;
  crtScreen.userData.kind = 'hero';
  crt.add(crtBezel, crtScreen);

  const snapCache = new Map<string, THREE.Texture>();
  const getSnap = (url: string) => {
    if (!snapCache.has(url)) {
      const t = track(new THREE.TextureLoader().load(url));
      t.colorSpace = THREE.NoColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      snapCache.set(url, t);
    }
    return snapCache.get(url)!;
  };
  const cdCache = new Map<string, THREE.Texture>();
  const tileRect = (tile: number) => new THREE.Vector4((tile % atlas.cols) / atlas.cols, 1 - (Math.floor(tile / atlas.cols) + 1) / atlas.rows, 1 / atlas.cols, 1 / atlas.rows);

  // ---------- 狀態 ----------
  type Mode = 'wall' | 'out' | 'in' | 'back';
  let mode: Mode = 'wall', cur = -1, pending = -1, p = 0, lidT = 0, crtT = 0;
  let offset = reduce ? 0 : -1.2, targetOffset = 0, vel = 0, dragging = false, moved = 0, lastX = 0;
  let lastInteract = performance.now(), hovered = -1, introT = reduce ? 1 : 0, booted = !!sessionStorage.getItem('ngm:boot3d');
  const mouse = new THREE.Vector2(9, 9), parallax = new THREE.Vector2();
  const ray = new THREE.Raycaster();
  const startPos = new THREE.Vector3(), startQuat = new THREE.Quaternion(), startScale = new THREE.Vector3();
  const layout = { casePos: new THREE.Vector3(-0.9, 0.08, 0), crtPos: new THREE.Vector3(0.98, 0.08, 0), crtScale: 1, dist: 2.6, discX: 0.72 };
  const filter = { genre: '', dev: '' };
  const dimTarget = new Float32Array(S);

  const info = {
    panel: root.querySelector<HTMLElement>('[data-info]'), idle: root.querySelector<HTMLElement>('[data-idle]'),
    title: root.querySelector('[data-i-title]'), zh: root.querySelector('[data-i-zh]'), meta: root.querySelector('[data-i-meta]'),
    link: root.querySelector<HTMLAnchorElement>('[data-i-link]'), match: root.querySelector('[data-match]'),
  };
  const showInfo = (gi: number) => {
    const on = gi >= 0;
    if (info.panel) info.panel.hidden = !on;
    if (info.idle) info.idle.hidden = on;
    if (!on) return;
    const g = games[gi];
    if (info.title) info.title.textContent = g.title;
    if (info.zh) info.zh.textContent = g.zh ?? '';
    if (info.meta) info.meta.textContent = `${g.year} · ${g.dev}`;
    if (info.link) info.link.href = g.href;
  };

  const applyFilter = () => {
    let n = 0;
    slots.forEach((s, i) => {
      if (s.game < 0) { dimTarget[i] = 0.6; return; }
      const g = games[s.game];
      const ok = (!filter.genre || g.genre === filter.genre) && (!filter.dev || g.devKey === filter.dev);
      dimTarget[i] = ok ? 0 : 1;
      if (ok) n++;
    });
    if (info.match) info.match.textContent = String(n).padStart(3, '0');
  };
  applyFilter();

  const placeHero = () => {
    const a = camera.aspect;
    if (a < 0.9) { layout.casePos.set(-0.28, 0.8, 0); layout.crtPos.set(0, -0.22, 0); layout.crtScale = 0.72; layout.dist = 3.6; layout.discX = 0.55; }
    else { layout.casePos.set(-0.9, 0.2, 0); layout.crtPos.set(0.98, 0.2, 0); layout.crtScale = 1; layout.dist = 2.6; layout.discX = 0.72; }
    hero.position.set(0, 0, CAM_Z - layout.dist);
    hero.lookAt(camera.position.x * 0, 0, CAM_Z);
    hero.updateMatrixWorld(true);
    crt.position.copy(layout.crtPos);
    crt.scale.setScalar(layout.crtScale);
  };

  function setHeroArt(gi: number) {
    const g = games[gi];
    artUniforms.map.value = atlasHi ?? atlasLo;
    artUniforms.rect.value.copy(tileRect(g.tile));
    const hi = cdCache.get(g.cd);
    const useHi = (t: THREE.Texture) => { if (cur === gi) { artUniforms.map.value = t; artUniforms.rect.value.set(0, 0, 1, 1); } };
    if (hi) useHi(hi);
    else {
      const t = new THREE.TextureLoader().load(g.cd, (tt) => useHi(tt));
      rawTex(t);
      cdCache.set(g.cd, t);
    }
    crtUniforms.map.value = getSnap(g.snap);
    crtUniforms.hasMap.value = 1;
  }

  function pull(slot: number) {
    if (slot < 0 || slots[slot].game < 0) return;
    lastInteract = performance.now();
    if (mode !== 'wall') { pending = slot; if (mode === 'out' || mode === 'in') { mode = 'back'; computeStart(cur); } return; }
    cur = slot;
    const gi = slots[slot].game;
    placeHero();
    computeStart(slot);
    hidden[slot] = 1; writeMatrix(slot); covers.instanceMatrix.needsUpdate = cases.instanceMatrix.needsUpdate = true;
    setHeroArt(gi);
    hero.visible = true;
    p = 0; lidT = 0; crtT = 0; crtUniforms.power.value = 0;
    mode = 'in';
    showInfo(gi);
    play('select');
  }
  // 牆上那格的世界座標 → hero 區域座標（抽出 / 放回的起訖點）
  function computeStart(slot: number) {
    wall.updateMatrixWorld(true);
    tmpM.copy(wall.matrixWorld).multiply(base[slot]);
    tmpM.premultiply(new THREE.Matrix4().copy(hero.matrixWorld).invert());
    tmpM.decompose(startPos, startQuat, startScale);
  }
  function putBack() { if (mode === 'in' || mode === 'out') { mode = 'back'; computeStart(cur); lastInteract = performance.now(); play('back'); } }
  const enter = () => {
    if (cur < 0 || mode === 'wall') return;
    play('chime');
    const href = games[slots[cur].game].href;
    import('astro:transitions/client').then((m) => m.navigate(href)).catch(() => (location.href = href));
  };
  // 依畫面角度排序的 slot（左→右），供上一張 / 下一張
  const orderByAngle = () => slots.map((_, i) => i).filter((i) => slots[i].game >= 0).sort((a, b) => slotAngle[a] - slotAngle[b] || slots[a].r - slots[b].r);
  const angOrder = orderByAngle();
  const centerSlot = () => {
    let best = -1, bd = 9;
    angOrder.forEach((i) => {
      const a = Math.atan2(Math.sin(slotAngle[i] - offset), Math.cos(slotAngle[i] - offset)); // 世界角度 = θ - offset
      const d = Math.abs(a) + Math.abs(base[i].elements[13]) * 0.05;
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  };
  const step = (dir: 1 | -1) => {
    const from = cur >= 0 && mode !== 'wall' ? cur : centerSlot();
    const k = angOrder.indexOf(from);
    const next = angOrder[(k + dir + angOrder.length) % angOrder.length];
    targetOffset = nearestOffset(slotAngle[next]);
    pull(next);
  };
  const nearestOffset = (want: number) => want + Math.round((targetOffset - want) / (Math.PI * 2)) * Math.PI * 2;
  const randomPull = () => { const i = angOrder[Math.floor(Math.random() * angOrder.length)]; targetOffset = nearestOffset(slotAngle[i]); pull(i); };
  function insertCoin() {
    const c = Math.min(99, Number(localStorage.getItem('ngm:credit') || 0) + 1);
    localStorage.setItem('ngm:credit', String(c));
    const cr = document.getElementById('credit');
    if (cr) cr.textContent = String(c).padStart(2, '0');
    play('coin');
    waveBoost = 1;
  }
  let waveBoost = 0;
  const pressBtn = (k: string) => {
    root.querySelector<HTMLElement>(`[data-btn="${k}"]`)?.animate([{ transform: 'translateY(3px)' }, { transform: 'none' }], { duration: 160 });
    if (k === 'A') { if (mode === 'out' || mode === 'in') enter(); else pull(centerSlot()); }
    else if (k === 'B') randomPull();
    else if (k === 'C') step(-1);
    else if (k === 'D') step(1);
  };

  // ---------- 輸入 ----------
  const setMouse = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    parallax.copy(mouse);
    if (tip) { tip.style.left = `${e.clientX - r.left + 14}px`; tip.style.top = `${e.clientY - r.top + 14}px`; }
  };
  const pickSlot = () => {
    ray.setFromCamera(mouse, camera);
    const h = ray.intersectObject(covers, false)[0];
    return h?.instanceId ?? -1;
  };
  const pickHero = () => {
    if (!hero.visible) return false;
    ray.setFromCamera(mouse, camera);
    return ray.intersectObjects([tray, lidArt, lidGlass, disc, crtScreen], false).length > 0;
  };
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true; moved = 0; lastX = e.clientX; vel = 0; setMouse(e);
    lastInteract = performance.now();
    if (!booted) { booted = true; sessionStorage.setItem('ngm:boot3d', '1'); if (soundOn()) play('boot'); }
  };
  const onMove = (e: PointerEvent) => {
    setMouse(e);
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    if (moved > 5 && mode === 'wall') { const d = -dx * 0.0032; targetOffset += d; vel = d; el.style.cursor = 'grabbing'; lastInteract = performance.now(); }
  };
  const onUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false; el.style.cursor = 'grab';
    if (moved > 5) return;
    setMouse(e);
    if (mode !== 'wall') { if (pickHero()) enter(); else putBack(); return; }
    const s = pickSlot();
    if (s < 0) return;
    if (slots[s].game < 0) insertCoin(); else pull(s);
  };
  const onLeave = () => { mouse.set(9, 9); parallax.set(0, 0); };
  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement)?.closest?.('input,textarea,select') || e.ctrlKey || e.metaKey || e.altKey) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 80 || r.top > innerHeight * 0.6) return;
    const k = e.key;
    if (k === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (k === 'Escape') putBack();
    else if (k === 'Enter' && document.activeElement === document.body) { if (mode === 'wall') pull(centerSlot()); else enter(); }
    else if (k === '5') insertCoin();
    else if (/^[abcd]$/i.test(k)) pressBtn(k.toUpperCase());
  };
  el.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  el.addEventListener('pointerleave', onLeave);
  window.addEventListener('keydown', onKey);
  const uiHandlers: [Element, () => void][] = [];
  root.querySelectorAll<HTMLElement>('[data-btn]').forEach((b) => { const h = () => pressBtn(b.dataset.btn!); b.addEventListener('click', h); uiHandlers.push([b, h]); });
  root.querySelectorAll<HTMLElement>('[data-coin]').forEach((b) => { b.addEventListener('click', insertCoin); uiHandlers.push([b, insertCoin]); });
  root.querySelectorAll<HTMLElement>('[data-close]').forEach((b) => { b.addEventListener('click', putBack); uiHandlers.push([b, putBack]); });
  root.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach((b) => {
    const h = () => {
      const [dim, v] = b.dataset.filter!.split(':') as ['genre' | 'dev', string];
      filter[dim] = filter[dim] === v ? '' : v;
      root.querySelectorAll<HTMLButtonElement>(`[data-filter^="${dim}:"]`).forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.filter === `${dim}:${filter[dim]}`)));
      applyFilter();
      lastInteract = performance.now();
    };
    b.addEventListener('click', h);
    uiHandlers.push([b, h]);
  });

  // ---------- 尺寸 / 可見性 ----------
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = camera.aspect < 0.9 ? 62 : 50;
    camera.updateProjectionMatrix();
    placeHero();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  let visible = true;
  const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
  io.observe(root);

  // 高解析 atlas 延後載入
  const hiTimer = window.setTimeout(() => {
    new THREE.TextureLoader().load(atlas.hi, (t) => { rawTex(t); atlasHi = t; coverMat.uniforms.uAtlas.value = t; if (artUniforms.rect.value.z < 1) artUniforms.map.value = t; });
  }, 300);

  // ---------- 主迴圈 ----------
  const clock = new THREE.Clock();
  const qTarget = new THREE.Quaternion();
  let raf = 0;
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) { clock.getDelta(); return; }
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const idle = performance.now() - lastInteract;

    if (introT < 1) introT = Math.min(1, introT + dt / 2.2);
    // 牆旋轉：拖曳慣性 + 閒置自轉
    if (!dragging && mode === 'wall') {
      targetOffset += vel; vel *= 0.92;
      if (!reduce && idle > 2500) targetOffset += dt * 0.035;
    }
    offset += (targetOffset - offset) * Math.min(1, dt * (introT < 1 ? 2 : 5));
    wall.rotation.y = offset;

    // attract mode
    if (!reduce) {
      if (mode === 'wall' && idle > 14000) randomPull();
      else if (mode === 'out' && idle > 8000) { putBack(); lastInteract = performance.now() - 9000; }
    }

    // 鏡頭視差 + 開場推近
    const e = 1 - Math.pow(1 - introT, 3);
    const px = reduce ? 0 : parallax.x, py = reduce ? 0 : parallax.y;
    camera.position.set(px * 0.25, py * 0.15, THREE.MathUtils.lerp(CAM_Z + 3.5, CAM_Z, e));
    camera.lookAt(px * 0.6, py * 0.3, -2);

    // 篩選淡化 + 懸停
    let dimDirty = false, hovDirty = false, matDirty = false;
    for (let i = 0; i < S; i++) {
      const dTarget = mode === 'wall' ? dimTarget[i] : Math.max(dimTarget[i], 0.55);
      if (Math.abs(aDim[i] - dTarget) > 0.002) { aDim[i] += (dTarget - aDim[i]) * Math.min(1, dt * 6); dimDirty = true; }
      const hT = i === hovered && mode === 'wall' ? 1 : 0;
      if (Math.abs(hoverAnim[i] - hT) > 0.002) { hoverAnim[i] += (hT - hoverAnim[i]) * Math.min(1, dt * 12); aHover[i] = hoverAnim[i]; writeMatrix(i); hovDirty = matDirty = true; }
    }
    if (dimDirty) dimAttr.needsUpdate = true;
    if (hovDirty) hovAttr.needsUpdate = true;
    if (matDirty) covers.instanceMatrix.needsUpdate = cases.instanceMatrix.needsUpdate = true;

    waveBoost = Math.max(0, waveBoost - dt * 0.8);
    coverMat.uniforms.uTime.value = t;
    coverMat.uniforms.uWave.value = (t * 0.9) % (Math.PI * 2) - Math.PI;
    coverMat.uniforms.uGlobal.value = THREE.MathUtils.lerp(coverMat.uniforms.uGlobal.value, 1 + waveBoost * 0.4, 0.2);

    // 抽出動畫
    if (mode === 'in' || mode === 'out' || mode === 'back') {
      if (mode === 'in') { p = Math.min(1, p + dt / (reduce ? 0.01 : 0.75)); if (p >= 1) { lidT = Math.min(1, lidT + dt / 0.5); if (lidT >= 1) mode = 'out'; } }
      if (mode === 'out') { lidT = Math.min(1, lidT + dt / 0.5); }
      if (mode === 'in' || mode === 'out') { if (lidT > 0.4) crtT = Math.min(1, crtT + dt / 0.5); }
      if (mode === 'back') {
        crtT = Math.max(0, crtT - dt / 0.25);
        if (lidT > 0) lidT = Math.max(0, lidT - dt / 0.3);
        else p = Math.max(0, p - dt / (reduce ? 0.01 : 0.55));
        if (p <= 0) {
          hidden[cur] = 0; writeMatrix(cur); covers.instanceMatrix.needsUpdate = cases.instanceMatrix.needsUpdate = true;
          hero.visible = false; mode = 'wall'; showInfo(-1);
          const nx = pending; pending = -1; cur = -1;
          if (nx >= 0) pull(nx);
        }
      }
      const k = ease(p);
      caseG.position.lerpVectors(startPos, layout.casePos, k);
      caseG.position.z += Math.sin(k * Math.PI) * 0.6;
      caseG.quaternion.slerpQuaternions(startQuat, qTarget.identity(), k);
      if (k < 1) caseG.rotateY(Math.sin(k * Math.PI) * 0.9);
      tmpS.copy(startScale).lerp(new THREE.Vector3(1, 1, 1), k);
      caseG.scale.copy(tmpS);
      const l = ease(lidT);
      // 光碟從盒中向右滑出（封面保持可見）
      disc.position.x = l * layout.discX;
      disc.position.z = 0.03; // 保持在封面之下，像從盒中抽出
      disc.rotation.z -= dt * (0.6 + l * 5);
      discUniforms.uTime.value = t;
      crt.visible = crtT > 0.001;
      crtUniforms.power.value = crtT;
      crtUniforms.time.value = t;
      crt.scale.setScalar(layout.crtScale * (0.85 + 0.15 * ease(crtT)));
    }

    // hover 檢測
    if (!dragging && mouse.x < 2) {
      if (mode === 'wall') {
        const s = pickSlot();
        if (s !== hovered) {
          hovered = s;
          const g = s >= 0 && slots[s].game >= 0 ? games[slots[s].game] : null;
          el.style.cursor = s >= 0 ? 'pointer' : 'grab';
          if (tip) { tip.hidden = s < 0; tip.textContent = g ? `${g.title}${g.zh ? '｜' + g.zh : ''} · ${g.year}` : s >= 0 ? 'INSERT COIN' : ''; }
        }
      } else {
        if (hovered >= 0) hovered = -1;
        const on = pickHero();
        el.style.cursor = on ? 'pointer' : 'zoom-out';
        if (tip) { tip.hidden = !on; tip.textContent = on ? '進入展示頁 ▶' : ''; }
      }
    }

    renderer.render(scene, camera);
  };
  showInfo(-1);
  loop();

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(hiTimer);
    ro.disconnect(); io.disconnect();
    el.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('keydown', onKey);
    uiHandlers.forEach(([n, h]) => n.removeEventListener('click', h));
    covers.dispose(); cases.dispose();
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    el.remove();
  };
}
