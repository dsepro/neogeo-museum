/**
 * MVS 主機板硬體 DIP 開關（8 位元，REG_DIPSW 0x300001，Active-Low：ON = 0）
 * 參考：neogeodev wiki、MAME neogeo driver。不同主機板版本標示可能略有差異。
 */
export const HARD_DIP = [
  { n: 1, name: 'SETTING MODE', zh: '設定模式', on: '開機直接進入 BIOS 設定（測試）選單', off: '一般遊戲模式' },
  { n: 2, name: 'COIN CHUTES', zh: '投幣口數量', on: '2 個投幣口（1P / 2P 各自計數）', off: '1 個投幣口（共用）' },
  { n: 3, name: 'CONTROL PANEL', zh: '控制面板', on: '麻將控制面板（麻將類遊戲使用）', off: '一般搖桿 + 按鍵' },
  { n: 4, name: 'COMM ID · BIT 1', zh: '連線機台編號（低位）', on: '與 SW5 組合設定連線時的機台編號', off: '—' },
  { n: 5, name: 'COMM ID · BIT 2', zh: '連線機台編號（高位）', on: '與 SW4 組合設定連線時的機台編號', off: '—' },
  { n: 6, name: 'COMM ENABLE', zh: '機台連線', on: '啟用多機台連線對戰（僅少數遊戲支援）', off: '停用連線' },
  { n: 7, name: 'FREE PLAY', zh: '免費遊玩', on: '不需投幣即可開始', off: '需投幣' },
  { n: 8, name: 'FREEZE', zh: '畫面凍結', on: '暫停遊戲畫面（檢修 / 拍攝用 Stop Mode）', off: '正常運作' },
];

/** BIOS 內常見的系統設定與 Soft DIP 項目（實際項目依遊戲而異） */
export const SOFT_DIP_COMMON = [
  { name: 'DIFFICULTY', zh: '難度', options: 'LEVEL 1 – 8', note: '多數遊戲預設中間值' },
  { name: 'PLAY TIME / TIMER', zh: '回合時間 / 計時速度', options: '依遊戲而定', note: '格鬥遊戲常見' },
  { name: 'ROUNDS', zh: '對戰回合數', options: '1 / 3 / 5 回合等', note: '格鬥遊戲常見' },
  { name: 'CONTINUE', zh: '允許接關', options: 'ON / OFF', note: '' },
  { name: 'DEMO SOUND', zh: '待機示範音效', options: 'ON / OFF', note: 'BIOS 系統設定' },
  { name: 'COIN RATE', zh: '投幣與 Credit 比例', options: '1 COIN 1 CREDIT …', note: 'BIOS 系統設定' },
  { name: 'GAME START COMPULSION', zh: '強制開始倒數', options: 'ON / OFF + 秒數', note: '多卡板選遊戲時' },
];
