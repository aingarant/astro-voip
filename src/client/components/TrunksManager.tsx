import React, { useState } from 'react';

type Trunk = {
  id: number;
  name: string;
  host: string;
  port: number;
  status: 'Online' | 'Offline' | 'Degraded';
  activeCalls: number;
  maxCalls: number;
};

const MOCK_TRUNKS: Trunk[] = [
  { id: 1, name: 'Primary SIP Trunk', host: 'sip.provider.com', port: 5060, status: 'Online', activeCalls: 14, maxCalls: 50 },
  { id: 2, name: 'Backup EU Trunk', host: 'eu.provider.com', port: 5061, status: 'Online', activeCalls: 2, maxCalls: 50 },
  { id: 3, name: 'Legacy T1 Gateway', host: '10.0.5.100', port: 5060, status: 'Degraded', activeCalls: 20, maxCalls: 24 },
  { id: 4, name: 'Toll-Free Inbound', host: 'tf.provider.com', port: 5060, status: 'Online', activeCalls: 8, maxCalls: 100 },
];

export function TrunksManager() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SIP Trunks</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage inbound and outbound PSTN connectivity.</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add Trunk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {MOCK_TRUNKS.map((trunk) => (
          <div key={trunk.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1 h-full ${trunk.status === 'Online' ? 'bg-emerald-500' : trunk.status === 'Degraded' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{trunk.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">{trunk.host}:{trunk.port}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                trunk.status === 'Online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                trunk.status === 'Degraded' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                'bg-rose-50 text-rose-600 border border-rose-100'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  trunk.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 
                  trunk.status === 'Degraded' ? 'bg-amber-500' : 
                  'bg-rose-500'
                }`}></div>
                {trunk.status}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Active Channels</span>
                  <span className={`text-[10px] font-bold ${(trunk.activeCalls / trunk.maxCalls) > 0.8 ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}`}>{trunk.activeCalls} / {trunk.maxCalls}</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-[1px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${(trunk.activeCalls / trunk.maxCalls) > 0.8 ? 'bg-amber-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${(trunk.activeCalls / trunk.maxCalls) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-all">
                  Configure
                </button>
                <button className="flex-1 py-3 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                  View Metrics
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
