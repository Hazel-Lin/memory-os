import test from "node:test";
import assert from "node:assert/strict";
import { migrateMemoryData } from "../../core/migrate.js";
import { CURRENT_MEMORY_VERSION } from "../../core/schema.js";

test("migrateMemoryData fills missing fields and stamps version", () => {
  const migrated = migrateMemoryData({
    selfProfile: {
      name: "Lin",
      capabilities: {
        writing: 4,
      },
    },
  });

  assert.equal(migrated.version, CURRENT_MEMORY_VERSION);
  assert.equal(migrated.selfProfile.name, "Lin");
  assert.deepEqual(migrated.selfProfile.languages, ["zh-CN", "en"]);
  assert.equal(migrated.selfProfile.capabilities.business_judgment, 0);
  assert.equal(migrated.selfProfile.capabilities.writing, 4);
  assert.deepEqual(migrated.projects, []);
  assert.deepEqual(migrated.insights, []);
});

test("migrateMemoryData rejects invalid capability ranges", () => {
  assert.throws(
    () =>
      migrateMemoryData({
        version: 1,
        selfProfile: {
          capabilities: {
            writing: 7,
          },
        },
      }),
    /Too big|Invalid input/
  );
});
