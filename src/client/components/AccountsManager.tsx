import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';

type Account = {
  id: number;
  extAccountId: string;
  domain: string;
  isActive: number;
};

const MOCK_ACCOUNTS: Account[] = [
  { id: 1, extAccountId: 'TWILIO_NA_EAST_01', domain: 'sip.twilio.com', isActive: 1 },
  { id: 2, extAccountId: 'BANDWIDTH_PROD', domain: 'sip.bandwidth.com', isActive: 1 },
  { id: 3, extAccountId: 'TELNYX_PRIMARY', domain: 'sip.telnyx.com', isActive: 0 },
  { id: 4, extAccountId: 'VOIPMS_BACKUP', domain: 'toronto01.voip.ms', isActive: 1 },
  { id: 5, extAccountId: 'INTL_COLT_EU', domain: 'colt.sip.eu', isActive: 1 },
  { id: 6, extAccountId: 'FLOWROUTE_EAST', domain: 'sip.flowroute.com', isActive: 1 },
  { id: 7, extAccountId: 'VULTR_VOIP_01', domain: 'vultr.sip.cloud', isActive: 0 },
  { id: 8, extAccountId: 'SKYETEL_US_WEST', domain: 'gw.skyetel.com', isActive: 1 },
  { id: 9, extAccountId: 'ANVEODIRECT_01', domain: 'sbc.anveo.com', isActive: 1 },
  { id: 10, extAccountId: 'QUESTBLUE_TRUNK', domain: 'sip.questblue.com', isActive: 1 },
  { id: 11, extAccountId: 'DIDWW_GLOBAL', domain: 'trunk.didww.com', isActive: 1 },
  { id: 12, extAccountId: 'VOXBEAM_EU', domain: 'sip.voxbeam.com', isActive: 0 },
];

export function AccountsManager() {
  return (
    <QueryProvider>
      <AccountsManagerInner />
    </QueryProvider>
  );
}

function AccountsManagerInner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ extAccountId: '', domain: '', isActive: 1 });

  const { data, isLoading } = useQuery<{ accounts: Account[] }>({
    queryKey: ['accounts'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/accounts');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { accounts: MOCK_ACCOUNTS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newAccount: { extAccountId: string; domain: string }) => {
      const res = await fetch('http://127.0.0.1:8787/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount),
      });
      if (!res.ok) throw new Error('Failed to create account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsModalOpen(false);
      setFormData({ extAccountId: '', domain: '', isActive: 1 });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (account: { id: number; extAccountId: string; domain: string; isActive: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/accounts/${account.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      });
      if (!res.ok) throw new Error('Failed to update account');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ extAccountId: '', domain: '', isActive: 1 });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (acc: Account) => {
    setFormData({ extAccountId: acc.extAccountId, domain: acc.domain, isActive: acc.isActive });
    setEditingId(acc.id);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setFormData({ extAccountId: '', domain: '', isActive: 1 });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Accounts Management</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Configure and monitor external SIP providers and domain routing.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          onClick={openCreate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add New Account
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">System ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account Identifier</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Domain Path</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Current Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Infrastructure Data...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.accounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="text-slate-300 flex flex-col items-center gap-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                      <span className="text-sm font-bold uppercase tracking-widest">No Active Accounts Found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.accounts.map((acc) => (
                  <tr key={acc.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-transparent transition-colors">
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">#{acc.id}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                          {acc.extAccountId.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{acc.extAccountId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">{acc.domain}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${acc.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${acc.isActive ? 'bg-emerald-500' : 'bg-rose-500'} ${acc.isActive ? 'animate-pulse' : ''}`}></div>
                        {acc.isActive ? 'Operational' : 'Disconnected'}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
                        onClick={() => openEdit(acc)}
                      >
                        Configure
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Configure Account' : 'New SIP Account'}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Provide the necessary credentials for the account.</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 transition-colors" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Account Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TWILIO_PROD_01"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium"
                    value={formData.extAccountId}
                    onChange={(e) => setFormData({ ...formData, extAccountId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">SIP Domain / Gateway</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iqfone.sip.twilio.com"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium font-mono"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  />
                </div>
                {editingId && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <span className="block text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Operational Status</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Toggle account connectivity</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={formData.isActive === 1}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked ? 1 : 0 })}
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-800 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                )}
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  className="flex-1 py-4 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-all"
                  onClick={() => setIsModalOpen(false)}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingId ? 'Apply Changes' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
