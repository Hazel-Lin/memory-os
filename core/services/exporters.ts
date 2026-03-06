import type { ExportTarget, MemoryData } from "../models.js";

export function formatProfileExport(
  data: MemoryData,
  target: ExportTarget = "generic"
): string {
  const p = data.selfProfile;
  const name = p.name || "the user";
  const languages = p.languages.length > 0 ? p.languages.join(", ") : "(not specified)";
  const bio = p.bio || "(not specified)";

  const capLines = Object.entries(p.capabilities)
    .map(([k, v]) => `- ${k}: ${v}/5`)
    .join("\n");

  const styleLines = [
    p.writingStyle.tone ? `- Tone: ${p.writingStyle.tone}` : "",
    p.writingStyle.preferredStructures.length
      ? `- Preferred structures: ${p.writingStyle.preferredStructures.join(", ")}`
      : "",
    p.writingStyle.avoid.length
      ? `- Avoid: ${p.writingStyle.avoid.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (target === "claude") {
    return `You are collaborating with ${name}.

## User Snapshot
- Name: ${name}
- Languages: ${languages}
- Bio: ${bio}

## Writing Style
${styleLines || "(not specified)"}

## Capabilities (self-assessed, 0-5)
${capLines}

When responding:
- match the user's writing style and capability levels
- keep answers practical and easy to apply
- avoid introducing unnecessary framing if the user prefers direct communication`;
  }

  return `User profile for AI collaboration:

- Name: ${name}
- Languages: ${languages}
- Bio: ${bio}

## Writing Style
${styleLines || "(not specified)"}

## Capabilities (self-assessed, 0-5)
${capLines}`;
}

export function formatProjectContextExport(
  data: MemoryData,
  projectId: string,
  target: ExportTarget = "generic"
): string {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) {
    throw new Error(`Project ${projectId} 不存在`);
  }

  const relatedInsights = data.insights.filter((item) => item.projectId === projectId);

  let output = `Use the following project context in this conversation.

## Project
- Name: ${project.name}
- Status: ${project.status}
- Target audience: ${project.audience || "(not specified)"}

## Description
${project.description}

## Goals
${project.goals.length > 0 ? project.goals.map((goal) => `- ${goal}`).join("\n") : "(not specified)"}

## Focus This Week
${project.focusThisWeek || "(not specified)"}`;

  if (relatedInsights.length > 0) {
    output += `\n\n## Related Insights (${relatedInsights.length})`;
    relatedInsights.forEach((insight) => {
      output += `\n\n### ${insight.title}`;
      if (insight.scenario) {
        output += `\nScenario: ${insight.scenario}`;
      }
      output += `\n${insight.content}`;
    });
  }

  if (target === "claude") {
    output += `\n\nWhen responding:
- stay aligned with the current project stage and weekly focus
- prefer suggestions that are executable for this project
- reuse the related insights when relevant`;
  }

  return output;
}

export function formatInsightsExport(data: MemoryData, projectId?: string): string {
  const insights = projectId
    ? data.insights.filter((item) => item.projectId === projectId)
    : data.insights;

  if (insights.length === 0) {
    return projectId ? `项目 ${projectId} 没有关联的 insights` : "暂无洞察记录。";
  }

  let output = `Use these insights as reusable collaboration patterns.\n\n# Insights (${insights.length})\n`;
  insights.forEach((insight, idx) => {
    output += `\n## ${idx + 1}. ${insight.title}`;
    if (insight.scenario) output += `\nScenario: ${insight.scenario}`;
    output += `\n\n${insight.content}\n`;
  });

  return output;
}
