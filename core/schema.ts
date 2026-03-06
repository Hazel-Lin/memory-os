import { z } from "zod";
import type { MemoryData } from "./models.js";

export const CURRENT_MEMORY_VERSION = 1;

const WritingStyleSchema = z.object({
  tone: z.string(),
  preferredStructures: z.array(z.string()),
  avoid: z.array(z.string()),
});

const CapabilitiesSchema = z
  .object({
    business_judgment: z.number().min(0).max(5),
    writing: z.number().min(0).max(5),
    product_thinking: z.number().min(0).max(5),
  })
  .catchall(z.number().min(0).max(5));

export const MemoryDataSchema = z.object({
  version: z.number().int().min(1),
  selfProfile: z.object({
    name: z.string(),
    languages: z.array(z.string()),
    bio: z.string(),
    writingStyle: WritingStyleSchema,
    capabilities: CapabilitiesSchema,
  }),
  projects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      goals: z.array(z.string()),
      audience: z.string(),
      status: z.string(),
      focusThisWeek: z.string(),
      createdAt: z.string(),
    })
  ),
  insights: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      scenario: z.string(),
      content: z.string(),
      projectId: z.string().nullable(),
      createdAt: z.string(),
    })
  ),
});

const LooseMemorySchema = z.object({
  version: z.number().int().min(1).optional(),
  selfProfile: z
    .object({
      name: z.string().optional(),
      languages: z.array(z.string()).optional(),
      bio: z.string().optional(),
      writingStyle: z
        .object({
          tone: z.string().optional(),
          preferredStructures: z.array(z.string()).optional(),
          avoid: z.array(z.string()).optional(),
        })
        .optional(),
      capabilities: z.record(z.string(), z.number()).optional(),
    })
    .optional(),
  projects: z
    .array(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        description: z.string().optional(),
        goals: z.array(z.string()).optional(),
        audience: z.string().optional(),
        status: z.string().optional(),
        focusThisWeek: z.string().optional(),
        createdAt: z.string().optional(),
      })
    )
    .optional(),
  insights: z
    .array(
      z.object({
        id: z.string().optional(),
        title: z.string().optional(),
        scenario: z.string().optional(),
        content: z.string().optional(),
        projectId: z.string().nullable().optional(),
        createdAt: z.string().optional(),
      })
    )
    .optional(),
});

export function createDefaultMemoryData(): MemoryData {
  return {
    version: CURRENT_MEMORY_VERSION,
    selfProfile: {
      name: "",
      languages: ["zh-CN", "en"],
      bio: "",
      writingStyle: {
        tone: "",
        preferredStructures: [],
        avoid: [],
      },
      capabilities: {
        business_judgment: 0,
        writing: 0,
        product_thinking: 0,
      },
    },
    projects: [],
    insights: [],
  };
}

export function normalizeMemoryData(input: unknown): MemoryData {
  const parsed = LooseMemorySchema.parse(input);
  const defaults = createDefaultMemoryData();

  const normalized: MemoryData = {
    version: parsed.version ?? defaults.version,
    selfProfile: {
      name: parsed.selfProfile?.name ?? defaults.selfProfile.name,
      languages: parsed.selfProfile?.languages ?? defaults.selfProfile.languages,
      bio: parsed.selfProfile?.bio ?? defaults.selfProfile.bio,
      writingStyle: {
        tone:
          parsed.selfProfile?.writingStyle?.tone ??
          defaults.selfProfile.writingStyle.tone,
        preferredStructures:
          parsed.selfProfile?.writingStyle?.preferredStructures ??
          defaults.selfProfile.writingStyle.preferredStructures,
        avoid:
          parsed.selfProfile?.writingStyle?.avoid ??
          defaults.selfProfile.writingStyle.avoid,
      },
      capabilities: {
        ...defaults.selfProfile.capabilities,
        ...(parsed.selfProfile?.capabilities ?? {}),
      },
    },
    projects: (parsed.projects ?? []).map((project) => ({
      id: project.id ?? "",
      name: project.name ?? "",
      description: project.description ?? "",
      goals: project.goals ?? [],
      audience: project.audience ?? "",
      status: project.status ?? "active",
      focusThisWeek: project.focusThisWeek ?? "",
      createdAt: project.createdAt ?? new Date(0).toISOString(),
    })),
    insights: (parsed.insights ?? []).map((insight) => ({
      id: insight.id ?? "",
      title: insight.title ?? "",
      scenario: insight.scenario ?? "",
      content: insight.content ?? "",
      projectId: insight.projectId ?? null,
      createdAt: insight.createdAt ?? new Date(0).toISOString(),
    })),
  };

  return MemoryDataSchema.parse(normalized);
}
