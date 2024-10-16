# remixy

![npm](https://img.shields.io/npm/v/remixy)
![License](https://img.shields.io/npm/l/remixy)

remixy is a versatile and extensible library designed to seamlessly integrate [Remix](https://remix.run/) applications with popular backend and routing frameworks, such as [Hono](https://hono.dev/). It empowers developers to build robust APIs and manage context effortlessly within Remix loaders.

## Features

- **Seamless Integration**: Easily integrate Remix with backend frameworks like Hono.
- **Context Management**: Load and manage context within Remix loaders effortlessly.
- **API Endpoints**: Create API endpoints directly within your Remix application.

## Installation

### Install remixy

```bash
npm install remixy
```

### Update package.json scripts

```json
  "scripts": {
    "build": "NODE_ENV=production remix vite:build",
    "start": "NODE_ENV=production node ./build/server/index.js"
    // other scripts...
  },
```

### Vite Configuration

Begin by configuring your vite.config.ts to include remixy and Remix plugins.

```typescript
// vite.config.ts
import { vitePlugin as remix } from "@remix-run/dev";
import { honoDevServer } from "remixy"; // Import from remixy
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  build: {
    target: "esnext", // Important: Change build target to ESNext
  },
  server: {
    port: 3002, // Optional: set your development PORT
  },
  plugins: [
    honoDevServer(), //  Important: Add Hono remixy dev server plugin
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
  ],
});
```

## Server Setup and Usage Sample

Configure your server to create and load context using remixy. Add code below in your entry.server.ts

```typescript
// entry.server.ts
import type { InferHonoLoadContext } from "remixy";
import { createRemixHonoLoadContext, createHonoServer } from "remixy";

// Sample: Function to load environment variables
const getClientEnv = () => {
  return {
    PUBLIC_API_URL: process.env.PUBLIC_API_URL,
  };
};

// Setup 1: Create load context
export const getLoadContext = createRemixHonoLoadContext((honoCtx, options) => {
  const clientEnv = getClientEnv();
  // here you can also use honoCtx or options from callback
  return { clientEnv };
});

// Setup 2: Create and configure the Hono server
export const server = createHonoServer({
  port: 3002, // set your production port
  getLoadContext,
  configure(server) {
    server.get("/api/hello", (ctx) => {
      return ctx.json({ hello: "world" });
    });
    // Add more API routes as needed
  },
});

// Setup 3: Extend Remix's AppLoadContext with remixy's context
declare module "@remix-run/node" {
  interface AppLoadContext
    extends InferHonoLoadContext<typeof getLoadContext> {}
}
```

## The Benefit of using remixy

### Using Load Context in Remix

Leverage the loaded context within your Remix loaders.

```typescript
// example.loader.ts
import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader = ({ context }): LoaderFunction => {
  const { clientEnv } = context; // Now you can load your context in the remix loader!
  return json({ clientEnv });
};
```

### Now you can create an API endpoint in Remix

With remixy, you can create API endpoints directly within your Remix application.

```typescript
// See Setup 2 on top
export const server = createHonoServer({
  port: 3002,
  getLoadContext,
  configure(server) {
    server.get("/api/hello", (ctx) => {
      return ctx.json({ hello: "world" });
    });
    // Add more API routes as needed
  },
});
```
