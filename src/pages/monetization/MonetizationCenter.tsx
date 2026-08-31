import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Award,
  ShieldAlert,
  Smartphone,
  Globe,
  Layers,
  Save,
  CheckCircle2,
  Sliders,
  Play,
  Download,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const MonetizationCenter: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'adblock' | 'video' | 'download'>('overview');

  const [settings, setSettings] = useState<Record<string, string>>({
    admob_enabled: 'true',
    adsense_enabled: 'true',
    gam_network_code: '123456789',
    adblock_detection_enabled: 'true',
    adblock_action: 'warning',
    max_ads_per_page: '4',
    interstitial_interval_mins: '5',
    video_preroll_enabled: 'true',
    video_midroll_enabled: 'true',
    video_midroll_interval_mins: '10',
    video_postroll_enabled: 'false',
    download_monetization_mode: 'ad-supported',
    download_countdown_sec: '10',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/monetization/settings');
      const json = await res.json();
      if (json.success) {
        setSettings((prev) => ({ ...prev, ...json.settings }));
      }
    } catch (err) {
      console.error('Failed to fetch monetization settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/monetization/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Monetization settings saved successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to save settings', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/20 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h1 className="text-xl font-bold text-slate-100">Monetization Engine & Control Center</h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Configure AdMob, Google AdSense, Google Ad Manager, Video Player Ad Rules, Download Gates, and AdBlock Shield.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Est. Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100">$5,820.50</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +18.4% from last month
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Overall eCPM</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100">$11.80</div>
          <div className="text-[11px] text-slate-400">Avg across Web & Mobile</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active Networks</span>
            <Globe className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100">3 Enabled</div>
          <div className="text-[11px] text-sky-400">AdMob + AdSense + GAM</div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>AdBlock Shield Status</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-100">
            {settings.adblock_detection_enabled === 'true' ? 'Active Warning' : 'Disabled'}
          </div>
          <div className="text-[11px] text-amber-400">12.4% users with AdBlock</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> Global Ad Frequency & Rules
        </button>
        <button
          onClick={() => setActiveTab('video')}
          className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'video'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-4 h-4" /> Video Player Monetization
        </button>
        <button
          onClick={() => setActiveTab('download')}
          className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'download'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" /> Download Monetization
        </button>
        <button
          onClick={() => setActiveTab('adblock')}
          className={`pb-3 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'adblock'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> AdBlock Protection
        </button>
      </div>

      {/* Tab 1: Global Frequency */}
      {activeTab === 'overview' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Ad Frequency & Cap Control</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Maximum Ads Per Page View</label>
              <input
                type="number"
                value={settings.max_ads_per_page || '4'}
                onChange={(e) => handleChange('max_ads_per_page', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Prevents layout clutter by capping total ad slots on any screen.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Interstitial Minimum Interval (Minutes)</label>
              <input
                type="number"
                value={settings.interstitial_interval_mins || '5'}
                onChange={(e) => handleChange('interstitial_interval_mins', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Minimum wait time between full-screen interstitial ads.</p>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-slate-200">Active Network Statuses</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-sky-400" /> AdMob (Mobile)
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">ENABLED</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-amber-400" /> AdSense (Web)
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">ENABLED</span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" /> Google Ad Manager
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">ENABLED</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Video Player Monetization */}
      {activeTab === 'video' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Video Player In-Stream Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Pre-roll Video Ad</span>
                <input
                  type="checkbox"
                  checked={settings.video_preroll_enabled === 'true'}
                  onChange={(e) => handleChange('video_preroll_enabled', String(e.target.checked))}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-400">Plays short video advertisement before video playback starts.</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Mid-roll Video Ad</span>
                <input
                  type="checkbox"
                  checked={settings.video_midroll_enabled === 'true'}
                  onChange={(e) => handleChange('video_midroll_enabled', String(e.target.checked))}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-400">Inserts ad cue points inside serial episode stream.</p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Post-roll Video Ad</span>
                <input
                  type="checkbox"
                  checked={settings.video_postroll_enabled === 'true'}
                  onChange={(e) => handleChange('video_postroll_enabled', String(e.target.checked))}
                  className="w-4 h-4 accent-indigo-500 rounded"
                />
              </div>
              <p className="text-[11px] text-slate-400">Plays video ad after episode ends before autoplaying next.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Mid-roll Ad Break Interval (Minutes)</label>
            <select
              value={settings.video_midroll_interval_mins || '10'}
              onChange={(e) => handleChange('video_midroll_interval_mins', e.target.value)}
              className="w-full max-w-xs px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="5">Every 5 Minutes</option>
              <option value="10">Every 10 Minutes</option>
              <option value="15">Every 15 Minutes</option>
              <option value="20">Every 20 Minutes</option>
            </select>
          </div>
        </div>
      )}

      {/* Tab 3: Download Monetization */}
      {activeTab === 'download' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Download Gate & Interstitial Rules</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Download Monetization Mode</label>
              <select
                value={settings.download_monetization_mode || 'ad-supported'}
                onChange={(e) => handleChange('download_monetization_mode', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="free">Free Download (No Gate)</option>
                <option value="ad-supported">Ad-supported Download (Timer & Banner)</option>
                <option value="premium">Premium Only Downloads</option>
                <option value="disabled">Disable Downloads Globally</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Countdown Wait Time (Seconds)</label>
              <input
                type="number"
                value={settings.download_countdown_sec || '10'}
                onChange={(e) => handleChange('download_countdown_sec', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Users see ad placement while waiting for direct download link.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AdBlock Protection */}
      {activeTab === 'adblock' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">AdBlock Detection System</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="adblock_toggle"
                checked={settings.adblock_detection_enabled === 'true'}
                onChange={(e) => handleChange('adblock_detection_enabled', String(e.target.checked))}
                className="w-4 h-4 accent-indigo-500 rounded"
              />
              <label htmlFor="adblock_toggle" className="text-xs font-bold text-slate-200 cursor-pointer">
                Enable Client-Side AdBlock Detection
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">AdBlock Detected Action</label>
              <select
                value={settings.adblock_action || 'warning'}
                onChange={(e) => handleChange('adblock_action', e.target.value)}
                className="w-full max-w-md px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="warning">Show Polite Banner / Warning Toast</option>
                <option value="block">Block Video Stream (Request Whitelist)</option>
                <option value="allow">Log Telemetry Only (Allow Content)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
