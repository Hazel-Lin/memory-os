import readline from "node:readline";
import type { ExportTarget, MemoryData } from "../models.js";
import { readMemory } from "../storage.js";
import {
  formatInsightsExport,
  formatProfileExport,
  formatProjectContextExport,
} from "./exporters.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
}

interface McpPromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

export function startMcpServer(): void {
  const input = readline.createInterface({
    input: process.stdin,
    crlfDelay: Infinity,
  });

  input.on("line", (line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    let request: JsonRpcRequest;
    try {
      request = JSON.parse(trimmed) as JsonRpcRequest;
    } catch {
      writeMessage({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
        },
      });
      return;
    }

    const response = handleMcpRequest(request);
    if (response) {
      writeMessage(response);
    }
  });
}

export function handleMcpRequest(request: JsonRpcRequest): JsonRpcResponse | null {
  if (request.method === "notifications/initialized") {
    return null;
  }

  try {
    switch (request.method) {
      case "initialize":
        return ok(request.id, buildInitializeResult(request.params));
      case "ping":
        return ok(request.id, {});
      case "resources/list":
        return ok(request.id, {
          resources: listResources(readMemory()),
        });
      case "resources/read":
        return ok(request.id, {
          contents: [readResource(readMemory(), String(request.params?.uri ?? ""))],
        });
      case "prompts/list":
        return ok(request.id, {
          prompts: listPrompts(),
        });
      case "prompts/get":
        return ok(
          request.id,
          getPrompt(
            readMemory(),
            String(request.params?.name ?? ""),
            (request.params?.arguments as Record<string, string> | undefined) ?? {}
          )
        );
      case "tools/list":
        return ok(request.id, {
          tools: listTools(),
        });
      case "tools/call":
        return ok(
          request.id,
          callTool(
            readMemory(),
            String(request.params?.name ?? ""),
            (request.params?.arguments as Record<string, unknown> | undefined) ?? {}
          )
        );
      default:
        return err(request.id, -32601, `Method not found: ${request.method}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return err(request.id, -32000, message);
  }
}

function buildInitializeResult(params?: Record<string, unknown>) {
  const protocolVersion =
    typeof params?.protocolVersion === "string"
      ? params.protocolVersion
      : "2025-06-18";

  return {
    protocolVersion,
    capabilities: {
      resources: {},
      prompts: {},
      tools: {},
    },
    serverInfo: {
      name: "memory-os",
      version: "0.2.0",
    },
  };
}

function listResources(data: MemoryData) {
  const resources = [
    {
      uri: "memory://profile",
      name: "Profile",
      description: "Structured personal profile",
      mimeType: "application/json",
    },
    {
      uri: "memory://projects",
      name: "Projects",
      description: "All projects",
      mimeType: "application/json",
    },
    {
      uri: "memory://insights",
      name: "Insights",
      description: "All insights",
      mimeType: "application/json",
    },
  ];

  for (const project of data.projects) {
    resources.push(
      {
        uri: `memory://projects/${encodeURIComponent(project.id)}`,
        name: `Project: ${project.name}`,
        description: "Single project record",
        mimeType: "application/json",
      },
      {
        uri: `memory://projects/${encodeURIComponent(project.id)}/context`,
        name: `Project Context: ${project.name}`,
        description: "Prompt-ready project context",
        mimeType: "text/markdown",
      },
      {
        uri: `memory://projects/${encodeURIComponent(project.id)}/insights`,
        name: `Project Insights: ${project.name}`,
        description: "Prompt-ready project insights",
        mimeType: "text/markdown",
      }
    );
  }

  return resources;
}

function readResource(data: MemoryData, uri: string) {
  if (!uri) {
    throw new Error("Resource URI is required");
  }

  const parsed = new URL(uri);
  const target = normalizeTarget(parsed.searchParams.get("target"));

  if (parsed.hostname === "profile") {
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(data.selfProfile, null, 2),
    };
  }

  if (parsed.hostname === "projects" && parsed.pathname === "") {
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(data.projects, null, 2),
    };
  }

  if (parsed.hostname === "insights" && parsed.pathname === "") {
    return {
      uri,
      mimeType: "application/json",
      text: JSON.stringify(data.insights, null, 2),
    };
  }

  if (parsed.hostname === "projects") {
    const path = parsed.pathname.split("/").filter(Boolean);
    const projectId = decodeURIComponent(path[0] ?? "");

    if (!projectId) {
      throw new Error(`Unsupported resource URI: ${uri}`);
    }

    if (path.length === 1) {
      const project = requireProject(data, projectId);
      return {
        uri,
        mimeType: "application/json",
        text: JSON.stringify(project, null, 2),
      };
    }

    if (path.length === 2 && path[1] === "context") {
      return {
        uri,
        mimeType: "text/markdown",
        text: formatProjectContextExport(data, projectId, target),
      };
    }

    if (path.length === 2 && path[1] === "insights") {
      return {
        uri,
        mimeType: "text/markdown",
        text: formatInsightsExport(data, projectId),
      };
    }
  }

  throw new Error(`Unsupported resource URI: ${uri}`);
}

function listPrompts() {
  return [
    {
      name: "profile_context",
      description: "Get prompt-ready user profile context",
      arguments: [
        optionalArg("target", "Export target: generic or claude"),
      ],
    },
    {
      name: "project_context",
      description: "Get prompt-ready context for a project",
      arguments: [
        requiredArg("projectId", "Project ID"),
        optionalArg("target", "Export target: generic or claude"),
      ],
    },
    {
      name: "insights_context",
      description: "Get prompt-ready insight bundle",
      arguments: [
        optionalArg("projectId", "Optional project ID filter"),
      ],
    },
  ];
}

function getPrompt(
  data: MemoryData,
  name: string,
  args: Record<string, string>
) {
  if (name === "profile_context") {
    const target = normalizeTarget(args.target);
    return {
      description: "Prompt-ready user profile context",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: formatProfileExport(data, target),
          },
        },
      ],
    };
  }

  if (name === "project_context") {
    const projectId = args.projectId;
    if (!projectId) {
      throw new Error("projectId is required");
    }
    const target = normalizeTarget(args.target);
    return {
      description: `Prompt-ready context for project ${projectId}`,
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: formatProjectContextExport(data, projectId, target),
          },
        },
      ],
    };
  }

  if (name === "insights_context") {
    return {
      description: "Prompt-ready insight bundle",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: formatInsightsExport(data, args.projectId),
          },
        },
      ],
    };
  }

  throw new Error(`Unknown prompt: ${name}`);
}

function listTools() {
  return [
    {
      name: "get_profile",
      description: "Get structured profile data and prompt-ready exports",
      inputSchema: {
        type: "object",
        properties: {
          target: {
            type: "string",
            enum: ["generic", "claude"],
          },
        },
      },
    },
    {
      name: "get_project_context",
      description: "Get structured project context and prompt-ready export",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
          target: {
            type: "string",
            enum: ["generic", "claude"],
          },
        },
        required: ["projectId"],
      },
    },
    {
      name: "get_insights",
      description: "Get insights and prompt-ready export",
      inputSchema: {
        type: "object",
        properties: {
          projectId: {
            type: "string",
          },
        },
      },
    },
  ];
}

function callTool(
  data: MemoryData,
  name: string,
  args: Record<string, unknown>
) {
  if (name === "get_profile") {
    const target = normalizeTarget(stringOrNull(args.target));
    return {
      content: [
        {
          type: "text",
          text: formatProfileExport(data, target),
        },
      ],
      structuredContent: {
        profile: data.selfProfile,
      },
    };
  }

  if (name === "get_project_context") {
    const projectId = stringOrNull(args.projectId);
    if (!projectId) {
      throw new Error("projectId is required");
    }
    const project = requireProject(data, projectId);
    const insights = data.insights.filter((item) => item.projectId === projectId);
    const target = normalizeTarget(stringOrNull(args.target));
    return {
      content: [
        {
          type: "text",
          text: formatProjectContextExport(data, projectId, target),
        },
      ],
      structuredContent: {
        project,
        insights,
      },
    };
  }

  if (name === "get_insights") {
    const projectId = stringOrNull(args.projectId) || undefined;
    const insights = projectId
      ? data.insights.filter((item) => item.projectId === projectId)
      : data.insights;

    return {
      content: [
        {
          type: "text",
          text: formatInsightsExport(data, projectId),
        },
      ],
      structuredContent: {
        insights,
      },
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

function requireProject(data: MemoryData, projectId: string) {
  const project = data.projects.find((item) => item.id === projectId);
  if (!project) {
    throw new Error(`Project ${projectId} 不存在`);
  }
  return project;
}

function normalizeTarget(target: string | null | undefined): ExportTarget {
  return target === "claude" ? "claude" : "generic";
}

function optionalArg(name: string, description: string): McpPromptArgument {
  return { name, description, required: false };
}

function requiredArg(name: string, description: string): McpPromptArgument {
  return { name, description, required: true };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function ok(id: JsonRpcRequest["id"], result: unknown): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    result,
  };
}

function err(
  id: JsonRpcRequest["id"],
  code: number,
  message: string
): JsonRpcResponse {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
    },
  };
}

function writeMessage(message: JsonRpcResponse): void {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}
