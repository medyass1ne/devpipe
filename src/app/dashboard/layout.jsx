import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="min-h-screen bg-ink text-text-main font-sans flex flex-col md:flex-row selection:bg-accent selection:text-ink">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-surface-raised flex flex-col">
        <div className="p-6 pb-8">
          <h2 className="text-xl font-bold tracking-tight text-text-main uppercase">
            DevPipe
          </h2>
        </div>
        <nav className="flex-1 space-y-1 font-mono text-sm">
          {/* Active state is left border in accent, not filled */}
          <Link href="/dashboard" className="block px-6 py-2 border-l-2 border-accent text-text-main hover:bg-surface-raised/50">
            <span className="text-accent mr-2">{'>'}</span> Drafts
          </Link>
          <Link href="/dashboard/accounts" className="block px-6 py-2 border-l-2 border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50">
            <span className="mr-2 text-surface-raised">#</span> Accounts
          </Link>
          <Link href="/dashboard/settings" className="block px-6 py-2 border-l-2 border-transparent text-text-muted hover:text-text-main hover:bg-surface-raised/50">
            <span className="mr-2 text-surface-raised">~</span> Settings
          </Link>
        </nav>
        <div className="p-6 border-t border-surface-raised">
          <div className="flex items-center space-x-3">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || 'User'} className="w-8 h-8 bg-surface-raised border border-ink" />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-accent bg-surface-raised border border-ink">
                {session?.user?.name?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
            <div>
              <p className="text-sm font-bold truncate max-w-[150px]">{session?.user?.name || 'Guest User'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100vh] overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
