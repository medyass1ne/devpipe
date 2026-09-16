"use client";

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('Yessin');
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    // In a real app we'd fetch the user's details from NextAuth session or API.
    // Setting defaults to match requested professional branding.
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data && data.user) {
          setName(data.user.name || 'Yessin');
          setEmail(data.user.email || '');
        }
      });
  }, []);

  return (
    <div className="max-w-2xl space-y-12">
      <div className="border-b border-surface-raised pb-4">
        <h1 className="text-xl font-mono text-text-main lowercase">~/settings</h1>
      </div>

      {/* Profile Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-mono font-bold text-text-main">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-text-muted mb-2">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-ink border border-surface-raised rounded-sm px-4 py-2.5 text-text-main focus:outline-none focus:border-accent transition font-mono text-sm"
            />
          </div>
          <div>
            <label className="block font-mono text-xs text-text-muted mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              disabled
              className="w-full bg-surface-raised border border-surface-raised rounded-sm px-4 py-2.5 text-text-muted font-mono text-sm cursor-not-allowed opacity-70"
            />
            <p className="mt-2 text-[10px] text-text-muted font-mono">Email is synced with your GitHub identity.</p>
          </div>
          <button className="px-6 py-2 bg-surface-raised border border-transparent hover:border-accent text-text-main font-mono text-sm transition rounded-sm">
            update_profile
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-6 pt-6 border-t border-surface-raised">
        <h2 className="text-lg font-mono font-bold text-diff-remove">Danger Zone</h2>
        <div className="bg-ink border border-diff-remove/30 rounded-sm p-6 flex items-center justify-between">
          <div>
            <h3 className="text-text-main font-mono text-sm font-bold mb-1">Delete Account</h3>
            <p className="text-text-muted font-mono text-xs">Permanently remove your account and all associated drafts. This action cannot be undone.</p>
          </div>
          <button className="px-4 py-2 bg-diff-remove/10 text-diff-remove border border-diff-remove/30 hover:bg-diff-remove hover:text-ink font-mono font-bold text-sm transition rounded-sm whitespace-nowrap ml-4">
            delete_account
          </button>
        </div>
      </section>
    </div>
  );
}
