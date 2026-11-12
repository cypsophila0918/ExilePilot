// 以章節編號儲存勾選項目與游標，切章時保留各章進度。
const storageKey = "exilepilot-v1";
const classes = { Scion: "貴族", Marauder: "野蠻人", Ranger: "遊俠", Witch: "女巫", Duelist: "決鬥者", Templar: "聖堂武僧", Shadow: "暗影刺客" };
const $ = id => document.getElementById(id);
const defaults = { act: 1, level: 1, className: "Witch", build: "witch", imported: null, progress: {} };
let state = { ...defaults };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && chapters.some(chapter => chapter.id === saved.act) && saved.progress) state = { ...defaults, ...saved };
  if (state.build === "demo" && !state.className) Object.assign(state, { build: "witch", className: "Witch" });
} catch {
  // 儲存區停用或資料損毀時，仍可在本次開啟期間使用。
}
let view = "route";

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    $("save").textContent = "進度已儲存於此瀏覽器";
  } catch {
    $("save").textContent = "瀏覽器無法儲存進度，本次關閉後可能遺失。";
  }
}

function add(parent, tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  parent.append(node);
  return node;
}

function options(select, entries, value) {
  select.replaceChildren(...entries.map(([key, label]) => new Option(label, key)));
  select.value = value;
}

function syncControls() {
  options($("act"), chapters.map(({ id }) => [id, `第 ${id} 章`]), state.act);
  options($("class"), [["", "未選擇"], ...Object.entries(classes)], state.className);
  options($("build"), [["witch", witchStarter.name], ["demo", "暫不使用流派"], ...(state.imported ? [["pob", "匯入的 PoB 流派"]] : [])], state.build);
  $("level").value = state.level;
  syncCharacterSummary();
}

function syncCharacterSummary() {
  const buildName = { pob: "PoB 流派", witch: witchStarter.name, demo: "未選流派" }[state.build];
  const className = classes[state.className] || "未選職業";
  $("character-summary").textContent = `等級 ${state.level} · ${className} · ${buildName}`;
}

function renderRoute(panel, chapter, progress) {
  const count = progress.done.filter(Boolean).length;
  const meter = document.createElement("progress");
  meter.max = chapter.steps.length;
  meter.value = count;
  meter.setAttribute("aria-label", "本章完成進度");
  const step = chapter.steps[progress.step];
  const nextStep = chapter.steps[progress.step + 1];
  const current = add(panel, "div", "", "task-now");
  add(current, "p", `目前要做 · 第 ${progress.step + 1} / ${meter.max} 步`, "muted");
  add(current, "h3", `${step.area}｜${step.task}`);
  add(current, "p", step.detail);
  if (chapter.id === 1 && progress.step === 0) {
    const start = add(current, "button", "第一次玩？看開局操作");
    start.addEventListener("click", () => $("nav").querySelector('[data-view="guide"]').click());
  }
  if ((chapter.id === 5 && step.task === "貪婪之神") ||
      (chapter.id === 10 && step.area === "破沿血道")) {
    renderBeginnerChecklist(current);
  }
  if (state.build === "witch") {
    const tips = chapter.id === 1 ? witchStarter.steps : witchCampaign[chapter.id];
    const tip = tips.find(item => item.task === step.task);
    if (tip) {
      add(current, "h3", tip.title);
      add(current, "p", tip.text);
    }
  }
  add(current, "p", nextStep ? `下一步前往：${nextStep.area}` : "這是本章最後一步。", "muted");

  const mark = add(current, "label", "", "step");
  const currentCheckbox = document.createElement("input");
  currentCheckbox.type = "checkbox";
  currentCheckbox.checked = Boolean(progress.done[progress.step]);
  mark.append(currentCheckbox);
  add(mark, "strong", "標記這一步已完成");

  const actions = add(current, "div", "", "actions");
  const summary = add(panel, "p", `完成 ${count} / ${meter.max} 項`);
  panel.append(meter);
  const checklist = add(panel, "details", "", "task-list");
  add(checklist, "summary", "查看本章所有步驟");
  const jumpLabel = add(checklist, "label", "已在遊戲途中？跳到所在步驟");
  const jump = add(jumpLabel, "select", "");
  options(jump, chapter.steps.map(({ area, task }, index) => [index, `${index + 1}. ${area}｜${task}`]), progress.step);
  jump.addEventListener("change", () => {
    progress.step = Number(jump.value);
    save();
    render();
    panel.querySelector(".task-now h3").scrollIntoView({ block: "nearest" });
  });
  const checkboxes = [];
  const updateCompletion = (index, checked) => {
    progress.done[index] = checked;
    checkboxes[index].checked = checked;
    if (index === progress.step) currentCheckbox.checked = checked;
    meter.value = progress.done.filter(Boolean).length;
    summary.textContent = `完成 ${meter.value} / ${meter.max} 項`;
    save();
  };
  currentCheckbox.addEventListener("change", () => updateCompletion(progress.step, currentCheckbox.checked));
  chapter.steps.forEach((step, index) => {
    const active = index === progress.step;
    const row = add(checklist, "label", "", active ? "step current" : "step");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(progress.done[index]);
    checkboxes.push(checkbox);
    checkbox.addEventListener("change", () => updateCompletion(index, checkbox.checked));
    row.append(checkbox);
    const copy = add(row, "span", "");
    add(copy, "strong", `${active ? "目前步驟 · " : ""}${step.area}｜${step.task}`);
    add(copy, "span", step.detail, "muted");
  });

  for (const direction of [-1, 1]) {
    const next = progress.step + direction;
    const button = add(actions, "button", direction < 0 ? "上一步" : "下一步", direction > 0 ? "primary" : "");
    button.disabled = next < 0 || next >= chapter.steps.length;
    button.addEventListener("click", () => {
      progress.step = next;
      save();
      render();
      const buttons = panel.querySelectorAll(".actions button");
      const preferred = buttons[direction < 0 ? 0 : 1];
      (preferred.disabled ? buttons[direction < 0 ? 1 : 0] : preferred).focus();
    });
  }
  if (!nextStep && chapter.id < chapters.length) {
    const nextChapter = add(panel, "button", `前往第 ${chapter.id + 1} 章`);
    nextChapter.addEventListener("click", () => {
      state.act += 1;
      syncControls();
      save();
      render();
      $("act").focus();
    });
  }
}

function renderBeginnerChecklist(panel) {
  const help = add(panel, "details", "", "task-list");
  add(help, "summary", "打奇塔弗前，檢查抗性和裝備");
  const list = add(help, "ol", "");
  add(list, "li", "按 C 開啟角色面板，到防禦頁看火焰、冰冷、閃電抗性。第五章和第十章擊敗奇塔弗後，各會永久降低 30 個百分點。");
  add(list, "li", "優先補最低的元素抗性，逐步把三項拉到 75%。先看戒指、腰帶和盾牌，保留主技能需要的連線。");
  add(list, "li", "常被打倒時，換有最大生命的裝備，更新生命藥劑。打頭目時先躲開地面警示，等招式結束再施法。");
  add(list, "li", "打完奇塔弗後再按 C 檢查一次。抗性掉下來時，先回城換裝再繼續。");
}

function renderWitchSetup(panel, chapter, progress) {
  // 任務進度和角色等級都符合後，才推薦換上新寶石。
  const unlocked = (act, task) => {
    if (chapter.id !== act) return chapter.id > act;
    const index = chapter.steps.findIndex(step => step.task === task);
    return index >= 0 && (progress.step > index || progress.done[index]);
  };
  const pulse = unlocked(1, "領取起始技能寶石");
  const lightning = state.level >= 8 && unlocked(1, "衝出監牢");
  const controlled = state.level >= 18 && unlocked(2, "清理蜘蛛");
  const firestorm = state.level >= 28 && unlocked(3, "剷除左右手");
  const penetration = firestorm && state.level >= 31 && unlocked(3, "命運之語");
  const main = firestorm ? "烈炎風暴" : pulse ? "冰霜脈衝" : "火球";
  const firstSupport = controlled ? "精準破壞輔助" : lightning ? "附加閃電傷害輔助" : "秘能波動輔助";
  const secondSupport = firestorm ? "快速施放輔助" : controlled && lightning ? "附加閃電傷害輔助" : lightning ? "秘能波動輔助" : "";
  const links = [main, firstSupport, secondSupport, penetration ? "火焰穿透輔助" : ""].filter(Boolean);
  const card = add(panel, "div", "", "task-now");
  add(card, "h3", "目前推薦連線");
  add(card, "p", links.join(" ＋ "));
  add(card, "p", `${links.length} 連｜${links.map((_, index) => index === 3 ? "紅" : "藍").join("－")}`);
  add(card, "p", links.length === 2 ? `只有一個藍孔時，先單用${main}。` : `孔位不足時，照上方順序從左邊裝起。兩連先用${main}＋${firstSupport}。`);
  add(card, "p", "寶石要放在同一件裝備上有線相連的孔。推薦依章節進度與等級顯示，換裝前請確認已領到寶石且符合屬性需求。", "muted");
  if (!firestorm) add(card, "p", "下一次更換主技能：第 3 章完成「剷除左右手」，達 28 級、67 智慧後換烈炎風暴。");
  if (firestorm && !penetration) add(card, "p", "下一次升級：第 3 章完成「命運之語」，達 31 級、52 力量後加入火焰穿透輔助。");

  const missing = add(card, "details", "", "task-list");
  add(missing, "summary", "少一顆寶石？查看補拿方式");
  const pickup = add(missing, "ul", "");
  if (chapter.id >= 6) add(pickup, "li", "第 6 章完成「貴族殞落」後，可在獅眼守望向莉莉羅斯補買這套搭配的普通寶石。");
  add(pickup, "li", "冰霜脈衝：第 1 章「大門口的敵人」找塔格拉領取，或向奈莎購買。");
  if (chapter.id >= 2) add(pickup, "li", "精準破壞輔助、快速施放輔助：第 2 章完成「清理蜘蛛」後找伊娜購買。");
  if (chapter.id >= 3) {
    add(pickup, "li", "烈炎風暴：第 3 章完成「剷除左右手」找馬拉莫領取，或向卡爾麗莎購買。沒拿到時先繼續用冰霜脈衝。");
    add(pickup, "li", "火焰穿透輔助：第 3 章完成「命運之語」領取，或向卡爾麗莎購買。沒拿到時先用烈炎風暴三連。");
  }
  const label = add(card, "label", "角色等級");
  const level = add(label, "input", "");
  Object.assign(level, { type: "number", min: "1", max: "100", required: true, value: state.level });
  level.addEventListener("change", () => {
    if (level.validity.valid) $("level").value = level.value;
    $("level").dispatchEvent(new Event("change"));
    panel.querySelector(".task-now input").focus();
  });
}

function renderChapterMap(panel, chapter, progress) {
  const next = chapter.steps[progress.step + 1];
  add(panel, "p", next ? `下一步前往：${next.area}` : "已到達本章最後一步。");
  add(panel, "p", "可先查其他區域。地形與出口方位會隨副本變動。", "muted");

  const label = add(panel, "label", "查看區域");
  const select = add(label, "select", "");
  options(select, chapter.steps.map(({ area, task }, index) => [index, `${area}｜${task}`]), progress.step);

  const card = add(panel, "div", "", "card");
  const showArea = index => {
    card.replaceChildren();
    const step = chapter.steps[index];
    const landmark = chapter.id === 1 ? firstActLandmarks[step.area] : null;
    add(card, "h3", step.area);
    add(card, "p", step.detail);
    if (landmark) {
      add(card, "h4", "相連區域");
      add(card, "p", landmark.exits);
      add(card, "h4", "進區後找什麼");
      add(card, "p", landmark.hint);
      add(card, "a", "查看區域資料", "source-link").href = landmark.source;
    }
  };
  showArea(progress.step);
  select.addEventListener("change", () => showArea(Number(select.value)));

  const route = add(panel, "details", "", "task-list");
  add(route, "summary", "查看整章路線");
  const list = add(route, "ol", "");
  chapter.steps.forEach((step, index) => {
    const item = add(list, "li", "", index === progress.step ? "card current" : "card");
    if (index === progress.step) item.setAttribute("aria-current", "step");
    const button = add(item, "button", `${step.area}｜${step.task}`);
    button.addEventListener("click", () => {
      select.value = index;
      showArea(index);
      select.focus();
    });
  });
}

function render() {
  const panel = $("panel");
  panel.replaceChildren();
  const chapter = chapters[state.act - 1];
  // 正式路線使用新進度鍵，避免將舊示範勾選套到遊戲任務。
  const progress = state.progress[chapter.progressKey || state.act] ??= { step: 0, done: [] };
  const pob = state.build === "pob" ? state.imported : null;
  const headings = { route: `第 ${state.act} 章拓荒`, gems: "技能寶石", tree: "天賦配置", map: `第 ${state.act} 章地圖路線`, guide: "第一次玩 POE1" };
  add(panel, "h2", headings[view]);

  if (view === "guide") {
    const steps = add(panel, "ol", "");
    add(steps, "li", "新建女巫角色，打開網站的「拓荒」，照目前步驟去找區域、任務或傳送點。完成後勾選，再按下一步。");
    add(steps, "li", "撿到火球後按 I 開背包，裝進裝備的藍孔。點右下角技能列的一格，把火球放上去，就能按那個鍵施放。");
    add(steps, "li", "拿到秘能波動輔助後，把它和火球放在同一件裝備上兩個有線相連的藍孔。只有一個藍孔時，先單用火球。");
    add(steps, "li", "升級後到網站「技能」更新角色等級。領獎或換裝前，先看目前推薦連線和本章要拿什麼。");
    add(steps, "li", "拿到天賦點後按 P。女巫前期先從起點找相連的法術傷害小點，後續兼顧最大生命。拿不定主意時，先看「天賦」的各階段方向。");
    add(panel, "p", "想加快進度時，沿路打成群怪物並開傳送點。頭目打不過就先補生命、抗性和寶石連線，再回來挑戰。");
    renderBeginnerChecklist(panel);
    const back = add(panel, "button", "回到拓荒步驟", "primary");
    back.addEventListener("click", () => $("nav").querySelector('[data-view="route"]').click());
    return;
  }
  if ((view === "route" || view === "map") && chapter.source) {
    const source = add(panel, "p", "POE1 繁中路線 v1｜3.29 資料基準，對照 3.30 公告｜", "muted");
    add(source, "a", "流亡編年史", "source-link").href = chapter.source;
  } else if ((view === "gems" || view === "tree") && state.build === "witch") {
    add(panel, "p", "烈炎風暴女巫 v1｜3.29 資料基準", "notice");
  } else if (view === "route" || view === "map" || !pob) {
    if (view !== "gems") add(panel, "p", demoNotice, "notice");
  } else add(panel, "p", `來源：匯入的 PoB｜目標版本：${pob.target || "未提供"}｜原始職業：${classes[pob.className] || pob.className || "未提供"}`, "notice");

  if (view === "route") {
    renderRoute(panel, chapter, progress);
  } else if (view === "map") {
    renderChapterMap(panel, chapter, progress);
  } else if (view === "gems" && state.build === "witch") {
    renderWitchSetup(panel, chapter, progress);
    add(panel, "h3", `第 ${chapter.id} 章要拿什麼`);
    const skillSteps = state.act === 1 ? witchStarter.steps : witchCampaign[state.act];
    for (const tip of skillSteps) {
      const card = add(panel, "div", "", "card");
      add(card, "h3", tip.title);
      add(card, "p", tip.text);
    }
    const sources = add(panel, "details", "", "task-list");
    add(sources, "summary", "查看繁中寶石來源");
    const list = add(sources, "ul", "");
    for (const [label, url] of [...witchStarter.sources,
      ["烈炎風暴", "https://poedb.tw/tw/Firestorm"],
      ["精準破壞輔助", "https://poedb.tw/tw/Controlled_Destruction_Support"],
      ["快速施放輔助", "https://poedb.tw/tw/Faster_Casting_Support"],
      ["火焰穿透輔助", "https://poedb.tw/tw/Fire_Penetration_Support"],
      ["易燃", "https://poedb.tw/tw/Flammability"],
    ]) {
      const row = add(list, "li", "");
      add(row, "a", label, "source-link").href = url;
    }
  } else if (view === "gems" && !pob) {
    add(panel, "p", "內建推薦適合新開女巫。其他職業仍可使用章節導航，或匯入自己的 PoB。");
    const button = add(panel, "button", "使用女巫推薦", "primary");
    button.addEventListener("click", () => {
      $("build").value = "witch";
      $("build").dispatchEvent(new Event("change"));
    });
  } else if (view === "gems") {
    add(panel, "p", "以下是 PoB 原始技能群組。已核對的寶石顯示繁中譯名，其他標示原文。逐級推薦、取得條件與實際插槽需求未提供。");
    if (!pob.groups.length) add(panel, "p", "未讀到可顯示的寶石名稱。");
    pob.groups.forEach((group, index) => {
      const card = add(panel, "div", "", "card");
      add(card, "h3", group.title || `技能群組 ${index + 1}`);
      add(card, "p", group.gems.map(displayGem).join("、"));
    });
  } else if (pob) {
    add(panel, "p", `昇華：${pob.ascendancy && pob.ascendancy !== "None" ? pob.ascendancy : "未提供"}`);
    add(panel, "p", "以下是原始天賦配置摘要。下一點順序與昇華時機未提供。");
    if (!pob.specs.length) add(panel, "p", "未讀到天賦配置。");
    pob.specs.forEach((spec, index) => add(panel, "p", `${spec.title || `天賦配置 ${index + 1}`}｜天賦樹版本：${spec.version || "未提供"}｜節點數：${spec.count || "未提供"}`, "card"));
  } else if (state.build === "witch") {
    const priorities = add(panel, "ol", "");
    add(priorities, "li", "第 1 章：從女巫起點的相連小點找法術傷害，讓火球和冰霜脈衝都能受益。途中有容易取得的最大生命就補。");
    add(priorities, "li", "第 2 至 3 章：繼續補最大生命和法術傷害。換成烈炎風暴後，再考慮火焰傷害。");
    add(priorities, "li", "第 4 至 10 章：常死先補生命和裝備抗性。完成迷宮時可選元素使。");
    add(panel, "p", "目前提供各階段的選點方向。逐點路線與昇華點法仍待核對。", "muted");
    add(panel, "a", "查看 3.30 官方天賦樹資料", "source-link").href = "https://github.com/grindinggear/skilltree-export/releases/tag/3.30.0";
  } else {
    add(panel, "p", "請選擇內建推薦，或匯入 PoB 查看原始天賦摘要。");
    add(panel, "p", "下一個天賦節點與昇華時機：資料未提供。");
  }
}

$("act").addEventListener("change", event => { state.act = Number(event.target.value); save(); render(); });
$("level").addEventListener("change", event => {
  if (event.target.validity.valid) state.level = event.target.valueAsNumber;
  event.target.value = state.level;
  syncCharacterSummary();
  save();
  render();
});
$("class").addEventListener("change", event => {
  state.className = event.target.value;
  if (state.build === "witch" && state.className !== "Witch") state.build = "demo";
  if (state.build === "demo" && state.className === "Witch") state.build = "witch";
  syncControls();
  save();
  render();
});
$("build").addEventListener("change", event => {
  state.build = event.target.value;
  if (state.build === "witch") state.className = "Witch";
  syncControls();
  save();
  render();
});
$("nav").querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
  view = button.dataset.view;
  $("nav").querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  render();
}));

const dialog = $("import-dialog");
$("open-import").addEventListener("click", () => dialog.showModal());
$("close-import").addEventListener("click", () => dialog.close());
$("import-form").addEventListener("submit", async event => {
  event.preventDefault();
  const submit = $("submit-import");
  submit.disabled = true;
  $("import-status").textContent = "讀取中…";
  try {
    const result = await readPob($("code").value);
    if (!result.groups.length && !result.specs.length && !result.className) throw new Error("找到 PoB 文件，但其中沒有可顯示的角色、技能或天賦欄位。");
    state.imported = result;
    state.build = "pob";
    if (Object.hasOwn(classes, result.className)) state.className = result.className;
    if (Number.isInteger(result.level) && result.level >= 1 && result.level <= 100) state.level = result.level;
    syncControls();
    save();
    render();
    $("code").value = "";
    $("import-status").textContent = "已讀取流派。請切換至技能或天賦查看原始資料。";
  } catch (error) {
    $("import-status").textContent = error.message;
  } finally {
    submit.disabled = false;
  }
});

syncControls();
render();
save();
