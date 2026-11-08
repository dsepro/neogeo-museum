/** 平台大事記與硬體規格（整理自公開資料，供展示用途；如有出入歡迎修正） */
export const TIMELINE: { year: number; text: string; hw?: boolean }[] = [
  { year: 1990, text: 'MVS 多卡板投入機廳；AES 家用機於日本以租賃形式推出', hw: true },
  { year: 1991, text: 'AES 開始一般零售，並登陸北美市場', hw: true },
  { year: 1992, text: '《龍虎之拳》首創超必殺技' },
  { year: 1993, text: '《侍魂》掀起武器格鬥熱潮' },
  { year: 1994, text: 'Neo Geo CD 於日本發售；《KOF \'94》誕生', hw: true },
  { year: 1995, text: 'Neo Geo CDZ 改善讀取速度', hw: true },
  { year: 1996, text: 'Nazca 推出《Metal Slug》' },
  { year: 1997, text: '3D 街機基板 Hyper Neo Geo 64 登場', hw: true },
  { year: 1998, text: 'Neo Geo Pocket 掌機推出；《KOF \'98》', hw: true },
  { year: 1999, text: 'Neo Geo Pocket Color；《Garou: MOTW》', hw: true },
  { year: 2000, text: 'Aruze 收購 SNK；NGPC 退出歐美市場' },
  { year: 2001, text: 'SNK 破產，Playmore（後 SNK Playmore）承接 IP' },
  { year: 2002, text: '韓國 Eolith 製作《KOF 2002》' },
  { year: 2003, text: '《Metal Slug 5》《KOF 2003》' },
  { year: 2004, text: '《Samurai Shodown V Special》— 官方末期作品' },
];

export interface System {
  id: string;
  name: string;
  full: string;
  zh: string;
  years: string;
  tagline: string;
  history: string[];
  specs: [string, string][];
}

export const SYSTEMS: System[] = [
  {
    id: 'mvs',
    name: 'MVS',
    full: 'Multi Video System',
    zh: '街機多卡板',
    years: '1990 – 2004',
    tagline: '一台機台，最多六款遊戲。',
    history: [
      'MVS 是 SNK 為機廳設計的可換卡街機系統。營運者只需更換卡帶就能更新遊戲，而 MV-2、MV-4、MV-6 等多插槽主機板讓單一機台同時提供 2～6 款遊戲，玩家在選單中自由選擇——這大幅降低了機廳的營運成本，也是 Neo Geo 在亞洲機廳普及的關鍵。',
      '開機畫面上的「MAX 330 MEGA / PRO-GEAR SPEC」標語宣告了當年驚人的卡帶容量；到了後期，透過卡帶內的 bank switching 晶片，遊戲容量早已突破這個上限。',
    ],
    specs: [
      ['主 CPU', 'Motorola 68000 @ 12 MHz'],
      ['副 CPU（音效）', 'Zilog Z80 @ 4 MHz'],
      ['音源', 'Yamaha YM2610：4 FM、3 SSG、1 噪音、7 ADPCM 聲道'],
      ['解析度', '320 × 224'],
      ['色彩', '同屏 4,096 色（調色盤 65,536 色）'],
      ['精靈（Sprite）', '同屏 380 個、每掃描線 96 個；尺寸 16×16～16×512'],
      ['記憶體', '64 KB 工作 RAM、68 KB VRAM、8 KB 調色盤 RAM、2 KB Z80 RAM'],
      ['主機板', 'MV-1（1 槽）、MV-2F、MV-4、MV-6（6 槽）等'],
      ['存檔', '支援記憶卡（與 AES 共用格式）'],
    ],
  },
  {
    id: 'aes',
    name: 'AES',
    full: 'Advanced Entertainment System',
    zh: '家用主機',
    years: '1990 – 2004',
    tagline: '把機廳原封不動搬回家。',
    history: [
      'AES 與 MVS 使用幾乎相同的硬體，因此家用版就是「街機完全移植」。代價是驚人的售價：北美版 Gold System 首發定價 US$649.99，單片卡帶常超過 200 美元，讓 AES 成為 90 年代最奢華的遊戲主機。',
      'AES 卡帶外殼較大且針腳排列與 MVS 不同，兩者無法直接互插；但記憶卡可在兩者之間共用，讓玩家把機廳進度帶回家。附帶的大型搖桿控制器採用街機式布局：一支搖桿加上 A／B／C／D 四顆按鍵。',
    ],
    specs: [
      ['主 CPU', 'Motorola 68000 @ 12 MHz'],
      ['副 CPU（音效）', 'Zilog Z80 @ 4 MHz'],
      ['音源', 'Yamaha YM2610'],
      ['解析度 / 色彩', '320 × 224；同屏 4,096 色'],
      ['媒體', 'AES 專用卡帶（與 MVS 不相容）'],
      ['控制器', '大型搖桿 + A B C D 四鍵 + SELECT / START'],
      ['日本', '1990 年租賃 → 1991 年一般零售'],
      ['北美首發價', 'Gold System US$649.99'],
    ],
  },
  {
    id: 'cd',
    name: 'NEO GEO CD',
    full: 'Neo Geo CD / CDZ',
    zh: 'CD-ROM 版主機',
    years: '1994 – 1999',
    tagline: '便宜的光碟，漫長的讀取。',
    history: [
      'Neo Geo CD 於 1994 年 9 月在日本推出，把遊戲從昂貴的卡帶轉到成本低得多的 CD-ROM，軟體價格大幅下降。先後有前置托盤（Front Loader）、上掀式（Top Loader）與日本限定的 CDZ 三種型號。',
      '問題是單倍速光碟機：容量動輒數百 Mbit 的遊戲必須先讀入記憶體，讀取畫面成為玩家共同記憶。CDZ 以更大的快取改善了讀取時間。另一方面，CD 音軌讓許多遊戲收錄了改編版 BGM。',
    ],
    specs: [
      ['主 CPU / 音效', '68000 @ 12 MHz / Z80 @ 4 MHz + YM2610'],
      ['光碟機', '單倍速 CD-ROM（約 150 KB/s）'],
      ['記憶體', '合計約 7 MB（程式 2 MB、圖形 4 MB、PCM 1 MB 等）'],
      ['音訊', 'YM2610 + CD-DA 音軌'],
      ['型號', 'Front Loader（1994）、Top Loader、CDZ（1995，日本限定）'],
      ['日本首發', '1994 年 9 月 9 日'],
    ],
  },
  {
    id: 'pocket',
    name: 'NEO GEO POCKET',
    full: 'Neo Geo Pocket / Pocket Color',
    zh: '掌上型主機',
    years: '1998 – 2001',
    tagline: '口袋裡的微動開關搖桿。',
    history: [
      'SNK 在 1998 年 10 月於日本推出黑白版 Neo Geo Pocket，僅半年後即推出彩色版 Neo Geo Pocket Color（NGPC）。招牌的「喀喀」微動開關搖桿讓掌機也能打出精準的格鬥指令。',
      'NGPC 擁有《SNK vs. Capcom: The Match of the Millennium》、《Card Fighters\' Clash》等名作，並可與 Dreamcast 連動。2000 年 SNK 被 Aruze 收購後，NGPC 在同年退出歐美市場。',
    ],
    specs: [
      ['CPU', 'Toshiba TLCS-900H（16-bit）@ 6.144 MHz'],
      ['音效 CPU', 'Z80 @ 3.072 MHz'],
      ['螢幕', '160 × 152'],
      ['色彩（NGPC）', '同屏 146 色（調色盤 4,096 色）'],
      ['電源（NGPC）', 'AA 電池 ×2，約 40 小時'],
      ['日本首發', 'NGP：1998 年 10 月；NGPC：1999 年 3 月'],
    ],
  },
];

export const COMPARE: { label: string; values: string[] }[] = [
  { label: '定位', values: ['街機', '家用機', '家用機（CD）', '掌機'] },
  { label: '首發', values: ['1990', '1990（日本租賃）', '1994', '1998 / 1999（彩色）'] },
  { label: '主 CPU', values: ['68000 12 MHz', '68000 12 MHz', '68000 12 MHz', 'TLCS-900H 6.144 MHz'] },
  { label: '解析度', values: ['320×224', '320×224', '320×224', '160×152'] },
  { label: '同屏色數', values: ['4,096', '4,096', '4,096', '146（NGPC）'] },
  { label: '媒體', values: ['MVS 卡帶', 'AES 卡帶', 'CD-ROM', 'NGP 卡帶'] },
];
