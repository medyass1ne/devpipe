import { defineRoute, z } from '@/lib/bro';

export const POST = defineRoute({
  params: z.object({ id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID") }),
  handler: async (ctx) => {
    const { id } = ctx.params;
    
    const release = await ctx.db.Release.findById(id);
    if (!release) {
      return ctx.error(404, 'Release not found');
    }
    
    const platforms = ['github', 'devto', 'hashnode', 'reddit'];
    for (const platform of platforms) {
      release.platformStates[platform].status = 'transformed';
      release.platformStates[platform].transformedContent = `[Optimized for ${platform}]\n\n${release.masterContent}`;
    }
    
    await release.save();
    return { success: true, data: release };
  }
});
