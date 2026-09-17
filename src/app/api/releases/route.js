export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { defineRoute, z } from '@/lib/bro';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export const POST = defineRoute({
  body: z.object({
    id: z.string().optional(),
    projectName: z.string().min(1),
    version: z.string().min(1),
    releaseType: z.enum(['first_release', 'update']).default('update'),
    masterContent: z.string().min(1),
    transformedContent: z.any().optional().nullable(),
  }),
  cache: 0,
  handler: async (ctx) => {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return ctx.error(401, "Unauthorized");
    }

    const { id, projectName, version, releaseType, masterContent, transformedContent } = ctx.body;
    
    let updatePayload = { projectName, version, releaseType, masterContent };
    let finalStatus = 'draft';
    
    if (transformedContent !== undefined) {
      updatePayload.transformedContent = transformedContent;
      const hasTransformed = transformedContent && Object.values(transformedContent).some(v => v);
      finalStatus = hasTransformed ? 'transformed' : 'draft';
      updatePayload.status = finalStatus;
    }
    
    if (id) {
      const release = await ctx.db.Release.findOneAndUpdate(
        { _id: id, userId: session.user.id },
        updatePayload,
        { returnDocument: 'after' }
      );
      if (!release) return ctx.error(404, "Release not found");
      return { success: true, data: release };
    } else {
      const release = new ctx.db.Release({
        userId: session.user.id,
        projectName,
        version,
        releaseType,
        masterContent,
        transformedContent: transformedContent || {},
        status: finalStatus,
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
    const releases = await ctx.db.Release.find({ userId: session.user.id }).sort({ updatedAt: -1 });
    return { success: true, data: releases };
  }
});
