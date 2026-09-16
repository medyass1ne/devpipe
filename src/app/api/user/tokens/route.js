import { defineRoute, z } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const POST = defineRoute({
  body: z.object({
    devtoKey: z.string().optional(),
    hashnodeKey: z.string().optional(),
    disconnectReddit: z.boolean().optional(),
  }),
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }
    
    const { devtoKey, hashnodeKey, disconnectReddit } = ctx.body;
    
    const user = await ctx.db.User.findById(session.user.id);
    if (!user) return ctx.error(404, "User not found");
    
    user.tokens = {
      ...user.tokens,
      devtoKey: devtoKey !== undefined ? devtoKey : (user.tokens?.devtoKey || ''),
      hashnodeKey: hashnodeKey !== undefined ? hashnodeKey : (user.tokens?.hashnodeKey || ''),
    };

    if (disconnectReddit) {
      user.tokens.redditConnected = false;
      user.tokens.redditUsername = null;
      user.tokens.redditAccessToken = null;
      user.tokens.redditRefreshToken = null;
    }
    
    await user.save();
    return { success: true, message: "Tokens updated successfully" };
  }
});
