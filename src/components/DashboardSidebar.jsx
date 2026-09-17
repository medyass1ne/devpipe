"use client";

import { useState } from 'react';
import Link from 'next/link';
import SidebarNav from './SidebarNav';
import LogoutButton from './LogoutButton';

export default function DashboardSidebar({ session }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-surface-raised bg-surface z-20 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-text-main uppercase cursor-pointer">
          DevPipe
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-text-muted hover:text-accent font-mono text-2xl transition"
          aria-label={mobileMenuOpen ? 'Close mobile menu' : 'Open mobile menu'}
        >
          {mobileMenuOpen ? '×' : '≡'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-ink/80 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:relative md:translate-x-0
        bg-surface border-r border-surface-raised flex flex-col h-full
        ${mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'}
        ${isCollapsed ? 'md:w-20' : 'md:w-64'}
      `}>
        <div className={`hidden md:flex p-6 pb-8 items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
        {!isCollapsed && (
          <Link href="/" className="text-xl font-bold tracking-tight text-text-main uppercase cursor-pointer">
            DevPipe
          </Link>
        )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="text-text-muted hover:text-accent font-mono text-sm transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? '>>' : '<<'}
          </button>
        </div>
        
        <SidebarNav isCollapsed={isCollapsed} />
      
      <div className={`p-6 border-t border-surface-raised flex ${isCollapsed ? 'flex-col items-center justify-center space-y-4 px-2' : 'items-center space-x-3'}`}>
        {session?.user?.image ? (
          <img src={session.user.image} alt={session.user.name || 'User'} className="w-8 h-8 bg-surface-raised border border-ink shrink-0" />
        ) : (
          <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-accent bg-surface-raised border border-ink shrink-0">
            {session?.user?.name?.[0]?.toUpperCase() || 'G'}
          </div>
        )}
        {!isCollapsed && (
          <div className="flex-1 flex items-center justify-between overflow-hidden">
            <p className="text-sm font-bold truncate max-w-[120px]">{session?.user?.name || 'Guest User'}</p>
            {session?.user && <LogoutButton />}
          </div>
        )}
          {isCollapsed && session?.user && (
            <div className="hidden md:block">
              <LogoutButton isCollapsed={isCollapsed} />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
