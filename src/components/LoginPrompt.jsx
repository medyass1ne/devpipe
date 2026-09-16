"use client";
import { signIn } from "next-auth/react";

export default function LoginPrompt() {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="bg-surface border border-surface-raised p-8 rounded-sm text-center max-w-md w-full">
        <h2 className="text-xl font-mono text-text-main mb-4">authentication_required</h2>
        <p className="text-sm font-mono text-text-muted mb-8">
          You must link a GitHub account to securely store platform tokens and track your releases.
        </p>
        <button 
          onClick={() => signIn('github')}
          className="w-full bg-accent text-ink font-bold font-mono py-3 rounded-sm hover:opacity-90 transition"
        >
          login --with github
        </button>
      </div>
    </div>
  );
}
