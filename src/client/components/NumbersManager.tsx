import React, { useState } from 'react';

type PhoneNumber = {
  id: number;
  number: string;
  provider: string;
  accountId: number;
  status: 'Active' | 'Inactive' | 'Porting';
  type: 'Local' | 'Toll-Free' | 'International';
};

const MOCK_NUMBERS: PhoneNumber[] = [
  { id: 1, number: '+1 (416) 555-0198', provider: 'Twilio', accountId: 101, status: 'Active', type: 'Local' },
  { id: 2, number: '+1 (800) 555-0199', provider: 'Bandwidth', accountId: 101, status: 'Active', type: 'Toll-Free' },
  { id: 3, number: '+1 (647) 555-0200', provider: 'Twilio', accountId: 102, status: 'Porting', type: 'Local' },
  { id: 4, number: '+44 20 7123 4567', provider: 'Telnyx', accountId: 103, status: 'Inactive', type: 'International' },
];

export function NumbersManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<PhoneNumber[]>(MOCK_NUMBERS);
  const [formData, setFormData] = useState({ number: '', provider: '', accountId: '', type: 'Local' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNumber: PhoneNumber = {
      id: data.length + 1,
      number: formData.number,
      provider: formData.provider,
      accountId: parseInt(formData.accountId),
      status: 'Active',
      type: formData.type as 'Local' | 'Toll-Free' | 'International',
    };
    setData([...data, newNumber]);
    setIsModalOpen(false);
    setFormData({ number: '', provider: '', accountId: '', type: 'Local' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Phone Numbers</h2>
          <p className="text-slate-500 font-medium mt-1">Manage DIDs, porting requests, and global numbering assets.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 group"
          onClick={() => setIsModalOpen(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Provision New Number
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/30">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carrier / Provider</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Linked</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">State</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((num) => (
                <tr key={num.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-slate-900 tracking-tight">{num.number}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{num.id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${num.type === 'Toll-Free' ? 'bg-rose-50 text-rose-600' : num.type === 'Local' ? 'bg-slate-50 text-slate-600' : 'bg-sky-50 text-sky-600'}`}>
                      {num.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                        {num.provider.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{num.provider}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400 font-mono">#{num.accountId}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${num.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : num.status === 'Porting' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${num.status === 'Active' ? 'bg-emerald-500 animate-pulse' : num.status === 'Porting' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                      {num.status}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all">
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-slate-100">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Provision New Asset</h3>
                <p className="text-xs text-slate-400 font-medium mt-1">Search and acquire a new DID for your infrastructure.</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setIsModalOpen(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number (E.164)</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (xxx) xxx-xxxx"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium font-mono"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Classification</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium appearance-none"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    >
                      <option>Local</option>
                      <option>Toll-Free</option>
                      <option>International</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Carrier Provider</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Twilio"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium"
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Parent Account ID</label>
                  <input
                    type="number"
                    required
                    placeholder="Enter system ID"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-200 transition-all font-medium font-mono"
                    value={formData.accountId}
                    onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                  />
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
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
                >
                  Provision Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
