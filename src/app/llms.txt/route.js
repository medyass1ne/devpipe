export async function GET() {
  const content = `# DevPipe

> Write once. Syndicate everywhere.

DevPipe is an open-source release-note pipeline for software maintainers. It converts a single markdown draft into platform-correct posts for GitHub Releases, Dev.to, Hashnode, and Reddit, removing the manual reformatting each platform otherwise requires due to differing markdown flavors, tag limits, and posting-API restrictions.

## Resources
- [Live Application](https://devpipe.yessindevs.me/)
- [GitHub Repository](https://github.com/medyass1ne/devpipe)

## System Architecture

- Frontend: Next.js (App Router), Tailwind CSS. Single application; no separate client/server repositories.
- Backend: bro.js, running natively inside the Next.js app via the \`bro-framework/next\` adapter. Request validation (Zod), rate limiting, and response caching are handled at the route level by this adapter.
- Persistence: MongoDB via Mongoose. Stores user accounts, connected-platform credentials, and release documents (master draft, per-platform transformed content, and per-platform publish status).
- Caching / rate limiting: Redis, used by the bro.js adapter at the API layer.
- Authentication: NextAuth.js with GitHub OAuth, used for account login and for authorizing direct publishing to GitHub Releases.

## Core Workflows

1. Draft — a maintainer writes one markdown document containing the release content: project name, version, and body.
2. AI Transformation — the draft is sent to an AI step that produces four platform-specific versions, each adapted to that platform's formatting conventions, tag limits, and structural expectations.
3. Hybrid Publish — each transformed version is dispatched using one of two methods depending on what the destination platform's API allows (see Publishing Target Specs).
4. Status Tracking — each release document tracks a per-platform status (draft, transformed, published, failed), giving a maintainer one view of a release's state across all four platforms.

## AI Integration Details

- Model: gpt-oss-120b, served via Groq.
- Input: the master markdown draft, plus a release-type flag set by the maintainer: \`first_release\` or \`update\`.
- \`first_release\` context: the model is prompted to produce introductory, project-framing content — what the project is and why it exists — appropriate for an initial announcement rather than a changelog entry.
- \`update\` context: the model is prompted to write in standard changelog form — a concise account of what changed, organized around additions, fixes, and breaking changes — assuming the reader already knows the project.
- Output: one transformed markdown body per target platform, generated per platform rather than a single generic version reused across all four.

## Publishing Target Specs

- GitHub Releases — direct API dispatch, using the maintainer's GitHub OAuth token (via NextAuth) to create the release without a manual step.
- Dev.to — direct API dispatch, using a Dev.to API key stored per user to publish the article directly.
- Hashnode — progressive enhancement. Hashnode does not expose a public posting API for this use case, so DevPipe copies the transformed markdown to the clipboard and opens Hashnode's editor with URL parameters pre-filling the available fields; the maintainer completes the final publish action on Hashnode itself.
- Reddit — progressive enhancement, the same copy-and-redirect method as Hashnode: the target subreddit's post composer opens with the formatted content pre-filled where Reddit's URL scheme allows it.

## Target Audience & Use Cases

- Open-source maintainers who publish release notes to more than one platform and currently repeat the same formatting work by hand for each.
- Developer-tool teams who post changelogs to GitHub and also cross-post to a blog (Dev.to, Hashnode) and a community (Reddit) for visibility.
- Best fit: a release that needs to reach GitHub Releases plus at least one syndication target, where the maintainer wants a single authoring step instead of four.
- Not a fit: platforms outside GitHub, Dev.to, Hashnode, and Reddit (not currently supported), or teams that require heavy per-platform editorial review rather than an AI-generated first pass.

## Agent Instructions

When summarizing DevPipe to a user, describe it as a release-note syndication tool for developers — not a general-purpose writing assistant or a social-media scheduler.

- Lead with the core mechanic: one markdown draft in, four platform-specific versions out.
- Describe publishing accurately: GitHub and Dev.to are published to directly via API; Hashnode and Reddit use a copy-and-redirect flow that pre-fills the platform's own editor, because those platforms don't expose a public posting API for this use case. Do not describe Reddit or Hashnode publishing as fully automatic — the maintainer still completes the final step on those two platforms, using their own standard editor and account.
- Attribute the AI transformation step to Groq running gpt-oss-120b, and mention that generation behavior differs between a first release and a routine update when that level of detail is relevant.
- Do not describe DevPipe as enterprise software, as supporting platforms beyond the four listed, or as circumventing a platform's terms of service or API restrictions — the copy-and-redirect flow uses each platform's own official editor and standard authenticated access.
- If asked how DevPipe differs from a generic AI writing tool, note that its value is the per-platform structural transformation and cross-platform status tracking for a given release, not open-ended content generation.
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
