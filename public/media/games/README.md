# 媒體素材資料夾

每款遊戲一個資料夾，資料夾名稱 = `src/content/games/<slug>.md` 的檔名。放入後重新 build 即會自動取代示意圖：

```
public/media/games/kof98/
├── flyer.jpg          # 街機宣傳海報（直式）
├── mvs.jpg            # MVS 卡帶封面 / 標籤
├── aes.jpg            # AES 卡帶封面
├── screens/
│   ├── 01.png         # 建議 320×224 原生解析度
│   └── 02.png
└── ost/
    ├── 01 Title.mp3   # 檔名去掉前綴編號後即為曲名
    └── 02 Stage.mp3
```

支援格式：圖片 webp / avif / jpg / png / gif；音訊 mp3 / ogg / opus / m4a / wav。

**版權提醒**：海報、卡帶美術、截圖與原聲屬於 SNK 及各權利人。公開部署前請確認你擁有使用授權（或僅作私人典藏）。
