# NEO GEO ARCADE MUSEUM · 街機文化展示館

Astro 7 + Tailwind CSS 4 建置的 Neo Geo（1990–2004）靜態典藏站。每款遊戲是一個 Markdown 檔案，build 後輸出純 HTML，可直接部署到 Vercel / Cloudflare Pages / GitHub Pages。

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # 輸出至 dist/
npm run preview
```

## 網站結構

| 路徑 | 內容 |
|---|---|
| `/` | three.js CD 封面牆（見下）＋類型入口、開發商 HIGH SCORE 排行、硬體館入口 |
| `/games/` | 遊戲典藏：年份 × 類型 × 開發商篩選、搜尋、排序（篩選條件會寫入網址，可分享） |
| `/browse/year/1998/`、`/browse/genre/fighting/`、`/browse/developer/adk/` | 各分類的靜態頁（SEO / 無 JS 可用） |
| `/games/<slug>/` | 單品展示頁：海報 / 盒裝封面、截圖（CRT + 放大檢視）、DIP 開關、OST 試聽 |
| `/hardware/` | 硬體館：MVS / AES / Neo Geo CD / Neo Geo Pocket 規格與歷史、四機比較表、CRT 濾鏡示範、DIP 說明、大事記 |

## 新增 / 編輯遊戲

`src/content/games/<slug>.md`：

```yaml
---
title: "The King of Fighters '98"
titleZh: "拳皇98"
year: 1998                    # 1990–2004
genre: fighting               # fighting | action | sports-puzzle
subgenre: "2D 格鬥（3 對 3）"
developer: snk                # snk | adk | nazca | other
developerName: "SNK"
featured: true
softDip:                      # 選填：此遊戲 BIOS Soft DIP 項目
  - { name: "難度", options: "LEVEL 1–8", default: "4" }
---
介紹文字（Markdown）
```

`scripts/seed_games.py` 是初始 125 筆資料的產生器（不會覆寫已存在檔案；`--force` 才會）。年份以 MVS 首發年為準，**建議發布前逐筆校對**。

## 首頁 CD 封面牆（`src/scripts/cdwall3d.ts`）

- 125 張封面每次進站隨機拼貼在一面內彎環形牆上，`featured: true` 的遊戲隨機抽最多 12 款佔 2×2 大格；空格放 NEO GEO CD 標誌（點擊 = 投幣）
- 封面來源：有 Neo Geo CD 版的用 CD 盒封面（80 款），其餘把 AES 封面偏上方裁成正方形（45 款）
- 所有封面合成一張 atlas，以 InstancedMesh + 自訂 shader 一次繪製；先載 64px 版（約 180 KB），再換 256px 版（約 2 MB）
- 拖曳旋轉（有慣性）、懸停浮起並顯示名稱、類型 / 開發商篩選亮燈（右上角，可組合）、閒置時光波掃過與自轉
- 點擊 CD：盒子由牆上飛出、轉正，光碟從盒中滑出旋轉（標籤印有封面），旁邊 CRT 螢幕播放遊戲畫面；再點盒子或螢幕進入展示頁，點空白處 / Esc / 放回 鍵歸位
- 按鍵：A 進入、B 隨機抽一張、C 上一張、D 下一張（滑鼠點面板上的圓掣或按鍵盤）、←/→、Enter、5 投幣
- 閒置 14 秒自動抽出一張（attract mode），8 秒後放回；`prefers-reduced-motion` 停用自轉與自動抽出；離開畫面暫停渲染；換頁時釋放 WebGL 資源；不支援 WebGL 時顯示平面封面牆

新增遊戲或更新封面後執行：`python scripts/build_cd_wall.py`（下載 CD 封面 / 裁 AES 封面 → `public/media/games/<slug>/cd.webp`，並重建 `public/media/cd-wall/atlas*.webp` 與 `atlas.json`）。CD 版對照表在腳本內的 `CD` 字典。

## 媒體素材

不需要改 frontmatter，直接放檔案：見 [`public/media/games/README.md`](public/media/games/README.md)。沒有素材時，海報 / 卡帶 / 截圖會用程式產生的原創 320×224 點陣示意圖（每款依 slug 固定不同），OST 播放器會改播 Web Audio 即時合成的原創示範旋律，並清楚標示「非原曲」。

### libretro 媒體（已內建）

125 款遊戲的三種圖像已從 [libretro-thumbnails](https://thumbnails.libretro.com/SNK%20-%20Neo%20Geo/) 下載：

| 來源資料夾 | 存放位置 | 用途 |
|---|---|---|
| `Named_Boxarts` | `aes.webp`（≤720px，約 7.4 MB 合計） | 遊戲庫卡片、單品頁主視覺（無 flyer 時）、CD 牆補位 |
| Neo Geo CD `Named_Boxarts` | `cd.webp`（512px 正方形） | 首頁 CD 封面牆 |
| `Named_Snaps` | `screens/01-ingame.webp`（原生 320×224，無損） | 首頁 CD 牆的 CRT 畫面、截圖區第一張、CRT 示範 |
| `Named_Titles` | `screens/02-title.webp`（原生 320×224，無損） | 截圖區「標題畫面」 |

重新下載或新增遊戲：在 `scripts/fetch_libretro.py` 的對照表加一行，執行 `python scripts/fetch_libretro.py`（需要 Pillow；`--only snap` 只抓某一類、`--force` 覆寫）。想加更多截圖，直接把 `03-xxx.png` 等放進 `screens/`。

## 視覺系統

- 字型：Press Start 2P（標題 / 標籤）、VT323（計分板數字）、DotGothic16（中文像素標題）、Noto Sans TC（內文）
- 色彩：純黑 `#000`、機台亮黃 `#FFD200`、SNK 藍 `#005BAC`、金屬紅（`.metal-red` / `.metal-bar` 漸層）
- CRT：`.crt` = 3px 掃描線 + RGB 光柵 + 暗角 / 玻璃反光 + SVG `feDisplacementMap` 桶形畸變（`src/lib/crtMap.ts` 的位移貼圖）。可由右上角開關；Safari 自動略過畸變層；`prefers-reduced-motion` 停用閃爍。

## 音效

全部以 Web Audio API 即時合成（`src/scripts/sfx.ts`），沒有外部音檔：投幣 `coin`、選單確認 `chime`、游標 `select`、返回 `back`、開機 Jingle `boot`（原創旋律）。**預設靜音**，按右上角 SOUND 開啟（每次開啟 CREDIT +1）。任何元素加上 `data-sfx="chime"` 即可在點擊時發聲。站內使用 Astro ClientRouter，換頁時音效不中斷。

## 部署

- **Vercel / Cloudflare Pages**：Framework 選 Astro，Build command `npm run build`，Output `dist`。
- **GitHub Pages**：已附 `.github/workflows/deploy.yml`，推到 `main` 即自動部署（自動設定 `BASE_PATH=/<repo>`）。站內連結都透過 `src/lib/url.ts` 處理子路徑。

## 授權聲明

非官方愛好者專案。NEO GEO、SNK 及各遊戲名稱、角色、美術、音樂為其權利人所有。
