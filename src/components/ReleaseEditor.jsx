"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';
import { useModal } from '@/components/ModalProvider';

export default function ReleaseEditor({ releaseId, onUpdateRelease, initialProjectName, initialVersion, initialMasterContent, initialReleaseType }) {
  const [projectName, setProjectName] = useState(initialProjectName || '');
  const [version, setVersion] = useState(initialVersion || '');
  const [releaseType, setReleaseType] = useState(initialReleaseType || 'update');
  const [masterContent, setMasterContent] = useState(initialMasterContent || '');
  
  const [isSaving, setIsSaving] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // 'code' or 'preview'
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const { showConfirm, showAlert } = useModal();

  const handleDelete = async () => {
    if (!releaseId) return;
    const confirmed = await showConfirm('Delete this draft permanently?');
    if (confirmed) {
      try {
        const res = await fetch(`/api/releases/${releaseId}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          router.push('/dashboard');
        } else {
          await showAlert('Failed to delete draft: ' + (data.error || 'Unknown error'));
        }
      } catch (e) {
        console.error('Delete error', e);
        await showAlert('Failed to delete draft');
      }
    }
  };

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);
  
  // Keep local track of transformed content before saving
  const [transformedContent, setTransformedContent] = useState(null);

  const [repos, setRepos] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(true);

  useEffect(() => {
    fetch('/api/user/repos')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setRepos(data.data);
          if (!projectName && data.data.length > 0) {
            setProjectName(data.data[0]);
          }
        }
        setIsLoadingRepos(false);
      })
      .catch(() => setIsLoadingRepos(false));
  }, []);

  const handleSave = async () => {
    if (!projectName || !version || !masterContent) {
      await showAlert("Please fill out all required fields.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        projectName,
        version,
        releaseType,
        masterContent,
      };
      if (releaseId) payload.id = releaseId;
      if (transformedContent !== null) payload.transformedContent = transformedContent;

      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        if (onUpdateRelease) onUpdateRelease(json.data);
      } else {
        await showAlert("Save failed: " + (json.error?.message || json.error));
      }
    } catch(err) {
      console.error(err);
    }
    setIsSaving(false);
  };

  const handleTransform = async () => {
    if (!projectName || !version || !masterContent) {
      await showAlert("Please fill out all fields before transforming.");
      return;
    }
    setIsTransforming(true);
    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, version, releaseType, masterContent })
      });
      
      const data = await res.json();
      
      if (res.status === 429 || (data && data.error && data.error.includes('Rate limit'))) {
        setCooldown(60);
        await showAlert(data.error || 'Rate limit exceeded. Please wait a minute.');
      } else if (res.ok && !data.error) {
        setTransformedContent(data);
        setCooldown(60);
        
        try {
          const autoSavePayload = {
            projectName,
            version,
            releaseType,
            masterContent,
            transformedContent: data,
          };
          if (releaseId) autoSavePayload.id = releaseId;
          
          const autoSaveRes = await fetch('/api/releases', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(autoSavePayload)
          });
          const autoSaveJson = await autoSaveRes.json();
          if (autoSaveJson.success && onUpdateRelease) {
            onUpdateRelease(autoSaveJson.data);
          } else if (onUpdateRelease) {
            onUpdateRelease({
               _id: releaseId,
               projectName,
               version,
               releaseType,
               masterContent,
               transformedContent: data,
               status: 'transformed'
            });
          }
        } catch (e) {
          console.error("Auto-save failed", e);
          if (onUpdateRelease) {
            onUpdateRelease({
               _id: releaseId,
               projectName,
               version,
               releaseType,
               masterContent,
               transformedContent: data,
               status: 'transformed'
            });
          }
        }
      } else {
        await showAlert("Transformation failed: " + (data.error?.message || data.error || "Unknown error"));
      }
    } catch(err) {
      console.error(err);
    }
    setIsTransforming(false);
  };

  return (
    <div className="bg-surface border border-surface-raised flex flex-col flex-1 shadow-none rounded-sm overflow-hidden">
      <div className="p-4 border-b border-surface-raised flex space-x-4 bg-ink">
        <div className="flex-1">
          <label className="block font-mono text-xs text-text-muted mb-2">GitHub Repository</label>
          {isLoadingRepos ? (
            <div className="w-full bg-surface-raised border border-surface-raised rounded-sm px-3 py-1.5 text-text-muted font-mono text-sm animate-pulse">
              loading_repos...
            </div>
          ) : repos.length > 0 ? (
            <select 
              className="w-full bg-surface-raised border border-surface-raised rounded-sm px-3 py-1.5 text-text-main focus:outline-none focus:border-accent transition font-mono text-sm appearance-none"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            >
              {repos.map(repo => (
                <option key={repo} value={repo}>{repo}</option>
              ))}
            </select>
          ) : (
            <input 
              type="text" 
              placeholder="devpipe" 
              className="w-full bg-surface-raised border border-surface-raised rounded-sm px-3 py-1.5 text-text-main focus:outline-none focus:border-accent transition font-mono text-sm"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          )}
        </div>
        <div className="w-1/4">
          <label className="block font-mono text-xs text-text-muted mb-2">Version</label>
          <input 
            type="text" 
            placeholder="v1.0.0" 
            className="w-full bg-surface-raised border border-surface-raised rounded-sm px-3 py-1.5 text-text-main focus:outline-none focus:border-accent transition font-mono text-sm"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />
        </div>
        <div className="w-1/3">
          <label className="block font-mono text-xs text-text-muted mb-2">Release Type</label>
          <div className="flex border border-surface-raised rounded-sm overflow-hidden text-sm font-mono">
            <button 
              onClick={() => setReleaseType('update')}
              className={`flex-1 py-1.5 transition ${releaseType === 'update' ? 'bg-surface text-accent' : 'bg-transparent text-text-muted hover:bg-surface/50'}`}
            >
              update
            </button>
            <div className="w-px bg-surface-raised"></div>
            <button 
              onClick={() => setReleaseType('first_release')}
              className={`flex-1 py-1.5 transition ${releaseType === 'first_release' ? 'bg-surface text-accent' : 'bg-transparent text-text-muted hover:bg-surface/50'}`}
            >
              first_release
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex bg-ink relative group min-h-[300px]">

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

        {viewMode === 'code' ? (
          <>

            <div className="w-10 bg-surface border-r border-surface-raised py-4 pt-10 flex flex-col items-end pr-2 text-text-muted font-mono text-xs select-none h-full">
              {masterContent.split('\n').map((_, i) => (
                 <div key={i}>{i + 1}</div>
              ))}
              {masterContent === '' && <div>1</div>}
            </div>

            <textarea 
              className="flex-1 w-full bg-ink border-0 px-4 py-4 pt-10 text-text-main focus:outline-none font-mono text-sm resize-none"
              placeholder="# Write your release draft..."
              value={masterContent}
              onChange={(e) => setMasterContent(e.target.value)}
            ></textarea>
          </>
        ) : (
          <div className="flex-1 w-full bg-ink px-6 py-10 overflow-auto">
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
              {masterContent || '*No content*'}
            </ReactMarkdown>
          </div>
        )}
        

        <div className="absolute inset-0 border border-surface-raised pointer-events-none group-focus-within:border-accent transition"></div>
      </div>

      <div className="flex justify-between items-center p-4 border-t border-surface-raised bg-surface">
        <div>
          {releaseId && (
            <button 
              onClick={handleDelete}
              className="px-4 py-2 border border-surface-raised bg-transparent hover:bg-surface-raised text-diff-remove font-mono text-sm transition rounded-sm"
            >
              delete
            </button>
          )}
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={handleSave}
            disabled={isSaving || isTransforming}
            className="px-4 py-2 border border-surface-raised bg-ink hover:bg-surface-raised text-text-main font-mono text-sm transition rounded-sm disabled:opacity-50"
          >
            {isSaving ? 'saving...' : 'save_draft'}
          </button>
          <button 
            onClick={handleTransform}
            disabled={isTransforming || isSaving || cooldown > 0}
            className={`px-4 py-2 font-mono font-bold text-sm transition rounded-sm disabled:opacity-50 ${
              cooldown > 0 
                ? 'bg-surface text-text-muted cursor-not-allowed border border-surface-raised' 
                : 'bg-accent text-ink hover:bg-opacity-90'
            }`}
          >
            {cooldown > 0 ? `cooldown... [${cooldown}s]` : isTransforming ? 'transforming...' : 'transform'}
          </button>
        </div>
      </div>
    </div>
  );
}
