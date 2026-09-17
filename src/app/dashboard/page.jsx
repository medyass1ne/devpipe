"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DraftsListView() {
  const [releases, setReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/releases', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // If empty, supply realistic mock data for initial render
          if (data.data.length === 0) {
            setReleases([
              { _id: 'mock1', projectName: 'bro.js', version: 'v1.4.2', updatedAt: new Date().toISOString(), publishStates: { github: { status: 'published' }, devto: { status: 'published' } } },
              { _id: 'mock2', projectName: 'mock2block', version: 'v0.9.0', updatedAt: new Date().toISOString(), publishStates: { hashnode: { status: 'transformed' } } },
              { _id: 'mock3', projectName: 'creatorpay', version: 'v2.0.0-beta', updatedAt: new Date().toISOString(), publishStates: {} }
            ]);
          } else {
            setReleases(data.data);
          }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredReleases = releases.filter(r => {
    if (filter === 'all') return true;
    return r.publishStates && r.publishStates[filter] && (r.publishStates[filter].status === 'published' || r.publishStates[filter].status === 'transformed');
  });

  const getStatusDot = (status) => {
    if (status === 'published') return 'bg-diff-add';
    if (status === 'transformed') return 'bg-diff-neutral';
    return 'bg-surface-raised border border-text-muted/30';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-surface-raised pb-4">
        <h1 className="text-xl font-mono text-text-main lowercase">releases / drafts</h1>
        <Link href="/dashboard/new" className="px-4 py-2 bg-accent text-ink font-mono font-bold text-sm hover:bg-opacity-90 transition rounded-sm">
          + create_draft
        </Link>
      </div>
      
      <div className="flex space-x-4 border-b border-surface-raised pb-4">
        {['all', 'github', 'devto', 'hashnode'].map(f => (
          <button 
            key={f} 
            onClick={() => setFilter(f)}
            className={`font-mono text-xs px-3 py-1 rounded-sm transition ${filter === f ? 'bg-surface-raised text-accent' : 'text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-text-muted font-mono animate-pulse">loading_drafts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReleases.map(release => (
            <div 
              key={release._id}
              onClick={() => router.push(release._id.startsWith('mock') ? '/dashboard/new' : `/dashboard/${release._id}`)}
              className="bg-surface-raised border border-surface-raised hover:border-accent p-6 rounded-sm cursor-pointer transition group"
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-mono font-bold text-text-main group-hover:text-accent transition truncate mr-4">{release.projectName}</h2>
                <span className="font-mono text-xs text-text-muted shrink-0">{release.version}</span>
              </div>
              <div className="flex space-x-4 mt-auto border-t border-surface/50 pt-4">
                {['github', 'devto', 'hashnode', 'reddit'].map(plat => (
                  <div key={plat} className="flex items-center space-x-1.5" title={`${plat}: ${release.publishStates?.[plat]?.status || 'none'}`}>
                    <div className={`w-2 h-2 rounded-full ${getStatusDot(release.publishStates?.[plat]?.status)}`}></div>
                    <span className="font-mono text-[10px] text-text-muted lowercase">{plat.substring(0,2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {filteredReleases.length === 0 && (
            <div className="col-span-full text-text-muted font-mono text-sm">
              // No drafts match the active filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
