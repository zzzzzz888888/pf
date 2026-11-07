# 作品集網站 — UIUX 版（pf）

鄭芯繻 Jheng Sin-Ru 的個人作品集，**投遞 UIUX／產品設計職缺用**。

- 網址：https://zzzzzz888888.github.io/pf/
- Repo：https://github.com/zzzzzz888888/pf（main 分支，GitHub Pages 直接發佈）
- 姊妹站：**平面設計版** 在 `C:\Users\user\Desktop\gd`（https://zzzzzz888888.github.io/gd/）。兩站各自獨立；使用者明講「兩個網站都要改」才同步修改兩邊。

## 定位
以 UIUX 產品設計為主軸，平面設計與動態圖像為輔。首頁作品分類順序：UIUX → 平面 → 動態。

## 結構
- `index.html` 首頁：關於我（照片、工具／UIUX 技能標籤）、工作經歷、自我介紹、作品分類（hover 換圖）。Hero 輪播目前隱藏。
- `uiux.html` UIUX 列表 → `project-*.html` 各專案頁（`project.html` 是範本遺留的 Tide 頁）
- `graphic.html` 平面設計 masonry 圖牆，每張 `.shot` 用 `data-cat / data-title / data-client / data-images` 定義，點擊開 lightbox；加 `hidden` 屬性可暫時隱藏不刪除
- `motion.html` 動態圖像（影片在 `videos/`）
- `assets/styles.css`、`assets/main.js` 全站共用（Lenis + GSAP）。改了 CSS/JS 要更新各頁的 `?v=` 版本號避免快取。
- 圖片在 `images/`：新增圖片一律先壓縮（寬最多 2400px、JPEG 品質約 85），作品牆用 `images/thumb/` 的 1000px 縮圖並加 `loading="lazy"` 與 width/height；影片用 H.264、寬最多 1920、faststart。未壓縮原檔備份在 `_originals/`（已加入 .gitignore，不上傳）。

## 工作習慣
- 每次修改一個主題就 commit，訊息用「頁面: 改了什麼」格式（例：`Graphic: move X to position 2`），然後 push 到 main。
- 分頁標題格式：`頁名 — Jheng Sin-Ru`。
