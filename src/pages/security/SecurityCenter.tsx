import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Eye, Trash2, Plus, AlertTriangle, Key } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const SecurityCenter: React.FC = () => {
  const { showToast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [blocklist, setBlocklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isIpModalOpen, setIsIpModalOpen] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [reason, setReason] = useState('Suspicious login attempts');

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const [lRes, bRes] = await Promise.all([
        fetch('/api/platform/security-logs'),
        fetch('/api/platform/ip-blocklist'),
      ]);
      const [lJson, bJson] = await Promise.all([lRes.json(), bRes.json()]);

      if (lJson.success) setLogs(lJson.logs || []);
      if (bJson.success) setBlocklist(bJson.blocklist || []);
    } catch (err) {
      console.error('Security data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/platform/ip-blocklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip_address: ipAddress, reason }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(`IP ${ipAddress} blocked successfully`, 'success');
        setIsIpModalOpen(false);
        setIpAddress('');
        fetchSecurityData();
      } else {
        showToast(json.message || 'Error blocking IP', 'error');
      }
    } catch (err) {
      showToast('Server connection error', 'error');
    }
  };

  const handleUnblockIp = async (id: number) => {
    try {
      const res = await fetch(`/api/platform/ip-blocklist/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('IP unblocked', 'success');
        fetchSecurityData();
      }
    } catch (err) {
      showToast('Error unblocking IP', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Security Center & IP Firewall</h1>
            <p className="text-xs text-slate-400">Audit security logs, block suspicious IP addresses, and enforce rate limiting.</p>
          </div>
        </div>

        <button
          onClick={() => setIsIpModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Block IP Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* IP Blocklist Table */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" /> Blocked IP Firewall ({blocklist.length})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {blocklist.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-bold text-rose-400">{b.ip_address}</td>
                    <td className="py-3 px-4 text-slate-400">{b.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleUnblockIp(b.id)}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 font-semibold text-[11px]"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Security Event Audit Log
          </h2>

          <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
            {logs.map((l) => (
              <div key={l.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-slate-200">{l.event_type}</div>
                  <div className="text-[11px] text-slate-400">{l.details}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono text-slate-400 text-[11px]">{l.ip_address}</div>
                  <div className="text-[10px] text-slate-500">{new Date(l.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Block IP Modal */}
      {isIpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">Block IP Address</h3>

            <form onSubmit={handleBlockIp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="e.g. 192.168.1.100"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reason for Block</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIpModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  Block IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
