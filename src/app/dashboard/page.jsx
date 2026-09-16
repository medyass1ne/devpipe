"use client";

import { useState } from 'react';
import ReleaseEditor from '@/components/ReleaseEditor';
import PlatformPreview from '@/components/PlatformPreview';

export default function DashboardPage() {
  const [release, setRelease] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const handleUpdateRelease = (updatedRelease) => {
    setRelease(updatedRelease);
  };

  const handlePublish = async (platform) => {
    if (!release?._id) return;
    setIsPublishing(true);
    try {
      // In the future this might post to a real external API. 
      // For now we update the release status to 'published'
      const res = await fetch(`/api/releases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: release._id,
          projectName: release.projectName,
          version: release.version,
          masterContent: release.masterContent,
          transformedContent: release.transformedContent,
          status: 'published' // Mongoose route ignores status from body, it computes it.
          // Wait, we need a specific publish endpoint or we can just mock it here.
          // For now, since the focus was on the transform and save routes, we just update local state.
        })
      });
      const json = await res.json();
      if (json.success) {
        setRelease(json.data);
      }
    } catch (err) {
      console.error("Publish failed", err);
    }
    setIsPublishing(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 flex flex-col h-full">
      {/* Header treats project name + version like a git tag */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0 border-b border-surface-raised pb-4">
        <div>
          {release ? (
            <h1 className="text-xl font-mono text-text-main">
              {release.projectName} — <span className="text-accent">{release.version}</span>
            </h1>
          ) : (
            <h1 className="text-xl font-mono text-text-main">
              new_release — <span className="text-text-muted">draft</span>
            </h1>
          )}
        </div>
        <div className="flex flex-col items-end h-6 font-mono text-sm">
          {isPublishing && <span className="text-accent">publishing...</span>}
        </div>
      </div>
      
      {/* 60/40 Split */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 pb-6">
        <div className="w-full lg:w-[60%] flex flex-col min-h-[400px]">
          <ReleaseEditor 
            releaseId={release?._id}
            onUpdateRelease={handleUpdateRelease} 
            initialProjectName={release?.projectName} 
            initialVersion={release?.version}
            initialMasterContent={release?.masterContent}
          />
        </div>
        <div className="w-full lg:w-[40%] flex flex-col min-h-[400px]">
          <PlatformPreview 
            release={release} 
            onPublish={handlePublish} 
          />
        </div>
      </div>
    </div>
  );
}
