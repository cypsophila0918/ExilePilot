# ExilePilot

Path of Exile 1（POE1）繁體中文拓荒助手。

## 預覽

1. 下載本專案後解壓縮，將所有檔案留在同一資料夾。
2. 使用 Windows 11 的 Edge 或 Chrome 開啟 `index.html`。網站可直接執行，無須安裝或啟動伺服器。
3. 先選目前章節。在「拓荒」查看「目前要做」，完成後勾選「標記這一步已完成」，再按「下一步」。「查看本章所有步驟」可展開完整清單，「地圖」可查看本章路線。展開「角色與流派設定」可調整角色等級、職業和流派。重新整理後可繼續操作。進度綁定瀏覽器與網址或檔案位置。
4. 在 POE1 版 Path of Building Community Fork 的匯入／匯出頁產生分享代碼。按網站右上角「匯入 PoB」並貼上代碼或原始 XML，再到「技能」或「天賦」查看。

## 資料來源與限制

- 第一章為 POE1 繁中路線資料 v1。2026-11-12 對照 [第一章區域與任務資料](https://poedb.tw/tw/Act_1)、[禁靈之獄下層](https://poedb.tw/tw/The_Lower_Prison)、[怨忿之窟](https://poedb.tw/tw/The_Cavern_of_Wrath)、[怨忿之窟深處](https://poedb.tw/tw/The_Cavern_of_Anger)、[被放逐的水手](https://poedb.tw/tw/The_Marooned_Mariner)及[開路先鋒](https://poedb.tw/tw/The_Way_Forward)。來源未標示客戶端小版本，尚未在遊戲中實跑。第一章正式路線有獨立的進度紀錄。
- 第 2 至第 10 章及內建流派沿用 ExilePilot 自製介面示範 v0.1。PoB 的寶石和昇華名稱目前可能保留匯入原文。
- 分享代碼格式依據 [Path of Building Community Fork 匯出程式](https://github.com/PathOfBuildingCommunity/PathOfBuilding/blob/dev/src/Classes/ImportTab.lua)。匯入只在瀏覽器處理。可讀取角色欄位、技能群組和天賦配置摘要。PoB 的版本欄位依原始資料顯示。
- 暫時無法直接抓取分享網址。缺少的寶石取得條件、逐級天賦及昇華時機會在介面提示。
- 網站以相對路徑載入，供 GitHub Pages 靜態託管使用。

## 女巫第一章入門

展開「角色與流派設定」，在流派選「女巫第一章入門」。第一章導航會在對應任務顯示領取與搭配建議，「技能」會列出完整順序及來源。資料版次 v1，依 2026-11-13 查閱的繁中遊戲資料整理。此入門配置涵蓋第一章寶石，未提供逐級天賦。PoB 技能群組目前可對照六顆已核對的寶石，其他保留原名。
