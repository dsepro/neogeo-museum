# -*- coding: utf-8 -*-
"""
一次性資料播種腳本：產生 src/content/games/<slug>.md
⚠ 目前 src/content/games/*.md 已更新為完整中文簡介與譯名，請勿再用 --force 覆寫。
- 已存在的 .md 不會覆寫（除非加 --force），方便你之後手動編輯內容。
- 年份以 MVS 首發年份為準；資料為整理版本，歡迎逐筆校對。
用法：python scripts/seed_games.py [--force]
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "content", "games")
FORCE = "--force" in sys.argv

# (slug, title, titleZh, year, genre, subgenre, devKey, devName, description, featured)
# genre: fighting | action | sports-puzzle     devKey: snk | adk | nazca | other
G = [
# ---------------- 1990 ----------------
("nam-1975","NAM-1975","",1990,"action","越戰題材射擊","snk","SNK","Neo Geo 第一批推出的遊戲之一（NGH-001）。以越戰為背景、準星與角色同屏操作的第三人稱射擊，開場的電影式演出在當年非常前衛。",False),
("magician-lord","Magician Lord","魔幻戰士",1990,"action","橫向動作","adk","ADK","ADK 為 Neo Geo 首發陣容打造的魔幻動作遊戲。主角 Elta 可透過寶珠變身成多種形態，以高難度與華麗的大型角色著稱。",False),
("baseball-stars-professional","Baseball Stars Professional","",1990,"sports-puzzle","棒球","snk","SNK","SNK 早期的棒球代表作，延續 FC 版《Baseball Stars》的玩法，以誇張演出與爽快打擊感受到玩家歡迎。",False),
("top-players-golf","Top Player's Golf","",1990,"sports-puzzle","高爾夫","snk","SNK","Neo Geo 首發的高爾夫遊戲，提供俯視與擊球視角，展示了 MVS 早期的大容量卡帶優勢。",False),
("riding-hero","Riding Hero","",1990,"sports-puzzle","賽車（機車）","snk","SNK","SNK 的機車賽車遊戲，是 Neo Geo 首發年份的競速作品之一。",False),
("cyber-lip","Cyber-Lip","",1990,"action","橫向射擊","snk","SNK","科幻題材的橫向卷軸射擊動作遊戲，在 Neo Geo 首年推出，玩法類似《魂斗羅》式的跑跳射擊。",False),
("ninja-combat","Ninja Combat","",1990,"action","清版動作","adk","ADK","ADK 的忍者清版動作遊戲，雙人合作、可收服敵方忍者作為可用角色。",False),
("the-super-spy","The Super Spy","",1990,"action","第一人稱格鬥","snk","SNK","少見的第一人稱視角近身格鬥/射擊動作遊戲，玩家扮演特務潛入大樓。",False),
("blues-journey","Blue's Journey","",1990,"action","平台動作","adk","ADK","色彩明亮的 ADK 平台動作遊戲（日版名《Raguy》），可縮小身體進入隱藏區域。",False),
("league-bowling","League Bowling","",1990,"sports-puzzle","保齡球","snk","SNK","支援多人輪流遊玩的保齡球遊戲，是早期 MVS 機台中常見的休閒選擇。",False),
("puzzled","Puzzled","",1990,"sports-puzzle","益智（方塊）","other","Video System","Video System 開發的方塊益智遊戲（日版《Joy Joy Kid》），以類俄羅斯方塊的消除玩法搭配可愛角色。",False),
# ---------------- 1991 ----------------
("fatal-fury","Fatal Fury: King of Fighters","餓狼傳說",1991,"fighting","2D 格鬥","snk","SNK","《餓狼傳說》系列首作。Terry、Andy 與 Joe 前往南鎮挑戰 Geese Howard，引入前後兩條「線」移動的雙線戰鬥系統。",True),
("king-of-the-monsters","King of the Monsters","怪獸之王",1991,"fighting","巨獸摔角","snk","SNK","巨大怪獸在城市中展開摔角式對決，可破壞建築物，充滿特攝片風味。",False),
("burning-fight","Burning Fight","",1991,"action","清版動作","snk","SNK","SNK 的都市清版動作遊戲，三名警探在街頭與黑幫展開肉搏。",False),
("sengoku","Sengoku","戰國傳承",1991,"action","清版動作","snk","SNK","現代都市與戰國亡靈交錯的清版動作遊戲，主角可變身為武士、忍者等形態。",False),
("ghost-pilots","Ghost Pilots","",1991,"action","縱向射擊","snk","SNK","以水上飛機為主角的縱向射擊遊戲，畫面帶有二戰風格。",False),
("alpha-mission-2","Alpha Mission II","",1991,"action","縱向射擊","snk","SNK","SNK 經典射擊《ASO》的續作，可在關卡間購買裝甲強化戰機。",False),
("crossed-swords","Crossed Swords","",1991,"action","第三人稱劍鬥","adk","ADK","從角色背後視角進行的劍鬥 RPG 式動作遊戲，強調格擋與時機。",False),
("robo-army","Robo Army","",1991,"action","清版動作","snk","SNK","以賽博格戰士為主角的清版動作遊戲。",False),
("thrash-rally","Thrash Rally","",1991,"sports-puzzle","賽車（拉力）","adk","ADK","ADK 的俯視角拉力賽車遊戲，可選擇多款車輛遠征世界賽道。",False),
# ---------------- 1992 ----------------
("art-of-fighting","Art of Fighting","龍虎之拳",1992,"fighting","2D 格鬥","snk","SNK","首創「超必殺技」與「氣力量表」，並以鏡頭縮放（Zoom）呈現大型角色。Ryo 與 Robert 營救 Yuri 的故事拉開序幕。",True),
("world-heroes","World Heroes","世界英雄",1992,"fighting","2D 格鬥","adk","ADK","ADK 的格鬥代表作，集合宮本武藏、聖女貞德、拉斯普丁等歷史人物穿越時空對戰。",False),
("fatal-fury-2","Fatal Fury 2","餓狼傳說2",1992,"fighting","2D 格鬥","snk","SNK","系列第二作開放 8 名角色自由選擇，加入不知火舞，並由 Wolfgang Krauser 擔任最終頭目。",False),
("king-of-the-monsters-2","King of the Monsters 2","怪獸之王2",1992,"fighting","巨獸摔角","snk","SNK","巨獸摔角續作，加入橫向移動的關卡段落，擴大了舞台與演出。",False),
("last-resort","Last Resort","",1992,"action","橫向射擊","snk","SNK","帶有濃厚 R-Type 影子的橫向射擊，以可旋轉的子機 Unit 與陰暗的賽博龐克美術著稱。",False),
("mutation-nation","Mutation Nation","",1992,"action","清版動作","snk","SNK","對抗突變怪物的清版動作遊戲，色彩鮮艷、敵人造型怪誕。",False),
("ninja-commando","Ninja Commando","",1992,"action","俯視射擊","adk","ADK","ADK 的俯視角忍者射擊遊戲，故事涉及穿越不同時代。",False),
("andro-dunos","Andro Dunos","",1992,"action","橫向射擊","other","Visco","Visco 開發的橫向射擊，可即時切換四種武器並升級。",False),
("viewpoint","Viewpoint","",1992,"action","斜角射擊","other","Aicom","以斜向等角（Isometric）視角呈現的射擊遊戲，偽 3D 畫面與電子音樂令人印象深刻。",False),
("super-sidekicks","Super Sidekicks","得點王",1992,"sports-puzzle","足球","snk","SNK","SNK《得點王》系列首作，大型球員角色與射門特寫奠定系列風格。",False),
("baseball-stars-2","Baseball Stars 2","",1992,"sports-puzzle","棒球","snk","SNK","《Baseball Stars》續作，畫面與演出全面強化。",False),
("football-frenzy","Football Frenzy","",1992,"sports-puzzle","美式足球","snk","SNK","SNK 的美式足球遊戲，以誇張的衝撞演出為特色。",False),
# ---------------- 1993 ----------------
("samurai-shodown","Samurai Shodown","侍魂",1993,"fighting","武器格鬥","snk","SNK","SNK 武器格鬥里程碑：重斬一刀的高傷害、怒氣量表、送道具的飛腳，以及幕末日本的和風美術。頭目為天草四郎時貞。",True),
("world-heroes-2","World Heroes 2","世界英雄2",1993,"fighting","2D 格鬥","adk","ADK","《World Heroes》續作，大幅增加可用角色並擴充系統。",False),
("fatal-fury-special","Fatal Fury Special","餓狼傳說SPECIAL",1993,"fighting","2D 格鬥","snk","SNK","《餓狼傳說2》的強化版，全角色可用並加入連段系統，隱藏挑戰者為《龍虎之拳》的 Ryo Sakazaki。",False),
("sengoku-2","Sengoku 2","戰國傳承2",1993,"action","清版動作","snk","SNK","《戰國傳承》續作，延續現代與戰國交錯的世界觀與變身玩法。",False),
("3-count-bout","3 Count Bout","",1993,"fighting","職業摔角","snk","SNK","SNK 的職業摔角格鬥（日版《Fire Suplex》），擂台內外皆可戰鬥。",False),
("spinmaster","Spinmaster","",1993,"action","平台動作","other","Data East","Data East 的卡通風平台動作遊戲（日版《Miracle Adventure》），以溜溜球作為武器。",False),
# ---------------- 1994 ----------------
("kof94","The King of Fighters '94","拳皇94",1994,"fighting","2D 格鬥（3 對 3）","snk","SNK","KOF 系列首作。集合《餓狼傳說》、《龍虎之拳》、《怒》等 SNK 角色，以三人一隊的團體戰為核心，最終頭目為 Rugal Bernstein。",True),
("samurai-shodown-2","Samurai Shodown II","真侍魂 霸王丸地獄變",1994,"fighting","武器格鬥","snk","SNK","被許多玩家視為系列巔峰。加入翻滾、伏地閃避與「武器破壞技」，新角色包括牙神幻十郎等。",True),
("art-of-fighting-2","Art of Fighting 2","龍虎之拳2",1994,"fighting","2D 格鬥","snk","SNK","《龍虎之拳》續作，全角色可選，以超高難度電腦 AI 聞名，Geese Howard 青年時期登場。",False),
("world-heroes-2-jet","World Heroes 2 Jet","世界英雄2 Jet",1994,"fighting","2D 格鬥","adk","ADK","《World Heroes 2》的強化版本，調整平衡並加入新角色。",False),
("aggressors-of-dark-kombat","Aggressors of Dark Kombat","痛快GANGAN行進曲",1994,"fighting","街頭格鬥","adk","ADK","ADK 的街頭風格格鬥，可在有縱深的地面自由走位，並撿拾場景中的武器。",False),
("top-hunter","Top Hunter","",1994,"action","橫向動作","snk","SNK","色彩繽紛的雙線平台動作遊戲（全名《Top Hunter: Roddy & Cathy》），可在前景與背景之間切換。",False),
("aero-fighters-2","Aero Fighters 2","",1994,"action","縱向射擊","other","Video System","Video System 的縱向射擊（日版《Sonic Wings 2》），角色選擇與幽默結局是特色。",False),
("zed-blade","Zed Blade","",1994,"action","橫向射擊","other","NMK","NMK 的橫向射擊，可自由組合前方、後方與導彈三種武器。",False),
("fight-fever","Fight Fever","",1994,"fighting","2D 格鬥","other","Viccom","韓國 Viccom 開發的 Neo Geo 格鬥遊戲。",False),
("windjammers","Windjammers","",1994,"sports-puzzle","飛盤對戰","other","Data East","Data East 的飛盤對戰運動遊戲（日版《Flying Power Disc》），節奏極快、至今仍有大量對戰玩家。",True),
("street-hoop","Street Hoop","",1994,"sports-puzzle","街頭籃球","other","Data East","Data East 的三對三街頭籃球遊戲（又名《Street Slam》、《Dunk Dream》）。",False),
("power-spikes-2","Power Spikes II","",1994,"sports-puzzle","排球","other","Video System","Video System 開發的排球遊戲。",False),
("super-sidekicks-2","Super Sidekicks 2","得點王2",1994,"sports-puzzle","足球","snk","SNK","《得點王》續作，增加世界盃式賽制與更多國家隊伍。",False),
("puzzle-bobble","Puzzle Bobble","泡泡龍",1994,"sports-puzzle","益智（射泡泡）","other","Taito","Taito 以《Bubble Bobble》角色延伸的射泡泡益智遊戲，三顆同色相連即可消除，是 MVS 機台上的長青作品。",True),
("gururin","Gururin","",1994,"sports-puzzle","益智（旋轉方塊）","other","Face","Face 開發的益智遊戲，以旋轉操作為核心玩法。",False),
# ---------------- 1995 ----------------
("kof95","The King of Fighters '95","拳皇95",1995,"fighting","2D 格鬥（3 對 3）","snk","SNK","首度開放自由組隊（Team Edit），八神庵作為宿敵隊伍首次登場，揭開草薙與八神的恩怨。",True),
("fatal-fury-3","Fatal Fury 3","餓狼傳說3",1995,"fighting","2D 格鬥","snk","SNK","系列第三作，改為三線移動並加入山崎龍二、Blue Mary 等新角色。",False),
("savage-reign","Savage Reign","風雲默示錄",1995,"fighting","武器格鬥","snk","SNK","SNK 的雙層場景武器格鬥，角色可跳躍至上層平台進行攻擊。",False),
("samurai-shodown-3","Samurai Shodown III","侍魂3 斬紅郎無雙劍",1995,"fighting","武器格鬥","snk","SNK","系列第三作，每名角色分為「修羅」與「羅剎」兩種風格，畫面更寫實。",False),
("world-heroes-perfect","World Heroes Perfect","世界英雄 Perfect",1995,"fighting","2D 格鬥","adk","ADK","系列最終作，加入 ABC 招式（Hero Gauge）系統。",False),
("real-bout-fatal-fury","Real Bout Fatal Fury","餓狼傳說 Real Bout",1995,"fighting","2D 格鬥","snk","SNK","Real Bout 系列首作，引入擂台出界（Ring Out）與力量量表，Geese 的最終決戰。",False),
("galaxy-fight","Galaxy Fight","",1995,"fighting","2D 格鬥","other","Sunsoft","Sunsoft 的宇宙主題格鬥遊戲（全名《Galaxy Fight: Universal Warriors》），舞台左右可無限延伸。",False),
("double-dragon-neo","Double Dragon","雙截龍",1995,"fighting","2D 格鬥","other","Technos","Technos 將《雙截龍》改編為一對一格鬥遊戲，參考 1994 年電影版設定。",False),
("voltage-fighter-gowcaizer","Voltage Fighter Gowcaizer","",1995,"fighting","2D 格鬥","other","Technos","Technos 的特攝英雄風格格鬥（日版《超人學園 Gowcaizer》），可吸收對手招式。",False),
("kabuki-klash","Kabuki Klash","天外魔境 真傳",1995,"fighting","2D 格鬥","other","Hudson","Hudson 將 RPG《天外魔境》角色帶入格鬥遊戲。",False),
("pulstar","Pulstar","",1995,"action","橫向射擊","other","Aicom","Aicom 的預渲染 3D 畫面橫向射擊，常被視為 Neo Geo 上的 R-Type 精神繼承者。",False),
("aero-fighters-3","Aero Fighters 3","",1995,"action","縱向射擊","other","Video System","Video System 的縱向射擊（日版《Sonic Wings 3》），延續系列的多國角色與幽默風格。",False),
("puzzle-bobble-2","Puzzle Bobble 2","泡泡龍2",1995,"sports-puzzle","益智（射泡泡）","other","Taito","《泡泡龍》續作，加入更多關卡與連鎖掉落規則，對戰性更強。",False),
("puzzle-de-pon","Puzzle De Pon!","",1995,"sports-puzzle","益智","other","Visco","Visco 開發的對戰益智遊戲。",False),
("goal-goal-goal","Goal! Goal! Goal!","",1995,"sports-puzzle","足球","other","Visco","Visco 的足球遊戲，節奏輕快。",False),
("super-sidekicks-3","Super Sidekicks 3: The Next Glory","得點王3",1995,"sports-puzzle","足球","snk","SNK","《得點王》系列第三作，擴充更多國家與聯賽。",False),
("stakes-winner","Stakes Winner","",1995,"sports-puzzle","賽馬","other","Saurus","Saurus 的賽馬遊戲，玩家扮演騎師在比賽中衝刺。",False),
# ---------------- 1996 ----------------
("metal-slug","Metal Slug","合金彈頭",1996,"action","Run & Gun","nazca","Nazca","由 Nazca 開發、SNK 發行的經典 Run & Gun 射擊。以極其細膩的手繪點陣動畫、坦克「Metal Slug」與幽默演出成為 Neo Geo 代名詞。",True),
("neo-turf-masters","Neo Turf Masters","",1996,"sports-puzzle","高爾夫","nazca","Nazca","Nazca 的高爾夫遊戲（日版《Big Tournament Golf》），操作直覺、球場多樣，評價極高。",True),
("kof96","The King of Fighters '96","拳皇96",1996,"fighting","2D 格鬥（3 對 3）","snk","SNK","系統大改：以翻滾取代閃避，加入奔跑與小跳，大蛇篇主線推進，頭目為 Goenitz。",False),
("art-of-fighting-3","Art of Fighting 3: The Path of the Warrior","龍虎之拳外傳",1996,"fighting","2D 格鬥","snk","SNK","系列第三作，使用動作捕捉製作動畫，畫風與前作截然不同，舞台移至墨西哥。",False),
("samurai-shodown-4","Samurai Shodown IV: Amakusa's Revenge","侍魂4 天草降臨",1996,"fighting","武器格鬥","snk","SNK","繼承「修羅/羅剎」雙風格，加入絕命奧義與自爆（切腹）機制。",False),
("kizuna-encounter","Kizuna Encounter","風雲 Super Tag Battle",1996,"fighting","2D 格鬥（Tag）","snk","SNK","《風雲默示錄》續作，改為兩人換手的 Tag 戰鬥。",False),
("ninja-masters","Ninja Master's","霸王忍法帖",1996,"fighting","武器格鬥","adk","ADK","ADK 與 SNK 合作的忍者武器格鬥，可隨時拔出或收起武器切換戰鬥方式。",False),
("waku-waku-7","Waku Waku 7","",1996,"fighting","2D 格鬥","other","Sunsoft","Sunsoft 的動畫風格格鬥，角色各自致敬經典動漫，以「Harahara Attack」大招著稱。",False),
("breakers","Breakers","",1996,"fighting","2D 格鬥","other","Visco","Visco 的格鬥遊戲，系統受《快打旋風》影響，操作手感流暢。",False),
("ragnagard","Ragnagard","神凰拳",1996,"fighting","2D 格鬥","other","Saurus","以預渲染 3D 角色製作的格鬥遊戲，視覺風格在 Neo Geo 上相當獨特。",False),
("twinkle-star-sprites","Twinkle Star Sprites","",1996,"action","對戰射擊","adk","ADK","ADK 的「對戰型縱向射擊」，擊破敵人可將攻擊送到對手畫面，是射擊與益智的混合體。",True),
("over-top","Over Top","",1996,"sports-puzzle","賽車","adk","ADK","ADK 的賽車遊戲，是 ADK 在 Neo Geo 上的後期作品之一。",False),
("magical-drop-2","Magical Drop II","",1996,"sports-puzzle","益智（抓取消除）","other","Data East","Data East 的快節奏消除益智，抓起並丟出同色球體觸發連鎖。",False),
("neo-mr-do","Neo Mr. Do!","",1996,"sports-puzzle","動作益智","other","Visco","經典《Mr. Do!》的 Neo Geo 重製版，挖掘隧道、收集水果。",False),
("tecmo-world-soccer-96","Tecmo World Soccer '96","",1996,"sports-puzzle","足球","other","Tecmo","Tecmo 在 Neo Geo 上推出的足球遊戲。",False),
("super-dodge-ball","Super Dodge Ball","熱血躲避球",1996,"sports-puzzle","躲避球","other","Technos","Technos 的熱血系列躲避球在 Neo Geo 上的作品，加入必殺球演出。",False),
("the-ultimate-11","The Ultimate 11","",1996,"sports-puzzle","足球","snk","SNK","《Super Sidekicks》系列的延續作（日版《得點王 炎のリベロ》）。",False),
# ---------------- 1997 ----------------
("kof97","The King of Fighters '97","拳皇97",1997,"fighting","2D 格鬥（3 對 3）","snk","SNK","大蛇篇完結作，可選擇 Advanced（MAX 發動）或 Extra（集氣）兩種模式，對戰熱潮席捲亞洲機廳。",True),
("last-blade","The Last Blade","幕末浪漫 月華の劍士",1997,"fighting","武器格鬥","snk","SNK","以幕末為背景的武器格鬥，提供「力」與「技」兩種戰鬥模式，美術與音樂廣受讚譽。",True),
("real-bout-fatal-fury-special","Real Bout Fatal Fury Special","餓狼傳說 RB Special",1997,"fighting","2D 格鬥","snk","SNK","Real Bout 系列強化版，取消出界設定並加入多名角色。",False),
("shock-troopers","Shock Troopers","",1997,"action","俯視射擊","other","Saurus","Saurus 的俯視角 Run & Gun，可選擇單人或三人小隊模式，節奏爽快。",True),
("neo-bomberman","Neo Bomberman","",1997,"sports-puzzle","動作益智","other","Hudson","Hudson 的《炸彈人》在 Neo Geo 上的作品，支援雙人合作與對戰。",False),
("money-puzzle-exchanger","Money Puzzle Exchanger","",1997,"sports-puzzle","益智（硬幣消除）","other","Face","以硬幣面額兌換規則消除的對戰益智遊戲，角色設計討喜。",False),
("magical-drop-3","Magical Drop III","",1997,"sports-puzzle","益智（抓取消除）","other","Data East","Magical Drop 系列第三作，以塔羅牌角色主題聞名。",False),
("pop-n-bounce","Pop 'n Bounce","",1997,"sports-puzzle","益智（打磚塊）","other","Video System","Video System 的打磚塊式益智遊戲（日版《Gapporin》）。",False),
# ---------------- 1998 ----------------
("kof98","The King of Fighters '98","拳皇98",1998,"fighting","2D 格鬥（3 對 3）","snk","SNK","沒有主線劇情的「夢幻對決」，集合歷代角色並大幅平衡系統，被廣泛視為系列最完成度的作品之一。",True),
("last-blade-2","The Last Blade 2","月華の劍士 第二幕",1998,"fighting","武器格鬥","snk","SNK","《月華劍士》續作，新增「極」模式（技與力的混合），音樂與演出更加成熟。",False),
("real-bout-fatal-fury-2","Real Bout Fatal Fury 2: The Newcomers","餓狼傳說 RB2",1998,"fighting","2D 格鬥","snk","SNK","Real Bout 系列最終作，新增 Rick Strowd 與李香緋兩名新角色。",False),
("breakers-revenge","Breakers Revenge","",1998,"fighting","2D 格鬥","other","Visco","《Breakers》的強化版，加入新角色並調整平衡。",False),
("metal-slug-2","Metal Slug 2","合金彈頭2",1998,"action","Run & Gun","snk","SNK","新增 Eri 與 Fio、多種新載具與木乃伊/肥胖化等狀態變化，但處理落差（掉格）明顯。",False),
("blazing-star","Blazing Star","",1998,"action","橫向射擊","other","Yumekobo","Yumekobo（前 Aicom 成員）的橫向射擊，以集氣射擊、華麗爆炸與日式英語語音著名。",False),
("shock-troopers-2nd-squad","Shock Troopers: 2nd Squad","",1998,"action","俯視射擊","other","Saurus","《Shock Troopers》續作，更換角色陣容並加入載具。",False),
("neo-geo-cup-98","Neo Geo Cup '98: The Road to the Victory","",1998,"sports-puzzle","足球","snk","SNK","配合 1998 年世界盃推出的 SNK 足球遊戲。",False),
# ---------------- 1999 ----------------
("garou-motw","Garou: Mark of the Wolves","餓狼 MARK OF THE WOLVES",1999,"fighting","2D 格鬥","snk","SNK","《餓狼傳說》系列世代交替之作。Geese 之子 Rock Howard 登場，Just Defense（精準防禦）與 T.O.P. 系統至今仍為格鬥迷津津樂道。",True),
("kof99","The King of Fighters '99","拳皇99",1999,"fighting","2D 格鬥（4 人隊伍）","snk","SNK","NESTS 篇開始，K' 成為新主角，改為四人一隊（三人上場、一人當 Striker 援護）。",False),
("metal-slug-x","Metal Slug X","合金彈頭X",1999,"action","Run & Gun","snk","SNK","《合金彈頭2》的重製強化版，重新配置敵人與武器、改善掉格問題，評價高於原版。",True),
("prehistoric-isle-2","Prehistoric Isle 2","",1999,"action","橫向射擊","other","Yumekobo","以恐龍為敵的橫向射擊遊戲，是 SNK 1989 年作品的續作。",False),
("strikers-1945-plus","Strikers 1945 Plus","",1999,"action","縱向射擊","other","Psikyo","Psikyo 的二戰題材縱向彈幕射擊，Neo Geo 版加入新機體。",False),
("ganryu","Ganryu","",1999,"action","橫向動作","other","Visco","以宮本武藏為主角的動作遊戲（日版《武藏巖流記》）。",False),
("captain-tomaday","Captain Tomaday","",1999,"action","縱向射擊","other","Visco","主角是一顆番茄超人的搞笑縱向射擊遊戲。",False),
# ---------------- 2000 ----------------
("metal-slug-3","Metal Slug 3","合金彈頭3",2000,"action","Run & Gun","snk","SNK","系列被公認的最高峰：分歧路線、大量載具與長達數十分鐘的最終關卡，點陣美術登峰造極。",True),
("kof2000","The King of Fighters 2000","拳皇2000",2000,"fighting","2D 格鬥（4 人隊伍）","snk","SNK","強化 Striker 系統（Active Striker），可在連段中呼叫援護，NESTS 篇高潮。",False),
("bang-bead","Bang Bead","",2000,"sports-puzzle","對戰打磚塊","other","Visco","類似《Windjammers》節奏的一對一對戰打球遊戲。",False),
("nightmare-in-the-dark","Nightmare in the Dark","",2000,"action","平台動作","other","Eleven / Gavaking","哥德風格的固定畫面平台動作遊戲，玩法近似《雪人兄弟》：先制住敵人再投擲清場。",False),
# ---------------- 2001 ----------------
("kof2001","The King of Fighters 2001","拳皇2001",2001,"fighting","2D 格鬥（4 人隊伍）","other","Eolith / Brezzasoft","SNK 破產後由韓國 Eolith 主導製作，可自由分配上場人數與 Striker 數量，NESTS 篇完結。",False),
("sengoku-3","Sengoku 3","戰國傳承3",2001,"action","清版動作","other","Noise Factory","由 Noise Factory 開發的系列第三作，轉為強調連段的格鬥式清版動作。",False),
# ---------------- 2002 ----------------
("kof2002","The King of Fighters 2002","拳皇2002",2002,"fighting","2D 格鬥（3 對 3）","other","Eolith","回歸 3 對 3 且無主線劇情的夢幻對決，MAX2 超必殺與可取消連段讓對戰極具深度。",True),
("metal-slug-4","Metal Slug 4","合金彈頭4",2002,"action","Run & Gun","other","Mega Enterprise / Noise Factory","由韓國 Mega Enterprise 與 Noise Factory 開發，加入新角色 Nadia 與 Trevor 以及連擊分數系統。",False),
("rage-of-the-dragons","Rage of the Dragons","",2002,"fighting","2D 格鬥（Tag）","other","Evoga / Noise Factory","原本構想為《雙截龍》精神續作的兩人換手格鬥遊戲。",False),
# ---------------- 2003 ----------------
("kof2003","The King of Fighters 2003","拳皇2003",2003,"fighting","2D 格鬥（交替制）","snk","SNK Playmore","改為可隨時換人的交替制，隊長可使用專屬 Leader 超必殺，Ash Crimson 篇開始。",False),
("metal-slug-5","Metal Slug 5","合金彈頭5",2003,"action","Run & Gun","snk","SNK Playmore","加入滑鏟動作與新載具，舞台以叢林與遺跡為主，音樂轉向搖滾風。",False),
("samurai-shodown-5","Samurai Shodown V","侍魂零",2003,"fighting","武器格鬥","other","Yuki Enterprise","時序回到初代之前的前傳作品，由 Yuki Enterprise 開發。",False),
("matrimelee","Matrimelee","鬥姬傳承",2003,"fighting","2D 格鬥","other","Noise Factory","Noise Factory 開發的格鬥遊戲，延續《Power Instinct（豪血寺一族）》系列的角色與風格。",False),
("pochi-and-nyaa","Pochi and Nyaa","",2003,"sports-puzzle","益智","other","Aiky","以貓狗角色為主題的益智遊戲，屬於 Neo Geo 晚期作品。",False),
# ---------------- 2004 ----------------
("samurai-shodown-5-special","Samurai Shodown V Special","侍魂零 Special",2004,"fighting","武器格鬥","other","Yuki Enterprise","《侍魂零》的強化版，加入「絕命奧義」演出；通常被視為官方 MVS/AES 平台上最後推出的商業遊戲之一。",True),
]

# ---------- 精選遊戲的出招表 / 按鍵資料（可自行增補） ----------
EXTRA = {
"kof98": {
  "controls": [
    {"button": "A", "action": "輕拳"}, {"button": "B", "action": "輕腳"},
    {"button": "C", "action": "重拳"}, {"button": "D", "action": "重腳"},
  ],
  "moves": [
    {"character": "共通系統", "moves": [
      {"name": "緊急迴避（翻滾）", "input": "AB", "type": "system"},
      {"name": "吹飛攻擊", "input": "CD", "type": "system"},
      {"name": "衝刺", "input": "66", "type": "system"},
      {"name": "後退步", "input": "44", "type": "system"},
      {"name": "Advanced：發動 MAX", "input": "ABC", "type": "system", "note": "需有能量珠"},
      {"name": "Extra：集氣", "input": "ABC", "type": "system", "note": "按住"},
    ]},
    {"character": "草薙京 Kyo Kusanagi", "moves": [
      {"name": "百八式・闇払い", "input": "236P", "type": "special"},
      {"name": "百式・鬼焼き", "input": "623P", "type": "special"},
      {"name": "七拾五式・改", "input": "236K", "type": "special"},
      {"name": "裏百八式・大蛇薙", "input": "2141236P", "type": "super", "note": "可按住蓄力"},
    ]},
    {"character": "八神庵 Iori Yagami", "moves": [
      {"name": "百八式・闇払い", "input": "236P", "type": "special"},
      {"name": "百式・鬼焼き", "input": "623P", "type": "special"},
      {"name": "百弐拾七式・葵花", "input": "214P", "type": "special", "note": "可連按三次"},
      {"name": "禁千弐百拾壱式・八稚女", "input": "236321P", "type": "super"},
    ]},
    {"character": "Terry Bogard", "moves": [
      {"name": "Power Wave", "input": "236A", "type": "special"},
      {"name": "Burn Knuckle", "input": "214P", "type": "special"},
      {"name": "Crack Shoot", "input": "214K", "type": "special"},
      {"name": "Rising Tackle", "input": "[2]8P", "type": "special"},
      {"name": "Power Geyser", "input": "21416P", "type": "super"},
    ]},
    {"character": "不知火舞 Mai Shiranui", "moves": [
      {"name": "花蝶扇", "input": "236P", "type": "special"},
      {"name": "龍炎舞", "input": "214P", "type": "special"},
      {"name": "必殺忍蜂", "input": "41236K", "type": "special"},
      {"name": "超必殺忍蜂", "input": "2141236K", "type": "super"},
    ]},
  ],
},
"samurai-shodown-2": {
  "controls": [
    {"button": "A", "action": "輕斬"}, {"button": "B", "action": "中斬"},
    {"button": "C", "action": "輕腳"}, {"button": "D", "action": "中腳"},
    {"button": "AB", "action": "重斬"}, {"button": "CD", "action": "重腳"},
  ],
  "moves": [
    {"character": "霸王丸 Haohmaru", "moves": [
      {"name": "旋風裂斬", "input": "236S", "type": "special"},
      {"name": "弧月斬", "input": "623S", "type": "special"},
    ]},
  ],
},
"metal-slug": {
  "controls": [
    {"button": "A", "action": "射擊（貼近敵人時自動改為近身攻擊）"},
    {"button": "B", "action": "跳躍"},
    {"button": "C", "action": "投擲手榴彈（搭乘 Metal Slug 時為主砲）"},
  ],
},
"metal-slug-x": {"controls": [
    {"button": "A", "action": "射擊 / 近身攻擊"}, {"button": "B", "action": "跳躍"}, {"button": "C", "action": "手榴彈 / 載具主砲"}]},
"metal-slug-3": {"controls": [
    {"button": "A", "action": "射擊 / 近身攻擊"}, {"button": "B", "action": "跳躍"}, {"button": "C", "action": "手榴彈 / 載具主砲"}]},
"puzzle-bobble": {"controls": [
    {"button": "←→", "action": "調整發射角度"}, {"button": "A", "action": "發射泡泡"}]},
"kof97": {"controls": [
    {"button": "A", "action": "輕拳"}, {"button": "B", "action": "輕腳"}, {"button": "C", "action": "重拳"}, {"button": "D", "action": "重腳"}]},
"kof2002": {"controls": [
    {"button": "A", "action": "輕拳"}, {"button": "B", "action": "輕腳"}, {"button": "C", "action": "重拳"}, {"button": "D", "action": "重腳"}]},
}

def y(v):  # YAML 是 JSON 超集
    return json.dumps(v, ensure_ascii=False)

def main():
    os.makedirs(OUT, exist_ok=True)
    seen = set(); written = 0; skipped = 0
    for (slug, title, zh, year, genre, sub, dev, devname, desc, featured) in G:
        assert slug not in seen, slug; seen.add(slug)
        assert genre in ("fighting", "action", "sports-puzzle"), slug
        assert dev in ("snk", "adk", "nazca", "other"), slug
        assert 1990 <= year <= 2004, slug
        path = os.path.join(OUT, slug + ".md")
        if os.path.exists(path) and not FORCE:
            skipped += 1; continue
        fm = [
            "---",
            f"title: {y(title)}",
        ]
        if zh: fm.append(f"titleZh: {y(zh)}")
        fm += [
            f"year: {year}",
            f"genre: {genre}",
            f"subgenre: {y(sub)}",
            f"developer: {dev}",
            f"developerName: {y(devname)}",
            f"featured: {'true' if featured else 'false'}",
        ]
        ex = EXTRA.get(slug, {})
        for k in ("controls", "moves", "softDip"):
            if k in ex: fm.append(f"{k}: {y(ex[k])}")
        fm += [
            "# 媒體檔：直接放入 public/media/games/" + slug + "/ 即可自動偵測",
            "#   flyer.jpg / mvs.jpg / aes.jpg / screens/*.png / ost/*.mp3",
            "---",
            "",
            desc,
            "",
        ]
        with open(path, "w", encoding="utf-8", newline="\n") as f:
            f.write("\n".join(fm))
        written += 1
    print(f"games total={len(G)} written={written} skipped(existing)={skipped}")

if __name__ == "__main__":
    main()
