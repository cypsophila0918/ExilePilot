// 分享代碼是 URL 安全 Base64 包裝的 zlib 壓縮 XML。
const maxPobBytes = 4 * 1024 * 1024;

async function readPob(input) {
  let xml = input.trim();
  if (!xml) throw new Error("請貼上 PoB 分享代碼或 XML。");
  if (xml.length > maxPobBytes) throw new Error("PoB 資料超過 4 MB。");
  if (/^https?:\/\//i.test(xml)) throw new Error("目前支援分享代碼與 XML。請先在 PoB 開啟連結，再複製分享代碼。");
  if (!xml.startsWith("<")) {
    const code = xml.replace(/\s/g, "");
    if (!/^[\w+/-]+={0,2}$/.test(code)) throw new Error("分享代碼格式錯誤，請重新複製完整代碼。");
    if (typeof DecompressionStream === "undefined") throw new Error("瀏覽器無法解壓縮分享代碼，請改貼 XML 或更新 Edge／Chrome。");
    try {
      const bytes = Uint8Array.from(atob(code.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "")), c => c.charCodeAt(0));
      const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate"));
      const reader = stream.getReader();
      const decoder = new TextDecoder("utf-8", { fatal: true });
      let size = 0;
      xml = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > maxPobBytes) {
          await reader.cancel();
          throw new RangeError();
        }
        xml += decoder.decode(value, { stream: true });
      }
      xml += decoder.decode();
    } catch (error) {
      if (error instanceof RangeError) throw new Error("解壓縮後的 PoB 資料超過 4 MB。");
      throw new Error("無法解壓縮分享代碼，請確認代碼完整且來自 POE1 的 PoB。");
    }
  }

  // 拒絕自訂 XML 實體。匯入資料只以純文字呈現。
  if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error("不支援含有自訂文件類型或實體的 XML。");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("XML 格式不完整或無法讀取。");
  const root = doc.documentElement;
  const build = root.querySelector(":scope > Build");
  if (root.tagName !== "PathOfBuilding" || !build) throw new Error("找不到 POE1 PoB 的 PathOfBuilding／Build 資料。");

  const attr = (node, key) => (node.getAttribute(key) || "").slice(0, 180);
  const groups = Array.from(root.querySelectorAll(":scope > Skills > Skill, :scope > Skills > SkillSet > Skill"), node => ({
    title: attr(node, "label") || attr(node.parentElement, "title"),
    gems: Array.from(node.querySelectorAll(":scope > Gem"), gem => ({
      name: attr(gem, "nameSpec"),
      id: attr(gem, "gemId"),
      variant: attr(gem, "skillId"),
    })).filter(gem => gem.name || gem.id || gem.variant),
  })).filter(group => group.gems.length);
  const specs = Array.from(root.querySelectorAll(":scope > Tree > Spec"), node => ({
    title: attr(node, "title"),
    version: attr(node, "treeVersion"),
    count: (node.getAttribute("nodes") || "").split(",").filter(value => /^\d+$/.test(value.trim())).length,
  }));
  return { className: attr(build, "className"), ascendancy: attr(build, "ascendClassName"), level: Number(attr(build, "level")), target: attr(build, "targetVersion"), groups, specs };
}
