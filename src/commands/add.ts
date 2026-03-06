import inquirer from "inquirer";
import { readMemory, writeMemory } from "../../core/storage.js";
import type { Project, Insight } from "../../core/models.js";
import { addInsight, addProject } from "../../core/services/memory-service.js";

export async function addProjectCommand(): Promise<void> {
  const answers = await inquirer.prompt([
    { type: "input", name: "name", message: "项目名称:" },
    { type: "input", name: "description", message: "项目描述:" },
    {
      type: "input",
      name: "goals",
      message: "项目目标（用 ; 分隔多个）:",
    },
    { type: "input", name: "audience", message: "目标受众:" },
    {
      type: "list",
      name: "status",
      message: "当前状态:",
      choices: ["ideation", "mvp", "active", "maintenance", "archived"],
    },
    { type: "input", name: "focusThisWeek", message: "本周重点:" },
  ]);

  const data = readMemory();

  const projectInput: Omit<Project, "id" | "createdAt"> = {
    name: answers.name,
    description: answers.description,
    goals: answers.goals
      .split(";")
      .map((g: string) => g.trim())
      .filter(Boolean),
    audience: answers.audience,
    status: answers.status,
    focusThisWeek: answers.focusThisWeek,
  };
  const project = addProject(data, projectInput);

  data.projects.push(project);
  writeMemory(data);
  console.log(`项目已添加: ${project.name} (id: ${project.id})`);
}

export async function addInsightCommand(): Promise<void> {
  const data = readMemory();

  // 准备项目选项
  const projectChoices = [
    { name: "（不关联项目）", value: "" },
    ...data.projects.map((p) => ({ name: `${p.name} (${p.id})`, value: p.id })),
  ];

  const answers = await inquirer.prompt([
    { type: "input", name: "title", message: "洞察标题:" },
    { type: "input", name: "scenario", message: "适用场景:" },
    {
      type: "editor",
      name: "content",
      message: "洞察内容（将打开编辑器）:",
    },
    {
      type: "list",
      name: "projectId",
      message: "关联项目:",
      choices: projectChoices,
    },
  ]);

  const insightInput: Omit<Insight, "id" | "createdAt"> = {
    title: answers.title,
    scenario: answers.scenario,
    content: answers.content.trim(),
    projectId: answers.projectId || null,
  };
  const insight = addInsight(data, insightInput);

  data.insights.push(insight);
  writeMemory(data);
  console.log(`洞察已添加: ${insight.title} (id: ${insight.id})`);
}
