// 以章節編號儲存勾選項目與游標，切章時保留各章進度。
const storageKey = "exilepilot-v1";
const classes = { Scion: "貴族", Marauder: "野蠻人", Ranger: "遊俠", Witch: "女巫", Duelist: "決鬥者", Templar: "聖堂武僧", Shadow: "暗影刺客" };
const $ = id => document.getElementById(id);
const defaults = { act: 1, level: 1, className: "", build: "demo", imported: null, progress: {} };
let state = { ...defaults };
try {
  const saved = JSON.parse(localStorage.getItem(storageKey));
  if (saved && chapters.some(chapter => chapter.id === saved.act) && saved.progress) state = { ...defaults, ...saved };
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
  options($("build"), [["demo", demoBuild.name], ...(state.imported ? [["pob", "匯入的 PoB 流派"]] : [])], state.build);
  $("level").value = state.level;
}

function renderRoute(panel, chapter, progress) {
  const count = progress.done.filter(Boolean).length;
  const meter = document.createElement("progress");
  meter.max = chapter.steps.length;
  meter.value = count;
  meter.setAttribute("aria-label", "本章完成進度");
  const summary = add(panel, "p", `完成 ${count} / ${meter.max} 項`);
  panel.append(meter);
  chapter.steps.forEach((step, index) => {
    const active = index === progress.step;
    const row = add(panel, "label", "", active ? "step current" : "step");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(progress.done[index]);
    checkbox.addEventListener("change", () => {
      progress.done[index] = checkbox.checked;
      meter.value = progress.done.filter(Boolean).length;
      summary.textContent = `完成 ${meter.value} / ${meter.max} 項`;
      save();
    });
    row.append(checkbox);
    const copy = add(row, "span", "");
    add(copy, "strong", `${active ? "目前步驟 · " : ""}${step.area}｜${step.task}`);
    add(copy, "span", step.detail, "muted");
  });

  const actions = add(panel, "div", "", "actions");
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
}

function render() {
  const panel = $("panel");
  panel.replaceChildren();
  const chapter = chapters[state.act - 1];
  const progress = state.progress[state.act] ??= { step: 0, done: [] };
  const pob = state.build === "pob" ? state.imported : null;
  const headings = { route: `第 ${state.act} 章拓荒`, gems: "技能寶石", tree: "天賦配置", map: `第 ${state.act} 章地圖路線` };
  add(panel, "h2", headings[view]);

  if (view === "route" || view === "map" || !pob) add(panel, "p", demoNotice, "notice");
  else add(panel, "p", `來源：匯入的 PoB｜目標版本：${pob.target || "未提供"}｜原始職業：${classes[pob.className] || pob.className || "未提供"}`, "notice");

  if (view === "route") {
    renderRoute(panel, chapter, progress);
  } else if (view === "map") {
    const next = chapter.steps[progress.step + 1];
    add(panel, "p", next ? `下一站：${next.area}` : "已到達本章最後一個示範步驟。");
    const list = add(panel, "ol", "");
    chapter.steps.forEach((step, index) => {
      const item = add(list, "li", `${step.area}｜${step.task}`, index === progress.step ? "card current" : "card");
      if (index === progress.step) item.setAttribute("aria-current", "step");
    });
  } else if (view === "gems" && !pob) {
    const stage = demoBuild.stages.findLast(item => item.level <= state.level);
    const next = demoBuild.stages.find(item => item.level > state.level);
    add(panel, "h3", stage.title);
    add(panel, "p", `主動：${stage.active}｜輔助：${stage.support}`, "card");
    add(panel, "p", `插槽需求：${stage.sockets}。取得章節與購買條件未提供。`);
    if (next) add(panel, "p", `等級 ${next.level} 切換至${next.title}。`);
  } else if (view === "gems") {
    add(panel, "p", "以下是 PoB 原始技能群組。缺少逐級推薦、取得條件與實際插槽需求。");
    if (!pob.groups.length) add(panel, "p", "未讀到可顯示的寶石名稱。");
    pob.groups.forEach((group, index) => {
      const card = add(panel, "div", "", "card");
      add(card, "h3", group.title || `技能群組 ${index + 1}`);
      add(card, "p", group.gems.join("、"));
    });
  } else if (pob) {
    add(panel, "p", `昇華：${pob.ascendancy && pob.ascendancy !== "None" ? pob.ascendancy : "未提供"}`);
    add(panel, "p", "以下是原始天賦配置摘要。下一點順序與昇華時機未提供。");
    if (!pob.specs.length) add(panel, "p", "未讀到天賦配置。");
    pob.specs.forEach((spec, index) => add(panel, "p", `${spec.title || `天賦配置 ${index + 1}`}｜天賦樹版本：${spec.version || "未提供"}｜節點數：${spec.count || "未提供"}`, "card"));
  } else {
    add(panel, "p", "此示範流派沒有已驗證的天賦配置。請匯入 PoB 查看原始天賦摘要。");
    add(panel, "p", "下一個天賦節點與昇華時機：資料未提供。");
  }
}

$("act").addEventListener("change", event => { state.act = Number(event.target.value); save(); render(); });
$("level").addEventListener("change", event => {
  if (event.target.validity.valid) state.level = event.target.valueAsNumber;
  event.target.value = state.level;
  save();
  render();
});
$("class").addEventListener("change", event => { state.className = event.target.value; save(); });
$("build").addEventListener("change", event => { state.build = event.target.value; save(); render(); });
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
