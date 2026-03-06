#!/usr/bin/env node

/**
 * GUI 诊断脚本
 * 检查 IPC 通信和数据加载是否正常
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const MEMORY_FILE = path.join(os.homedir(), '.memory-os/memory.json');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Memory OS GUI 诊断');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 1. 检查数据文件
console.log('1. 检查数据文件...');
if (fs.existsSync(MEMORY_FILE)) {
  console.log('  ✓ 文件存在:', MEMORY_FILE);

  try {
    const content = fs.readFileSync(MEMORY_FILE, 'utf-8');
    const data = JSON.parse(content);
    console.log('  ✓ JSON 格式正确');
    console.log('  - Profile 姓名:', data.selfProfile.name || '（空）');
    console.log('  - 项目数量:', data.projects.length);
    console.log('  - 洞察数量:', data.insights.length);
  } catch (error) {
    console.log('  ✗ JSON 解析失败:', error.message);
  }
} else {
  console.log('  ✗ 文件不存在');
}

// 2. 检查构建文件
console.log('\n2. 检查构建文件...');
const distElectron = path.join(process.cwd(), 'dist-electron');
if (fs.existsSync(distElectron)) {
  console.log('  ✓ dist-electron 目录存在');

  const mainFile = path.join(distElectron, 'main/index.js');
  const preloadFile = path.join(distElectron, 'preload/index.js');

  if (fs.existsSync(mainFile)) {
    console.log('  ✓ main/index.js 存在');
  } else {
    console.log('  ✗ main/index.js 不存在');
  }

  if (fs.existsSync(preloadFile)) {
    console.log('  ✓ preload/index.js 存在');
  } else {
    console.log('  ✗ preload/index.js 不存在');
  }
} else {
  console.log('  ✗ dist-electron 目录不存在');
}

// 3. 建议
console.log('\n3. 调试建议...');
console.log('  - 打开 DevTools (Cmd+Option+I)');
console.log('  - 查看 Console 中的错误信息');
console.log('  - 检查 Network 面板的请求');
console.log('  - 在 Console 中运行: window.electronAPI.storage.read()');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
