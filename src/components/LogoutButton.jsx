"use client";

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/' })} 
      className="text-xs font-mono text-text-muted hover:text-diff-remove transition mt-1"
    >
      [logout]
    </button>
  );
}
