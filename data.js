// 第一章依繁中區域與任務資料整理。資料版次 1，來源未標示客戶端小版本。
const actOne = {
  id: 1,
  progressKey: "act1-zh-hant-v1",
  source: "https://poedb.tw/tw/Act_1",
  steps: [
    {"area":"絕望岩灘","task":"大門口的敵人","detail":"擊敗西拉克，進入獅眼守望。"},
    {"area":"獅眼守望","task":"領取起始技能寶石","detail":"找塔格拉領取職業可用的技能寶石，接著從城鎮前往暮光海灘。"},
    {"area":"暮光海灘","task":"啟用傳送點","detail":"開啟傳送點後，從暮光海灘進入海潮孤島。"},
    {"area":"海潮孤島","task":"醫者之心","detail":"擊敗酷寒之使，拾取醫藥箱。回獅眼守望交給奈莎，可領水銀藥劑，再傳送回暮光海灘。"},
    {"area":"炙熱鹽沼","task":"打破鳥蛋","detail":"從暮光海灘進入，翻找三處恐喙鳥巢。將三枚雕紋放入石壁上的凹槽，開啟海潮地穴入口。"},
    {"area":"海潮地穴","task":"啟用傳送點","detail":"開啟傳送點。先找通往水聲之淵的入口，完成天賦點支線。"},
    {"area":"水聲之淵","task":"黑淵危機 · 1 點天賦","detail":"擊敗深淵巨蟹。回獅眼守望找塔格拉領取並使用天賦之書，再傳送回海潮地穴。"},
    {"area":"沉寂海崖","task":"啟用傳送點","detail":"從海潮地穴進入，開啟傳送點後前往碎岩山坡。"},
    {"area":"碎岩山坡","task":"前往禁靈之獄下層","detail":"啟用傳送點，穿過碎岩山坡進入禁靈之獄下層。"},
    {"area":"禁靈之獄下層","task":"傳送點與昇華試煉","detail":"啟用傳送點。找出並完成昇華試煉，接著進入禁靈之獄上層。"},
    {"area":"禁靈之獄上層","task":"衝出監牢","detail":"擊敗典獄長布魯特斯，沿出口前往監獄大門。"},
    {"area":"監獄大門","task":"啟用傳送點","detail":"開啟傳送點，前往魅影船墓。開路先鋒的天賦點要等第二章打通西部密林的路障後，回獅眼守望找畢斯特領取。"},
    {"area":"魅影船墓","task":"啟用傳送點並找費爾船長","detail":"開啟傳送點，與費爾船長交談，再找魅影船墓洞穴的入口。"},
    {"area":"魅影船墓洞穴","task":"取得不滅之火","detail":"拾取不滅之火，原路返回魅影船墓。"},
    {"area":"魅影船墓","task":"被放逐的水手 · 1 點天賦","detail":"將不滅之火交給費爾船長並擊敗他。回獅眼守望找畢斯特領取並使用天賦之書，再傳送回魅影船墓。"},
    {"area":"怨忿之窟","task":"啟用傳送點","detail":"從魅影船墓進入，開啟傳送點，繼續前往怨忿之窟深處。"},
    {"area":"怨忿之窟深處","task":"海妖之歌","detail":"擊敗海妖莫薇兒，從出口進入南部森林。"},
    {"area":"南部森林","task":"進入第二章","detail":"穿過南部森林，抵達森林營地。"},
  ],
};
// 其他章節的內容僅用於示範。
const chapters = Array.from({ length: 10 }, (_, index) => index === 0 ? actOne : ({
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

// POE1 繁中寶石對照 v1。精確對照名稱與物品識別碼，保留不同寶石變體。
const gemTranslations = new Map([
  ["Fireball", "SkillGemFireball", "火球"],
  ["Freezing Pulse", "SkillGemFreezingPulse", "冰霜脈衝"],
  ["Arcane Surge Support", "SupportGemArcaneSurge", "秘能波動輔助"],
  ["Frostblink", "SkillGemFrostblink", "霜漣之瞬"],
  ["Added Lightning Damage Support", "SupportGemAddedLightningDamage", "附加閃電傷害輔助"],
  ["Arc", "SkillGemArc", "電弧"],
].flatMap(([english, id, chinese]) => [[english, chinese], [id, chinese]]));

function displayGem(name) {
  const original = name.trim();
  const translated = gemTranslations.get(original.replace(/^Metadata\/Items\/Gems\//, ""));
  if (translated) return translated;
  return /\p{Script=Han}/u.test(original) ? original : `原文：${original}`;
}

// 女巫第一章入門建議。取得順序取決於任務，角色等級只決定能否裝上寶石。
const witchStarter = {
  name: "女巫第一章入門",
  steps: [
    { task: "大門口的敵人", title: "絕望岩灘｜火球＋秘能波動輔助", text: "先拿火球打怪，再從途中箱子拿秘能波動輔助。放進同一件裝備的兩個相連藍孔。沒有連線時，先單用火球。" },
    { task: "領取起始技能寶石", title: "大門口的敵人｜選冰霜脈衝", text: "擊敗西拉克後找塔格拉選冰霜脈衝，換下火球，繼續連秘能波動輔助（藍—藍）。投射物可以穿過多個敵人。選過其他獎勵也可找奈莎購買。" },
    { task: "醫者之心", title: "醫者之心｜選水銀藥劑", text: "把醫藥箱交給奈莎後選水銀藥劑，跑圖時使用。主技能繼續用冰霜脈衝。" },
    { task: "打破鳥蛋", title: "打破鳥蛋｜選霜漣之瞬", text: "打開海潮地穴後，回獅眼守望找塔格拉選霜漣之瞬。角色達 4 級可裝進另一個藍孔並綁到技能列，用來位移。主技能維持原本的兩連。" },
    { task: "衝出監牢", title: "衝出監牢｜選附加閃電傷害輔助", text: "打倒典獄長布魯特斯後回獅眼守望領獎。角色達 8 級且智慧至少 18，可用三個相連藍孔放冰霜脈衝、秘能波動輔助和附加閃電傷害輔助。只有兩連時，可先用冰霜脈衝連附加閃電傷害輔助。" },
  ],
  sources: [
    ["火球", "https://poedb.tw/tw/Fireball"],
    ["冰霜脈衝", "https://poedb.tw/tw/Freezing_Pulse"],
    ["秘能波動輔助", "https://poedb.tw/tw/Arcane_Surge_Support"],
    ["打破鳥蛋獎勵", "https://poedb.tw/tw/Breaking_Some_Eggs"],
    ["霜漣之瞬", "https://poedb.tw/tw/Frostblink"],
    ["附加閃電傷害輔助", "https://poedb.tw/tw/Added_Lightning_Damage_Support"],
  ],
};
