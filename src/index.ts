#!/usr/bin/env node

import { Command } from "commander";
import { initCommand } from "./commands/init.js";
import {
  editInsightCommand,
  editProfileCommand,
  editProjectCommand,
} from "./commands/edit.js";
import { addProjectCommand, addInsightCommand } from "./commands/add.js";
import {
  exportProfileCommand,
  exportContextCommand,
  exportInsightsCommand,
} from "./commands/export.js";
import { readMemory } from "../core/storage.js";

const program = new Command();

function runSafely<T extends unknown[]>(
  action: (...args: T) => void | Promise<void>
) {
  return async (...args: T) => {
    try {
      await action(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : "未知错误";
      console.error(message);
      process.exit(1);
    }
  };
}

program
  .name("mem")
  .description("Memory OS - 本地个人上下文管理工具")
  .version("0.1.0");

// mem init
program
  .command("init")
  .description("初始化 memory.json")
  .option("--force", "覆盖已存在的 memory.json")
  .action(runSafely((opts?: { force?: boolean }) => initCommand(Boolean(opts?.force))));

// mem edit profile
const editCmd = program.command("edit").description("编辑数据");
editCmd
  .command("profile")
  .description("用编辑器打开 memory.json 进行编辑")
  .action(runSafely(editProfileCommand));
editCmd
  .command("project")
  .description("用编辑器打开单个项目进行编辑")
  .argument("<id>", "项目 ID")
  .action(runSafely((id: string) => editProjectCommand(id)));
editCmd
  .command("insight")
  .description("用编辑器打开单条洞察进行编辑")
  .argument("<id>", "洞察 ID")
  .action(runSafely((id: string) => editInsightCommand(id)));

// mem add project / insight
const addCmd = program.command("add").description("添加数据");
addCmd
  .command("project")
  .description("交互式添加一个项目")
  .action(runSafely(addProjectCommand));
addCmd
  .command("insight")
  .description("交互式添加一条洞察")
  .action(runSafely(addInsightCommand));

// mem export
const exportCmd = program.command("export").description("导出上下文");

exportCmd
  .command("profile")
  .description("导出个人简介，用于 AI system prompt")
  .option("--target <target>", "目标平台: claude | generic", "generic")
  .action(runSafely((opts?: { target: string }) => exportProfileCommand(opts?.target ?? "generic")));

exportCmd
  .command("context")
  .description("导出项目上下文")
  .requiredOption("--project <id>", "项目 ID")
  .option("--target <target>", "目标平台: claude | generic", "generic")
  .action(
    runSafely((opts?: { project: string; target: string }) =>
      exportContextCommand(opts!.project, opts!.target)
    )
  );

exportCmd
  .command("insights")
  .description("导出洞察列表")
  .option("--project <id>", "按项目 ID 过滤")
  .action(runSafely((opts?: { project?: string }) => exportInsightsCommand(opts?.project ?? "")));

// mem list
program
  .command("list")
  .description("列出所有项目")
  .action(runSafely(() => {
    const data = readMemory();
    if (data.projects.length === 0) {
      console.log("暂无项目，使用 mem add project 添加");
      return;
    }
    console.log("项目列表:\n");
    data.projects.forEach((p) => {
      console.log(`  ${p.id}  ${p.name}  [${p.status}]`);
      console.log(`          ${p.description}`);
      console.log();
    });
  }));

program.parse();
