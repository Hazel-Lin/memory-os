#!/usr/bin/env node

/**
 * Memory OS 冒烟测试
 * 验证核心功能是否正常工作
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 测试配置
const MEMORY_DIR = path.join(os.homedir(), '.memory-os');
const MEMORY_FILE = path.join(MEMORY_DIR, 'memory.json');
const BACKUP_FILE = path.join(MEMORY_DIR, 'memory.backup.json');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.blue}[测试]${colors.reset} ${name}`);
}

function logSuccess(message) {
  console.log(`  ${colors.green}✓${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`  ${colors.red}✗${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`  ${colors.yellow}⚠${colors.reset} ${message}`);
}

// 备份现有数据
function backupData() {
  if (fs.existsSync(MEMORY_FILE)) {
    fs.copyFileSync(MEMORY_FILE, BACKUP_FILE);
    logWarning('已备份现有数据');
  }
}

// 恢复数据
function restoreData() {
  if (fs.existsSync(BACKUP_FILE)) {
    fs.copyFileSync(BACKUP_FILE, MEMORY_FILE);
    fs.unlinkSync(BACKUP_FILE);
    logWarning('已恢复原始数据');
  }
}

// 测试：数据文件初始化
async function testDataInitialization() {
  logTest('数据文件初始化');

  try {
    // 导入核心模块
    const storageModule = await import('../core/storage.js');
    const { ensureDir, writeMemory, getDefaultMemory, memoryFileExists } = storageModule;

    // 确保目录存在
    ensureDir();
    logSuccess('目录创建成功');

    // 创建默认数据
    const defaultData = getDefaultMemory();
    writeMemory(defaultData);
    logSuccess('默认数据写入成功');

    // 验证文件存在
    if (memoryFileExists()) {
      logSuccess('数据文件存在验证通过');
    } else {
      throw new Error('数据文件不存在');
    }

    return true;
  } catch (error) {
    logError(`初始化失败: ${error.message}`);
    return false;
  }
}

// 测试：数据读写
async function testDataReadWrite() {
  logTest('数据读写');

  try {
    const storageModule = await import('../core/storage.js');
    const { readMemory, writeMemory } = storageModule;

    // 读取数据
    const data = readMemory();
    logSuccess('数据读取成功');

    // 修改数据
    data.selfProfile.name = '测试用户';
    data.selfProfile.bio = '这是一个冒烟测试';
    data.selfProfile.capabilities.business_judgment = 3;

    // 写入数据
    writeMemory(data);
    logSuccess('数据写入成功');

    // 再次读取验证
    const newData = readMemory();
    if (newData.selfProfile.name === '测试用户') {
      logSuccess('数据验证通过');
    } else {
      throw new Error('数据不一致');
    }

    return true;
  } catch (error) {
    logError(`读写失败: ${error.message}`);
    return false;
  }
}

// 测试：Project 操作
async function testProjectOperations() {
  logTest('Project 操作');

  try {
    const storageModule = await import('../core/storage.js');
    const { readMemory, writeMemory } = storageModule;

    const data = readMemory();

    // 添加项目
    const testProject = {
      id: `test_${Date.now()}`,
      name: '测试项目',
      description: '用于冒烟测试的项目',
      goals: ['目标1', '目标2'],
      audience: '测试用户',
      status: 'active',
      focusThisWeek: '完成测试',
      createdAt: new Date().toISOString(),
    };

    data.projects.push(testProject);
    writeMemory(data);
    logSuccess('项目添加成功');

    // 验证项目
    const updatedData = readMemory();
    const foundProject = updatedData.projects.find((p) => p.id === testProject.id);
    if (foundProject) {
      logSuccess('项目验证通过');
    } else {
      throw new Error('找不到添加的项目');
    }

    return true;
  } catch (error) {
    logError(`Project 操作失败: ${error.message}`);
    return false;
  }
}

// 测试：Insight 操作
async function testInsightOperations() {
  logTest('Insight 操作');

  try {
    const storageModule = await import('../core/storage.js');
    const { readMemory, writeMemory } = storageModule;

    const data = readMemory();

    // 添加洞察
    const testInsight = {
      id: `test_${Date.now()}`,
      title: '测试洞察',
      scenario: '冒烟测试场景',
      content: '这是一条测试洞察内容',
      projectId: null,
      createdAt: new Date().toISOString(),
    };

    data.insights.push(testInsight);
    writeMemory(data);
    logSuccess('洞察添加成功');

    // 验证洞察
    const updatedData = readMemory();
    const foundInsight = updatedData.insights.find((i) => i.id === testInsight.id);
    if (foundInsight) {
      logSuccess('洞察验证通过');
    } else {
      throw new Error('找不到添加的洞察');
    }

    return true;
  } catch (error) {
    logError(`Insight 操作失败: ${error.message}`);
    return false;
  }
}

// 测试：数据结构完整性
async function testDataStructure() {
  logTest('数据结构完整性');

  try {
    const storageModule = await import('../core/storage.js');
    const { readMemory } = storageModule;

    const data = readMemory();

    // 验证必需字段
    const requiredFields = {
      selfProfile: ['name', 'languages', 'bio', 'writingStyle', 'capabilities'],
      writingStyle: ['tone', 'preferredStructures', 'avoid'],
      project: ['id', 'name', 'description', 'goals', 'audience', 'status', 'focusThisWeek', 'createdAt'],
      insight: ['id', 'title', 'scenario', 'content', 'projectId', 'createdAt'],
    };

    // 检查 selfProfile
    for (const field of requiredFields.selfProfile) {
      if (!(field in data.selfProfile)) {
        throw new Error(`selfProfile 缺少字段: ${field}`);
      }
    }
    logSuccess('selfProfile 结构验证通过');

    // 检查 writingStyle
    for (const field of requiredFields.writingStyle) {
      if (!(field in data.selfProfile.writingStyle)) {
        throw new Error(`writingStyle 缺少字段: ${field}`);
      }
    }
    logSuccess('writingStyle 结构验证通过');

    // 检查 projects
    if (Array.isArray(data.projects)) {
      logSuccess('projects 数组验证通过');
      if (data.projects.length > 0) {
        const project = data.projects[0];
        for (const field of requiredFields.project) {
          if (!(field in project)) {
            throw new Error(`project 缺少字段: ${field}`);
          }
        }
        logSuccess('project 结构验证通过');
      }
    }

    // 检查 insights
    if (Array.isArray(data.insights)) {
      logSuccess('insights 数组验证通过');
      if (data.insights.length > 0) {
        const insight = data.insights[0];
        for (const field of requiredFields.insight) {
          if (!(field in insight)) {
            throw new Error(`insight 缺少字段: ${field}`);
          }
        }
        logSuccess('insight 结构验证通过');
      }
    }

    return true;
  } catch (error) {
    logError(`结构验证失败: ${error.message}`);
    return false;
  }
}

// 主测试流程
async function runTests() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  Memory OS 冒烟测试', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  // 备份数据
  backupData();

  const results = [];

  // 运行所有测试
  results.push(await testDataInitialization());
  results.push(await testDataReadWrite());
  results.push(await testProjectOperations());
  results.push(await testInsightOperations());
  results.push(await testDataStructure());

  // 恢复数据
  restoreData();

  // 统计结果
  const passed = results.filter((r) => r).length;
  const total = results.length;

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('  测试结果', 'blue');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'blue');

  if (passed === total) {
    log(`✓ 所有测试通过 (${passed}/${total})`, 'green');
    log(`\n数据文件位置: ${MEMORY_FILE}`, 'blue');
    process.exit(0);
  } else {
    log(`✗ 部分测试失败 (${passed}/${total})`, 'red');
    process.exit(1);
  }
}

// 运行测试
runTests().catch((error) => {
  logError(`测试运行失败: ${error.message}`);
  restoreData();
  process.exit(1);
});
