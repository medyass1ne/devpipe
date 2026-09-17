"use client";

import { signOut } from 'next-auth/react';

export default function LogoutButton({ isCollapsed }) {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      title="Logout"
      aria-label="Logout"
      className="text-xs font-mono text-text-muted hover:text-diff-remove transition mt-1"
    >
      {isCollapsed ? '[x]' : '[logout]'}
    </button>
  );
}
