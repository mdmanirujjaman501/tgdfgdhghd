import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../api/analyticsApi';
import { BarChart3, Eye, Download, Users, Tv, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const res = await analyticsApi.getChartData();
        if (res.success) setChartData(res.data);
      } catch (err) {
        console.error('Failed to load chart metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const deviceData = [
    { name: 'Android Mobile', value: 45, color: '#6366f1' },
    { name: 'Smart TV', value: 30, color: '#10b981' },
    { name: 'Web Browser', value: 18, color: '#06b6d4' },
    { name: 'iOS Mobile', value: 7, color: '#f59e0b' },
  ];

  const categoryShare = [
    { name: 'Daily Soap', value: 40, color: '#8b5cf6' },
    { name: 'Mythological', value: 25, color: '#ec4899' },
    { name: 'Drama', value: 20, color: '#3b82f6' },
    { name: 'Reality Shows', value: 15, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Streaming Analytics & Traffic</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Detailed playback metrics, bandwidth usage, and client device breakdown
          </p>
        </div>
      </div>

      {/* Main Streaming Trend Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Weekly Video Streams & Downloads</span>
          </h2>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDl2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#f8fafc',
                }}
              />
              <Area type="monotone" dataKey="views" name="Video Plays" stroke="#6366f1" fill="url(#colorViews2)" />
              <Area type="monotone" dataKey="downloads" name="Offline Downloads" stroke="#10b981" fill="url(#colorDl2)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Grid Charts: Devices & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Tv className="w-4 h-4 text-indigo-400" />
            <span>Playback Client Devices</span>
          </h3>

          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {deviceData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-300 font-medium">{d.name}:</span>
                <span className="text-slate-400 font-mono">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Share */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-400" />
            <span>Content Share by Category</span>
          </h3>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryShare} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#f8fafc',
                  }}
                />
                <Bar dataKey="value" name="Share %" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
