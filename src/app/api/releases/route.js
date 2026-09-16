import { defineRoute, z } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const POST = defineRoute({
  body: z.object({
    id: z.string().optional(),
    projectName: z.string().min(1),
    version: z.string().min(1),
    masterContent: z.string().min(1),
    transformedContent: z.object({
      github: z.string().nullable().optional(),
      devto: z.string().nullable().optional(),
      hashnode: z.string().nullable().optional(),
      reddit: z.string().nullable().optional(),
    }).optional().nullable(),
  }),
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }

    const { id, projectName, version, masterContent, transformedContent } = ctx.body;
    
    const hasTransformed = transformedContent && Object.values(transformedContent).some(v => v);
    const status = hasTransformed ? 'transformed' : 'draft';
    
    if (id) {
      const release = await ctx.db.Release.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        { projectName, version, masterContent, transformedContent, status },
        { new: true }
      );
      if (!release) return ctx.error(404, "Release not found");
      return { success: true, data: release };
    } else {
      const release = new ctx.db.Release({
        userId: session.user.id,
        projectName,
        version,
        masterContent,
        transformedContent: transformedContent || {},
        status,
      });
      await release.save();
      return { success: true, data: release };
    }
  }
});

export const GET = defineRoute({
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }
    const releases = await ctx.db.Release.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return { success: true, data: releases };
  }
});
