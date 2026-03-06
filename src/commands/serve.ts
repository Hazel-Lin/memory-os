import { createApiServer } from "../../core/services/api.js";

export async function serveCommand(port: number, host: string): Promise<void> {
  const server = createApiServer({ port, host });

  await new Promise<void>((resolve, reject) => {
    server.on("error", reject);
    const shutdown = () => {
      server.close(() => resolve());
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  });
}
