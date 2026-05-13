import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';

type Subscriber = {
  id: number;
  accountId: number;
  extensionId: number;
  defaultDid: string;
  username: string;
  domain: string;
};

const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 1, accountId: 101, extensionId: 1001, defaultDid: '+1 (416) 555-0198', username: 'alice_sip', domain: 'sip.iqfone.com' },
  { id: 2, accountId: 101, extensionId: 1002, defaultDid: '+1 (416) 555-0199', username: 'bob_dev', domain: 'sip.iqfone.com' },
  { id: 3, accountId: 102, extensionId: 2001, defaultDid: '+1 (800) 555-0100', username: 'reception_front', domain: 'sip.iqfone.com' },
  { id: 4, accountId: 103, extensionId: 3010, defaultDid: '+44 20 7123 4567', username: 'uk_office_main', domain: 'sip.iqfone.com' },
  { id: 5, accountId: 104, extensionId: 4001, defaultDid: '+1 (212) 555-0987', username: 'exec_line_01', domain: 'sip.iqfone.com' },
  { id: 6, accountId: 105, extensionId: 5001, defaultDid: '+1 (310) 555-7788', username: 'warehouse_01', domain: 'sip.iqfone.com' },
  { id: 7, accountId: 105, extensionId: 5002, defaultDid: '+1 (310) 555-7789', username: 'warehouse_02', domain: 'sip.iqfone.com' },
  { id: 8, accountId: 101, extensionId: 1003, defaultDid: '+1 (416) 555-0200', username: 'charlie_sales', domain: 'sip.iqfone.com' },
  { id: 9, accountId: 106, extensionId: 6001, defaultDid: '+33 1 70 38 00 00', username: 'paris_office', domain: 'sip.iqfone.com' },
  { id: 10, accountId: 107, extensionId: 7001, defaultDid: '+1 (604) 555-1234', username: 'vancouver_tech', domain: 'sip.iqfone.com' },
  { id: 11, accountId: 108, extensionId: 8001, defaultDid: '+1 (512) 555-5555', username: 'austin_remote', domain: 'sip.iqfone.com' },
  { id: 12, accountId: 101, extensionId: 1004, defaultDid: '+1 (416) 555-0300', username: 'david_it', domain: 'sip.iqfone.com' },
  { id: 13, accountId: 102, extensionId: 2002, defaultDid: '+1 (800) 555-0101', username: 'support_lead', domain: 'sip.iqfone.com' },
  { id: 14, accountId: 103, extensionId: 3011, defaultDid: '+44 20 7123 4568', username: 'london_hr', domain: 'sip.iqfone.com' },
  { id: 15, accountId: 104, extensionId: 4002, defaultDid: '+1 (212) 555-0988', username: 'finance_01', domain: 'sip.iqfone.com' },
];

export function SubscribersManager() {
  return (
    <QueryProvider>
      <SubscribersManagerInner />
    </QueryProvider>
  );
}

function SubscribersManagerInner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    extensionId: '',
    defaultDid: '',
    username: '',
    domain: '',
    password: ''
  });

  const { data, isLoading } = useQuery<{ subscribers: Subscriber[] }>({
    queryKey: ['subscribers'],
    queryFn: async () => {
      // In a real app, this would fetch from the API. 
      // For visualization, we'll return mock data if the API fails or is unavailable.
      try {
        const res = await fetch('http://127.0.0.1:8787/subscribers');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { subscribers: MOCK_SUBSCRIBERS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSub: typeof formData) => {
      const res = await fetch('http://127.0.0.1:8787/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSub,
          accountId: parseInt(newSub.accountId),
          extensionId: parseInt(newSub.extensionId),
        }),
      });
      if (!res.ok) throw new Error('Failed to create subscriber');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setIsModalOpen(false);
      setFormData({ accountId: '', extensionId: '', defaultDid: '', username: '', domain: '', password: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Subscribers</h2>
          <p className="text-slate-500 font-medium mt-1">Manage global SIP registration credentials and user-level routing.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 group"
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add Subscriber
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subscriber Identity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Parent Account</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Extension / DID Mapping</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Domain</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Fetching SIP Database...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300">
                    <span className="text-sm font-bold uppercase tracking-widest">No Active Subscribers Found</span>
                  </td>
                </tr>
              ) : (
                data?.subscribers.map((sub) => (
                  <tr key={sub.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-indigo-100">
                          {sub.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 tracking-tight">{sub.username}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">System ID: {sub.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 font-mono">#{sub.accountId}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-indigo-600 font-mono tracking-tight">{sub.extensionId}</span>
                        <span className="text-[10px] font-bold text-slate-400">{sub.defaultDid}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100">
                        {sub.domain}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all">
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
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Provision Subscriber</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Create a new SIP user with custom authentication and routing.</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Account Association</label>
                    <input
                      type="number"
                      required
                      placeholder="Parent ID"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-mono"
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Extension Mapping</label>
                    <input
                      type="number"
                      required
                      placeholder="Extension ID"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-mono"
                      value={formData.extensionId}
                      onChange={(e) => setFormData({ ...formData, extensionId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Default DID</label>
                    <input
                      type="text"
                      required
                      placeholder="+1 (xxx) xxx-xxxx"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-mono"
                      value={formData.defaultDid}
                      onChange={(e) => setFormData({ ...formData, defaultDid: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">SIP Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. alice_sip"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Network Domain</label>
                    <input
                      type="text"
                      required
                      placeholder="sip.iqfone.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium"
                      value={formData.domain}
                      onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">SIP Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all"
                  onClick={() => setIsModalOpen(false)}
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Processing...' : 'Authorize Subscriber'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
