import { createBro, z } from 'bro-framework/next';
import en from '../locale/en.json';
import mongoose from "mongoose";

// Central bro.js configuration for this Next.js application.
const { defineRoute } = createBro({
  // Validate required environment variables when the application starts.
  env: z.object({
    JWT_SECRET: z.string().min(1)
  }),

  // Enable JWT or API-key authentication by supplying real secrets.
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    // apiKey: process.env.API_KEY || ['dev_key_1', 'dev_key_2'] // for API key authentication, supports array for zero-downtime rotation
  },

  // Rate limiting configuration.
  rateLimit: { windowMs: 10000, max: 5 }, // Allow five requests per client during each ten-second window.

  // Optional database connection. Uncomment and install mongoose when needed.
  db: async () => {
    mongoose.connect(process.env.MONGODB_URI);
  },

  // Optional Redis connection for distributed caching and rate limiting.
  // redisUrl: process.env.REDIS_URL,

  // Locales are resolved by ctx.t() in route handlers.
  locales: {
    en
  },
  defaultLocale: 'en'
});

export { defineRoute, z };
