import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from 'mongoose';
import User from '@/models/User';
import LoginPrompt from '@/components/LoginPrompt';
import TokensForm from '@/components/TokensForm';

export default async function AccountsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <LoginPrompt />;
  }
  
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(process.env.MONGO_URI);
  }
  
  const user = await User.findById(session.user.id).lean();
  
  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 flex-shrink-0 border-b border-surface-raised pb-4">
        <h1 className="text-xl font-mono text-text-main">
          connected_accounts
        </h1>
      </div>
      
      <div className="flex-1 bg-surface border border-surface-raised rounded-sm overflow-hidden p-6 md:p-8">
         <p className="text-text-muted text-sm font-mono mb-8">
           Store your API keys securely to enable automatic syndication when publishing your releases.
         </p>
         
         <TokensForm initialTokens={user?.tokens || {}} />
      </div>
    </div>
  );
}
