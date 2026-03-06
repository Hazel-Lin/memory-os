import { contextBridge as o, ipcRenderer as t } from "electron";
const r = {
  // ========== 存储操作 ==========
  storage: {
    read: () => t.invoke("storage:read"),
    write: (e) => t.invoke("storage:write", e),
    getPath: () => t.invoke("storage:getPath"),
    exists: () => t.invoke("storage:exists")
  },
  // ========== Profile 操作 ==========
  profile: {
    update: (e) => t.invoke("profile:update", e)
  },
  // ========== Project 操作 ==========
  project: {
    add: (e) => t.invoke("project:add", e),
    update: (e, i) => t.invoke("project:update", e, i),
    delete: (e) => t.invoke("project:delete", e)
  },
  // ========== Insight 操作 ==========
  insight: {
    add: (e) => t.invoke("insight:add", e),
    update: (e, i) => t.invoke("insight:update", e, i),
    delete: (e) => t.invoke("insight:delete", e)
  },
  // ========== 导出操作 ==========
  export: {
    profile: (e) => t.invoke("export:profile", e),
    context: (e, i) => t.invoke("export:context", e, i),
    insights: (e) => t.invoke("export:insights", e)
  },
  // ========== 剪贴板操作 ==========
  clipboard: {
    write: (e) => t.invoke("clipboard:write", e)
  }
};
o.exposeInMainWorld("electronAPI", r);
