import React from 'react';

type VoicemailBox = {
  id: number;
  extension: string;
  owner: string;
  newMessages: number;
  totalMessages: number;
  quotaPercent: number;
};

const MOCK_VOICEMAILS: VoicemailBox[] = [
  { id: 1, extension: '101', owner: 'Alice Smith', newMessages: 3, totalMessages: 15, quotaPercent: 10 },
  { id: 2, extension: '102', owner: 'Bob Johnson', newMessages: 0, totalMessages: 45, quotaPercent: 30 },
  { id: 3, extension: '103', owner: 'Charlie Brown', newMessages: 12, totalMessages: 140, quotaPercent: 95 },
  { id: 4, extension: '200', owner: 'Sales General', newMessages: 5, totalMessages: 20, quotaPercent: 15 },
];

export function VoicemailManager() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Voicemail Boxes</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage user voicemail inboxes, messages, and storage quotas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MOCK_VOICEMAILS.map((vm) => (
          <div key={vm.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-700 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {vm.extension}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{vm.owner}</h3>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mailbox {vm.extension}</span>
                </div>
              </div>
              {vm.newMessages > 0 && (
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
                  {vm.newMessages}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Messages</span>
                <span className="text-[12px] font-bold text-slate-900 dark:text-white">{vm.totalMessages} stored</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <span className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-widest">Storage Quota</span>
                  <span className={`text-[10px] font-bold ${vm.quotaPercent > 90 ? 'text-rose-600' : 'text-slate-600 dark:text-slate-400'}`}>{vm.quotaPercent}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden p-[1px]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${vm.quotaPercent > 90 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                    style={{ width: `${vm.quotaPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-all">
                  Settings
                </button>
                <button className="flex-1 py-3 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                  View Inbox
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
