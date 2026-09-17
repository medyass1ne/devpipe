"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getSession, signOut } from 'next-auth/react';

export default function LandingPage() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.8,
        delayChildren: 0.5
      }
    }
  };

  const lineVariants = {
    hidden: { opacity: 0, display: 'none' },
    visible: { opacity: 1, display: 'block' }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col font-sans selection:bg-accent selection:text-ink">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes step-blink {
          0%, 49.9% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: step-blink 800ms infinite;
        }
      `}} />


      <header className="flex items-center justify-between p-6 border-b border-surface-raised max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-8">
          <div className="text-xl font-bold font-sans text-text-main tracking-tight uppercase">
            DevPipe
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="font-mono text-sm text-text-muted hover:text-text-main transition">Features</Link>
            <Link href="#docs" className="font-mono text-sm text-text-muted hover:text-text-main transition">Docs</Link>
            <a href="https://github.com/devpipe" target="_blank" rel="noreferrer" className="text-text-muted hover:text-text-main transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </nav>
        </div>
        {session ? (
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="font-mono text-sm text-text-main hover:text-accent transition">dashboard</Link>
            <button 
              onClick={() => signOut()}
              className="px-6 py-2 bg-surface border border-surface hover:border-diff-remove text-text-main hover:text-diff-remove font-mono text-sm transition rounded-sm"
            >
              logout
            </button>
          </div>
        ) : (
          <Link 
            href="/login"
            className="px-6 py-2 bg-surface-raised border border-surface-raised hover:border-accent text-text-main font-mono text-sm transition rounded-sm"
          >
            login
          </Link>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center">
        

        <section className="w-full flex flex-col items-center justify-center p-6 pt-8 pb-32">
          <motion.div 
            className="text-center max-w-2xl w-full mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-main mb-6 tracking-tight leading-tight">
              Write once. <br className="hidden md:block" />
              <span className="text-text-muted">Syndicate everywhere.</span>
            </h1>
            <motion.p 
              className="text-text-muted text-lg md:text-xl font-sans"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              The release distribution pipeline for open-source maintainers.
            </motion.p>
          </motion.div>


          <motion.div 
            className="w-full max-w-3xl bg-surface border border-surface-raised rounded-sm p-6 md:p-8 font-mono text-sm md:text-base relative overflow-hidden mb-12 text-left h-auto min-h-[240px]"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >

            <div className="flex space-x-2 absolute top-4 left-4">
              <div className="w-3 h-3 rounded-full bg-diff-remove"></div>
              <div className="w-3 h-3 rounded-full bg-diff-neutral"></div>
              <div className="w-3 h-3 rounded-full bg-diff-add"></div>
            </div>
            
            <div className="mt-6 flex flex-col space-y-3">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col space-y-3"
              >
                <div className="text-text-main">
                  <span className="text-accent mr-2">{'>'}</span> 
                  devpipe push bro.js@v2.3.0
                </div>
                
                <motion.div variants={lineVariants} className="text-diff-add">
                  [+] GitHub Release ... Success
                </motion.div>
                
                <motion.div variants={lineVariants} className="text-diff-add">
                  [+] Dev.to Article ... Success
                </motion.div>
                
                <motion.div variants={lineVariants} className="text-diff-add">
                  [+] Hashnode Post .... Success
                </motion.div>

                <motion.div variants={lineVariants} className="text-diff-add">
                  [+] Reddit Post ...... Success
                </motion.div>
                
                <motion.div variants={lineVariants}>
                  <span className="text-accent inline-block animate-blink">
                    █
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 4.5, duration: 0.5 }}
          >
            <Link 
              href="/login"
              className="px-8 py-4 bg-accent text-ink font-mono font-bold text-lg hover:bg-opacity-90 transition rounded-sm shadow-none"
            >
              start_pipeline
            </Link>
          </motion.div>
        </section>


        <section id="features" className="w-full max-w-5xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 relative">

            <div className="hidden md:block absolute top-[11px] left-0 right-0 h-[1px] bg-text-muted/30 -z-10"></div>
            

            <div className="flex flex-col items-center text-center p-6 pt-0">
              <div className="w-6 h-6 rounded-full bg-ink border border-text-muted/30 mb-8 relative flex justify-center items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div>
              </div>
              <h3 className="font-mono text-text-main font-bold mb-4">$ write</h3>
              <p className="text-text-muted text-sm max-w-[200px]">
                One master markdown file. No per-platform formatting required.
              </p>
            </div>


            <div className="flex flex-col items-center text-center p-6 pt-0">
              <div className="w-6 h-6 rounded-full bg-ink border border-text-muted/30 mb-8 relative flex justify-center items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-text-muted"></div>
              </div>
              <h3 className="font-mono text-text-main font-bold mb-4">$ transform</h3>
              <p className="text-text-muted text-sm max-w-[200px]">
                Content automatically adapted to each platform's conventions.
              </p>
            </div>


            <div className="flex flex-col items-center text-center p-6 pt-0">
              <div className="w-6 h-6 rounded-full bg-ink border border-text-muted/30 mb-8 relative flex justify-center items-center">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
              </div>
              <h3 className="font-mono text-text-main font-bold mb-4">$ syndicate</h3>
              <p className="text-text-muted text-sm max-w-[200px]">
                Published everywhere at once, tracked in one place.
              </p>
            </div>
          </div>
        </section>


        <section className="w-full max-w-2xl mx-auto px-6 pb-32">
          <div className="relative flex justify-between items-center mb-8">

            <div className="absolute top-[5px] left-8 right-8 h-[1px] bg-diff-add/30 -z-10"></div>
            
            {['github', 'dev.to', 'hashnode', 'reddit'].map((plat) => (
              <div key={plat} className="flex flex-col items-center bg-ink px-4">
                <div className="w-3 h-3 rounded-full bg-diff-add mb-3"></div>
                <span className="font-mono text-xs text-diff-add">{plat}</span>
              </div>
            ))}
          </div>
          <div className="text-center">
            <span className="font-mono text-xs text-text-muted">more integrations on the roadmap</span>
          </div>
        </section>


        <section className="w-full max-w-4xl mx-auto px-6 pb-32">
          <div className="bg-surface border border-surface-raised rounded-sm overflow-hidden font-mono text-sm md:text-base">
            <div className="p-4 border-b border-surface-raised bg-ink">
              <span className="text-text-muted">@@ release day @@</span>
            </div>
            
            <div className="flex flex-col">

              <div className="bg-diff-remove/10 text-diff-remove px-6 py-4 flex flex-col space-y-2 border-b border-surface-raised">
                <div>- 4 tabs open, 4 different formats, 4 chances to forget one</div>
                <div>- copy-pasting the same changelog by hand, every time</div>
              </div>
              

              <div className="bg-diff-add/10 text-diff-add px-6 py-4 flex flex-col space-y-2">
                <div>+ one markdown file</div>
                <div>+ one command, four platforms, correctly formatted</div>
              </div>
            </div>
          </div>
        </section>


        <section className="w-full border-y border-surface-raised bg-surface py-6 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between font-mono text-sm space-y-4 md:space-y-0">
            <div className="flex space-x-8 text-text-main">
              <span>★ 1,240</span>
              <span>MIT licensed</span>
            </div>
            <div className="text-text-muted italic">
              // saves me twenty minutes on every release — really
            </div>
          </div>
        </section>
      </main>


      <footer className="w-full bg-ink border-t border-surface-raised px-6 pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="text-xl font-bold font-sans text-text-main tracking-tight uppercase mb-4">
                DEVPIPE
              </div>
            </div>
            
            <div className="flex flex-col space-y-4">
              <h4 className="font-mono text-text-main font-bold text-sm">Product</h4>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">Features</Link>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">Pricing</Link>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">Changelog</Link>
            </div>
            
            <div className="flex flex-col space-y-4">
              <h4 className="font-mono text-text-main font-bold text-sm">Resources</h4>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">Docs</Link>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">GitHub</Link>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">Status</Link>
            </div>
            
            {/* <div className="flex flex-col space-y-4">
              <h4 className="font-mono text-text-main font-bold text-sm">Company</h4>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">About</Link>
              <Link href="#" className="font-mono text-xs text-text-muted hover:text-text-main transition">Contact</Link>
            </div> */}
          </div>
          
          <div className="flex justify-between items-center pt-8 border-t border-surface-raised font-mono text-xs text-text-muted">
            <span>DEVPIPE</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
