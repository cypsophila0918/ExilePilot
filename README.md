# ExilePilot

Path of Exile 1 繁體中文劇情拓荒助手。

1. 在 Windows 11 用 Edge 或 Chrome 開啟 `index.html`。把檔案留在同一資料夾，無須安裝或啟動伺服器。
2. 選目前章節，依「目前要做」前進。完成後勾選，再按「下一步」。已在途中可展開「查看本章所有步驟」跳轉。進度儲存在目前瀏覽器與網址或檔案位置。
3. 新開啟網站預設使用「新手推薦｜烈炎風暴女巫」。「技能」依任務與角色等級顯示目前連線、孔位不足的搭配及本章取得方式；導航在相關任務顯示領取提示。
4. 匯入 PoB 時貼上 POE1 分享代碼或 XML。技能頁會顯示已核對的繁中寶石。其他名稱保留原文。天賦頁顯示 PoB 的原始配置摘要；配置摘要中的節點數不是點法順序。

## 資料版本

- 劇情路線 v1，以 POE1 3.29 時期資料為基準，2026-11-13 查閱 [繁中 3.30 公告](https://pathofexile.tw/forum/view-thread/295920)。各章介面連至對應的 [流亡編年史章節資料](https://poedb.tw/tw/Act_1)。走法及支線排列由 ExilePilot 整理；3.30 遊戲客戶端尚未實跑。
- 女巫以冰霜脈衝過渡，第三章換烈炎風暴，後續沿用四連。這是本專案的配石建議，各寶石需求、獎勵與商店資料列在「技能」的來源區。逐級天賦尚無適用於這套配置的已查核版本，介面會提示。
- PoB 匯入參照 [Community Fork 匯出程式](https://github.com/PathOfBuildingCommunity/PathOfBuilding/blob/dev/src/Classes/ImportTab.lua) 與 [寶石 ID](https://github.com/PathOfBuildingCommunity/PathOfBuilding/blob/dev/src/Data/Gems.lua)。譯名對照涵蓋已核對的寶石及部分變體，尚未覆蓋全遊戲。分享網址須先在 PoB 轉成分享代碼。

## 瀏覽器測試

GitHub Actions 的 Browser QA 用 Chromium 驗證桌面與手機寬度、十章導航、進度重整還原、女巫任務提示，以及真正的 POE1 PoB XML 和其壓縮分享代碼。測試資料使用 [PoB Community Fork 的 OccVortex.xml](https://github.com/PathOfBuildingCommunity/PathOfBuilding/blob/dev/spec/TestBuilds/3.13/OccVortex.xml)；它用來檢查相容性，不是內建女巫配置。

第一次遊玩可先開「新手教學」。第一章起點有開局捷徑，技能頁有補拿清單，兩場奇塔弗前可展開裝備與抗性檢查。
