import React, { useEffect, useState } from 'react';
import { settingsApi } from '../api/settingsApi';
import { useToast } from '../components/common/Toast';
import { Settings as SettingsIcon, Save, Tv, Shield, Globe, PlayCircle } from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'TV Serial Studio',
    site_tagline: 'Premier Indian TV Serials & Daily Soaps Streaming Engine',
    site_logo: '',
    primary_language: 'Hindi',
    default_quality: '1080p',
    public_api_enabled: 'true',
    global_rate_limit: '1000',
    jwt_expiry_hours: '24',
    max_upload_size_mb: '10',
    allowed_stream_domains: '*',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showToast } = useToast();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await settingsApi.get();
      if (res.success && res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      showToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.update(settings);
      if (res.success) {
        showToast('System settings saved successfully');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-500 text-xs">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <span>Platform Settings & Configurations</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global site configuration, video CDN player options, and API limits
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* General Site Config */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Tv className="w-4 h-4 text-indigo-400" />
            <span>General Platform Info</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">CMS Platform Name</label>
              <input
                type="text"
                value={settings.site_name || ''}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Tagline</label>
              <input
                type="text"
                value={settings.site_tagline || ''}
                onChange={(e) => setSettings({ ...settings, site_tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Audio Language</label>
              <input
                type="text"
                value={settings.primary_language || 'Hindi'}
                onChange={(e) => setSettings({ ...settings, primary_language: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Video Resolution</label>
              <select
                value={settings.default_quality || '1080p'}
                onChange={(e) => setSettings({ ...settings, default_quality: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              >
                <option value="1080p">1080p Full HD</option>
                <option value="720p">720p HD</option>
                <option value="480p">480p SD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Headless API Config */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Headless REST API Controls</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Public REST API Status</label>
              <select
                value={settings.public_api_enabled || 'true'}
                onChange={(e) => setSettings({ ...settings, public_api_enabled: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              >
                <option value="true">Enabled (Public Access Open)</option>
                <option value="false">Disabled (Maintenance Mode)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Global Rate Limit (Req / Hr)</label>
              <input
                type="number"
                value={settings.global_rate_limit || '1000'}
                onChange={(e) => setSettings({ ...settings, global_rate_limit: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Security & Authentication */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Security & Token Policies</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Admin JWT Token Expiry (Hours)</label>
              <input
                type="number"
                value={settings.jwt_expiry_hours || '24'}
                onChange={(e) => setSettings({ ...settings, jwt_expiry_hours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Max Upload File Size (MB)</label>
              <input
                type="number"
                value={settings.max_upload_size_mb || '10'}
                onChange={(e) => setSettings({ ...settings, max_upload_size_mb: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
