import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { DashboardData } from '../types';
import {
  Tv,
  Film,
  PlayCircle,
  Eye,
  Download,
  Users,
  FolderTree,
  Clapperboard,
  Plus,
  ArrowUpRight,
  Activity,
  BarChart,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, chartRes] = await Promise.all([
          analyticsApi.getDashboardStats(),
          analyticsApi.getChartData(),
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (chartRes.success) setChartData(chartRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Loading Analytics & Metrics...</span>
        </div>
      </div>
    );
  }

  const totals = data?.totals || {
    serials: 0,
    episodes: 0,
    seasons: 0,
    categories: 0,
    actors: 0,
    views: 0,
    downloads: 0,
    users: 0,
  };

  const statCards = [
    {
      title: 'Total Serials',
      value: totals.serials,
      icon: <Tv className="w-5 h-5 text-indigo-400" />,
      color: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/20',
      link: '/serials',
    },
    {
      title: 'Total Episodes',
      value: totals.episodes,
      icon: <PlayCircle className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
      link: '/episodes',
    },
    {
      title: 'Total Views',
      value: totals.views.toLocaleString(),
      icon: <Eye className="w-5 h-5 text-cyan-400" />,
      color: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/20',
      link: '/analytics',
    },
    {
      title: 'Total Downloads',
      value: totals.downloads.toLocaleString(),
      icon: <Download className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
      link: '/analytics',
    },
    {
      title: 'Total Seasons',
      value: totals.seasons,
      icon: <Film className="w-5 h-5 text-purple-400" />,
      color: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
      link: '/seasons',
    },
    {
      title: 'App Users',
      value: totals.users,
      icon: <Users className="w-5 h-5 text-sky-400" />,
      color: 'from-sky-500/20 to-sky-600/5 border-sky-500/20',
      link: '/users',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Overview Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time catalog metrics, traffic trends, and streaming statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/serials"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Serial</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <Link
            key={i}
            to={card.link}
            className={`bg-gradient-to-br ${card.color} bg-slate-900/80 border p-4 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-all`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              {card.icon}
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-slate-100 tracking-tight">{card.value}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-semibold text-slate-200">Traffic & Streaming Trends (Last 7 Days)</h2>
          </div>
          <span className="text-[11px] text-slate-500">Live Analytics</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#f8fafc',
                }}
              />
              <Area type="monotone" dataKey="views" name="Views" stroke="#6366f1" fillOpacity={1} fill="url(#colorViews)" />
              <Area type="monotone" dataKey="downloads" name="Downloads" stroke="#10b981" fillOpacity={1} fill="url(#colorDownloads)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lower Grids: Recent Serials & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Serials */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Tv className="w-4 h-4 text-indigo-400" />
              <span>Recently Added Serials</span>
            </h2>
            <Link to="/serials" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentSerials?.slice(0, 5).map((serial) => (
              <div
                key={serial.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {serial.poster ? (
                    <img
                      src={serial.poster}
                      alt={serial.title}
                      className="w-10 h-14 object-cover rounded-lg shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                      <Tv className="w-5 h-5 text-slate-600" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-100 truncate">{serial.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {serial.category_name || 'Uncategorized'} • Rating: ⭐ {serial.rating}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      serial.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                    }`}
                  >
                    {serial.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Audit & Activity Log</span>
            </h2>
            <Link to="/logs" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
              Full Logs <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentActivity?.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-3 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs"
              >
                <div>
                  <span className="font-semibold text-slate-200">{log.admin_name || 'Admin'}</span>{' '}
                  <span className="text-slate-400">{log.description}</span>
                  <div className="text-[10px] text-slate-500 mt-1">{new Date(log.created_at).toLocaleString()}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                  {log.entity_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
