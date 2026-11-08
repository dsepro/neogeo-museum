# AGENTS.md — NEO GEO ARCADE MUSEUM

項目說明、規則與交接資訊。任何 agent（Hermes / Claude Code / Codex / Cursor / Aider）在此 repo 工作時請先讀完本檔。

## 這是什麼

Neo Geo（1990–2004）街機文化展示館，靜態網站。Astro 7 + Tailwind CSS 4 + three.js，所有內容來自本地 Markdown / JSON，build 後是純 HTML（151 頁）。

- 線上：https://dsepro.github.io/neogeo-museum/ （GitHub Pages，repo public）
- Repo：https://github.com/dsepro/neogeo-museum
- 本機：`C:\Users\Louis\neogeo-museum`

## 指令

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview
```

部署：push 到 `main` → `.github/workflows/deploy.yml` 自動 build 並發佈（`BASE_PATH=/neogeo-museum`）。

## 架構

```
src/
  content/games/*.md        125 款遊戲，一款一檔（frontmatter + 中文簡介）
  content.config.ts         zod schema（genre / developer 為 enum）
  lib/
    url.ts                  站內連結一律經 url()（處理 base 子路徑）
    media.ts                resolveMedia(slug)：掃 public/media/games/<slug>/
    taxonomy.ts             GENRES / DEVELOPERS / BUTTON_COLORS
    history.ts              四台主機規格與大事記
    pixelScene.ts           程序化 320×224 點陣示意圖（無媒體時的備用）
    crtMap.ts               SVG 桶形畸變位移貼圖（Python 產生）
    dip.ts                  MVS 硬體 DIP 開關資料
  components/               Crt / Scene / GameCard / Flyer / DipSwitch / OstPlayer / SectionHead
  layouts/Base.astro        全域版式、header、音效 & CRT 開關、ClientRouter
  pages/
    index.astro             首頁：CD 封面牆（three.js）
    games/index.astro       遊戲庫：篩選 / 搜尋 / 排序（同步 URL）
    games/[slug].astro      單品頁：海報、截圖、DIP、OST
    browse/[dim]/[value].astro  年份 / 類型 / 開發商靜態分類頁
    hardware/index.astro    硬體館
  scripts/
    cdwall3d.ts             首頁 CD 牆（three.js，InstancedMesh + atlas + shader）
    sfx.ts                  Web Audio 合成音效（預設靜音）
public/media/
  games/<slug>/aes.webp | cd.webp | screens/01-ingame.webp | screens/02-title.webp | ost/
  cd-wall/atlas.webp | atlas-lo.webp | atlas.json
scripts/
  seed_games.py             初始 125 筆資料產生器（⚠ 不要用 --force，會覆寫現有內容）
  fetch_libretro.py         下載 AES 盒面 / 遊戲畫面 / 標題畫面
  build_cd_wall.py          下載 Neo Geo CD 封面、裁切補位、重建 CD 牆 atlas
```

## 規則（重要）

1. **站內連結一定要用 `url()`**（`src/lib/url.ts`），不要寫死 `/games/...`，否則 GitHub Pages 子路徑會壞。
2. **新增 / 編輯遊戲**：只改 `src/content/games/<slug>.md`。schema 在 `src/content.config.ts`，違反 enum 會 build 失敗。年份 1990–2004、`genre` 三選一、`developer` 四選一（`other` 時 `developerName` 填真實廠商）。
3. **媒體按檔名自動偵測**，不要改 frontmatter：`aes.webp`、`cd.webp`、`screens/*`、`ost/*`。沒有素材時會用程式產生的示意圖，這是刻意設計。
4. **加遊戲或換封面後要跑 `python scripts/build_cd_wall.py`**（需要 Pillow），否則首頁 CD 牆不會有新封面（atlas 是預先合成的）。
5. **版權素材**：封面 / 截圖來自 libretro-thumbnails、原聲未收錄。repo 係 public，所有圖都可被下載；不要自行加入未授權的音樂或海報。
6. **音效一律 Web Audio 即時合成，預設靜音**；不要加入模仿原曲的 jingle，demo 音樂必須標示「非原曲」。
7. **CRT 效果**：`html[data-crt=on]` 控制掃描線；Safari 自動略過 SVG 畸變；`prefers-reduced-motion` 停用動畫。改動要保留這三種情況。
8. **three.js 場景**：在 `astro:page-load` 掛載、`astro:before-swap` 呼叫 cleanup（取消 RAF、dispose 幾何 / 材質 / 貼圖 / renderer、移除 canvas）。渲染用 IntersectionObserver + `document.hidden` 暫停。WebGL 失敗要 fallback 到平面封面牆。
9. **驗證才算完成**：`npx astro build` 無錯 → `npx astro preview` → 桌面 1440 與手機 390 各截圖檢查 → 試篩選 / DIP / OST / 3D 抽 CD → 檢查 console 無錯。
10. 不要 `git push --force`；不要改 `package.json` 內的部署腳本名稱（workflow 依賴 `npm run build`）。

## 已經知道的問題 / 待辦

- World Heroes 簡介提到「呂布」，但初代角色陣容應該沒有；待確認後修正。
- 45 款沒有 Neo Geo CD 版的遊戲，用 AES 封面偏上方裁成正方形（`build_cd_wall.py` 的 `CROP_TOP = 0.15`），有些標題字或頭部被裁到，可逐張微調。
- 收錄 125 款，用戶原本提到希望 150+；可續加（照第 2、4 點）。
- OST 播放器目前只有合成的原創示範曲，等有授權音檔才會有真曲。
- 出招表、卡帶區段落已按用戶要求移除（資料仍留在 .md 的 `moves` / `controls` 欄位）。

## 交接給其他 agent

新 agent 開場建議指令：

> 讀 AGENTS.md。這是 Neo Geo 街機博物館（Astro + Tailwind + three.js）。先跑 `npm install && npm run build` 確認現狀，再處理我接下來要的改動。改完要 build 成功並在瀏覽器驗證。
