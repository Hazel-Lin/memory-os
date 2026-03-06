# Memory OS 测试指南

## 快速开始

### 启动 GUI 应用

```bash
cd /Users/linhuizi/Desktop/memory-os
npm run dev:gui
```

应该看到：
- Electron 窗口自动打开（1200x800）
- 三栏布局界面
- 绿色 "数据加载成功" Toast 通知
- DevTools 自动打开（开发模式）

### 运行自动化冒烟测试

```bash
npm run test:smoke
```

测试覆盖：
- ✅ 数据文件初始化
- ✅ 数据读写操作
- ✅ Project 添加和验证
- ✅ Insight 添加和验证
- ✅ 数据结构完整性

## 手动测试清单

详细的 GUI 测试清单请查看：[tests/GUI_CHECKLIST.md](tests/GUI_CHECKLIST.md)

### 核心功能测试

1. **Profile 编辑**
   - 点击左侧 "Profile" 按钮
   - 编辑姓名、语言、简介
   - 添加/删除写作风格偏好
   - 调整能力滑块
   - 点击 "保存" 按钮

2. **数据同步验证**
   ```bash
   # 查看保存的数据
   cat ~/.memory-os/memory.json | jq .selfProfile

   # 使用 CLI 导出验证
   npm run dev -- export profile --target claude
   ```

3. **导出功能**
   - 右侧点击 "导出给 Claude"
   - 验证剪贴板内容（Cmd+V 粘贴）
   - 应该看到格式化的 Profile 文本

## 当前状态

### ✅ 已实现功能

- **阶段 1：基础架构**
  - ✅ 代码重构（core/ 共享模块）
  - ✅ Electron + React + Vite 配置
  - ✅ Tailwind CSS 样式系统

- **阶段 2：数据层**
  - ✅ IPC 通信（Main ↔ Renderer）
  - ✅ Zustand 状态管理
  - ✅ Toast 通知和错误处理

- **阶段 3：Profile 功能**
  - ✅ Profile 完整编辑器
  - ✅ 能力评估滑块
  - ✅ 写作风格管理
  - ✅ 导航和信息面板
  - ✅ 导出到剪贴板

### 🚧 待实现功能

- **阶段 4：Projects 功能**（计划中）
- **阶段 5：Insights 功能**（计划中）
- **阶段 6：导出和优化**（计划中）

## 已知问题

1. **GPU 进程警告**（正常）
   ```
   ERROR:content/browser/gpu/gpu_process_host.cc - GPU process exited unexpectedly
   ```
   - 这是 Electron 在开发模式下的常见警告
   - 不影响功能使用
   - 生产构建时会消失

2. **HMR 热更新**
   - CSS 修改会自动刷新
   - 组件修改可能需要手动刷新（Cmd+R）

## 性能验证

### 启动时间
- Vite 服务器：~100-200ms
- Electron 构建：~1-2s
- 窗口显示：即时

### 数据操作
- 读取数据：<10ms
- 保存数据：<20ms
- 导出文本：<5ms

## 调试技巧

### 查看控制台日志

GUI 自动打开 DevTools，可以看到：
- ✓ 数据加载成功
- IPC 通信日志
- 错误和警告信息

### 查看 IPC 通信

在 DevTools Console 中：
```javascript
// 读取完整数据
window.electronAPI.storage.read()

// 获取存储路径
window.electronAPI.storage.getPath()

// 测试导出
window.electronAPI.export.profile('claude')
```

### 查看 Zustand Store

安装 React DevTools 扩展后，可以在 Components 面板查看状态。

## 测试数据

冒烟测试会自动：
1. 备份现有数据到 `~/.memory-os/memory.backup.json`
2. 运行所有测试
3. 恢复原始数据

手动测试不会影响现有数据，所有修改都会正常保存。

## 故障排除

### GUI 无法启动

```bash
# 清理构建缓存
rm -rf dist-electron node_modules/.vite

# 重新安装依赖
npm install

# 重新启动
npm run dev:gui
```

### TypeScript 编译错误

```bash
# 清理编译输出
rm -rf dist

# 重新编译
npm run build
```

### 数据文件损坏

```bash
# 查看文件内容
cat ~/.memory-os/memory.json

# 手动修复或重新初始化
npm run dev -- init
```

## 下一步

完成当前阶段测试后，可以继续：

1. **开始阶段 4**：实现 Projects 功能
2. **开始阶段 5**：实现 Insights 功能
3. **开始阶段 6**：完善导出和打包

每个阶段都有对应的验收标准和测试清单。
