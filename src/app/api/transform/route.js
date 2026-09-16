import { defineRoute, z } from '@/lib/bro';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const POST = defineRoute({
  body: z.object({
    projectName: z.string().min(1),
    version: z.string().min(1),
    masterContent: z.string().min(1),
  }),
  handler: async (ctx) => {
    const { projectName, version, masterContent } = ctx.body;
    
    const prompt = `You are a DevRel engineer. Transform this master release markdown into 4 formats: github (highly technical, diffs, install steps), devto (conversational, emojis, story-driven intro), hashnode (professional architectural breakdown), reddit (plaintext, r/node style, problem-first, no marketing). Return ONLY a raw JSON object with keys: github, devto, hashnode, reddit.\n\nProject: ${projectName}\nVersion: ${version}\n\nMaster Content:\n${masterContent}`;
    
    try {
      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'qwen/qwen3.8-27b',
        response_format: { type: "json_object" }
      });

      const output = completion.choices[0]?.message?.content;
      if (!output) {
        return ctx.error(500, "Failed to generate transformation");
      }

      return JSON.parse(output);
    } catch (e) {
      console.error(e);
      return ctx.error(500, "Failed to generate or parse response from LLM");
    }
  }
});
