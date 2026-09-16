"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ReleaseEditor from '@/components/ReleaseEditor';
import PlatformPreview from '@/components/PlatformPreview';

export default function EditDraftPage() {
  const params = useParams();
  const [release, setRelease] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the specific release
    fetch('/api/releases')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const found = data.data.find(r => r._id === params.id);
          if (found) {
            setRelease(found);
          } else {
            setError("Draft not found.");
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load draft.");
        setIsLoading(false);
      });
  }, [params.id]);

  const handleUpdateRelease = (updatedRelease) => {
    setRelease(updatedRelease);
  };

  if (isLoading) {
    return <div className="text-text-muted font-mono animate-pulse">loading_draft...</div>;
  }

  if (error || !release) {
    return <div className="text-diff-remove font-mono">- {error || "Draft not found"}</div>;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0 border-b border-surface-raised pb-4">
        <div>
          <h1 className="text-xl font-mono text-text-main">
            {release.projectName} — <span className="text-accent">{release.version}</span>
          </h1>
        </div>
      </div>
      
      {/* 60/40 Split */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 pb-6">
        <div className="w-full lg:w-[60%] flex flex-col min-h-[400px]">
          <ReleaseEditor 
            releaseId={release._id}
            onUpdateRelease={handleUpdateRelease} 
            initialProjectName={release.projectName} 
            initialVersion={release.version}
            initialMasterContent={release.masterContent}
          />
        </div>
        <div className="w-full lg:w-[40%] flex flex-col min-h-[400px]">
          <PlatformPreview 
            release={release} 
            onUpdateRelease={handleUpdateRelease} 
          />
        </div>
      </div>
    </div>
  );
}
