"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PlatformPreview({ release, onUpdateRelease, isTransforming }) {
  const [activeTab, setActiveTab] = useState('github');
  const [viewMode, setViewMode] = useState('code'); // 'code' or 'preview'
  const [isPublishing, setIsPublishing] = useState(false);
  
  // The new schema uses release.transformedContent instead of platformStates
  if (!release || !release.transformedContent || Object.keys(release.transformedContent).length === 0) {
    return (
      <div className="bg-surface border border-surface-raised flex-1 flex items-center justify-center text-text-muted font-mono text-sm rounded-sm p-4 text-center min-h-[300px]">
        <p>// No transformations pending.</p>
      </div>
    );
  }

  const platforms = ['github', 'devto', 'hashnode', 'reddit'];
  const content = release.transformedContent[activeTab];
  const publishStates = release.publishStates || {};
  const activeState = publishStates[activeTab] || {};
  const status = release.status || 'draft';

  const handlePublish = async () => {
    if (!release._id) return;
    setIsPublishing(true);
    try {
      const res = await fetch(`/api/releases/${release._id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpdateRelease) onUpdateRelease(data.data);
      } else {
        alert(data.error || 'Failed to publish');
      }
    } catch (e) {
      alert('Network error while publishing');
    }
    setIsPublishing(false);
  };

  // Status pill as diff marker
  const getStatusMarker = (status) => {
    switch (status) {
      case 'published': return <span className="text-diff-add bg-diff-add/10 px-2 py-0.5">+ published</span>;
      case 'transformed': return <span className="text-accent bg-diff-neutral px-2 py-0.5">~ transformed</span>;
      case 'failed': return <span className="text-diff-remove bg-diff-remove/10 px-2 py-0.5">- failed</span>;
      default: return <span className="text-text-muted px-2 py-0.5">draft</span>;
    }
  };

  return (
    <div className={`bg-surface border border-surface-raised flex flex-col flex-1 rounded-sm ${isTransforming ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300 min-h-[300px] overflow-hidden`}>
      {/* Top Bar with Publish All */}
      <div className="p-3 border-b border-surface-raised bg-ink flex justify-between items-center">
        <span className="font-mono text-xs text-text-muted">Syndication</span>
        <button 
          onClick={handlePublish}
          disabled={isPublishing || !release._id || status !== 'transformed'}
          className="px-4 py-1.5 font-mono text-xs transition rounded-sm border border-accent text-accent hover:bg-accent hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'publishing...' : 'publish_all'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-raised bg-surface">
        {platforms.map(platform => {
          const isActive = activeTab === platform;
          return (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`flex-1 py-3 text-xs font-mono transition flex items-center justify-center space-x-2 border-b-2 ${
                isActive 
                  ? 'border-accent bg-surface-raised text-text-main' 
                  : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised'
              }`}
            >
              <span className="text-accent">{isActive ? '▼' : '▶'}</span>
              <span>{platform}</span>
              {publishStates[platform]?.status === 'published' && <span className="text-diff-add">✔</span>}
              {publishStates[platform]?.status === 'failed' && <span className="text-diff-remove">✖</span>}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 p-0 overflow-auto bg-ink border-b border-surface-raised relative min-h-[300px]">
        {/* Toggle */}
        <div className="absolute top-2 right-4 z-10 flex space-x-1">
          <button 
            onClick={() => setViewMode('code')}
            className={`px-2 py-1 text-xs font-mono rounded-sm transition ${viewMode === 'code' ? 'bg-surface-raised text-accent' : 'text-text-muted hover:text-text-main'}`}
          >
            code
          </button>
          <button 
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 text-xs font-mono rounded-sm transition ${viewMode === 'preview' ? 'bg-surface-raised text-accent' : 'text-text-muted hover:text-text-main'}`}
          >
            preview
          </button>
        </div>

        <div className="absolute top-10 right-0 p-2 z-10 text-xs font-mono">
           {activeState.status === 'published' ? (
             <span className="text-diff-add bg-diff-add/10 px-2 py-0.5">+ published</span>
           ) : activeState.status === 'failed' ? (
             <span className="text-diff-remove bg-diff-remove/10 px-2 py-0.5">- failed</span>
           ) : getStatusMarker(status)}
        </div>

        {viewMode === 'code' ? (
          <div className="p-4 pt-12 text-sm font-mono whitespace-pre-wrap text-text-main h-full">
            {content || '// No output'}
          </div>
        ) : (
          <div className="p-6 pt-12 overflow-auto h-full w-full">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold font-sans text-text-main mt-6 mb-4" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold font-sans text-text-main mt-5 mb-3" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-bold font-sans text-text-main mt-4 mb-2" {...props} />,
              p: ({node, ...props}) => <p className="text-text-main font-sans text-sm mb-4 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 text-sm text-text-main font-sans space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 text-sm text-text-main font-sans space-y-1" {...props} />,
              pre: ({node, ...props}) => <pre className="bg-surface-raised text-text-main p-4 rounded-sm font-mono text-xs overflow-auto mb-4 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit" {...props} />,
              code: ({node, ...props}) => <code className="bg-surface-raised text-text-main px-1.5 py-0.5 rounded-sm font-mono text-xs" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted mb-4" {...props} />,
              a: ({node, ...props}) => <a className="text-accent underline hover:no-underline" {...props} />
            }}>
              {content || '*No output*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-surface flex justify-between items-center">
        <div className="flex-1">
          {activeState.status === 'published' && activeState.url ? (
            <a href={activeState.url} target="_blank" rel="noreferrer" className="text-diff-add font-mono text-sm hover:underline flex items-center space-x-2">
              <span>+ published: {activeState.url}</span>
            </a>
          ) : activeState.status === 'failed' && activeState.error ? (
            <span className="text-diff-remove font-mono text-sm">- failed: {activeState.error}</span>
          ) : activeState.status === 'pending_auth' ? (
            <span className="text-text-muted font-mono text-sm">// Platform auth pending</span>
          ) : null}
        </div>
        
        {activeState.status !== 'published' && (
          <button 
            onClick={handlePublish}
            disabled={isPublishing || !release._id || status !== 'transformed'}
            className={`px-4 py-2 font-mono text-sm transition rounded-sm border ${
              isPublishing || !release._id || status !== 'transformed'
                ? 'border-surface-raised text-text-muted bg-ink cursor-not-allowed'
                : 'border-accent text-accent hover:bg-accent hover:text-ink bg-ink'
            }`}
          >
            publish --to {activeTab}
          </button>
        )}
      </div>
    </div>
  );
}
