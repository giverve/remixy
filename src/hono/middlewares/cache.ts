import type { MiddlewareHandler } from "hono";

export function cache(seconds: number): MiddlewareHandler {
  return async (c, next) => {
    if (!/\.[a-zA-Z0-9]+$/.exec(c.req.path) || c.req.path.endsWith(".data")) {
      return next();
    }

    await next();

    if (!c.res.ok) {
      return;
    }

    c.res.headers.set("cache-control", `public, max-age=${seconds}`);
  };
}
