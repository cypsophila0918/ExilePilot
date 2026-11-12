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
// 各章用獨立版本鍵，保留第一章原有進度並隔離舊示範紀錄。
const chapters = [actOne, ...Object.entries(campaignRoutes).map(([chapter, rows]) => ({
  id: Number(chapter),
  progressKey: `act${chapter}-zh-hant-v1`,
  source: `https://poedb.tw/tw/Act_${chapter}`,
  steps: rows.map(([area, task, detail]) => ({ area, task, detail })),
}))];
const demoNotice = "介面示範 v0.1｜來源：ExilePilot 自製範例。POE1 適用版本未驗證。";

// POE1 繁中寶石對照 v1。精確對照名稱與物品識別碼，保留不同寶石變體。
const gemTranslations = new Map([
  ["Fireball", "SkillGemFireball", "火球"],
  ["Freezing Pulse", "SkillGemFreezingPulse", "冰霜脈衝"],
  ["Arcane Surge Support", "SupportGemArcaneSurge", "秘能波動輔助"],
  ["Frostblink", "SkillGemFrostblink", "霜漣之瞬"],
  ["Added Lightning Damage Support", "SupportGemAddedLightningDamage", "附加閃電傷害輔助"],
  ["Arc", "SkillGemArc", "電弧"],
  ["Firestorm", "SkillGemFirestorm", "烈炎風暴"],
  ["Vaal Firestorm", "SkillGemVaalFirestorm", "瓦爾．烈炎風暴"],
  ["Firestorm of Meteors", "SkillGemFirestormAltX", "烈炎風暴．隕石"],
  ["Firestorm of Pelting", "SkillGemFirestormAltY", "烈炎風暴．猛擲"],
  ["Controlled Destruction Support", "SupportGemControlledDestruction", "精準破壞輔助"],
  ["Faster Casting Support", "SupportGemFasterCast", "快速施放輔助"],
  ["Flammability", "SkillGemFlammability", "易燃"],
  ["Fire Penetration Support", "SupportGemFirePenetration", "火焰穿透輔助"],
  ["Armageddon Brand", "SkillGemArmageddonBrand", "末日烙印"],
  ["Flame Dash", "SkillGemFlameDash", "烈焰衝刺"],
].flatMap(([english, id, chinese]) => [[english, chinese], ...(id ? [[id, chinese]] : [])]));

const skillIdTranslations = new Map([
  ["FlameDash", "烈焰衝刺"],
  ["SupportArcaneSurge", "秘能波動輔助"],
  ["SupportControlledDestruction", "精準破壞輔助"],
  ["SupportAddedLightningDamage", "附加閃電傷害輔助"],
  ["SupportFasterCasting", "快速施放輔助"],
  ["SupportFirePenetration", "火焰穿透輔助"],
  ["FirestormAltX", "烈炎風暴．隕石"],
  ["FirestormAltY", "烈炎風暴．猛擲"],
]);

function displayGem(gem) {
  // 舊版 localStorage 只存字串。原檔有變體名稱時優先辨識，避免共用物品 ID 覆蓋。
  const { name, id, variant } = typeof gem === "string" ? { name: gem } : gem;
  const original = name || variant || id;
  if (/\p{Script=Han}/u.test(original)) return original;
  const normalizedId = id?.replace(/^Metadata\/Items\/Gems\//, "");
  const exactName = gemTranslations.get(name);
  const variantTranslation = skillIdTranslations.get(variant);
  if (variantTranslation) return variantTranslation;
  if (variant && /Alt[A-Z]|Royale/i.test(variant)) {
    const distinctId = /Alt[A-Z]|Royale/i.test(normalizedId || "") ? gemTranslations.get(normalizedId) : null;
    return distinctId || (/ of |^Royale /i.test(name) ? exactName : null) || `原文：${variant === original ? original : name ? `${name}（${variant}）` : variant}`;
  }
  // 共用基本寶石 ID 的變體即使沒有 skillId，也保留原名。
  if (name && /^(Vaal |Awakened |Royale )| of /i.test(name)) {
    const distinctId = /Vaal|Plus|Alt[A-Z]|Royale/i.test(normalizedId || "") ? gemTranslations.get(normalizedId) : null;
    return distinctId || exactName || `原文：${original}`;
  }
  return gemTranslations.get(normalizedId) || exactName || gemTranslations.get(original.replace(/^Metadata\/Items\/Gems\//, "")) || `原文：${original}`;
}

// 女巫第一章入門建議。取得順序取決於任務，角色等級只決定能否裝上寶石。
const witchStarter = {
  name: "新手推薦｜烈炎風暴女巫",
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

const witchCampaign = {
  2: [{task:"清理蜘蛛", title:"選精準破壞輔助", text:"向斯克領取，或向伊娜購買。18 級、33 智慧後用冰霜脈衝＋精準破壞輔助＋附加閃電傷害輔助（藍藍藍）。只有兩連就先接精準破壞。可向伊娜買快速施放輔助（藍，18 級、33 智慧），留到主技能換成烈炎風暴後使用。"}],
  3: [
    {task:"迷失的愛情", title:"選易燃", text:"向卡爾麗莎領取或購買。24 級、25 力量、37 智慧後可裝一個藍孔，換火系主技能後對頭目手動施放。"},
    {task:"剷除左右手", title:"選烈炎風暴，28 級換主技能", text:"回薩恩營地找馬拉莫領取。28 級、67 智慧時，把冰霜脈衝換成烈炎風暴。三連用烈炎風暴＋精準破壞輔助＋快速施放輔助（藍藍藍）。未領到可向卡爾麗莎購買，或完成命運之語向薩歐賽買。"},
    {task:"命運之語", title:"選火焰穿透輔助", text:"女巫可領取，或向卡爾麗莎購買。31 級、52 力量後放進第四個相連紅孔。還沒有藍藍藍紅四連，就繼續用三連。"},
  ],
  4: [{title:"完成烈炎風暴四連", text:"把火焰穿透輔助放入第四個相連紅孔。若漏拿，回第三章找卡爾麗莎或薩歐賽。力量不足先留三連，用裝備補力量。"}],
  5: [{title:"沿用四連，準備抗性裝", text:"維持烈炎風暴＋精準破壞＋快速施放＋火焰穿透（藍藍藍紅）。章末奇塔弗會扣抗性，先保留帶生命與元素抗性的裝備。"}],
  6: [{task:"貴族殞落", title:"解鎖莉莉羅斯的寶石商店", text:"清完絕望岩灘後向莉莉羅斯補買普通寶石。缺烈炎風暴或其輔助可在這裡補齊，再裝回藍藍藍紅四連。"}],
  7: [{title:"沿用四連與位移", text:"烈炎風暴負責傷害，霜漣之瞬放獨立藍孔。遇到頭目可先施放易燃，再在頭目停住時施放烈炎風暴。"}],
  8: [{title:"沿用四連，保留走位空間", text:"對雙女神先施放易燃，放烈炎風暴後移動。換裝時確認主技能仍有藍藍藍紅四個相連插槽。"}],
  9: [{title:"沿用四連，整理抗性與生命", text:"維持主技能四連。難以承受傷害時優先換生命或抗性裝備，留意新裝備的插槽連線。"}],
  10: [{title:"用同一套連線完成劇情", text:"沿用烈炎風暴四連、易燃與霜漣之瞬。可先完成第三階段迷宮，再挑戰奇塔弗。通關後再檢查抗性。"}],
};

const firstActLandmarks = {
  "暮光海灘": {
    exits: "獅眼守望、炙熱鹽沼、海潮孤島",
    hint: "先開暮光海灘的傳送點。要拿醫藥箱時走海潮孤島，交給奈莎後傳送回暮光海灘，再找炙熱鹽沼的入口。",
    source: "https://poedb.tw/tw/The_Coast",
  },
  "炙熱鹽沼": {
    exits: "暮光海灘、海潮地穴、惡水池",
    hint: "先確認拿了三枚恐喙鳥雕紋，再找有凹槽的石壁。看到惡水池入口時，可先略過；它是另一條支線。",
    source: "https://poedb.tw/tw/The_Mud_Flats",
  },
  "海潮地穴": {
    exits: "炙熱鹽沼、沉寂海崖、水聲之淵",
    hint: "先開傳送點。要去水聲之淵時，沿路看小地圖有沒有標出支線入口。橋可用來辨認自己走到哪裡，但支線入口和橋的相對位置有不同配置。交完天賦點任務後，傳送回海潮地穴再找沉寂海崖。",
    source: "https://www.definitivguide.com/docs/PoE1/Act%201/Submerged%20Passage",
  },
  "水聲之淵": {
    exits: "海潮地穴",
    hint: "打倒深淵巨蟹後回獅眼守望找塔格拉。若有傳送卷軸，可開門回城，再用城鎮傳送點回海潮地穴繼續主線。",
    source: "https://poedb.tw/tw/Act_1",
  },
};
