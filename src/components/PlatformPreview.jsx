"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PlatformPreview({ release, onPublish, isTransforming }) {
  const [activeTab, setActiveTab] = useState('github');
  const [viewMode, setViewMode] = useState('code'); // 'code' or 'preview'
  
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
  const status = release.status || 'draft';

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
      {/* Tabs */}
      <div className="flex border-b border-surface-raised bg-surface">
        {platforms.map(platform => {
          const isActive = activeTab === platform;
          return (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              className={`flex-1 py-3 text-xs font-mono transition flex items-center justify-center space-x-1 border-b-2 ${
                isActive 
                  ? 'border-accent bg-surface-raised text-text-main' 
                  : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised'
              }`}
            >
              <span className="text-accent">{isActive ? '▼' : '▶'}</span>
              <span>{platform}</span>
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
           {getStatusMarker(status)}
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
              code: ({node, inline, ...props}) => 
                inline 
                  ? <code className="bg-surface-raised text-text-main px-1.5 py-0.5 rounded-sm font-mono text-xs" {...props} />
                  : <pre className="bg-surface-raised text-text-main p-4 rounded-sm font-mono text-xs overflow-auto mb-4"><code {...props} /></pre>,
              blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-accent pl-4 italic text-text-muted mb-4" {...props} />,
              a: ({node, ...props}) => <a className="text-accent underline hover:no-underline" {...props} />
            }}>
              {content || '*No output*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-surface flex justify-end">
        <button 
          onClick={() => onPublish && onPublish(activeTab)}
          disabled={status === 'published' || status === 'draft' || !status}
          className={`px-4 py-2 font-mono text-sm transition rounded-sm border ${
            status === 'published' || status === 'draft' || !status
              ? 'border-surface-raised text-text-muted bg-ink cursor-not-allowed'
              : 'border-accent text-accent hover:bg-accent hover:text-ink bg-ink'
          }`}
        >
          publish --to {activeTab}
        </button>
      </div>
    </div>
  );
}
