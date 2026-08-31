import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Trash2, Edit2, Shield, Smartphone, Globe, Layers, ArrowRight } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const AdPlacementsManagement: React.FC = () => {
  const { showToast } = useToast();
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    position: 'Header',
    network: 'AdSense',
    fallback_network: 'Google Ad Manager',
    device_target: 'All',
    priority: 1,
    status: 'active',
  });

  const fetchPlacements = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/monetization/placements');
      const json = await res.json();
      if (json.success) {
        setPlacements(json.placements || []);
      }
    } catch (err) {
      console.error('Failed to load ad placements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const handleOpenModal = (p?: any) => {
    if (p) {
      setEditingPlacement(p);
      setFormData({
        name: p.name,
        position: p.position,
        network: p.network,
        fallback_network: p.fallback_network || 'Google Ad Manager',
        device_target: p.device_target || 'All',
        priority: p.priority || 1,
        status: p.status || 'active',
      });
    } else {
      setEditingPlacement(null);
      setFormData({
        name: '',
        position: 'Header',
        network: 'AdSense',
        fallback_network: 'Google Ad Manager',
        device_target: 'All',
        priority: 1,
        status: 'active',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/monetization/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlacement ? { ...formData, id: editingPlacement.id } : formData),
      });
      const json = await res.json();
      if (json.success) {
        showToast(editingPlacement ? 'Placement updated' : 'Placement created', 'success');
        setIsModalOpen(false);
        fetchPlacements();
      } else {
        showToast(json.message || 'Error saving placement', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ad placement?')) return;
    try {
      const res = await fetch(`/api/monetization/placements/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Placement deleted', 'success');
        fetchPlacements();
      }
    } catch (err) {
      showToast('Failed to delete placement', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Visual Ad Placement Manager</h1>
            <p className="text-xs text-slate-400">Configure fallback ad networks, device targeting, and layout priorities.</p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-violet-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Ad Placement</span>
        </button>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">Loading ad placements...</div>
        ) : placements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-500">No ad placements created yet.</div>
        ) : (
          placements.map((p) => (
            <div key={p.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 relative group">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{p.name}</h3>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">{p.position}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(p)} className="p-1.5 text-slate-400 hover:text-slate-200">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Network Fallback Cascade */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase">Waterfall Fallback Cascade</div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">{p.network}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded">{p.fallback_network}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
                <span>Device: <strong className="text-slate-200">{p.device_target}</strong></span>
                <span>Priority: <strong className="text-slate-200">#{p.priority}</strong></span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              {editingPlacement ? 'Edit Placement' : 'Create New Ad Placement'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Placement Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Header Navigation Banner"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Header">Header</option>
                    <option value="Below Navigation">Below Navigation</option>
                    <option value="Before Episode">Before Episode</option>
                    <option value="After Episode">After Episode</option>
                    <option value="Sidebar">Sidebar</option>
                    <option value="Between Episodes">Between Episodes</option>
                    <option value="Before Download">Before Download</option>
                    <option value="Footer">Footer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Device Target</label>
                  <select
                    value={formData.device_target}
                    onChange={(e) => setFormData({ ...formData, device_target: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Devices</option>
                    <option value="Desktop">Desktop Only</option>
                    <option value="Mobile">Mobile Only</option>
                    <option value="Tablet">Tablet Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Primary Ad Network</label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AdSense">Google AdSense</option>
                    <option value="AdMob">Google AdMob</option>
                    <option value="Google Ad Manager">Google Ad Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Fallback Ad Network</label>
                  <select
                    value={formData.fallback_network}
                    onChange={(e) => setFormData({ ...formData, fallback_network: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Google Ad Manager">Google Ad Manager</option>
                    <option value="AdSense">Google AdSense</option>
                    <option value="AdMob">Google AdMob</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  Save Placement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
