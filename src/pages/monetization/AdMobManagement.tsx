import React, { useState, useEffect } from 'react';
import { Smartphone, Shield, Save, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const AdMobManagement: React.FC = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [admob, setAdmob] = useState({
    admob_enabled: 'true',
    admob_app_id_android: 'ca-app-pub-3940256099942544~3347511713',
    admob_app_id_ios: 'ca-app-pub-3940256099942544~1458002511',
    admob_banner_unit_id: 'ca-app-pub-3940256099942544/6300978111',
    admob_interstitial_unit_id: 'ca-app-pub-3940256099942544/1033173712',
    admob_rewarded_unit_id: 'ca-app-pub-3940256099942544/5224354917',
    admob_native_unit_id: 'ca-app-pub-3940256099942544/2247696110',
    admob_app_open_unit_id: 'ca-app-pub-3940256099942544/3419835294',
    admob_test_mode: 'true',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/monetization/settings');
      const json = await res.json();
      if (json.success) {
        setAdmob((prev) => ({ ...prev, ...json.settings }));
      }
    } catch (err) {
      console.error('Failed to load AdMob settings:', err);
    } finally {
      setLoading(false);
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
        body: JSON.stringify({ settings: admob }),
      });
      const json = await res.json();
      if (json.success) {
        showToast('AdMob mobile app configuration updated successfully!', 'success');
      } else {
        showToast(json.message || 'Failed to update AdMob settings', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Google AdMob (Mobile Apps Integration)</h1>
            <p className="text-xs text-slate-400">Configure native mobile advertising for Android & iOS mobile clients.</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save AdMob Settings'}</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-sky-950/30 border border-sky-500/20 rounded-xl flex items-start gap-3 text-xs text-sky-300">
        <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Mobile Native Network Notice:</span> AdMob is designed strictly for Android and iOS mobile applications. Website ad slots should be configured under the Google AdSense or Google Ad Manager sections.
        </div>
      </div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App IDs & Mode */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Mobile App IDs & Test Mode</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Android App ID</label>
            <input
              type="text"
              value={admob.admob_app_id_android}
              onChange={(e) => setAdmob({ ...admob, admob_app_id_android: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">iOS App ID</label>
            <input
              type="text"
              value={admob.admob_app_id_ios}
              onChange={(e) => setAdmob({ ...admob, admob_app_id_ios: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Test Ad Mode</span>
              <input
                type="checkbox"
                checked={admob.admob_test_mode === 'true'}
                onChange={(e) => setAdmob({ ...admob, admob_test_mode: String(e.target.checked) })}
                className="w-4 h-4 accent-sky-500 rounded"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              When enabled, Google test ad units are served to safeguard your account against invalid click penalties during testing.
            </p>
          </div>
        </div>

        {/* Ad Format Unit IDs */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-5">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Ad Format Unit IDs</h2>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Banner Ad Unit ID</label>
            <input
              type="text"
              value={admob.admob_banner_unit_id}
              onChange={(e) => setAdmob({ ...admob, admob_banner_unit_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Interstitial Ad Unit ID</label>
            <input
              type="text"
              value={admob.admob_interstitial_unit_id}
              onChange={(e) => setAdmob({ ...admob, admob_interstitial_unit_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rewarded Video Ad Unit ID</label>
            <input
              type="text"
              value={admob.admob_rewarded_unit_id}
              onChange={(e) => setAdmob({ ...admob, admob_rewarded_unit_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Native Advanced Unit ID</label>
            <input
              type="text"
              value={admob.admob_native_unit_id}
              onChange={(e) => setAdmob({ ...admob, admob_native_unit_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">App Open Ad Unit ID</label>
            <input
              type="text"
              value={admob.admob_app_open_unit_id}
              onChange={(e) => setAdmob({ ...admob, admob_app_open_unit_id: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
