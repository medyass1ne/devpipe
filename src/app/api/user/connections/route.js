import { defineRoute } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = defineRoute({
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }

    const user = await ctx.db.User.findById(session.user.id);
    if (!user) {
      return ctx.error(404, "User not found");
    }

    const tokens = user.tokens || {};

    return {
      github: !!session.accessToken,
      devto: !!tokens.devtoKey,
      hashnode: !!tokens.hashnodeKey,
      reddit: !!tokens.redditAccessToken
    };
  }
});
