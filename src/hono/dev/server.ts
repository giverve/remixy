import honoDevServer from "@hono/vite-dev-server";
import { type Plugin } from "vite";
import type { HonoDevServerOptions } from "../types";

const defaultConfig: Required<HonoDevServerOptions> = {
  entry: "app/entry.server.tsx",
  exportName: "server",
  appDirectory: "app",
  exclude: [],
};

export function devServer(config: HonoDevServerOptions = {}): Plugin {
  const mergedConfig = { ...defaultConfig, ...config };
  return honoDevServer({
    injectClientScript: false,
    entry: mergedConfig.entry,
    export: mergedConfig.exportName,
    exclude: [
      `/${mergedConfig.appDirectory}/**/*`,
      `/${mergedConfig.appDirectory}/**/.*/**`,
      /^\/@.+$/,
      /^\/node_modules\/.*/,
      ...mergedConfig.exclude,
    ],
  });
}
