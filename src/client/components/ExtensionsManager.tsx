import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';

type Extension = {
  id: number;
  extension: string;
  name: string;
  accountId: number;
  voicemailEnabled: boolean;
  status: 'Online' | 'Offline';
};

const MOCK_EXTENSIONS: Extension[] = [
  { id: 1, extension: '1001', name: 'Alice Smith', accountId: 101, voicemailEnabled: true, status: 'Online' },
  { id: 2, extension: '1002', name: 'Bob Jones', accountId: 101, voicemailEnabled: false, status: 'Offline' },
  { id: 3, extension: '1003', name: 'Charlie Davis', accountId: 101, voicemailEnabled: true, status: 'Online' },
  { id: 4, extension: '2001', name: 'Front Desk', accountId: 102, voicemailEnabled: true, status: 'Online' },
  { id: 5, extension: '2005', name: 'Conference Room B', accountId: 102, voicemailEnabled: false, status: 'Online' },
  { id: 6, extension: '3010', name: 'Support Queue 1', accountId: 103, voicemailEnabled: true, status: 'Online' },
  { id: 7, extension: '4001', name: 'Executive Suite', accountId: 104, voicemailEnabled: true, status: 'Offline' },
  { id: 8, extension: '5001', name: 'Warehouse Main', accountId: 105, voicemailEnabled: false, status: 'Online' },
  { id: 9, extension: '5002', name: 'Shipping Desk', accountId: 105, voicemailEnabled: false, status: 'Online' },
  { id: 10, extension: '6001', name: 'Paris Branch Main', accountId: 106, voicemailEnabled: true, status: 'Online' },
  { id: 11, extension: '7001', name: 'Vancouver IT Desk', accountId: 107, voicemailEnabled: true, status: 'Online' },
  { id: 12, extension: '8001', name: 'Austin Sales', accountId: 108, voicemailEnabled: false, status: 'Offline' },
  { id: 13, extension: '1004', name: 'David Wilson', accountId: 101, voicemailEnabled: true, status: 'Online' },
  { id: 14, extension: '2002', name: 'Support Lead', accountId: 102, voicemailEnabled: true, status: 'Online' },
  { id: 15, extension: '3011', name: 'HR Dept', accountId: 103, voicemailEnabled: true, status: 'Online' },
];

export function ExtensionsManager() {
  return (
    <QueryProvider>
      <ExtensionsManagerInner />
    </QueryProvider>
  );
}

function ExtensionsManagerInner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ extension: '', name: '', accountId: '', voicemailEnabled: true });

  const { data, isLoading } = useQuery<{ extensions: Extension[] }>({
    queryKey: ['extensions'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/extensions');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { extensions: MOCK_EXTENSIONS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newExt: typeof formData) => {
      const res = await fetch('http://127.0.0.1:8787/extensions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExt,
          accountId: parseInt(newExt.accountId),
        }),
      });
      if (!res.ok) throw new Error('Failed to create extension');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['extensions'] });
      setIsModalOpen(false);
      setFormData({ extension: '', name: '', accountId: '', voicemailEnabled: true });
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
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Extensions</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Configure internal SIP endpoints, routing, and voicemail preferences.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Create Extension
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Extension</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Assignee</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Voicemail</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Activity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Extensions...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.extensions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300">
                    <span className="text-sm font-bold uppercase tracking-widest">No Active Extensions Found</span>
                  </td>
                </tr>
              ) : (
                data?.extensions.map((ext) => (
                  <tr key={ext.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-transparent transition-colors">
                    <td className="px-8 py-6">
                      <div className="w-12 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-mono font-bold border border-indigo-100/50">
                        {ext.extension}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-500 overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(ext.name)}&background=f1f5f9&color=64748b&bold=true`} alt="" />
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{ext.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">
                      #{ext.accountId}
                    </td>
                    <td className="px-8 py-6">
                      {ext.voicemailEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-sky-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Disabled</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${ext.status === 'Online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${ext.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                        {ext.status}
                      </div>
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
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-700">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Extension</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">Initialize a new SIP endpoint on the cluster.</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:text-slate-400 transition-colors" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Extension Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1001"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-bold font-mono"
                      value={formData.extension}
                      onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Linked Account ID</label>
                    <input
                      type="number"
                      required
                      placeholder="System ID"
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium font-mono"
                      value={formData.accountId}
                      onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Display Name / Assignee</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Smith"
                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Voicemail Module</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Enable mailbox for this extension</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.voicemailEnabled}
                      onChange={(e) => setFormData({ ...formData, voicemailEnabled: e.target.checked })}
                    />
                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-800 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
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
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? 'Processing...' : 'Initialize Extension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
