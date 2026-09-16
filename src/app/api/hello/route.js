import { defineRoute } from '@/lib/bro';

export const GET = defineRoute({
  // Allow five requests per client during each ten-second window.
  rateLimit: { windowMs: 10000, max: 5 },
  // Cache successful responses for 60 seconds.
  cache: 60,
  handler: (ctx) => ({ message: ctx.t('welcome', { name: 'Developer' }) })
});
