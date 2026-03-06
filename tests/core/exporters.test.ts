import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultMemoryData } from "../../core/schema.js";
import {
  formatInsightsExport,
  formatProfileExport,
  formatProjectContextExport,
} from "../../core/services/exporters.js";

function makeFixture() {
  const data = createDefaultMemoryData();
  data.selfProfile.name = "Lin";
  data.selfProfile.bio = "Builds tools for AI workflows.";
  data.selfProfile.writingStyle.tone = "Direct";
  data.selfProfile.capabilities.writing = 4;
  data.projects.push({
    id: "p1",
    name: "Memory OS",
    description: "Local context manager",
    goals: ["Capture context", "Export prompts"],
    audience: "Solo builders",
    status: "active",
    focusThisWeek: "Refactor core layer",
    createdAt: "2026-03-06T00:00:00.000Z",
  });
  data.insights.push({
    id: "i1",
    title: "Prefer local-first",
    scenario: "Tool architecture",
    content: "Keep the source of truth in a local file first.",
    projectId: "p1",
    createdAt: "2026-03-06T00:00:00.000Z",
  });
  return data;
}

test("formatProfileExport returns Claude-specific guidance", () => {
  const output = formatProfileExport(makeFixture(), "claude");

  assert.match(output, /You are collaborating with Lin/);
  assert.match(output, /When responding:/);
  assert.match(output, /writing: 4\/5/);
});

test("formatProjectContextExport includes related insights", () => {
  const output = formatProjectContextExport(makeFixture(), "p1", "generic");

  assert.match(output, /Use the following project context in this conversation/);
  assert.match(output, /- Name: Memory OS/);
  assert.match(output, /## Related Insights \(1\)/);
  assert.match(output, /Prefer local-first/);
});

test("formatInsightsExport returns filtered project insights", () => {
  const output = formatInsightsExport(makeFixture(), "p1");

  assert.match(output, /Use these insights as reusable collaboration patterns/);
  assert.match(output, /# Insights \(1\)/);
  assert.match(output, /Scenario: Tool architecture/);
  assert.match(output, /Keep the source of truth/);
});
