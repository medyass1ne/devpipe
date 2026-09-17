"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PlatformPreview({ release, onUpdateRelease, isTransforming }) {
  const [activeTab, setActiveTab] = useState('github');
  const [viewMode, setViewMode] = useState('code'); // 'code' || 'preview'
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState(null);
  const [copiedStates, setCopiedStates] = useState({ reddit: false, hashnode: false });
  const [tagsInput, setTagsInput] = useState('');
  const [connections, setConnections] = useState({});

  useEffect(() => {
    fetch('/api/user/connections')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setConnections(data);
        }
      })
      .catch(console.error);
  }, []);

  
  if (!release || !release.transformedContent || Object.keys(release.transformedContent).length === 0) {
    return (
      <div className="bg-surface border border-surface-raised flex-1 flex items-center justify-center text-text-muted font-mono text-sm rounded-sm p-4 text-center min-h-[300px]">
        <p>// No transformations pending.</p>
      </div>
    );
  }

  const platforms = ['github', 'devto', 'hashnode', 'reddit'];
  const platformData = release.transformedContent[activeTab] || {};
  
  useEffect(() => {
    setTagsInput((platformData.tags || []).join(', '));
  }, [activeTab, release?.transformedContent]);

  const handleTagsChange = (e) => {
    setTagsInput(e.target.value);
    const newTags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
    if (onUpdateRelease) {
      onUpdateRelease({
        ...release,
        transformedContent: {
          ...release.transformedContent,
          [activeTab]: { ...release.transformedContent[activeTab], tags: newTags }
        }
      });
    }
  };
  const publishStates = release.publishStates || {};
  const activeState = publishStates[activeTab] || {};
  const status = release.status || 'draft';

  const handlePublish = async (target) => {
    if (!release._id) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch(`/api/releases/${release._id}/publish`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target, transformedContent: release.transformedContent })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onUpdateRelease) {
          onUpdateRelease({
            ...data.data,
            transformedContent: release.transformedContent
          });
        }
      } else {
        const errMsg = data.error || 'Failed to publish';
        console.error("Publish API Error:", errMsg);
        setPublishError(errMsg);
        setTimeout(() => setPublishError(null), 5000);
      }
    } catch (e) {
      console.error("Network error while publishing:", e);
      setPublishError('Network error while publishing');
      setTimeout(() => setPublishError(null), 5000);
    }
    setIsPublishing(false);
  };

  const handleCopyAndOpen = async (platform) => {
    try {
      const pData = release?.transformedContent?.[platform] || {};
      const mdContent = pData.content || '';
      await navigator.clipboard.writeText(mdContent);
      setCopiedStates(prev => ({ ...prev, [platform]: true }));
      if (platform === 'reddit') {
        const title = pData.title || '';
        const redditUrl = 'https://www.reddit.com/submit?title=' + encodeURIComponent(title) + '&selftext=true&text=' + encodeURIComponent(mdContent);
        window.open(redditUrl, '_blank');
      } else if (platform === 'hashnode') {
        window.open('https://hashnode.com/draft', '_blank');
      }
      setTimeout(() => {
         setCopiedStates(prev => ({ ...prev, [platform]: false }));
      }, 5000);
    } catch (e) {
      console.error("Clipboard error:", e);
      setPublishError("Failed to copy to clipboard");
      setTimeout(() => setPublishError(null), 5000);
    }
  };

  const getStatusMarker = (status) => {
    switch (status) {
      case 'published': return <span className="text-diff-add bg-diff-add/10 px-2 py-0.5">+ published</span>;
      case 'transformed': return <span className="text-accent bg-diff-neutral px-2 py-0.5">~ transformed</span>;
      case 'failed': return <span className="text-diff-remove bg-diff-remove/10 px-2 py-0.5">- failed</span>;
      default: return <span className="text-text-muted px-2 py-0.5">draft</span>;
    }
  };

  return (
    <div className={`bg-surface border border-surface-raised flex flex-col h-full overflow-hidden rounded-sm ${isTransforming ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300`}>
      <div className="shrink-0 flex flex-col">

      <div className="p-3 border-b border-surface-raised bg-ink flex justify-between items-center">
        <span className="font-mono text-xs text-text-muted">Syndication</span>
        <button 
          onClick={() => handlePublish('all')}
          disabled={isPublishing || !release._id || status !== 'transformed'}
          className="px-4 py-1.5 font-mono text-xs transition rounded-sm border border-accent text-accent hover:bg-accent hover:text-ink disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'publishing...' : 'publish_all'}
        </button>
      </div>


      <div className="flex overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-surface-raised bg-surface">
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


      <div className="flex flex-col p-4 border-b border-surface-raised bg-ink space-y-3">
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
          <label className="font-mono text-xs text-text-muted w-auto md:w-12">Title:</label>
          <input 
            type="text"
            value={platformData.title || ''}
            onChange={(e) => {
              if (onUpdateRelease) {
                onUpdateRelease({
                  ...release,
                  transformedContent: {
                    ...release.transformedContent,
                    [activeTab]: { ...release.transformedContent[activeTab], title: e.target.value }
                  }
                });
              }
            }}
            className="flex-1 w-full bg-surface border border-surface-raised px-3 py-2 text-sm font-mono text-text-main focus:outline-none focus:border-accent rounded-sm"
          />
        </div>
        {(activeTab === 'devto' || activeTab === 'hashnode') && (
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <label className="font-mono text-xs text-text-muted w-auto md:w-12">Tags:</label>
            <input 
              type="text"
              value={tagsInput}
              onChange={handleTagsChange}
              placeholder="javascript, react, webdev"
              className="flex-1 w-full bg-surface border border-surface-raised px-3 py-2 text-sm font-mono text-text-main focus:outline-none focus:border-accent rounded-sm"
            />
            {activeTab === 'devto' && (
              <span className="font-mono text-xs text-text-muted whitespace-nowrap">max 4 tags</span>
            )}
          </div>
        )}
        {activeTab === 'reddit' && connections.reddit && (
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2">
            <label className="font-mono text-xs text-text-muted w-auto md:w-16">Subreddit:</label>
            <input 
              type="text"
              value={platformData.subreddit || ''}
              onChange={(e) => {
                if (onUpdateRelease) {
                  onUpdateRelease({
                    ...release,
                    transformedContent: {
                      ...release.transformedContent,
                      [activeTab]: { ...release.transformedContent[activeTab], subreddit: e.target.value }
                    }
                  });
                }
              }}
              placeholder="r/node"
              className="flex-1 w-full bg-surface border border-surface-raised px-3 py-2 text-sm font-mono text-text-main focus:outline-none focus:border-accent rounded-sm"
            />
          </div>
        )}
      </div>

      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-ink border-b border-surface-raised relative">

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
           {copiedStates[activeTab] ? (
             <span className="text-diff-add bg-diff-add/10 px-2 py-0.5">+ copied</span>
           ) : activeState.status === 'published' ? (
             <span className="text-diff-add bg-diff-add/10 px-2 py-0.5">+ published</span>
           ) : activeState.status === 'failed' ? (
             <span className="text-diff-remove bg-diff-remove/10 px-2 py-0.5">- failed</span>
           ) : getStatusMarker(status)}
        </div>

        {viewMode === 'code' ? (
          <textarea 
            className="flex-1 min-h-0 overflow-y-auto w-full bg-ink border-0 p-4 pt-12 text-sm font-mono text-text-main focus:outline-none resize-none"
            value={platformData.content || ''}
            onChange={(e) => {
              if (onUpdateRelease) {
                onUpdateRelease({
                  ...release,
                  transformedContent: {
                    ...release.transformedContent,
                    [activeTab]: { ...release.transformedContent[activeTab], content: e.target.value }
                  }
                });
              }
            }}
          />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-12 w-full">
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
              {platformData.content || '*No output*'}
            </ReactMarkdown>
          </div>
        )}
      </div>


      <div className="shrink-0 p-4 bg-surface flex justify-between items-center">
        <div className="flex-1">
          {publishError ? (
            <span className="text-diff-remove font-mono text-sm bg-diff-remove/10 px-2 py-1 rounded-sm">- {publishError}</span>
          ) : activeState.status === 'published' && activeState.url ? (
            <a href={activeState.url} target="_blank" rel="noreferrer" className="text-diff-add font-mono text-sm hover:underline flex items-center space-x-2">
              <span>+ published: {activeState.url}</span>
            </a>
          ) : activeState.status === 'failed' && activeState.error ? (
            <span className="text-diff-remove font-mono text-sm">- failed: {activeState.error}</span>
          ) : activeState.status === 'pending_auth' ? (
            <span className="text-text-muted font-mono text-sm">// Platform auth pending</span>
          ) : null}
        </div>
        
        {(!connections[activeTab] && (activeTab === 'reddit' || activeTab === 'hashnode')) ? (
          <button 
            onClick={() => handleCopyAndOpen(activeTab)}
            className="px-4 py-2 font-mono text-sm transition rounded-sm border border-accent text-accent hover:bg-accent hover:text-ink bg-ink"
          >
            copy & open {activeTab}
          </button>
        ) : activeState.status !== 'published' && (
          <button 
            onClick={() => handlePublish(activeTab)}
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
