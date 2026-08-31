import React, { useState, useEffect } from 'react';
import { Layers, Save, Sliders, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const AdManagerManagement: React.FC = () => {
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const [gam, setGam] = useState({
    gam_network_code: '123456789',
    gam_publisher_id: 'pub-1234567890123456',
    gam_inventory_id: 'inv-main-serial-app',
    gam_default_size: 'Responsive',
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/monetization/settings');
      const json = await res.json();
      if (json.success) {
        setGam((prev) => ({ ...prev, ...json.settings }));
      }
    } catch (err) {
      console.error('Failed to load GAM settings:', err);
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
        body: JSON.stringify({ settings: gam }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Google Ad Manager configuration saved successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to save GAM settings', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const adSizes = ['320x50', '320x100', '300x250', '336x280', '728x90', '970x250', 'Responsive'];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Google Ad Manager (GAM) Configuration</h1>
            <p className="text-xs text-slate-400">Enterprise ad server integration with key-value targeting and inventory controls.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save GAM Settings'}</span>
        </button>
      </div>

      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
        <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Network & Inventory Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Network Code</label>
            <input
              type="text"
              value={gam.gam_network_code}
              onChange={(e) => setGam({ ...gam, gam_network_code: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Inventory Identifier</label>
            <input
              type="text"
              value={gam.gam_inventory_id}
              onChange={(e) => setGam({ ...gam, gam_inventory_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-3">Supported Ad Unit Sizes</label>
          <div className="flex flex-wrap gap-2">
            {adSizes.map((sz) => (
              <span key={sz} className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg font-mono">
                {sz}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
