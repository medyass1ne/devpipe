import { defineRoute, z } from '@/lib/bro';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = defineRoute({
  //rateLimit: { windowMs: 3600000, max: 3, message: { success: false, error: 'Rate limit exceeded. Please wait a minute.' } },
  body: z.object({
    projectName: z.string().min(1),
    version: z.string().min(1),
    releaseType: z.enum(['first_release', 'update']).default('update'),
    masterContent: z.string().min(1),
  }),
  handler: async (ctx) => {
    const { projectName, version, releaseType, masterContent } = ctx.body;
    
    const prompt = `You are a DevRel engineer. Transform this master release markdown into 4 formats: github (highly technical, diffs, install steps), devto (conversational, emojis, story-driven intro), hashnode (professional architectural breakdown), reddit (plaintext, r/node style, problem-first, no marketing).

The user is publishing a: ${releaseType}.
- If 'first_release': Treat this as a brand new project launch. Introduce what the tool is, the core problem it solves, and why it was built. DO NOT use words like 'update', 'new version', 'changes', or assume the audience knows what the project is.
- If 'update': Treat this as a standard changelog announcement. Focus on what is new in this specific version, breaking changes, and improvements over the previous version.

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "github": { "title": "...", "content": "..." },
  "devto": { "title": "...", "tags": ["tag1", "tag2", "tag3", "tag4"], "content": "..." },
  "hashnode": { "title": "...", "tags": ["tag1", "tag2", "tag3", "tag4"], "content": "..." },
  "reddit": { "title": "...", "content": "..." }
}

CRITICAL RULES for devto tags:
- Must be an array of strings (minimum 1, maximum 4).
- Contain ONLY lowercase alphanumeric characters (no spaces, no special chars, e.g., "javascript").

Keep each platform's content concise to avoid token limits. Ensure the JSON is completely formed and properly closed with a } at the end.

Project: ${projectName}
Version: ${version}

Master Content:
${masterContent}`;
    
    const systemPrompt = `You are a developer relations AI. Your ONLY output must be a perfectly valid, raw JSON object.
CRITICAL JSON RULES:
1. DO NOT wrap the output in Markdown blocks (no \`\`\`json).
2. Escape all internal quotes, backticks, and newlines properly so the JSON does not break.
3. Ensure no trailing commas or extra brackets.

REQUIRED JSON STRUCTURE:
{
  "github": { "title": "string", "content": "markdown string" },
  "devto": { "title": "string", "tags": ["tag1", "tag2"], "content": "markdown string" },
  "hashnode": { "title": "string", "tags": ["tag1", "tag2"], "content": "markdown string" },
  "reddit": { "title": "string", "content": "markdown string" }
}`;

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        model: 'openai/gpt-oss-120b',
        response_format: { type: "json_object" },
        max_tokens: 4096
      });

      const output = completion.choices[0]?.message?.content;
      if (!output) {
        return ctx.error(500, "Failed to generate transformation");
      }

      return JSON.parse(output);
    } catch (e) {
      console.error(e.message || e.error?.failed_generation || e);
      return ctx.error(500, 'Transformation failed due to complex Markdown formatting. Please try again.');
    }
  }
});
