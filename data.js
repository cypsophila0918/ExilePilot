// 示範內容只用於操作介面，正式資料須另外提供版本與來源。
const chapters = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  steps: [
    { area: "示範區域 A", task: "確認出發方向", detail: "示範起點" },
    { area: "示範區域 B", task: "啟用傳送點", detail: "傳送點提醒示範" },
    { area: "示範區域 C", task: "檢查支線獎勵", detail: "天賦點獎勵提醒示範" },
  ],
}));
const demoBuild = {
  name: "內建流派（操作示範）",
  stages: [
    { level: 1, title: "過渡配置", active: "示範主動寶石 A（紅）", support: "示範輔助寶石 A（紅）", sockets: "2 連，紅－紅" },
    { level: 12, title: "切換配置", active: "示範主動寶石 B（藍）", support: "示範輔助寶石 B（綠）", sockets: "2 連，藍－綠" },
  ],
};
const demoNotice = "介面示範 v0.1｜來源：ExilePilot 自製範例。POE1 適用版本未驗證。";
