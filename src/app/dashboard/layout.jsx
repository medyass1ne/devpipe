import Link from 'next/link';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SidebarNav from '@/components/SidebarNav';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="min-h-screen bg-ink text-text-main font-sans flex flex-col md:flex-row selection:bg-accent selection:text-ink">

      <aside className="w-full md:w-64 bg-surface border-b md:border-b-0 md:border-r border-surface-raised flex flex-col">
        <div className="p-6 pb-8">
          <h2 className="text-xl font-bold tracking-tight text-text-main uppercase">
            DevPipe
          </h2>
        </div>
        <SidebarNav />
        <div className="p-6 border-t border-surface-raised">
          <div className="flex items-center space-x-3">
            {session?.user?.image ? (
              <img src={session.user.image} alt={session.user.name || 'User'} className="w-8 h-8 bg-surface-raised border border-ink" />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center font-mono font-bold text-accent bg-surface-raised border border-ink">
                {session?.user?.name?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
            <div className="flex-1 flex items-center justify-between">
              <p className="text-sm font-bold truncate max-w-[120px]">{session?.user?.name || 'Guest User'}</p>
              {session?.user && <LogoutButton />}
            </div>
          </div>
        </div>
      </aside>


      <main className="flex-1 flex flex-col h-[100vh] overflow-hidden">
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
