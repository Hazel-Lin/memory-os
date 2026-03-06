# 故障排除指南

## 问题：界面一直显示"加载中..."

### 解决方案 1：刷新页面
在 Electron 窗口中按 **Cmd+R**（macOS）或 **Ctrl+R**（Windows/Linux）刷新页面。

### 解决方案 2：重启 GUI
```bash
# 停止当前进程（在终端按 Ctrl+C）
# 然后重新启动
npm run dev:gui
```

### 解决方案 3：检查 DevTools
1. 打开 DevTools：**Cmd+Option+I**（macOS）或 **Ctrl+Shift+I**（Windows/Linux）
2. 查看 Console 面板的错误信息
3. 在 Console 中手动测试 IPC：
```javascript
// 测试数据读取
window.electronAPI.storage.read()

// 应该返回包含 selfProfile, projects, insights 的对象
```

### 解决方案 4：验证数据文件
```bash
# 查看数据文件内容
cat ~/.memory-os/memory.json | jq .

# 运行诊断脚本
node tests/diagnose-gui.mjs
```

### 解决方案 5：清除缓存重新构建
```bash
# 停止 GUI
# 清除构建缓存
rm -rf dist-electron node_modules/.vite

# 重新启动
npm run dev:gui
```

## 问题：数据保存后没有更新

### 检查步骤
1. 打开 DevTools Console
2. 查找"Profile 保存成功"的日志
3. 验证文件是否更新：
```bash
cat ~/.memory-os/memory.json | jq .selfProfile
```

### 如果看到错误
- 检查错误消息
- 确保文件没有被其他程序锁定
- 检查文件权限

## 问题：导出功能不工作

### 测试导出
在 Console 中：
```javascript
// 测试导出 Profile
window.electronAPI.export.profile('claude')
  .then(result => console.log('导出结果:', result))
  .catch(error => console.error('导出失败:', error))

// 测试剪贴板
window.electronAPI.clipboard.write('测试文本')
  .then(() => console.log('写入剪贴板成功'))
  .catch(error => console.error('写入失败:', error))
```

## 问题：能力滑块不响应

### 检查
1. 确保数据已加载（不显示"加载中..."）
2. 尝试点击滑块轨道而不是拖动
3. 检查 Console 是否有 JavaScript 错误

## 常见错误信息

### "IPC 处理器未注册"
- 主进程启动失败
- 重启 GUI 应用

### "Failed to read memory.json"
- 数据文件损坏或不存在
- 运行 `npm run dev -- init` 重新初始化

### "Permission denied"
- 文件权限问题
- 检查 ~/.memory-os/ 目录权限

## 获取帮助

如果以上方法都无法解决问题：

1. **收集信息**：
   - 运行 `node tests/diagnose-gui.mjs`
   - 截图 DevTools Console 的错误
   - 记录操作步骤

2. **重置环境**：
```bash
# 备份数据
cp ~/.memory-os/memory.json ~/memory-backup.json

# 清理并重新初始化
rm -rf ~/.memory-os
npm run dev -- init

# 恢复数据
cp ~/memory-backup.json ~/.memory-os/memory.json

# 重启 GUI
npm run dev:gui
```

## 调试技巧

### 查看 Zustand Store 状态
安装 React DevTools 扩展后，在 Components 面板可以查看当前状态。

### 监控数据变化
在 Console 中：
```javascript
// 监听数据变化
setInterval(() => {
  window.electronAPI.storage.read().then(data => {
    console.log('当前数据:', data.selfProfile.name);
  });
}, 5000);
```

### 强制重新加载数据
在 Console 中：
```javascript
// 强制刷新页面
location.reload()
```
