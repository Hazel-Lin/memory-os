import { startMcpServer } from "../../core/services/mcp.js";

export async function mcpCommand(): Promise<void> {
  startMcpServer();

  await new Promise<void>((resolve) => {
    process.stdin.on("end", () => resolve());
    process.stdin.resume();
  });
}
