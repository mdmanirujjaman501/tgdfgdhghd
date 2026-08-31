import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, LogOut, Search, ExternalLink } from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';
import { NotificationDropdown } from './NotificationDropdown';

export const Header: React.FC = () => {
  const { admin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-6 backdrop-blur transition-colors">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-slate-100 hidden sm:block">
            CMS Control Panel
          </h1>
          <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            v2.0 Pro
          </span>
        </div>

        {/* Global Search Bar Trigger */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition" />
              <span>Global search across CMS (serials, episodes, cast)...</span>
            </span>
            <kbd className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-900 border border-slate-700 rounded-md">
              Ctrl + K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Admin Notifications Dropdown */}
          <NotificationDropdown />

          {/* Public API link */}
          <a
            href="/api/v1/public/serials"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-md transition"
            title="Open Headless REST API"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public API</span>
          </a>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-400" />}
          </button>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                {admin?.name ? admin.name.substring(0, 2) : 'AD'}
              </div>
              <div className="hidden xl:block text-left">
                <div className="text-xs font-semibold text-slate-200">{admin?.name || 'Administrator'}</div>
                <div className="text-[10px] text-slate-400">{admin?.role || 'Super Admin'}</div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

