import { defineRoute } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const GET = defineRoute({
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }
    
    const user = await ctx.db.User.findById(session.user.id).select('githubAccessToken');
    if (!user || !user.githubAccessToken) {
      return ctx.error(401, "GitHub access token missing");
    }

    try {
      const res = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
        headers: {
          'Authorization': `Bearer ${user.githubAccessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!res.ok) {
        return ctx.error(res.status, "Failed to fetch GitHub repositories");
      }
      
      const repos = await res.json();
      // Only return names of repos the user has push access to (can release)
      const repoNames = repos
        .filter(r => r.permissions && r.permissions.push)
        .map(r => r.name);
        
      return { success: true, data: repoNames };
    } catch (e) {
      console.error(e);
      return ctx.error(500, "Network error fetching repositories");
    }
  }
});
