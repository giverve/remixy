import type { AppLoadContext } from "@remix-run/node";
import type { Context, Env, Hono } from "hono";
import type { HonoOptions } from "hono/hono-base";
import type { BlankEnv } from "hono/types";
import type { RemixMiddlewareOptions } from "remix-hono/handler";

export interface HonoDevServerOptions {
  appDirectory?: string;
  entry?: string;
  exportName?: string;
  exclude?: (string | RegExp)[];
}

export type LoadContextOptions = Pick<RemixMiddlewareOptions, "build" | "mode">;
export type HonoContext = Context;

export type HonoServerOptions<E extends Env = BlankEnv> = {
  defaultLogger?: boolean;
  port?: number;
  buildDirectory?: string;
  serverBuildFile?: `${string}.js`;
  assetsDir?: string;
  configure?: <E extends Env = BlankEnv>(
    server: Hono<E>
  ) => Promise<void> | void;
  getLoadContext?: (
    ctx: Context,
    options: Pick<RemixMiddlewareOptions, "build" | "mode">
  ) => Promise<AppLoadContext> | AppLoadContext;
  listeningListener?: (info: { port: number }) => void;
  honoOptions?: HonoOptions<E>;
};

export type InferHonoLoadContext<
  T extends (...args: [HonoContext, LoadContextOptions]) => unknown
> = Awaited<ReturnType<T>>;

export type CreateLoaderFn<T> = (
  honoCtx: HonoContext,
  options: LoadContextOptions
) => T;
