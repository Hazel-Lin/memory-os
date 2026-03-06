# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Memory OS 是一个本地 CLI 工具，用于管理个人上下文信息（profile、projects、insights），并将其导出为适合粘贴到 AI system prompt 的格式。

## Development Commands

```bash
# 开发模式（无需编译）
npm run dev -- <command> [args]

# 编译 TypeScript
npm run build

# 运行编译后的 CLI
npm run start -- <command> [args]
# 或直接使用
node dist/index.js <command> [args]

# 全局链接（开发用）
npm link
mem <command>  # 可直接使用 mem 命令
```

## Architecture

### 数据流
1. 所有数据存储在 `~/.memory-os/memory.json`（用户目录下）
2. `storage.ts` 负责所有文件 I/O 操作
3. `models.ts` 定义了完整的 TypeScript 类型
4. 命令实现位于 `src/commands/` 目录下

### 核心模块

**src/index.ts** - CLI 入口点
- 使用 commander 定义所有命令和子命令
- 命令组织：`init`, `edit`, `add`, `export`, `list`

**src/storage.ts** - 存储层
- `readMemory()`: 读取并校验 JSON
- `writeMemory(data)`: 写入 JSON
- `getDefaultMemory()`: 默认数据结构
- 错误处理：文件不存在或 JSON 格式不合法时会 `process.exit(1)`

**src/models.ts** - 类型系统
- `MemoryData`: 顶层数据结构（包含 `selfProfile`, `projects`, `insights`）
- `Project`: 项目信息（id, name, description, goals, audience, status, focusThisWeek）
- `Insight`: 洞察记录（title, scenario, content, projectId）
- `SelfProfile`: 个人信息（name, languages, bio, writingStyle, capabilities）

**src/commands/** - 命令实现
- `init.ts`: 初始化数据文件，已存在则跳过
- `edit.ts`: 调用 `$EDITOR` 编辑 JSON，保存后校验格式
- `add.ts`: 使用 inquirer 交互式添加 project/insight
- `export.ts`: 将数据格式化为自然语言输出（profile/context/insights）

### ID 生成规则
项目和洞察的 ID 使用 `Date.now().toString(36) + Math.random().toString(36).slice(2, 6)` 生成，确保唯一性。

### 模块导入约定
项目使用 ES Modules (`"type": "module"`），所有本地模块导入必须带 `.js` 后缀（即使源文件是 `.ts`）：
```typescript
import { readMemory } from "./storage.js";  // ✓ 正确
import { readMemory } from "./storage";     // ✗ 错误
```

## 扩展建议

添加新命令时：
1. 在 `src/commands/` 下创建新文件
2. 在 `src/index.ts` 中注册命令
3. 如果需要修改数据结构，同时更新 `models.ts` 和 `storage.ts` 中的 `getDefaultMemory()`
