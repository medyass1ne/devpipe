import { defineRoute, z } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const POST = defineRoute({
  params: z.object({
    id: z.string()
  }),
  body: z.object({
    target: z.enum(['all', 'github', 'devto']).default('all'),
    transformedContent: z.any().optional()
  }).optional().default({ target: 'all' }),
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }

    const release = await ctx.db.Release.findById(ctx.params.id);
    if (!release) return ctx.error(404, "Release not found");
    if (release.userId.toString() !== session.user.id) return ctx.error(403, "Forbidden");

    const user = await ctx.db.User.findById(session.user.id);
    if (!user) return ctx.error(404, "User not found");

    const { transformedContent, projectName, version } = release;
    const tokens = user.tokens || {};

    const payload = ctx.body || { target: 'all' };
    const target = payload.target;
    const tc = payload.transformedContent || release.transformedContent;

    const dispatchGitHub = async () => {
      if (target !== 'all' && target !== 'github') return { status: 'skipped' };
      if (!tc?.github) return { status: 'skipped' };
      if (!session.accessToken || !session.githubUsername) return { status: 'failed', error: 'Missing GitHub tokens in session' };
      
      try {
        const githubUrl = 'https://api.github.com/repos/' + session.githubUsername + '/' + projectName + '/releases';
        const res = await fetch(githubUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tag_name: version,
            name: tc.github.title || version,
            body: tc.github.content || ''
          })
        });
        
        if (!res.ok) {
          const text = await res.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            console.error('GitHub HTML/Text Error:', text);
            return { status: 'failed', error: 'GitHub API returned invalid response format' };
          }
          console.error('GitHub 422 Error:', JSON.stringify(errorData, null, 2));
          const errMsg = errorData.errors?.[0]?.code || errorData.message || 'GitHub API Error';
          return { status: 'failed', error: errMsg };
        }
        
        const data = await res.json();
        return { status: 'published', url: data.html_url };
      } catch (err) {
        console.error('GitHub Dispatch Error:', err);
        return { status: 'failed', error: err.message };
      }
    };

    const dispatchDevTo = async () => {
      if (target !== 'all' && target !== 'devto') return { status: 'skipped' };
      if (!tc?.devto) return { status: 'skipped' };
      if (!tokens.devtoKey) return { status: 'failed', error: 'Missing Dev.to API Key' };

      try {
        let parsedTags = [];
        if (typeof tc.devto.tags === 'string') {
          parsedTags = tc.devto.tags.split(',').map(t => t.trim().replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean).slice(0, 4);
        } else if (Array.isArray(tc.devto.tags)) {
          parsedTags = tc.devto.tags.map(t => typeof t === 'string' ? t.trim().replace(/[^a-zA-Z0-9]/g, '') : '').filter(Boolean).slice(0, 4);
        }

        const res = await fetch('https://dev.to/api/articles', {
          method: 'POST',
          headers: {
            'api-key': tokens.devtoKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            article: {
              title: tc.devto.title || `${projectName} ${version} Release Notes`,
              body_markdown: tc.devto.content || '',
              tags: parsedTags,
              published: true
            }
          })
        });

        if (!res.ok) {
          const text = await res.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            console.error('Dev.to HTML/Text Error:', text);
            return { status: 'failed', error: 'Dev.to API returned invalid response format' };
          }
          console.error('Dev.to API Error:', JSON.stringify(errorData, null, 2));
          return { status: 'failed', error: errorData.error || 'Dev.to API Error' };
        }
        
        const data = await res.json();
        return { status: 'published', url: data.url };
      } catch (err) {
        console.error('Dev.to Dispatch Error:', err);
        return { status: 'failed', error: err.message };
      }
    };

    // Run all dispatches concurrently
    const [githubResult, devtoResult] = await Promise.allSettled([
      dispatchGitHub(),
      dispatchDevTo()
    ]);

    const updateState = (platform, resultObj) => {
      if (resultObj.status === 'fulfilled') {
        const val = resultObj.value;
        if (val.status === 'skipped') return;
        if (val.status === 'published') {
          release.publishStates[platform] = { status: 'published', url: val.url, error: null };
        } else if (val.status === 'failed') {
          release.publishStates[platform] = { status: 'failed', error: val.error, url: null };
        }
      } else {
        release.publishStates[platform] = { status: 'failed', error: 'Dispatcher crashed', url: null };
      }
    };

    if (!release.publishStates) release.publishStates = {};
    updateState('github', githubResult);
    updateState('devto', devtoResult);

    await release.save();
    return { success: true, data: release };
  }
});
