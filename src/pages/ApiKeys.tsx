import React, { useEffect, useState } from 'react';
import { apiKeyApi } from '../api/apiKeyApi';
import { ApiKey } from '../types';
import { Modal } from '../components/common/Modal';
import { useToast } from '../components/common/Toast';
import { KeyRound, Plus, Copy, Check, Trash2, ShieldCheck, Zap } from 'lucide-react';

export const ApiKeys: React.FC = () => {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newRateLimit, setNewRateLimit] = useState(1000);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { showToast } = useToast();

  const loadKeys = async () => {
    setLoading(true);
    try {
      const res = await apiKeyApi.getAll();
      if (res.success) setKeys(res.data);
    } catch (err) {
      showToast('Failed to load API keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    try {
      const res = await apiKeyApi.create({ name: newKeyName, rate_limit: newRateLimit });
      if (res.success) {
        showToast('API Key generated successfully');
        setIsModalOpen(false);
        setNewKeyName('');
        loadKeys();
      }
    } catch (err) {
      showToast('Error generating API Key', 'error');
    }
  };

  const handleCopy = (id: number, val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    showToast('API key copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      const res = await apiKeyApi.delete(deletingId);
      if (res.success) {
        showToast('API key revoked and deleted');
        setIsDeleteModalOpen(false);
        setDeletingId(null);
        loadKeys();
      }
    } catch (err) {
      showToast('Failed to delete API key', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span>Headless REST API Keys</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and manage API credentials for mobile apps, smart TV apps, and web frontends
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New API Key</span>
        </button>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Application / Key Name</th>
              <th className="py-3 px-4">API Token Value</th>
              <th className="py-3 px-4">Rate Limit</th>
              <th className="py-3 px-4">Usage Count</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  Loading API keys...
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No API keys generated yet.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-semibold text-slate-100">{key.name}</td>
                  <td className="py-3 px-4 font-mono text-indigo-300">
                    <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                      <span className="truncate max-w-[200px]">{key.key_value}</span>
                      <button
                        onClick={() => handleCopy(key.id, key.key_value)}
                        className="text-slate-400 hover:text-slate-100 p-0.5"
                        title="Copy Key"
                      >
                        {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-amber-400 font-medium">
                    {key.rate_limit} req/hr
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {key.usage_count.toLocaleString()} calls
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 capitalize">
                      {key.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setDeletingId(key.id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                      title="Revoke & Delete Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Headless API Key" maxWidth="sm">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Key Name / Client App *</label>
            <input
              type="text"
              required
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none"
              placeholder="e.g. Android TV Mobile App"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Rate Limit (Requests / Hour)</label>
            <input
              type="number"
              min="100"
              step="500"
              value={newRateLimit}
              onChange={(e) => setNewRateLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none font-mono"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/20"
            >
              Generate Token
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Revoke API Key" maxWidth="sm">
        <div className="space-y-4 text-xs">
          <p className="text-slate-300">
            Are you sure you want to revoke this API key? Applications using this token will lose access immediately.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
            >
              Cancel
            </button>
            <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-semibold">
              Confirm Revoke
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
