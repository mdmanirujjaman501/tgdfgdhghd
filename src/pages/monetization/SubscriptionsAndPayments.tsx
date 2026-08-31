import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Check, Edit2, ShieldCheck, DollarSign, Wallet } from 'lucide-react';
import { useToast } from '../../components/common/Toast';

export const SubscriptionsAndPayments: React.FC = () => {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<any[]>([]);
  const [gateways, setGateways] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plans' | 'gateways' | 'transactions'>('plans');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, gRes, tRes] = await Promise.all([
        fetch('/api/subscriptions/plans'),
        fetch('/api/subscriptions/gateways'),
        fetch('/api/subscriptions/transactions'),
      ]);
      const [pJson, gJson, tJson] = await Promise.all([pRes.json(), gRes.json(), tRes.json()]);

      if (pJson.success) setPlans(pJson.plans || []);
      if (gJson.success) setGateways(gJson.gateways || []);
      if (tJson.success) setTransactions(tJson.transactions || []);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleGateway = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/subscriptions/gateways/${id}/toggle`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        showToast('Payment gateway status updated', 'success');
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update gateway', 'error');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Subscriptions & Payment Gateways</h1>
            <p className="text-xs text-slate-400">Manage VIP membership plans, Stripe, PayPal, bKash, Nagad & transaction logs.</p>
          </div>
        </div>

        <div className="flex border border-slate-800 rounded-xl bg-slate-950 p-1 text-xs">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'plans' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Subscription Plans
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'gateways' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Payment Gateways
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeTab === 'transactions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Tab 1: Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`p-5 bg-slate-900 border rounded-2xl space-y-4 relative ${
                p.is_popular ? 'border-rose-500/50 shadow-lg shadow-rose-500/10' : 'border-slate-800'
              }`}
            >
              {p.is_popular && (
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-extrabold bg-rose-500 text-white rounded-full uppercase tracking-wider">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-sm font-bold text-slate-100">{p.name}</h3>
                <div className="text-2xl font-black text-slate-100 mt-2">
                  ${p.price} <span className="text-xs text-slate-400 font-normal">/ {p.duration}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl text-xs space-y-2 text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Ad-Free Experience</span>
                  <span className={p.is_ad_free ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                    {p.is_ad_free ? 'YES' : 'NO'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max Quality</span>
                  <span className="font-bold text-indigo-400">{p.max_quality}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Max Devices</span>
                  <span className="font-bold text-slate-200">{p.max_devices} Screen(s)</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Gateways */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gateways.map((g) => (
            <div key={g.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">{g.name}</h3>
                </div>
                <button
                  onClick={() => handleToggleGateway(g.id, Boolean(g.is_active))}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition ${
                    g.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {g.is_active ? 'Active' : 'Disabled'}
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1 font-mono">
                <div>Public Key: {g.public_key || 'configured'}</div>
                <div>Sandbox: {g.is_sandbox ? 'ENABLED' : 'LIVE'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Transactions */}
      {activeTab === 'transactions' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Subscriber Transaction History</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Gateway</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-300">{tx.transaction_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-100">{tx.username || `User #${tx.user_id}`}</td>
                    <td className="py-3 px-4 text-indigo-400 font-semibold">{tx.plan_name || 'VIP Monthly'}</td>
                    <td className="py-3 px-4 font-bold text-emerald-400">${tx.amount} {tx.currency}</td>
                    <td className="py-3 px-4 text-slate-400">{tx.gateway}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">
                      {tx.created_at ? new Date(tx.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
