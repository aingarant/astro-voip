import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';

type ServerNode = {
  id: number;
  name: string;
  type: 'Kamailio' | 'FreeSWITCH' | 'RTPEngine' | 'PostgreSQL';
  ipAddress: string;
  region: string;
  status: 'Online' | 'Degraded' | 'Offline';
  cpuUsage: number;
  memUsage: number;
};

const MOCK_SERVERS: ServerNode[] = [
  { id: 1, name: 'kamailio-edge-01', type: 'Kamailio', ipAddress: '10.0.1.10', region: 'NA-East-1', status: 'Online', cpuUsage: 12, memUsage: 45 },
  { id: 2, name: 'kamailio-edge-02', type: 'Kamailio', ipAddress: '10.0.1.11', region: 'NA-West-2', status: 'Online', cpuUsage: 15, memUsage: 42 },
  { id: 3, name: 'fs-media-01', type: 'FreeSWITCH', ipAddress: '10.0.2.20', region: 'NA-East-1', status: 'Degraded', cpuUsage: 85, memUsage: 60 },
  { id: 4, name: 'fs-media-02', type: 'FreeSWITCH', ipAddress: '10.0.2.21', region: 'EU-Central-1', status: 'Online', cpuUsage: 30, memUsage: 55 },
  { id: 5, name: 'rtpengine-01', type: 'RTPEngine', ipAddress: '10.0.3.30', region: 'EU-West-1', status: 'Online', cpuUsage: 40, memUsage: 20 },
  { id: 6, name: 'db-primary', type: 'PostgreSQL', ipAddress: '10.0.4.50', region: 'NA-East-1', status: 'Online', cpuUsage: 18, memUsage: 82 },
  { id: 7, name: 'kamailio-edge-03', type: 'Kamailio', ipAddress: '10.0.1.12', region: 'AP-South-1', status: 'Online', cpuUsage: 5, memUsage: 30 },
  { id: 8, name: 'fs-media-03', type: 'FreeSWITCH', ipAddress: '10.0.2.22', region: 'AP-South-1', status: 'Offline', cpuUsage: 0, memUsage: 0 },
  { id: 9, name: 'rtpengine-02', type: 'RTPEngine', ipAddress: '10.0.3.31', region: 'NA-West-2', status: 'Online', cpuUsage: 25, memUsage: 15 },
];

export function ServersManager() {
  return (
    <QueryProvider>
      <ServersManagerInner />
    </QueryProvider>
  );
}

function ServersManagerInner() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ servers: ServerNode[] }>({
    queryKey: ['servers'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/servers');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { servers: MOCK_SERVERS };
      }
    },
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Infrastructure Nodes</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Real-time telemetry and management for the global VoIP cluster.</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Provision Node
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Infrastructure...</span>
            </div>
          </div>
        ) : data?.servers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300">
            <span className="text-sm font-bold uppercase tracking-widest">No Servers Found</span>
          </div>
        ) : (
          data?.servers.map((node) => (
            <div key={node.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${node.status === 'Online' ? 'bg-emerald-500' : node.status === 'Degraded' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 transition-colors">{node.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono uppercase tracking-widest">{node.ipAddress}</span>
                    <span className="text-slate-200">•</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{node.region}</span>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                  node.status === 'Online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                  node.status === 'Degraded' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                  'bg-rose-50 text-rose-600 border border-rose-100'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    node.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 
                    node.status === 'Degraded' ? 'bg-amber-500' : 
                    'bg-rose-500'
                  }`}></div>
                  {node.status}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Service Architecture</span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-white dark:bg-slate-800 px-2 py-1 rounded-lg border border-indigo-50">{node.type}</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Compute Load</span>
                      <span className={`text-[10px] font-bold ${node.cpuUsage > 80 ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>{node.cpuUsage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-[1px]">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${node.cpuUsage > 80 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${node.cpuUsage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2 px-1">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Memory Commit</span>
                      <span className={`text-[10px] font-bold ${node.memUsage > 80 ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>{node.memUsage}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-[1px]">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${node.memUsage > 80 ? 'bg-rose-500' : 'bg-sky-500'}`} 
                        style={{ width: `${node.memUsage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-all">
                    Telemetry
                  </button>
                  <button className="flex-1 py-3 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-rose-100 hover:text-rose-500 hover:bg-rose-50 transition-all">
                    Restart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
