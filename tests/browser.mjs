import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { deflateSync } from "node:zlib";
import { chromium } from "playwright";

// 使用 PoB 專案的真實匯出，校驗 Git blob 以便辨識來源變動。
const fixtureUrl = "https://raw.githubusercontent.com/PathOfBuildingCommunity/PathOfBuilding/dev/spec/TestBuilds/3.13/OccVortex.xml";
const fixture = await fetch(fixtureUrl);
assert.equal(fixture.status, 200);
const xml = Buffer.from(await fixture.arrayBuffer());
const blob = createHash("sha1").update(`blob ${xml.length}\0`).update(xml).digest("hex");
assert.equal(blob, "2e6df661d8797d26c7ada2fe1ccbca55a49ff20f");
const code = deflateSync(xml).toString("base64url");
const contentTypes = { html: "text/html", js: "application/javascript", css: "text/css" };
const server = createServer(async (request, response) => {
  const name = request.url === "/" ? "index.html" : request.url.slice(1);
  if (!/^[a-z]+\.(html|js|css)$/.test(name)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(new URL(`../${name}`, import.meta.url));
    response.writeHead(200, { "Content-Type": contentTypes[name.split(".").at(-1)] + "; charset=utf-8" }).end(data);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
let browser;
try {
  browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 850 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  const act = page.locator("#act");
  const now = page.locator(".task-now");
  const has = async (locator, pattern) => assert.match(await locator.innerText(), pattern);
  assert.equal(await act.locator("option").count(), 10);
  assert.equal(await page.locator("#build").inputValue(), "witch");
  for (let chapter = 1; chapter <= 10; chapter += 1) {
    await act.selectOption(String(chapter));
    await has(now, /目前要做/);
    assert.doesNotMatch(await now.innerText(), /示範區域/);
  }
  await act.selectOption("1");
  await has(now, /絕望岩灘/);
  await page.getByRole("button", { name: /第一次玩/ }).click();
  await has(page.locator("#panel"), /第一次玩 POE1/);
  await page.getByRole("button", { name: "回到拓荒步驟" }).click();
  await page.getByRole("button", { name: "地圖", exact: true }).click();
  await page.getByLabel("查看區域").selectOption({ label: "海潮地穴｜啟用傳送點" });
  await has(page.locator("#panel"), /相連區域/);
  await has(page.locator("#panel"), /相對位置有不同配置/);
  await page.getByRole("button", { name: "拓荒", exact: true }).click();
  await has(now, /絕望岩灘/);
  await now.getByRole("checkbox").check();
  await now.getByRole("button", { name: "下一步" }).click();
  await has(now, /獅眼守望/);
  await page.reload();
  await has(now, /獅眼守望/);
  assert.equal(await page.locator("progress").getAttribute("value"), "1");
  await page.getByText("角色與流派設定").click();
  await page.locator("#build").selectOption("witch");
  await has(now, /選冰霜脈衝/);
  await act.selectOption("3");
  await page.getByRole("button", { name: "技能", exact: true }).click();
  await has(page.locator("#panel"), /28 級換主技能/);
  await has(page.locator(".task-now"), /冰霜脈衝/);
  await act.selectOption("4");
  const inlineLevel = page.locator(".task-now input");
  await inlineLevel.fill("31");
  await inlineLevel.press("Tab");
  await has(page.locator(".task-now"), /烈炎風暴 ＋ 精準破壞輔助 ＋ 快速施放輔助 ＋ 火焰穿透輔助/);
  await has(page.locator(".task-now"), /藍－藍－藍－紅/);
  await page.getByText("少一顆寶石？查看補拿方式").click();
  await has(page.locator(".task-now"), /沒拿到時先用烈炎風暴三連/);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);

  const importBuild = async input => {
    await page.locator("#open-import").click();
    await page.locator("#code").fill(input);
    await page.locator("#submit-import").click();
    await page.getByText(/已讀取流派|目前支援分享代碼|無法解壓縮分享代碼/).waitFor();
    const status = await page.locator("#import-status").innerText();
    await page.locator("#close-import").click();
    return status;
  };
  assert.match(await importBuild(xml.toString("utf8")), /已讀取/);
  assert.match(await importBuild(code), /已讀取/);
  await has(page.locator("#panel"), /烈焰衝刺/);
  await has(page.locator("#panel"), /秘能波動輔助/);
  await page.getByRole("button", { name: "天賦", exact: true }).click();
  await has(page.locator("#panel"), /節點數/);
  assert.match(await importBuild("https://example.invalid"), /目前支援/);
  assert.match(await importBuild("AAAA"), /無法解壓縮/);
  const variantXml = '<PathOfBuilding><Build className="Witch"/><Skills><Skill><Gem gemId="Metadata/Items/Gems/SkillGemFirestorm" nameSpec="Firestorm of Meteors"/><Gem gemId="Metadata/Items/Gems/SkillGemFirestorm" nameSpec="Firestorm of Unknown"/></Skill></Skills></PathOfBuilding>';
  assert.match(await importBuild(variantXml), /已讀取/);
  await page.getByRole("button", { name: "技能", exact: true }).click();
  await has(page.locator("#panel"), /烈炎風暴．隕石/);
  await has(page.locator("#panel"), /原文：Firestorm of Unknown/);
  assert.deepEqual(errors, []);
  console.log("桌面 1280px、手機 390px、十章、進度還原、選石、真實 PoB XML 與壓縮代碼通過");
} finally {
  await browser?.close();
  server.close();
}
