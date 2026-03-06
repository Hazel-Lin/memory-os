import { ipcMain as s, clipboard as P, app as f, BrowserWindow as j } from "electron";
import h from "node:path";
import u from "node:fs";
import { fileURLToPath as I } from "node:url";
import S from "node:os";
const p = h.join(S.homedir(), ".memory-os"), g = h.join(p, "memory.json");
function v() {
  return g;
}
function w() {
  return u.existsSync(g);
}
function c() {
  w() || (console.error("memory.json 不存在，请先运行 mem init"), process.exit(1));
  const n = u.readFileSync(g, "utf-8");
  try {
    return JSON.parse(n);
  } catch {
    console.error("memory.json 格式不合法，请手动检查文件内容"), process.exit(1);
  }
}
function l(n) {
  u.writeFileSync(g, JSON.stringify(n, null, 2), "utf-8");
}
function _() {
  u.existsSync(p) || u.mkdirSync(p, { recursive: !0 });
}
function E() {
  return {
    selfProfile: {
      name: "",
      languages: ["zh-CN", "en"],
      bio: "",
      writingStyle: {
        tone: "",
        preferredStructures: [],
        avoid: []
      },
      capabilities: {
        business_judgment: 0,
        writing: 0,
        product_thinking: 0
      }
    },
    projects: [],
    insights: []
  };
}
function b(n, t = "generic") {
  const e = n.selfProfile, r = Object.entries(e.capabilities).map(([i, a]) => `  - ${i}: ${a}/5`).join(`
`), o = [
    e.writingStyle.tone ? `- Tone: ${e.writingStyle.tone}` : "",
    e.writingStyle.preferredStructures.length ? `- Preferred structures: ${e.writingStyle.preferredStructures.join(", ")}` : "",
    e.writingStyle.avoid.length ? `- Avoid: ${e.writingStyle.avoid.join(", ")}` : ""
  ].filter(Boolean).join(`
`);
  return t === "claude" ? `# About the User

Name: ${e.name}
Languages: ${e.languages.join(", ")}
Bio: ${e.bio}

## Writing Style
${o || "(not specified)"}

## Capabilities (self-assessed, 0-5)
${r}

Please adapt your responses to match the user's writing style and capability levels.` : `# User Profile

Name: ${e.name}
Languages: ${e.languages.join(", ")}
Bio: ${e.bio}

## Writing Style
${o || "(not specified)"}

## Capabilities (self-assessed, 0-5)
${r}`;
}
function D(n, t, e = "generic") {
  const r = n.projects.find((a) => a.id === t);
  if (!r)
    throw new Error(`Project ${t} 不存在`);
  const o = n.insights.filter((a) => a.projectId === t);
  let i = `# Project Context: ${r.name}

## Description
${r.description}

## Goals
${r.goals.map((a) => `- ${a}`).join(`
`)}

## Target Audience
${r.audience}

## Status
${r.status}

## Focus This Week
${r.focusThisWeek}`;
  return o.length > 0 && (i += `

## Related Insights (${o.length})`, o.forEach((a) => {
    i += `

### ${a.title}
${a.content}`;
  })), e === "claude" && (i += `

Please use this project context to inform your responses.`), i;
}
function M(n, t) {
  const e = t ? n.insights.filter((o) => o.projectId === t) : n.insights;
  if (e.length === 0)
    return t ? `项目 ${t} 没有关联的 insights` : "暂无洞察记录。";
  let r = `# Insights (${e.length})
`;
  return e.forEach((o, i) => {
    r += `
## ${i + 1}. ${o.title}`, o.scenario && (r += `
Scenario: ${o.scenario}`), r += `

${o.content}
`;
  }), r;
}
function x() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function C(n, t) {
  return {
    ...n.selfProfile,
    ...t
  };
}
function W(n, t) {
  return {
    ...t,
    id: x(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function O(n, t, e) {
  const r = n.projects.find((o) => o.id === t);
  if (!r)
    throw new Error(`Project ${t} 不存在`);
  return {
    ...r,
    ...e
  };
}
function F(n, t) {
  if (!n.projects.some((r) => r.id === t))
    throw new Error(`Project ${t} 不存在`);
}
function L(n, t) {
  return t.projectId && $(n, t.projectId), {
    ...t,
    id: x(),
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function N(n, t, e) {
  const r = n.insights.find((o) => o.id === t);
  if (!r)
    throw new Error(`Insight ${t} 不存在`);
  return e.projectId && $(n, e.projectId), {
    ...r,
    ...e
  };
}
function R(n, t) {
  if (!n.insights.some((r) => r.id === t))
    throw new Error(`Insight ${t} 不存在`);
}
function $(n, t) {
  if (!n.projects.some((r) => r.id === t))
    throw new Error(`Project ${t} 不存在`);
}
function T() {
  s.handle("storage:read", async () => {
    try {
      if (!w()) {
        _();
        const n = E();
        return l(n), n;
      }
      return c();
    } catch (n) {
      throw console.error("读取数据失败:", n), n;
    }
  }), s.handle("storage:write", async (n, t) => {
    try {
      return l(t), { success: !0 };
    } catch (e) {
      throw console.error("写入数据失败:", e), e;
    }
  }), s.handle("storage:getPath", async () => v()), s.handle("storage:exists", async () => w()), s.handle("profile:update", async (n, t) => {
    try {
      const e = c();
      return e.selfProfile = C(e, t), l(e), { success: !0, data: e.selfProfile };
    } catch (e) {
      throw console.error("更新 Profile 失败:", e), e;
    }
  }), s.handle("project:add", async (n, t) => {
    try {
      const e = c(), r = W(e, t);
      return e.projects.push(r), l(e), { success: !0, data: r };
    } catch (e) {
      throw console.error("添加 Project 失败:", e), e;
    }
  }), s.handle("project:update", async (n, t, e) => {
    try {
      const r = c(), o = r.projects.findIndex((i) => i.id === t);
      if (o === -1) throw new Error(`Project ${t} 不存在`);
      return r.projects[o] = O(r, t, e), l(r), { success: !0, data: r.projects[o] };
    } catch (r) {
      throw console.error("更新 Project 失败:", r), r;
    }
  }), s.handle("project:delete", async (n, t) => {
    try {
      const e = c();
      F(e, t);
      const r = e.projects.findIndex((o) => o.id === t);
      return e.projects.splice(r, 1), l(e), { success: !0 };
    } catch (e) {
      throw console.error("删除 Project 失败:", e), e;
    }
  }), s.handle("insight:add", async (n, t) => {
    try {
      const e = c(), r = L(e, t);
      return e.insights.push(r), l(e), { success: !0, data: r };
    } catch (e) {
      throw console.error("添加 Insight 失败:", e), e;
    }
  }), s.handle("insight:update", async (n, t, e) => {
    try {
      const r = c(), o = r.insights.findIndex((i) => i.id === t);
      if (o === -1) throw new Error(`Insight ${t} 不存在`);
      return r.insights[o] = N(r, t, e), l(r), { success: !0, data: r.insights[o] };
    } catch (r) {
      throw console.error("更新 Insight 失败:", r), r;
    }
  }), s.handle("insight:delete", async (n, t) => {
    try {
      const e = c();
      R(e, t);
      const r = e.insights.findIndex((o) => o.id === t);
      return e.insights.splice(r, 1), l(e), { success: !0 };
    } catch (e) {
      throw console.error("删除 Insight 失败:", e), e;
    }
  }), s.handle("export:profile", async (n, t = "generic") => {
    try {
      const e = c();
      return { success: !0, data: b(e, t) };
    } catch (e) {
      throw console.error("导出 Profile 失败:", e), e;
    }
  }), s.handle("export:context", async (n, t, e = "generic") => {
    try {
      const r = c();
      return { success: !0, data: D(r, t, e) };
    } catch (r) {
      throw console.error("导出 Context 失败:", r), r;
    }
  }), s.handle("export:insights", async (n, t) => {
    try {
      const e = c();
      return { success: !0, data: M(e, t) };
    } catch (e) {
      throw console.error("导出 Insights 失败:", e), e;
    }
  }), s.handle("clipboard:write", async (n, t) => {
    try {
      return P.writeText(t), { success: !0 };
    } catch (e) {
      throw console.error("复制到剪贴板失败:", e), e;
    }
  }), console.log("✓ IPC 处理器已注册");
}
const A = I(import.meta.url), y = h.dirname(A), B = process.env.NODE_ENV === "development";
let d = null;
function m() {
  const n = h.join(y, "../preload/index.js");
  console.log("Preload path:", n), console.log("Preload exists:", u.existsSync(n)), d = new j({
    width: 1200,
    height: 800,
    minWidth: 1e3,
    minHeight: 600,
    webPreferences: {
      preload: n,
      nodeIntegration: !1,
      contextIsolation: !0,
      sandbox: !1
      // 禁用沙箱以确保 preload 能工作
    },
    titleBarStyle: "hiddenInset",
    show: !1
  }), d.once("ready-to-show", () => {
    d?.show();
  }), B ? (d.loadURL("http://localhost:5173"), d.webContents.openDevTools()) : d.loadFile(h.join(y, "../renderer/index.html")), d.on("closed", () => {
    d = null;
  });
}
f.whenReady().then(() => {
  T(), m(), f.on("activate", () => {
    j.getAllWindows().length === 0 && m();
  });
});
f.on("window-all-closed", () => {
  process.platform !== "darwin" && f.quit();
});
