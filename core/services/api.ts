import http from "node:http";
import type { AddressInfo } from "node:net";
import { URL } from "node:url";
import type { ExportTarget } from "../models.js";
import { readMemory } from "../storage.js";
import {
  formatInsightsExport,
  formatProfileExport,
  formatProjectContextExport,
} from "./exporters.js";

export interface ApiServerOptions {
  host?: string;
  port?: number;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

export function createApiServer(options: ApiServerOptions = {}): http.Server {
  const server = http.createServer((req, res) => {
    void handleApiRequest(req)
      .then(({ status, body }) => {
        res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(body, null, 2));
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "未知错误";
        res.writeHead(500, { "content-type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: message }, null, 2));
      });
  });

  const host = options.host ?? "127.0.0.1";
  const port = options.port ?? 3322;

  server.on("listening", () => {
    const address = server.address() as AddressInfo | null;
    if (!address) return;
    console.log(`Memory OS API listening on http://${host}:${address.port}`);
  });

  return server.listen(port, host);
}

export async function handleApiRequest(
  req: Pick<http.IncomingMessage, "method" | "url">
): Promise<ApiResponse> {
  if (req.method !== "GET") {
    return {
      status: 405,
      body: { error: "Method not allowed" },
    };
  }

  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  const path = trimTrailingSlash(url.pathname);

  if (path === "/health") {
    return {
      status: 200,
      body: { ok: true },
    };
  }

  const data = readMemory();

  if (path === "/profile") {
    return {
      status: 200,
      body: {
        data: data.selfProfile,
        exports: {
          generic: formatProfileExport(data, "generic"),
          claude: formatProfileExport(data, "claude"),
        },
      },
    };
  }

  if (path === "/projects") {
    return {
      status: 200,
      body: {
        data: data.projects,
      },
    };
  }

  const projectMatch = path.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const projectId = decodeURIComponent(projectMatch[1]);
    const project = data.projects.find((item) => item.id === projectId);
    if (!project) {
      return notFound(`Project ${projectId} 不存在`);
    }
    return {
      status: 200,
      body: {
        data: project,
      },
    };
  }

  const projectContextMatch = path.match(/^\/projects\/([^/]+)\/context$/);
  if (projectContextMatch) {
    const projectId = decodeURIComponent(projectContextMatch[1]);
    const project = data.projects.find((item) => item.id === projectId);
    if (!project) {
      return notFound(`Project ${projectId} 不存在`);
    }

    const relatedInsights = data.insights.filter((item) => item.projectId === projectId);
    const target = normalizeTarget(url.searchParams.get("target"));

    return {
      status: 200,
      body: {
        data: {
          project,
          insights: relatedInsights,
        },
        export: formatProjectContextExport(data, projectId, target),
        target,
      },
    };
  }

  if (path === "/insights") {
    const projectId = url.searchParams.get("project") || undefined;
    const insights = projectId
      ? data.insights.filter((item) => item.projectId === projectId)
      : data.insights;

    return {
      status: 200,
      body: {
        data: insights,
        export: formatInsightsExport(data, projectId),
      },
    };
  }

  return notFound("Route not found");
}

function notFound(message: string): ApiResponse {
  return {
    status: 404,
    body: { error: message },
  };
}

function normalizeTarget(target: string | null): ExportTarget {
  return target === "claude" ? "claude" : "generic";
}

function trimTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
