export type GenreKey = 'fighting' | 'action' | 'sports-puzzle';
export type DevKey = 'snk' | 'adk' | 'nazca' | 'other';

export const GENRES: Record<GenreKey, { zh: string; en: string; blurb: string; examples: string }> = {
  fighting: {
    zh: '格鬥',
    en: 'FIGHTING',
    blurb: '一枚硬幣、一條搖桿、四顆按鍵。從《餓狼傳說》到《拳皇》與《侍魂》，Neo Geo 是 90 年代對戰格鬥的主戰場。',
    examples: 'KOF・侍魂・餓狼傳說・月華劍士',
  },
  action: {
    zh: '動作射擊',
    en: 'ACTION / SHOOTER',
    blurb: 'Run & Gun、清版動作、縱橫向射擊。手繪點陣動畫在《合金彈頭》達到極致。',
    examples: '合金彈頭・Shock Troopers・Blazing Star',
  },
  'sports-puzzle': {
    zh: '運動 / 益智',
    en: 'SPORTS / PUZZLE',
    blurb: '機廳裡最容易上手的一格：射泡泡、飛盤對決、高爾夫與足球。',
    examples: '泡泡龍・Windjammers・Neo Turf Masters',
  },
};

export const DEVELOPERS: Record<DevKey, { name: string; zh: string; blurb: string }> = {
  snk: { name: 'SNK', zh: 'SNK（新日本企劃）', blurb: '平台的主人。KOF、餓狼、侍魂、龍虎之拳的原廠。2001 年破產後由 SNK Playmore 承接。' },
  adk: { name: 'ADK', zh: 'ADK（Alpha Denshi）', blurb: 'SNK 最緊密的第二方夥伴：《Magician Lord》、《World Heroes》、《Twinkle Star Sprites》。' },
  nazca: { name: 'Nazca', zh: 'Nazca Corporation', blurb: '由前 Irem 成員組成，1996 年交出《Metal Slug》與《Neo Turf Masters》後併入 SNK。' },
  other: { name: 'OTHERS', zh: '其他協力廠商', blurb: 'Taito、Data East、Visco、Saurus、Video System、Sunsoft、Noise Factory、Eolith…' },
};

export const YEARS = Array.from({ length: 15 }, (_, i) => 1990 + i);

export const BUTTON_COLORS: Record<string, string> = {
  A: '#e4202a', // red
  B: '#ffd200', // yellow
  C: '#2fae4a', // green
  D: '#005bac', // blue
};
