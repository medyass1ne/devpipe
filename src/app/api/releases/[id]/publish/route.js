import { defineRoute, z } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const POST = defineRoute({
  params: z.object({
    id: z.string()
  }),
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

    const dispatchGitHub = async () => {
      if (!transformedContent?.github) return { status: 'skipped' };
      if (!user.githubAccessToken || !user.githubUsername) return { status: 'failed', error: 'Missing GitHub tokens' };
      
      const res = await fetch(`https://api.github.com/repos/${user.githubUsername}/${projectName}/releases`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag_name: version,
          name: version,
          body: transformedContent.github
        })
      });
      
      const data = await res.json();
      if (!res.ok) return { status: 'failed', error: data.message || 'GitHub API Error' };
      return { status: 'published', url: data.html_url };
    };

    const dispatchDevTo = async () => {
      if (!transformedContent?.devto) return { status: 'skipped' };
      if (!tokens.devtoKey) return { status: 'failed', error: 'Missing Dev.to API Key' };

      const res = await fetch('https://dev.to/api/articles', {
        method: 'POST',
        headers: {
          'api-key': tokens.devtoKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          article: {
            title: `${projectName} ${version} Release Notes`,
            body_markdown: transformedContent.devto,
            published: true
          }
        })
      });

      const data = await res.json();
      if (!res.ok) return { status: 'failed', error: data.error || 'Dev.to API Error' };
      return { status: 'published', url: data.url };
    };

    const dispatchHashnode = async () => {
      if (!transformedContent?.hashnode) return { status: 'skipped' };
      if (!tokens.hashnodeKey) return { status: 'failed', error: 'Missing Hashnode Token' };

      // 1. Fetch Publication ID
      const meRes = await fetch('https://gql.hashnode.com/', {
        method: 'POST',
        headers: { 'Authorization': tokens.hashnodeKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { me { publications(first: 1) { edges { node { id } } } } }`
        })
      });
      const meData = await meRes.json();
      const pubId = meData.data?.me?.publications?.edges?.[0]?.node?.id;
      if (!pubId) return { status: 'failed', error: 'Could not find a Hashnode publication.' };

      // 2. Publish Post
      const publishRes = await fetch('https://gql.hashnode.com/', {
        method: 'POST',
        headers: { 'Authorization': tokens.hashnodeKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `mutation PublishPost($input: PublishPostInput!) { publishPost(input: $input) { post { url } } }`,
          variables: {
            input: {
              title: `${projectName} ${version} Release Notes`,
              contentMarkdown: transformedContent.hashnode,
              publicationId: pubId
            }
          }
        })
      });
      
      const publishData = await publishRes.json();
      if (publishData.errors) return { status: 'failed', error: publishData.errors[0].message };
      return { status: 'published', url: publishData.data?.publishPost?.post?.url };
    };

    const dispatchReddit = async () => {
      return { status: 'pending_auth' };
    };

    // Run all dispatches concurrently
    const [githubResult, devtoResult, hashnodeResult, redditResult] = await Promise.allSettled([
      dispatchGitHub(),
      dispatchDevTo(),
      dispatchHashnode(),
      dispatchReddit()
    ]);

    const updateState = (platform, resultObj) => {
      if (resultObj.status === 'fulfilled') {
        const val = resultObj.value;
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
    updateState('hashnode', hashnodeResult);
    updateState('reddit', redditResult);

    await release.save();
    return { success: true, data: release };
  }
});
