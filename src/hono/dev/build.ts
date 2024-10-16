import type { ViteDevServer } from "vite";

let viteDevServer: ViteDevServer | undefined;

export async function importDevBuild() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (!viteDevServer) {
    const vite = await import("vite");
    viteDevServer = await vite.createServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
  }

  return viteDevServer.ssrLoadModule("virtual:remix/server-build");
}
