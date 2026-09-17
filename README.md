# DevPipe

Write once. Syndicate everywhere.

DevPipe is a release-note pipeline for open-source maintainers. Write a single
markdown draft and publish platform-correct versions to GitHub Releases,
Dev.to, Hashnode, and Reddit without reformatting anything by hand.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![bro.js](https://img.shields.io/badge/bro.js-backend-informational)](https://brojs.yessindevs.me/)

## Why

Every platform has its own formatting rules, tag limits, and API quirks.
Maintainers end up hand-editing the same changelog four different ways, every
release. DevPipe removes that step: write once, transform per platform,
publish from one place.

## Features

- **AI-assisted transforms** — Groq (gpt-oss-120b) rewrites your draft into a
  platform-appropriate title, structure, and tags, adjusting for whether the
  release is a first launch or a minor update.
- **Mixed publishing model** — direct, parallel API dispatch to platforms that
  support it or expose it for free (GitHub, Dev.to) and a pre-filled copy-and-open flow for platforms
  that don't expose a public posting API.
- **Rate limiting and caching** — Redis-backed, applied at the API layer by
  default, no extra setup required.
- **Crawler-friendly output** — a dedicated `llms.txt` endpoint and structured
  JSON-LD for pages indexed by AI search tools.

## Architecture

DevPipe is a single Next.js (App Router) application. API routes are defined
with the bro.js framework via the `bro-framework/next` adapter, which handles
request validation (Zod), rate limiting, and caching at the route level.

| Layer    | Stack                                  |
| -------- | --------------------------------------- |
| Frontend | Next.js, Tailwind CSS, Framer Motion    |
| Backend  | bro.js, NextAuth.js (GitHub OAuth)      |
| Data     | MongoDB (Mongoose), Redis               |
| AI       | Groq — gpt-oss-120b                     |

## Getting started

Requires Node.js and a running Redis instance.

```bash
git clone https://github.com/medyass1ne/devpipe.git
cd devpipe
npm install
npm run dev
```

## Environment variables

Rename `.env.example` to `.env` and fill in the values:

| Variable               | Description                                          |
| ----------------------- | ----------------------------------------------------- |
| `MONGO_URI`             | MongoDB connection string.                            |
| `GROQ_API_KEY`          | API key for Groq, used for AI transforms.             |
| `REDIS_URL`             | Redis connection string.                            |
| `GITHUB_ID`             | GitHub OAuth App client ID.                           |
| `GITHUB_SECRET`         | GitHub OAuth App client secret.                       |
| `NEXTAUTH_URL`          | Canonical app URL, e.g. `http://localhost:3000`.      |
| `NEXTAUTH_SECRET`       | Random 32-byte string used to sign session tokens.    |
| `REDDIT_CLIENT_ID`      | Reddit app client ID (optional).                      |
| `REDDIT_CLIENT_SECRET`  | Reddit app client secret (optional).                  |

## Contributing

Contributions are welcome, particularly new platform adapters — Medium,
Substack, and Discord webhooks are natural next targets. Open an issue or
discussion before starting on a larger feature so the approach can be agreed
on first.

## License

MIT — see [LICENSE](LICENSE).
