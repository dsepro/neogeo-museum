# -*- coding: utf-8 -*-
"""
首頁 CD 封面牆素材：
1) 下載 Neo Geo CD 盒裝封面（libretro Named_Boxarts，500×500）→ public/media/games/<slug>/cd.webp
2) 沒有 CD 版的遊戲：把 aes.webp 偏上方裁成正方形 → cd.webp
3) 合成貼圖集（atlas）：public/media/cd-wall/atlas.webp（256px/格）、atlas-lo.webp（64px/格）、atlas.json
需要 Pillow。先跑 fetch_libretro.py（要有 aes.webp），再跑本腳本。
用法：python scripts/build_cd_wall.py [--force]
"""
import io, json, os, sys, urllib.parse, urllib.request
import concurrent.futures as cf
from PIL import Image, ImageDraw, ImageFont

HOST = "https://thumbnails.libretro.com/SNK%20-%20Neo%20Geo%20CD/Named_Boxarts/"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAMES = os.path.join(ROOT, "public", "media", "games")
OUT = os.path.join(ROOT, "public", "media", "cd-wall")
CONTENT = os.path.join(ROOT, "src", "content", "games")
FORCE = "--force" in sys.argv
TILE, TILE_LO, COLS = 256, 64, 16
CROP_TOP = 0.15  # AES 直式封面裁正方形時，從上方保留的比例（標題字通常在上半部）

# slug -> Neo Geo CD 封面檔名（優先 World / 英文版）
CD = {
    "3-count-bout": "3 Count Bout (World).png",
    "aero-fighters-2": "Aero Fighters 2 (World).png",
    "aero-fighters-3": "Aero Fighters 3 (World).png",
    "aggressors-of-dark-kombat": "Aggressors of Dark Kombat (World).png",
    "alpha-mission-2": "Alpha Mission II (World).png",
    "art-of-fighting-3": "Art of Fighting - Ryuuko no Ken Gaiden ~ The Path of the Warrior - Art of Fighting 3 (World) (En,Ja,Es,Pt).png",
    "last-blade": "Last Blade, The (World).png",
    "last-blade-2": "Last Blade 2, The (World).png",
    "baseball-stars-2": "Baseball Stars 2 (World).png",
    "baseball-stars-professional": "Baseball Stars Professional (World).png",
    "neo-turf-masters": "Neo Turf Masters (World).png",
    "blues-journey": "Blue's Journey (World).png",
    "breakers": "Breakers (World).png",
    "burning-fight": "Burning Fight (World).png",
    "crossed-swords": "Crossed Swords (Japan).png",
    "cyber-lip": "Cyber-Lip (World).png",
    "double-dragon-neo": "Double Dragon (USA) (En,Ja).png",
    "street-hoop": "Street Hoop (World).png",
    "kabuki-klash": "Kabuki Klash (World).png",
    "fatal-fury": "Garou Densetsu - Shukumei no Tatakai ~ Fatal Fury - King of Fighters (Japan) (En,Ja).png",
    "fatal-fury-2": "Fatal Fury 2 (World).png",
    "fatal-fury-3": "Fatal Fury 3 - Road to the Final Victory (World).png",
    "fatal-fury-special": "Fatal Fury Special (World).png",
    "windjammers": "Windjammers (World).png",
    "football-frenzy": "Football Frenzy (Japan) (En,Ja).png",
    "savage-reign": "Savage Reign (World).png",
    "galaxy-fight": "Galaxy Fight - Universal Warriors (World).png",
    "ghost-pilots": "Ghost Pilots (World).png",
    "puzzled": "Puzzled (World).png",
    "kof94": "King of Fighters '94, The (World).png",
    "kof95": "King of Fighters '95, The (World).png",
    "kof96": "King of Fighters '96, The (World).png",
    "kof97": "King of Fighters '97, The (World).png",
    "kof98": "King of Fighters '98, The - Dream Match Never Ends ~ The King of Fighters '98 - The Slugfest (Japan) (En,Ja).png",
    "kof99": "King of Fighters '99, The ~ The King of Fighters '99 - Millennium Battle (World) (En,Ja,Es,Pt).png",
    "king-of-the-monsters-2": "King of the Monsters 2 - The Next Thing (World).png",
    "last-resort": "Last Resort (Japan) (En,Ja).png",
    "league-bowling": "League Bowling (Japan) (En,Ja).png",
    "magical-drop-2": "Magical Drop 2 (World).png",
    "magician-lord": "Magician Lord (Japan) (En,Ja).png",
    "metal-slug": "Metal Slug (World).png",
    "metal-slug-2": "Metal Slug 2 (World) (En,Ja).png",
    "mutation-nation": "Mutation Nation (Japan) (En,Ja).png",
    "nam-1975": "NAM-1975 (World).png",
    "ninja-combat": "Ninja Combat (World).png",
    "ninja-commando": "Ninja Commando (Japan) (En,Ja).png",
    "ninja-masters": "Ninja Master's - Haou Ninpou Chou (Japan) (En,Ja).png",
    "over-top": "OverTop (World).png",
    "power-spikes-2": "Power Spikes II (Japan) (En,Ja).png",
    "pulstar": "Pulstar (World).png",
    "puzzle-bobble": "Puzzle Bobble ~ Bust-a-Move (Japan) (En,Ja).png",
    "real-bout-fatal-fury": "Real Bout Fatal Fury (World).png",
    "real-bout-fatal-fury-2": "Real Bout Fatal Fury 2 - The Newcomers (World).png",
    "real-bout-fatal-fury-special": "Real Bout Fatal Fury Special (World).png",
    "ragnagard": "Ragnagard (World).png",
    "riding-hero": "Riding Hero (World).png",
    "robo-army": "Robo Army (World).png",
    "art-of-fighting": "Ryuuko no Ken ~ Art of Fighting (World) (En,Ja,Es).png",
    "art-of-fighting-2": "Ryuuko no Ken 2 ~ Art of Fighting 2 (World) (En,Ja,Es).png",
    "samurai-shodown": "Samurai Spirits ~ Samurai Shodown (Japan) (En,Ja).png",
    "samurai-shodown-2": "Shin Samurai Spirits - Haoumaru Jigokuhen ~ Samurai Shodown II (World) (En,Ja).png",
    "samurai-shodown-3": "Samurai Spirits - Zankurou Musouken ~ Samurai Shodown III (World) (En,Ja,Es,Pt).png",
    "samurai-shodown-4": "Samurai Spirits - Amakusa Kourin ~ Samurai Shodown IV - Amakusa's Revenge (World) (En,Ja,Es,Pt).png",
    "sengoku": "Sengoku (World).png",
    "sengoku-2": "Sengoku 2 (World).png",
    "stakes-winner": "Stakes Winner - GI Kanzen Seiha e no Michi (Japan).png",
    "super-sidekicks": "Super Sidekicks (World).png",
    "super-sidekicks-2": "Super Sidekicks 2 (World).png",
    "super-sidekicks-3": "Super Sidekicks 3 - The Next Glory (World).png",
    "the-super-spy": "Super Spy, The (World).png",
    "top-hunter": "Top Hunter - Roddy _ Cathy (Japan) (En,Ja).png",
    "top-players-golf": "Top Player's Golf (Japan) (En,Ja).png",
    "twinkle-star-sprites": "Twinkle Star Sprites (World).png",
    "viewpoint": "Viewpoint (Japan).png",
    "voltage-fighter-gowcaizer": "Voltage Fighter Gowcaizer (World).png",
    "world-heroes": "World Heroes (Japan) (En,Ja).png",
    "world-heroes-2": "World Heroes 2 (Japan) (En,Ja).png",
    "world-heroes-2-jet": "World Heroes 2 Jet (World).png",
    "world-heroes-perfect": "World Heroes Perfect (World).png",
    "thrash-rally": "Rally Chase (Japan) (En,Ja).png"
}


def make_cd(slug):
    out = os.path.join(GAMES, slug, "cd.webp")
    if os.path.exists(out) and not FORCE:
        return slug, "skip"
    if slug in CD:
        req = urllib.request.Request(HOST + urllib.parse.quote(CD[slug]), headers={"User-Agent": "Mozilla/5.0 (neogeo-museum)"})
        im, err = None, None
        for _ in range(4):
            try:
                im = Image.open(io.BytesIO(urllib.request.urlopen(req, timeout=90).read())).convert("RGB")
                break
            except Exception as e:
                err = e
        if im is None:
            return slug, f"FAIL {err}"
        src = "cd"
    else:
        aes = os.path.join(GAMES, slug, "aes.webp")
        if not os.path.exists(aes):
            return slug, "FAIL no aes.webp"
        im = Image.open(aes).convert("RGB")
        w, h = im.size
        s = min(w, h)
        top = round((h - s) * CROP_TOP)
        im = im.crop(((w - s) // 2, top, (w - s) // 2 + s, top + s))
        src = "aes"
    im = im.resize((512, 512), Image.LANCZOS)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    im.save(out, "WEBP", quality=84, method=6)
    return slug, src


def logo_tile(size):
    t = Image.new("RGB", (size, size), (6, 6, 8))
    d = ImageDraw.Draw(t)
    d.rectangle([0, int(size * 0.36), size, int(size * 0.64)], fill=(196, 10, 20))
    try:
        f1 = ImageFont.load_default(size=int(size * 0.15))
        f2 = ImageFont.load_default(size=int(size * 0.11))
    except TypeError:
        f1 = f2 = ImageFont.load_default()
    d.text((size / 2, size * 0.5), "NEO GEO", font=f1, fill=(255, 255, 255), anchor="mm")
    d.text((size / 2, size * 0.78), "CD", font=f2, fill=(255, 210, 0), anchor="mm")
    return t


def build_atlas():
    slugs = sorted(f[:-3] for f in os.listdir(CONTENT) if f.endswith(".md"))
    slugs = [s for s in slugs if os.path.exists(os.path.join(GAMES, s, "cd.webp"))]
    n = len(slugs) + 1  # 最後一格 = 裝飾用 NEO GEO CD 標誌
    rows = -(-n // COLS)
    os.makedirs(OUT, exist_ok=True)
    for tile, name, q in ((TILE, "atlas.webp", 80), (TILE_LO, "atlas-lo.webp", 70)):
        atlas = Image.new("RGB", (COLS * tile, rows * tile), (0, 0, 0))
        for i, s in enumerate(slugs):
            im = Image.open(os.path.join(GAMES, s, "cd.webp")).convert("RGB").resize((tile, tile), Image.LANCZOS)
            atlas.paste(im, ((i % COLS) * tile, (i // COLS) * tile))
        li = len(slugs)
        atlas.paste(logo_tile(tile), ((li % COLS) * tile, (li // COLS) * tile))
        atlas.save(os.path.join(OUT, name), "WEBP", quality=q, method=6)
    src = {s: ("cd" if s in CD else "aes") for s in slugs}
    meta = {"cols": COLS, "rows": rows, "tile": TILE, "count": len(slugs), "logo": len(slugs), "order": slugs, "source": src}
    with open(os.path.join(OUT, "atlas.json"), "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)
    return meta


if __name__ == "__main__":
    slugs = sorted(f[:-3] for f in os.listdir(CONTENT) if f.endswith(".md"))
    with cf.ThreadPoolExecutor(8) as ex:
        res = list(ex.map(make_cd, slugs))
    from collections import Counter
    print(Counter(r[1].split(" ")[0] for r in res))
    for s, r in res:
        if r.startswith("FAIL"):
            print(s, r)
    m = build_atlas()
    print(f"atlas: {m['count']} covers + logo, {m['cols']}x{m['rows']} tiles")
