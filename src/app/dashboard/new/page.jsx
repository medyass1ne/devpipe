"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReleaseEditor from '@/components/ReleaseEditor';
import PlatformPreview from '@/components/PlatformPreview';

export default function NewDraftPage() {
  const [release, setRelease] = useState(null);
  const router = useRouter();

  const handleUpdateRelease = (updatedRelease) => {
    setRelease(updatedRelease);
    if (!release && updatedRelease._id) {
      router.push(`/dashboard/${updatedRelease._id}`);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 flex flex-col h-full">

      <div className="flex items-center justify-between mb-2 flex-shrink-0 border-b border-surface-raised pb-4">
        <div>
          <h1 className="text-xl font-mono text-text-main">
            new_release — <span className="text-text-muted">draft</span>
          </h1>
        </div>
      </div>
      

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 pb-6">
        <div className="w-full lg:w-[60%] flex flex-col min-h-[400px]">
          <ReleaseEditor 
            onUpdateRelease={handleUpdateRelease} 
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
