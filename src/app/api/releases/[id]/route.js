import { defineRoute, z } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const DELETE = defineRoute({
  params: z.object({
    id: z.string()
  }),
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }

    const release = await ctx.db.Release.findById(ctx.params.id);
    if (!release) {
      return ctx.error(404, "Release not found");
    }

    if (release.userId.toString() !== session.user.id) {
      return ctx.error(403, "Forbidden");
    }

    await ctx.db.Release.findByIdAndDelete(ctx.params.id);

    return { success: true };
  }
});
