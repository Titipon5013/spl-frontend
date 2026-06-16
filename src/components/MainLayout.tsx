import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Bell, Menu, Search, Settings } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--pp-canvas)] font-sans text-[var(--pp-ink)]">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex min-h-screen flex-1 flex-col transition-all duration-200 md:ml-64">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[var(--pp-line)] bg-white px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button 
              className="rounded-[var(--pp-radius)] p-2 text-[var(--pp-muted)] hover:bg-[var(--pp-surface-muted)] hover:text-[var(--pp-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)] md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-base font-bold text-[var(--pp-ink)] md:text-lg">{pageTitle}</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--pp-muted)]" size={16} />
              <input 
                type="text" 
                placeholder="Search operations..." 
                aria-label="Search operations"
                className="min-h-10 w-48 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-[var(--pp-canvas)] pl-9 pr-3 text-sm outline-none transition focus:border-[var(--pp-blue)] focus:bg-white focus:ring-2 focus:ring-[var(--pp-blue)]/20 md:w-64"
              />
            </div>
            
            <button className="hidden min-h-10 rounded-[var(--pp-radius)] p-2 text-[var(--pp-muted)] transition-colors hover:bg-[var(--pp-surface-muted)] hover:text-[var(--pp-blue)] sm:block" aria-label="Notifications"><Bell size={20} /></button>
            <button className="hidden min-h-10 rounded-[var(--pp-radius)] p-2 text-[var(--pp-muted)] transition-colors hover:bg-[var(--pp-surface-muted)] hover:text-[var(--pp-blue)] sm:block" aria-label="Settings"><Settings size={20} /></button>
            
            <div className="flex items-center gap-3 border-l border-[var(--pp-line)] pl-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold leading-none text-[var(--pp-ink)]">Admin Portal</p>
                <p className="mt-1 text-xs font-semibold text-[var(--pp-success)]">Online</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--pp-radius)] bg-[var(--pp-blue-deep)] text-sm font-bold text-white">
                AD
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
