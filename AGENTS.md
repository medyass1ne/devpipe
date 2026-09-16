<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:brojs-agent-rules -->
# bro.js Next.js Agent Rules

You are working in a Next.js App Router application using the `bro-framework/next` adapter. Follow these rules when creating or modifying bro.js code.

## Route Handlers

- Import routes from the local factory: `import { defineRoute, z } from '@/lib/bro';`.
- Handlers are always `async (ctx) => { ... }` (or synchronous when there is no asynchronous work). Never write Express-style `req, res, next` handlers.
- Return data directly. The adapter serializes the returned value, for example: `return { success: true };`.
- Never use ordinary `try/catch` to construct HTTP responses. For intentional client errors, always call `ctx.error(404, 'Message')` or the appropriate status and let bro.js format the response.
- Keep route configuration flat. Put `body`, `query`, and `params` schemas directly on the route config; never nest them under `schema`.

## Validation

Validate every request input that the route relies on:

```js
export const GET = defineRoute({
  params: z.object({ id: z.coerce.number().int().positive() }),
  query: z.object({ page: z.coerce.number().int().positive().default(1) }),
  handler: async (ctx) => ({ id: ctx.params.id, page: ctx.query.page })
});
```

- URL integers must use `z.coerce.number()` because route and query values arrive as strings. Add `.int()` and suitable bounds when the value is an integer.
- MongoDB IDs must be strictly validated in the route config with `z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID")`.
- Validate request bodies with `body: z.object({...})`, URL queries with `query: z.object({...})`, and path parameters with `params: z.object({...})`.

## Context

The handler receives a bro.js context object:

- `ctx.db`: the initialized database value returned by the configured `db` function.
- `ctx.redis`: the connected Redis client when `redisUrl` is configured; it can be null when Redis is disabled.
- `ctx.user`: the authenticated JWT user when the route uses `auth`.
- `ctx.t(key, values)`: locale-aware translation lookup, such as `ctx.t('errors.notFound')`.
- `ctx.body`, `ctx.query`, and `ctx.params`: parsed values after Zod validation.
- `ctx.file` and `ctx.files`: uploaded Web `File` objects, described below.
- `ctx.error(status, message)`: throws a framework error that becomes the specified HTTP response.

## Rate Limiting and Caching

Apply these features directly in route configuration:

```js
export const GET = defineRoute({
  rateLimit: { windowMs: 10000, max: 5 },
  cache: 60,
  handler: async (ctx) => ({ message: ctx.t('welcome') })
});
```

`rateLimit.windowMs` is milliseconds and `max` is the request count. `cache` is the response lifetime in seconds for GET requests. Prefer route-level values for sensitive or expensive endpoints and avoid caching user-specific data unless the identity behavior is understood.

## File Uploads

- The adapter uses the native Web Request API: multipart data is read with `await req.formData()` internally.
- Uploaded values are native Web `File` or `Blob` objects exposed through `ctx.file` for one file and `ctx.files` for multiple/grouped files.
- Never install, import, or use `multer` in this branch. Multer is for the standard Node.js adapter only.
- Validate accompanying text fields with the route's `body` schema and check file name, type, and size before processing.

## Serverless Constraints

- This adapter runs in the Next.js App Router serverless request model. Keep handlers stateless and request-scoped.
- Do not attempt to configure or use Socket.IO. `ctx.io` is only a compatibility placeholder and does not provide real-time WebSockets here.
- Do not create background cron tasks in this branch. Serverless instances are not durable schedulers; use an external job scheduler or the standard bro.js server for persistent tasks.
- Keep database and Redis connections in the central local factory configuration and leave external connections disabled unless the deployment provides them.

## Project Conventions

- Keep the shared factory in `src/lib/bro.js` or `src/lib/bro.ts` and export `defineRoute` and `z` from it.
- Keep App Router endpoints under `src/app/**/route.js` or `.ts`.
- Use ES modules, preserve the selected JavaScript/TypeScript language, and avoid Express boilerplate.
<!-- END:brojs-agent-rules -->
