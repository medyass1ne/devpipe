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
    
    const prompt = `You are an authentic, expert developer relations engineer. Your job is to adapt the provided Master Content into 4 platform-specific formats.

CRITICAL FIDELITY RULE: 
DO NOT invent features, CLI commands, installation steps, URLs, or architectural details. You must ONLY use the facts, links, and details explicitly provided in the Master Content. If the master content is about a web app, do not hallucinate a CLI.

ANTI-AI SLOP RULE:
Write like a real, grounded human developer. Ban words like "delve", "revolutionary", "game-changer", "testament", "unlock", or "supercharge". Avoid overly enthusiastic corporate marketing fluff. 

Platform Personas:
- github: Clean, structured, and technical. Use standard Markdown headers. Focus on what it is, how it works, and direct links.
- devto: Conversational and engaging. Use light emojis. Start with a relatable hook based on the problem the draft solves.
- hashnode: Professional and clean. Reads like an engineering blog post. Focus on the "why" and "how".
- reddit: Raw, authentic, and text-heavy (r/programming or r/node style). NO marketing fluff. NO emojis. Get straight to the problem and the technical solution.

The user is publishing a: ${releaseType}.
- If 'first_release': Treat this as a brand new project launch. Introduce the tool, the core problem it solves, and why it was built. DO NOT assume the audience knows what the project is.
- If 'update': Treat this as a standard changelog announcement. Focus on what is new in this specific version.

Return ONLY a valid JSON object with EXACTLY this structure:
{
  "github": { "title": "...", "content": "..." },
  "devto": { "title": "...", "tags": ["tag1", "tag2", "tag3"], "content": "..." },
  "hashnode": { "title": "...", "tags": ["tag1", "tag2", "tag3"], "content": "..." },
  "reddit": { "title": "...", "content": "..." }
}

CRITICAL RULES for devto & hashnode tags:
- Must be an array of strings (minimum 1, maximum 4).
- Contain ONLY lowercase alphanumeric characters (no spaces, no special chars, e.g., "javascript").

Project: ${projectName}
Version: ${version}

Master Content:
${masterContent}`;
    
    const systemPrompt = `You are a developer relations AI. Your ONLY output must be a perfectly valid, raw JSON object.
CRITICAL JSON RULES:
1. DO NOT wrap the output in Markdown blocks (no \`\`\`json).
2. Escape all internal quotes, backticks, and newlines properly so the JSON does not break.
3. Ensure no trailing commas or extra brackets.
4. DO NOT double-escape newlines. Use standard single \`\\n\` for line breaks. Do NOT output literal \`\\\\n\`.

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

      const parsed = JSON.parse(output);

      const sanitizeNewlines = (obj) => {
        if (typeof obj === 'string') {
          return obj.replace(/\\n/g, '\n');
        }
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeNewlines(item));
        }
        if (obj !== null && typeof obj === 'object') {
          const newObj = {};
          for (const key in obj) {
            newObj[key] = sanitizeNewlines(obj[key]);
          }
          return newObj;
        }
        return obj;
      };

      return sanitizeNewlines(parsed);
    } catch (e) {
      console.error(e.message || e.error?.failed_generation || e);
      return ctx.error(500, 'Transformation failed due to complex Markdown formatting. Please try again.');
    }
  }
});
