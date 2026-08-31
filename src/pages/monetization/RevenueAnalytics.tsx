import React, { useState, useEffect } from 'react';
import { BarChart3, Globe, Smartphone, Monitor, Tablet, Filter, ArrowUpRight } from 'lucide-react';

export const RevenueAnalytics: React.FC = () => {
  const [range, setRange] = useState('30d');
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/monetization/analytics');
      const json = await res.json();
      if (json.success) {
        setAnalytics(json);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const summary = analytics?.revenueSummary || {
    estimatedRevenue: 3631.70,
    todayRevenue: 245.80,
    yesterdayRevenue: 210.40,
    thisMonthRevenue: 5820.50,
    lastMonthRevenue: 4910.00,
    rpm: 12.45,
    cpm: 11.80,
    cpc: 0.38,
    ctr: 3.12,
    impressions: 842000,
    clicks: 26100,
    fillRate: 98.4,
  };

  const geoData = analytics?.geoData || [];
  const deviceData = analytics?.deviceData || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" /> Revenue & Geo Monetization Analytics
          </h1>
          <p className="text-xs text-slate-400">Track eCPM, CTR, Country breakdown and Device performance.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-xl text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
          {['today', '7d', '30d', '3m', '1y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 rounded-lg font-semibold uppercase transition ${
                range === r ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Total Revenue ({range.toUpperCase()})</span>
          <div className="text-2xl font-black text-emerald-400">${summary.estimatedRevenue.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Overall RPM</span>
          <div className="text-2xl font-black text-indigo-400">${summary.rpm.toFixed(2)}</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Average CTR</span>
          <div className="text-2xl font-black text-amber-400">{summary.ctr}%</div>
        </div>
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Ad Fill Rate</span>
          <div className="text-2xl font-black text-sky-400">{summary.fillRate}%</div>
        </div>
      </div>

      {/* Geo Breakdown Table */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Globe className="w-4 h-4 text-sky-400" /> Geographic Country Breakdown
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-3 px-4">Country</th>
                <th className="py-3 px-4">Device</th>
                <th className="py-3 px-4">Impressions</th>
                <th className="py-3 px-4">Clicks</th>
                <th className="py-3 px-4">CTR</th>
                <th className="py-3 px-4">RPM</th>
                <th className="py-3 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {geoData.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-bold text-slate-100">{row.country}</td>
                  <td className="py-3 px-4 text-slate-400">{row.device}</td>
                  <td className="py-3 px-4">{Number(row.impressions).toLocaleString()}</td>
                  <td className="py-3 px-4">{Number(row.clicks).toLocaleString()}</td>
                  <td className="py-3 px-4 text-amber-400 font-semibold">{row.ctr}%</td>
                  <td className="py-3 px-4 text-indigo-400 font-semibold">${row.rpm}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">${row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-emerald-400" /> Device Platform Metrics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deviceData.map((d: any) => (
            <div key={d.device} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  {d.device === 'Desktop' && <Monitor className="w-4 h-4 text-indigo-400" />}
                  {d.device === 'Mobile' && <Smartphone className="w-4 h-4 text-sky-400" />}
                  {d.device === 'Tablet' && <Tablet className="w-4 h-4 text-amber-400" />}
                  {d.device}
                </span>
                <span className="text-xs font-bold text-emerald-400">${d.revenue.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                Impressions: <strong className="text-slate-200">{d.impressions.toLocaleString()}</strong> | CTR: <strong className="text-amber-400">{d.ctr}%</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
