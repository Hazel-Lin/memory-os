import test from "node:test";
import assert from "node:assert/strict";
import { createDefaultMemoryData } from "../../core/schema.js";
import {
  addInsight,
  addProject,
  updateInsight,
  updateProfile,
  updateProject,
} from "../../core/services/memory-service.js";

test("updateProfile merges profile updates", () => {
  const data = createDefaultMemoryData();
  const profile = updateProfile(data, {
    name: "Lin",
    bio: "Writes product specs.",
  });

  assert.equal(profile.name, "Lin");
  assert.equal(profile.bio, "Writes product specs.");
  assert.deepEqual(profile.languages, ["zh-CN", "en"]);
});

test("addProject and updateProject keep persisted fields", () => {
  const data = createDefaultMemoryData();
  const project = addProject(data, {
    name: "Memory OS",
    description: "Context manager",
    goals: ["Ship MVP"],
    audience: "Builders",
    status: "active",
    focusThisWeek: "Refactor",
  });
  data.projects.push(project);

  const updated = updateProject(data, project.id, { status: "maintenance" });

  assert.equal(updated.id, project.id);
  assert.equal(updated.createdAt, project.createdAt);
  assert.equal(updated.status, "maintenance");
});

test("addInsight validates referenced project ids", () => {
  const data = createDefaultMemoryData();

  assert.throws(
    () =>
      addInsight(data, {
        title: "Broken link",
        scenario: "",
        content: "Should fail",
        projectId: "missing",
      }),
    /Project missing 不存在/
  );
});

test("updateInsight allows moving to an existing project", () => {
  const data = createDefaultMemoryData();
  const project = addProject(data, {
    name: "Memory OS",
    description: "Context manager",
    goals: [],
    audience: "",
    status: "active",
    focusThisWeek: "",
  });
  data.projects.push(project);

  const insight = addInsight(data, {
    title: "Local first",
    scenario: "Architecture",
    content: "Use local state",
    projectId: null,
  });
  data.insights.push(insight);

  const updated = updateInsight(data, insight.id, { projectId: project.id });

  assert.equal(updated.projectId, project.id);
});
