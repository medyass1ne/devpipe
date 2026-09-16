"use client";
import { useState } from 'react';

export default function TokensForm({ initialTokens }) {
  const [devtoKey, setDevtoKey] = useState(initialTokens.devtoKey || '');
  const [hashnodeKey, setHashnodeKey] = useState(initialTokens.hashnodeKey || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [redditConnected, setRedditConnected] = useState(initialTokens.redditConnected || false);
  const [redditUsername, setRedditUsername] = useState(initialTokens.redditUsername || '');
  
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devtoKey, hashnodeKey })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage('~ tokens successfully saved.');
      } else {
        setMessage('- ' + (data.error?.message || data.error || 'Failed to save tokens.'));
      }
    } catch (err) {
      setMessage('- Network error occurred.');
    }
    setIsSaving(false);
  };

  const handleDisconnectReddit = async () => {
    setMessage('');
    try {
      const res = await fetch('/api/user/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disconnectReddit: true })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRedditConnected(false);
        setRedditUsername('');
        setMessage('~ Reddit disconnected.');
      } else {
        setMessage('- Failed to disconnect Reddit.');
      }
    } catch (err) {
      setMessage('- Network error occurred.');
    }
  };
  
  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div>
        <label className="block font-mono text-xs text-text-muted mb-2">Dev.to API Key</label>
        <input 
          type="password" 
          value={devtoKey}
          onChange={(e) => setDevtoKey(e.target.value)}
          placeholder="••••••••••••••••"
          className="w-full bg-ink border border-surface-raised rounded-sm px-4 py-2.5 text-text-main focus:outline-none focus:border-accent transition font-mono text-sm"
        />
      </div>
      <div>
        <label className="block font-mono text-xs text-text-muted mb-2">Hashnode Personal Access Token</label>
        <input 
          type="password" 
          value={hashnodeKey}
          onChange={(e) => setHashnodeKey(e.target.value)}
          placeholder="••••••••••••••••"
          className="w-full bg-ink border border-surface-raised rounded-sm px-4 py-2.5 text-text-main focus:outline-none focus:border-accent transition font-mono text-sm"
        />
      </div>
      <div>
        <label className="block font-mono text-xs text-text-muted mb-2">Reddit OAuth</label>
        {redditConnected ? (
          <div className="flex items-center justify-between bg-ink border border-surface-raised rounded-sm px-4 py-2 text-sm font-mono">
            <span className="text-diff-add">+ connected as u/{redditUsername}</span>
            <button
              type="button"
              onClick={handleDisconnectReddit}
              className="px-3 py-1 bg-surface-raised text-text-muted hover:text-diff-remove hover:bg-ink border border-transparent hover:border-diff-remove transition rounded-sm text-xs"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => window.location.href = '/api/auth/reddit'}
            className="w-full bg-surface-raised border border-transparent hover:border-accent text-text-main font-mono text-sm py-2.5 transition rounded-sm flex items-center justify-center space-x-2"
          >
            <span>connect_reddit</span>
          </button>
        )}
      </div>
      
      <div className="pt-4 flex items-center justify-between mt-8">
        <span className="font-mono text-xs text-accent">{message}</span>
        <button 
          type="submit"
          disabled={isSaving}
          className="px-6 py-2 bg-accent text-ink font-mono font-bold text-sm hover:bg-opacity-90 transition rounded-sm disabled:opacity-50"
        >
          {isSaving ? 'saving...' : 'save_keys'}
        </button>
      </div>
    </form>
  );
}
