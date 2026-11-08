/**
 * 互動音效（Web Audio 即時合成，無外部音檔，全部為原創音色）
 * - 預設靜音：localStorage 'ngm:sound' === 'on' 才會發聲
 * - coin   投幣聲（開啟音效 / INSERT COIN）
 * - chime  選單確認音
 * - select 游標移動音
 * - boot   開機 Jingle（原創短旋律，向 MVS 開機畫面致敬，非原曲）
 */
const KEY = 'ngm:sound';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export const soundOn = () => localStorage.getItem(KEY) === 'on';
export const setSound = (on: boolean) => localStorage.setItem(KEY, on ? 'on' : 'off');

export function audio(): { ctx: AudioContext; out: GainNode } {
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return { ctx, out: master! };
}

function tone(
  freq: number,
  start: number,
  dur: number,
  { type = 'square' as OscillatorType, vol = 0.12, slide = 0, attack = 0.004 } = {},
) {
  const { ctx, out } = audio();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(out);
  o.start(start);
  o.stop(start + dur + 0.02);
}

const SFX = {
  coin() {
    const t = audio().ctx.currentTime + 0.01;
    tone(1046.5, t, 0.08, { vol: 0.1 });
    tone(1568, t + 0.075, 0.42, { vol: 0.1 });
    tone(3136, t + 0.075, 0.25, { type: 'sine', vol: 0.03 });
  },
  chime() {
    const t = audio().ctx.currentTime + 0.01;
    [1318.5, 1760, 2637].forEach((f, i) => tone(f, t + i * 0.045, 0.22, { type: 'triangle', vol: 0.11 }));
  },
  select() {
    const t = audio().ctx.currentTime + 0.005;
    tone(1760, t, 0.035, { vol: 0.05 });
  },
  back() {
    const t = audio().ctx.currentTime + 0.005;
    tone(660, t, 0.09, { vol: 0.07, slide: 0.6 });
  },
  boot() {
    // 原創開機旋律：上行琶音 → 主和弦長音 + 金屬感泛音
    const t = audio().ctx.currentTime + 0.05;
    const seq = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    seq.forEach((f, i) => tone(f, t + i * 0.075, 0.18, { vol: 0.09 }));
    const c = t + seq.length * 0.075;
    [523.25, 659.25, 783.99, 1046.5].forEach((f) => tone(f, c, 1.4, { type: 'sawtooth', vol: 0.035, attack: 0.02 }));
    tone(130.81, c, 1.4, { type: 'triangle', vol: 0.18, attack: 0.01 });
    tone(2093, c, 0.9, { type: 'sine', vol: 0.05 });
    tone(2637, c + 0.12, 0.8, { type: 'sine', vol: 0.03 });
  },
};
export type SfxName = keyof typeof SFX;

export function play(name: SfxName, force = false) {
  if (!force && !soundOn()) return;
  try {
    SFX[name]?.();
  } catch {
    /* 音訊不可用時靜默 */
  }
}
