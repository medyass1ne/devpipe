"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav() {
  const pathname = usePathname();

  const isDraftsActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/new') || (pathname.startsWith('/dashboard/') && !pathname.includes('accounts') && !pathname.includes('settings'));
  const isAccountsActive = pathname === '/dashboard/accounts';
  const isSettingsActive = pathname === '/dashboard/settings';

  return (
    <nav className="flex-1 space-y-1 font-mono text-sm">
      <Link href="/dashboard" className={`block px-6 py-2 border-l-2 transition ${isDraftsActive ? 'border-accent text-text-main' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}>
        <span className={isDraftsActive ? 'text-accent mr-2' : 'text-surface-raised mr-2'}>{'>'}</span> Drafts
      </Link>
      <Link href="/dashboard/accounts" className={`block px-6 py-2 border-l-2 transition ${isAccountsActive ? 'border-accent text-text-main' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}>
        <span className={isAccountsActive ? 'text-accent mr-2' : 'text-surface-raised mr-2'}>#</span> Accounts
      </Link>
      <Link href="/dashboard/settings" className={`block px-6 py-2 border-l-2 transition ${isSettingsActive ? 'border-accent text-text-main' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}>
        <span className={isSettingsActive ? 'text-accent mr-2' : 'text-surface-raised mr-2'}>~</span> Settings
      </Link>
    </nav>
  );
}
