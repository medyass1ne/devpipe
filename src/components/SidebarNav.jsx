"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav({ isCollapsed }) {
  const pathname = usePathname();

  const isDraftsActive = pathname === '/dashboard' || pathname.startsWith('/dashboard/new') || (pathname.startsWith('/dashboard/') && !pathname.includes('accounts') && !pathname.includes('settings'));
  const isAccountsActive = pathname === '/dashboard/accounts';
  const isSettingsActive = pathname === '/dashboard/settings';

  return (
    <nav className="flex-1 space-y-1 font-mono text-sm pt-8 md:pt-0">
      <Link href="/dashboard" title="Drafts" aria-label="Drafts" className={`block py-2 border-l-2 transition flex items-center ${isCollapsed ? 'px-0 justify-center' : 'px-6'} ${isDraftsActive ? 'border-accent text-text-main' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}>
        {isCollapsed ? (
          <svg className={`w-5 h-5 ${isDraftsActive ? 'text-accent' : 'text-text-muted group-hover:text-text-main'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        ) : (
          <span className={isDraftsActive ? 'text-accent' : 'text-surface-raised'}>{'>'}</span>
        )}
        {!isCollapsed && <span className="ml-2">Drafts</span>}
      </Link>
      <Link href="/dashboard/accounts" title="Accounts" aria-label="Accounts" className={`block py-2 border-l-2 transition flex items-center ${isCollapsed ? 'px-0 justify-center' : 'px-6'} ${isAccountsActive ? 'border-accent text-text-main' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}>
        {isCollapsed ? (
          <svg className={`w-5 h-5 ${isAccountsActive ? 'text-accent' : 'text-text-muted group-hover:text-text-main'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        ) : (
          <span className={isAccountsActive ? 'text-accent' : 'text-surface-raised'}>#</span>
        )}
        {!isCollapsed && <span className="ml-2">Accounts</span>}
      </Link>
      <Link href="/dashboard/settings" title="Settings" aria-label="Settings" className={`block py-2 border-l-2 transition flex items-center ${isCollapsed ? 'px-0 justify-center' : 'px-6'} ${isSettingsActive ? 'border-accent text-text-main' : 'border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50'}`}>
        {isCollapsed ? (
          <svg className={`w-5 h-5 ${isSettingsActive ? 'text-accent' : 'text-text-muted group-hover:text-text-main'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ) : (
          <span className={isSettingsActive ? 'text-accent' : 'text-surface-raised'}>~</span>
        )}
        {!isCollapsed && <span className="ml-2">Settings</span>}
      </Link>
    </nav>
  );
}
