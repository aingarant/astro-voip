import React from 'react';

type Destination = {
  id: number;
  pattern: string;
  type: 'Extension' | 'IVR' | 'Ring Group' | 'Voicemail';
  target: string;
  priority: number;
};

const MOCK_DESTINATIONS: Destination[] = [
  { id: 1, pattern: '^18005550100$', type: 'IVR', target: 'Main Auto Attendant', priority: 10 },
  { id: 2, pattern: '^18005550101$', type: 'Ring Group', target: 'Sales Queue', priority: 20 },
  { id: 3, pattern: '^18005550102$', type: 'Extension', target: 'Ext 101 (CEO)', priority: 30 },
  { id: 4, pattern: '.*', type: 'Voicemail', target: 'General Delivery', priority: 999 },
];

export function DestinationsManager() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inbound Destinations</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Route incoming DID patterns to internal endpoints.</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add Route
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Match Pattern</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target Type</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Destination</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {MOCK_DESTINATIONS.map((dest) => (
                <tr key={dest.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-transparent transition-colors">
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{dest.priority}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">{dest.pattern}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                      dest.type === 'IVR' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                      dest.type === 'Ring Group' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      dest.type === 'Extension' ? 'bg-sky-50 text-sky-600 border-sky-100' :
                      'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                    }`}>
                      {dest.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{dest.target}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
