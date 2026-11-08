# -*- coding: utf-8 -*-
"""
從 libretro-thumbnails 下載 Neo Geo 媒體到 public/media/games/<slug>/：
  Named_Boxarts → aes.webp                  （AES 盒裝封面，縮至 ≤720px，有損 WebP）
  Named_Snaps   → screens/01-ingame.webp    （遊戲畫面，原生 320×224，無損 WebP）
  Named_Titles  → screens/02-title.webp     （標題畫面，原生 320×224，無損 WebP）
來源：https://thumbnails.libretro.com/SNK%20-%20Neo%20Geo/
需要 Pillow（pip install pillow）。已存在的檔案會略過，加 --force 重新下載。
用法：python scripts/fetch_boxart.py [--force] [--only boxart|snap|title]
"""
import io, os, sys, urllib.parse, urllib.request
import concurrent.futures as cf
from PIL import Image

HOST = "https://thumbnails.libretro.com/SNK%20-%20Neo%20Geo/"
ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "media", "games")
FORCE = "--force" in sys.argv
ONLY = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None

# kind: (libretro 資料夾, 輸出相對路徑, 是否縮圖/有損)
KINDS = {
    "boxart": ("Named_Boxarts", "aes.webp", True),
    "snap": ("Named_Snaps", "screens/01-ingame.webp", False),
    "title": ("Named_Titles", "screens/02-title.webp", False),
}

# slug -> libretro 檔名（三個資料夾檔名相同；優先選 NGH = 家用版）
BOXART = {
    "nam-1975": "NAM-1975 (NGM-001)(NGH-001).png",
    "magician-lord": "Magician Lord (NGH-005).png",
    "baseball-stars-professional": "Baseball Stars Professional (NGH-002).png",
    "top-players-golf": "Top Player's Golf (NGM-003)(NGH-003).png",
    "riding-hero": "Riding Hero (NGM-006)(NGH-006).png",
    "cyber-lip": "Cyber-Lip (NGM-010).png",
    "ninja-combat": "Ninja Combat (NGH-009).png",
    "the-super-spy": "The Super Spy (NGM-011)(NGH-011).png",
    "blues-journey": "Blue's Journey _ Raguy (ALM-001)(ALH-001).png",
    "league-bowling": "League Bowling (NGM-019)(NGH-019).png",
    "puzzled": "Puzzled _ Joy Joy Kid (NGM-021)(NGH-021).png",
    "fatal-fury": "Fatal Fury - King of Fighters _ Garou Densetsu - shukumei no tatakai (NGM-033)(NGH-033).png",
    "king-of-the-monsters": "King of the Monsters (set 1).png",
    "burning-fight": "Burning Fight (NGM-018)(NGH-018).png",
    "sengoku": "Sengoku _ Sengoku Denshou (NGM-017)(NGH-017).png",
    "ghost-pilots": "Ghost Pilots (NGM-020)(NGH-020).png",
    "alpha-mission-2": "Alpha Mission II _ ASO II - Last Guardian (NGM-007)(NGH-007).png",
    "crossed-swords": "Crossed Swords (ALM-002)(ALH-002).png",
    "robo-army": "Robo Army (set 1).png",
    "thrash-rally": "Thrash Rally (ALM-003)(ALH-003).png",
    "art-of-fighting": "Art of Fighting _ Ryuuko no Ken (NGM-044)(NGH-044).png",
    "world-heroes": "World Heroes (ALH-005).png",
    "fatal-fury-2": "Fatal Fury 2 _ Garou Densetsu 2 - arata-naru tatakai (NGM-047)(NGH-047).png",
    "king-of-the-monsters-2": "King of the Monsters 2 - The Next Thing (NGM-039)(NGH-039).png",
    "last-resort": "Last Resort.png",
    "mutation-nation": "Mutation Nation (NGM-014)(NGH-014).png",
    "ninja-commando": "Ninja Commando.png",
    "andro-dunos": "Andro Dunos (NGM-049)(NGH-049).png",
    "viewpoint": "Viewpoint.png",
    "super-sidekicks": "Super Sidekicks _ Tokuten Ou.png",
    "baseball-stars-2": "Baseball Stars 2.png",
    "football-frenzy": "Football Frenzy (NGM-034)(NGH-034).png",
    "samurai-shodown": "Samurai Shodown _ Samurai Spirits (NGH-045).png",
    "world-heroes-2": "World Heroes 2 (ALM-006)(ALH-006).png",
    "fatal-fury-special": "Fatal Fury Special _ Garou Densetsu Special (set 1)(NGM-058)(NGH-058).png",
    "sengoku-2": "Sengoku 2 _ Sengoku Denshou 2.png",
    "3-count-bout": "3 Count Bout _ Fire Suplex (NGM-043)(NGH-043).png",
    "spinmaster": "Spin Master _ Miracle Adventure.png",
    "kof94": "The King of Fighters '94 (NGM-055)(NGH-055).png",
    "samurai-shodown-2": "Samurai Shodown II _ Shin Samurai Spirits - Haohmaru jigokuhen (NGM-063)(NGH-063).png",
    "art-of-fighting-2": "Art of Fighting 2 _ Ryuuko no Ken 2 (NGH-056).png",
    "world-heroes-2-jet": "World Heroes 2 Jet (ADM-007)(ADH-007).png",
    "aggressors-of-dark-kombat": "Aggressors of Dark Kombat _ Tsuukai GANGAN Koushinkyoku (ADM-008)(ADH-008).png",
    "top-hunter": "Top Hunter - Roddy _ Cathy (NGH-046).png",
    "aero-fighters-2": "Aero Fighters 2 _ Sonic Wings 2.png",
    "zed-blade": "Zed Blade _ Operation Ragnarok.png",
    "fight-fever": "Fight Fever (set 1).png",
    "windjammers": "Windjammers _ Flying Power Disc.png",
    "street-hoop": "Street Hoop _ Street Slam _ Dunk Dream (DEM-004) (DEH-004).png",
    "power-spikes-2": "Power Spikes II (NGM-068).png",
    "super-sidekicks-2": "Super Sidekicks 2 - The World Championship _ Tokuten Ou 2 - real fight football (NGM-061)(NGH-061).png",
    "puzzle-bobble": "Puzzle Bobble _ Bust-A-Move (Neo-Geo) (NGM-083).png",
    "gururin": "Gururin.png",
    "kof95": "The King of Fighters '95 (NGH-084).png",
    "fatal-fury-3": "Fatal Fury 3 - Road to the Final Victory _ Garou Densetsu 3 - haruka-naru tatakai (NGM-069)(NGH-069).png",
    "savage-reign": "Savage Reign _ Fu'un Mokushiroku - kakutou sousei.png",
    "samurai-shodown-3": "Samurai Shodown III _ Samurai Spirits - Zankurou Musouken (NGH-087).png",
    "world-heroes-perfect": "World Heroes Perfect.png",
    "real-bout-fatal-fury": "Real Bout Fatal Fury _ Real Bout Garou Densetsu (NGM-095)(NGH-095).png",
    "galaxy-fight": "Galaxy Fight - Universal Warriors.png",
    "double-dragon-neo": "Double Dragon (Neo-Geo).png",
    "voltage-fighter-gowcaizer": "Voltage Fighter - Gowcaizer _ Choujin Gakuen Gowcaizer.png",
    "kabuki-klash": "Far East of Eden - Kabuki Klash _ Tengai Makyou - Shin Den.png",
    "pulstar": "Pulstar.png",
    "aero-fighters-3": "Aero Fighters 3 _ Sonic Wings 3.png",
    "puzzle-bobble-2": "Puzzle Bobble 2 _ Bust-A-Move Again (Neo-Geo).png",
    "puzzle-de-pon": "Puzzle De Pon!.png",
    "goal-goal-goal": "Goal! Goal! Goal!.png",
    "super-sidekicks-3": "Super Sidekicks 3 - The Next Glory _ Tokuten Ou 3 - eikou e no michi.png",
    "stakes-winner": "Stakes Winner _ Stakes Winner - GI kinzen seiha e no michi.png",
    "metal-slug": "Metal Slug - Super Vehicle-001.png",
    "neo-turf-masters": "Neo Turf Masters _ Big Tournament Golf.png",
    "kof96": "The King of Fighters '96 (NGH-214).png",
    "art-of-fighting-3": "Art of Fighting 3 - The Path of the Warrior _ Art of Fighting - Ryuuko no Ken Gaiden.png",
    "samurai-shodown-4": "Samurai Shodown IV - Amakusa's Revenge _ Samurai Spirits - Amakusa Kourin (NGM-222)(NGH-222).png",
    "kizuna-encounter": "Kizuna Encounter - Super Tag Battle _ Fu'un Super Tag Battle.png",
    "ninja-masters": "Ninja Master's - haoh-ninpo-cho.png",
    "waku-waku-7": "Waku Waku 7.png",
    "breakers": "Breakers.png",
    "ragnagard": "Ragnagard _ Shin-Oh-Ken.png",
    "twinkle-star-sprites": "Twinkle Star Sprites.png",
    "over-top": "Over Top.png",
    "magical-drop-2": "Magical Drop II.png",
    "neo-mr-do": "Neo Mr. Do!.png",
    "tecmo-world-soccer-96": "Tecmo World Soccer '96.png",
    "super-dodge-ball": "Super Dodge Ball _ Kunio no Nekketsu Toukyuu Densetsu.png",
    "the-ultimate-11": "The Ultimate 11 - The SNK Football Championship _ Tokuten Ou - Honoo no Libero.png",
    "kof97": "The King of Fighters '97 (NGH-2320).png",
    "last-blade": "The Last Blade _ Bakumatsu Roman - Gekka no Kenshi (NGH-2340).png",
    "real-bout-fatal-fury-special": "Real Bout Fatal Fury Special _ Real Bout Garou Densetsu Special.png",
    "shock-troopers": "Shock Troopers (set 1).png",
    "neo-bomberman": "Neo Bomberman.png",
    "money-puzzle-exchanger": "Money Puzzle Exchanger _ Money Idol Exchanger.png",
    "magical-drop-3": "Magical Drop III.png",
    "pop-n-bounce": "Pop 'n Bounce _ Gapporin.png",
    "kof98": "The King of Fighters '98 - The Slugfest _ King of Fighters '98 - dream match never ends (NGH-2420).png",
    "last-blade-2": "The Last Blade 2 _ Bakumatsu Roman - Dai Ni Maku Gekka no Kenshi (NGM-2430)(NGH-2430).png",
    "real-bout-fatal-fury-2": "Real Bout Fatal Fury 2 - The Newcomers _ Real Bout Garou Densetsu 2 - the newcomers (NGH-2400).png",
    "breakers-revenge": "Breakers Revenge.png",
    "metal-slug-2": "Metal Slug 2 - Super Vehicle-001_II (NGM-2410) (NGH-2410).png",
    "blazing-star": "Blazing Star.png",
    "shock-troopers-2nd-squad": "Shock Troopers - 2nd Squad.png",
    "neo-geo-cup-98": "Neo-Geo Cup '98 - The Road to the Victory.png",
    "garou-motw": "Garou - Mark of the Wolves (NGH-2530).png",
    "kof99": "The King of Fighters '99 - Millennium Battle (NGH-2510).png",
    "metal-slug-x": "Metal Slug X - Super Vehicle-001 (NGM-2500)(NGH-2500).png",
    "prehistoric-isle-2": "Prehistoric Isle 2.png",
    "strikers-1945-plus": "Strikers 1945 Plus.png",
    "ganryu": "Ganryu _ Musashi Ganryuki.png",
    "captain-tomaday": "Captain Tomaday.png",
    "metal-slug-3": "Metal Slug 3 (NGH-2560).png",
    "kof2000": "The King of Fighters 2000 (NGM-2570) (NGH-2570).png",
    "bang-bead": "Bang Bead.png",
    "nightmare-in-the-dark": "Nightmare in the Dark.png",
    "kof2001": "The King of Fighters 2001 (NGH-2621).png",
    "sengoku-3": "Sengoku 3 _ Sengoku Densho 2001 (set 1).png",
    "kof2002": "The King of Fighters 2002 (NGM-2650)(NGH-2650).png",
    "metal-slug-4": "Metal Slug 4 (NGH-2630).png",
    "rage-of-the-dragons": "Rage of the Dragons (NGM-264_).png",
    "kof2003": "The King of Fighters 2003 (NGH-2710).png",
    "metal-slug-5": "Metal Slug 5 (NGH-2680).png",
    "samurai-shodown-5": "Samurai Shodown V _ Samurai Spirits Zero (NGH-2700).png",
    "matrimelee": "Matrimelee _ Shin Gouketsuji Ichizoku Toukon (NGM-2660) (NGH-2660).png",
    "pochi-and-nyaa": "Pochi and Nyaa (Ver 2.02).png",
    "samurai-shodown-5-special": "Samurai Shodown V Special _ Samurai Spirits Zero Special (NGH-2720) (2nd release, less censored).png"
}


def fetch(job):
    slug, fn, kind = job
    folder, rel, lossy = KINDS[kind]
    out = os.path.join(ROOT, slug, *rel.split("/"))
    if os.path.exists(out) and not FORCE:
        return slug, kind, "skip"
    req = urllib.request.Request(HOST + folder + "/" + urllib.parse.quote(fn), headers={"User-Agent": "Mozilla/5.0 (neogeo-museum)"})
    try:
        data = urllib.request.urlopen(req, timeout=90).read()
    except Exception as e:
        return slug, kind, f"FAIL {e}"
    im = Image.open(io.BytesIO(data))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if lossy:
        im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
        if im.width > 720:
            im = im.resize((720, round(im.height * 720 / im.width)), Image.LANCZOS)
        im.save(out, "WEBP", quality=82, method=6)
    else:
        im.convert("RGB").save(out, "WEBP", lossless=True, method=6)
    return slug, kind, "ok"


if __name__ == "__main__":
    jobs = [(s, f, k) for s, f in BOXART.items() for k in KINDS if not ONLY or k == ONLY]
    with cf.ThreadPoolExecutor(8) as ex:
        for slug, kind, status in ex.map(fetch, jobs):
            print(f"{status:4} {kind:6} {slug}")
