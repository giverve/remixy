import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import type { ServerBuild } from "@remix-run/node";
import { type Env, Hono } from "hono";
import { logger } from "hono/logger";
import type { BlankEnv } from "hono/types";
import path from "node:path";
import url from "node:url";
import { remix } from "remix-hono/handler";

import { importDevBuild } from "./dev/build";
import { cache } from "./middlewares";
import type {
  CreateLoaderFn,
  HonoContext,
  HonoServerOptions,
  LoadContextOptions,
} from "./types";

const defaultOptions: HonoServerOptions<BlankEnv> = {
  defaultLogger: true,
  port: Number(process.env.PORT) || 3000,
  buildDirectory: "build/server",
  serverBuildFile: "index.js",
  assetsDir: "assets",
  listeningListener: (info) => {
    console.log(
      `🚀 [Remixy] Remix run on Hono Server started on port ${info.port}`
    );
  },
};

export async function createHonoServer<E extends Env = BlankEnv>(
  options: HonoServerOptions<E> = {}
) {
  const mergedOptions: HonoServerOptions<E> = {
    ...defaultOptions,
    ...options,
    defaultLogger: options.defaultLogger ?? true,
  };

  const mode =
    process.env.NODE_ENV === "test" ? "development" : process.env.NODE_ENV;

  const isProductionMode = mode === "production";

  const server = new Hono<E>(mergedOptions.honoOptions);

  /**
   * Inject middleware
   */
  if (mergedOptions.configure) {
    await mergedOptions.configure(server);
  }

  /**
   * Serve assets files from build/client/assets
   */
  server.use(
    `/${mergedOptions.assetsDir}/*`,
    cache(60 * 60 * 24 * 365), // 1 year
    serveStatic({ root: "./build/client" })
  );

  /**
   * Serve public files
   */
  server.use(
    "*",
    cache(60 * 60),
    serveStatic({ root: isProductionMode ? "./build/client" : "./public" })
  ); // 1 hour

  /**
   * Add logger middleware
   */
  if (mergedOptions.defaultLogger) {
    server.use("*", logger());
  }

  /**
   * Add remix middleware to Hono server
   */
  server.use(async (c, next) => {
    const build = (
      isProductionMode
        ? await import(
            /* @vite-ignore */
            url
              .pathToFileURL(
                path.resolve(
                  path.join(
                    process.cwd(),
                    `./${mergedOptions.buildDirectory}/${mergedOptions.serverBuildFile}`
                  )
                )
              )
              .toString()
          )
        : await importDevBuild()
    ) as ServerBuild;

    return remix({
      build,
      mode,
      getLoadContext(c) {
        if (!mergedOptions.getLoadContext) {
          return {};
        }
        return mergedOptions.getLoadContext(c, { build });
      },
    })(c, next);
  });

  /**
   * Start the production server
   */

  if (isProductionMode) {
    serve(
      {
        ...server,
        port: mergedOptions.port,
      },
      mergedOptions.listeningListener
    );
  }

  return server;
}

export function createRemixHonoLoadContext<T>(loaderFn: CreateLoaderFn<T>) {
  return (honoCtx: HonoContext, options: LoadContextOptions): T => {
    return loaderFn(honoCtx, options);
  };
}
