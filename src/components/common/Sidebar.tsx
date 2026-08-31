import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Tv,
  Film,
  PlayCircle,
  Video,
  FolderTree,
  Tag,
  Users,
  ShieldCheck,
  KeyRound,
  FileCode,
  BarChart3,
  History,
  Settings,
  Clapperboard,
  DollarSign,
  Smartphone,
  Globe,
  Layers,
  LayoutGrid,
  CreditCard,
  Wrench,
  ShieldAlert,
  Activity,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const sections: NavSection[] = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Monetization Center',
      items: [
        { label: 'Overview & Settings', path: '/monetization/overview', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> },
        { label: 'AdMob (Mobile Apps)', path: '/monetization/admob', icon: <Smartphone className="w-4 h-4 text-sky-400" /> },
        { label: 'AdSense (Websites)', path: '/monetization/adsense', icon: <Globe className="w-4 h-4 text-amber-400" /> },
        { label: 'Google Ad Manager', path: '/monetization/gam', icon: <Layers className="w-4 h-4 text-indigo-400" /> },
        { label: 'Ad Placements & Units', path: '/monetization/placements', icon: <LayoutGrid className="w-4 h-4 text-violet-400" /> },
        { label: 'Revenue & Geo Analytics', path: '/monetization/analytics', icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
        { label: 'Subscriptions & Payments', path: '/monetization/payments', icon: <CreditCard className="w-4 h-4 text-rose-400" /> },
      ],
    },
    {
      title: 'Content Catalog',
      items: [
        { label: 'TV Serials', path: '/serials', icon: <Tv className="w-4 h-4" /> },
        { label: 'Seasons', path: '/seasons', icon: <Film className="w-4 h-4" /> },
        { label: 'Episodes', path: '/episodes', icon: <PlayCircle className="w-4 h-4" /> },
        { label: 'Media Sources', path: '/media-sources', icon: <Video className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Metadata & Cast',
      items: [
        { label: 'Categories', path: '/categories', icon: <FolderTree className="w-4 h-4" /> },
        { label: 'Genres & Tags', path: '/genres', icon: <Tag className="w-4 h-4" /> },
        { label: 'Actors & Cast', path: '/actors', icon: <Clapperboard className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Users & Security',
      items: [
        { label: 'App Users', path: '/users', icon: <Users className="w-4 h-4" /> },
        { label: 'Admin Staff', path: '/admins', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Security Center', path: '/security', icon: <ShieldAlert className="w-4 h-4 text-amber-400" /> },
        { label: 'API Keys', path: '/api-keys', icon: <KeyRound className="w-4 h-4" /> },
      ],
    },
    {
      title: 'System & Tools',
      items: [
        { label: 'Content Tools & Health', path: '/tools', icon: <Wrench className="w-4 h-4 text-indigo-400" /> },
        { label: 'API Documentation', path: '/api-docs', icon: <FileCode className="w-4 h-4" /> },
        { label: 'Activity Logs', path: '/logs', icon: <History className="w-4 h-4" /> },
        { label: 'Settings', path: '/settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900/90 flex flex-col h-screen sticky top-0 overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-slate-800 bg-slate-950/40">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
          <Tv className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 tracking-wide uppercase">Serial Studio</h2>
          <p className="text-[10px] text-indigo-400 font-medium">Headless CMS Engine</p>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="p-4 space-y-6 flex-1">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            {section.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/30 text-center">
        <div className="text-[11px] text-slate-500 font-medium">Powered by Express + MySQL2 (XAMPP)</div>
      </div>
    </aside>
  );
};
