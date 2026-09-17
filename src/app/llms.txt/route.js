export async function GET() {
  const content = `# DevPipe
> Write once. Syndicate everywhere.

DevPipe is a tool for open-source maintainers to draft, format, and publish release notes to GitHub, Dev.to, Hashnode, and Reddit simultaneously using AI transformation.

## Target Audience
Developers, Open Source Maintainers.

## Tech Stack
Next.js, bro.js, MongoDB.`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
