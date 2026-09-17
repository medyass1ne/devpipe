import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import DashboardSidebar from '@/components/DashboardSidebar';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="h-screen bg-ink text-text-main font-sans flex flex-col md:flex-row selection:bg-accent selection:text-ink">
      <DashboardSidebar session={session} />
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
