import React, { useState, useEffect } from 'react';
import { Globe, Save, Check, Layout, Sparkles } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const AdSenseManagement: React.FC = () => {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [adsense, setAdsense] = useState({
    adsense_enabled: 'true',
    adsense_publisher_id: 'pub-9876543210123456',
    adsense_auto_ads: 'true',
    adsense_header_enabled: 'true',
    adsense_sidebar_enabled: 'true',
    adsense_before_ep_enabled: 'true',
    adsense_after_ep_enabled: 'true',
    adsense_footer_enabled: 'true',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/monetization/settings');
      const json = await res.json();
      if (json.success) {
        setAdsense((prev) => ({ ...prev, ...json.settings }));
      }
    } catch (err) {
      console.error('Failed to load AdSense settings:', err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/monetization/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: adsense }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Google AdSense web configuration saved successfully!', 'success');
      } else {
        showToast(json.message || 'Error saving AdSense settings', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const placementsList = [
    { key: 'adsense_header_enabled', label: 'Header Navigation Banner', desc: 'Top site header slot (728x90 Leaderboard)' },
    { key: 'adsense_sidebar_enabled', label: 'Sidebar Sticky Widget', desc: 'Desktop sidebar widget (300x250 Medium Rectangle)' },
    { key: 'adsense_before_ep_enabled', label: 'Before Episode Stream', desc: 'Directly above episode player screen' },
    { key: 'adsense_after_ep_enabled', label: 'After Episode Stream', desc: 'Below video player before download links' },
    { key: 'adsense_footer_enabled', label: 'Footer Responsive Ad', desc: 'Bottom website footer container' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Google AdSense (Website Monetization)</h1>
            <p className="text-xs text-slate-400">Manage site Auto-Ads script tag and targeted manual website ad slots.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-600/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save AdSense Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AdSense Publisher Credentials */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Account Credentials</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Publisher ID (pub-xxxxxxxxxxxxxx)</label>
            <input
              type="text"
              value={adsense.adsense_publisher_id}
              onChange={(e) => setAdsense({ ...adsense, adsense_publisher_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Enable Google Auto Ads
              </span>
              <input
                type="checkbox"
                checked={adsense.adsense_auto_ads === 'true'}
                onChange={(e) => setAdsense({ ...adsense, adsense_auto_ads: String(e.target.checked) })}
                className="w-4 h-4 accent-amber-500 rounded"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Google automatically injects responsive ad slots into optimal layout positions across desktop & mobile views.
            </p>
          </div>
        </div>

        {/* Website Placement Controls */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Manual Placement Visibility</h2>

          <div className="space-y-3">
            {placementsList.map((p) => (
              <div key={p.key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-slate-200">{p.label}</div>
                  <div className="text-[10px] text-slate-400">{p.desc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={(adsense as any)[p.key] === 'true'}
                  onChange={(e) => setAdsense({ ...adsense, [p.key]: String(e.target.checked) })}
                  className="w-4 h-4 accent-amber-500 rounded shrink-0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
