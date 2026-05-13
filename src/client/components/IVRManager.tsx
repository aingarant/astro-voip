import React, { useState } from 'react';

type IVRMenu = {
  id: number;
  name: string;
  tenant: string;
  greeting: string;
  optionsCount: number;
  status: 'Active' | 'Draft' | 'Disabled';
};

const MOCK_IVRS: IVRMenu[] = [
  { id: 1, name: 'Main Corporate Menu', tenant: 'acme.com', greeting: 'welcome-acme.wav', optionsCount: 4, status: 'Active' },
  { id: 2, name: 'After Hours Attendant', tenant: 'acme.com', greeting: 'after-hours.wav', optionsCount: 2, status: 'Active' },
  { id: 3, name: 'Support Queue Intro', tenant: 'techcorp.net', greeting: 'support-intro.wav', optionsCount: 3, status: 'Active' },
  { id: 4, name: 'Holiday Special', tenant: 'globalretail.com', greeting: 'holiday-2026.wav', optionsCount: 5, status: 'Draft' },
  { id: 5, name: 'Billing IVR', tenant: 'acme.com', greeting: 'tts-billing-greeting', optionsCount: 3, status: 'Disabled' },
];

export function IVRManager() {
  const [activeTab, setActiveTab] = useState<'menus' | 'prompts'>('menus');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Interactive Voice Response (IVR)</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Design auto-attendants, call flows, and manage voice prompts.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            Prompt Library
          </button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
            Create IVR Menu
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="border-b border-slate-100 dark:border-slate-700 px-8 py-4 flex gap-6">
          <button 
            className={`text-sm font-bold pb-4 border-b-2 -mb-[17px] transition-colors ${activeTab === 'menus' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('menus')}
          >
            Configured Menus
          </button>
          <button 
            className={`text-sm font-bold pb-4 border-b-2 -mb-[17px] transition-colors ${activeTab === 'prompts' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
            onClick={() => setActiveTab('prompts')}
          >
            System Prompts
          </button>
        </div>

        {activeTab === 'menus' && (
          <div className="overflow-x-auto p-4 sm:p-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {MOCK_IVRS.map((ivr) => (
                <div key={ivr.id} className="group border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6b2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2b2 2 0 00-2 2v4a2 2 0 002 2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{ivr.name}</h3>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono tracking-widest">{ivr.tenant}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${
                      ivr.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                      ivr.status === 'Draft' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                      'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        ivr.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 
                        ivr.status === 'Draft' ? 'bg-amber-500' : 
                        'bg-slate-400'
                      }`}></div>
                      {ivr.status}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Entry Greeting</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono truncate max-w-[150px] sm:max-w-none">{ivr.greeting}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Key Press Actions</span>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg">
                        {ivr.optionsCount} Configured
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6">
                    <button className="flex-[2] py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all">
                      Edit Flow
                    </button>
                    <button className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all">
                      Clone
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="p-8 text-center py-20">
            <div className="w-16 h-16 mx-auto bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Prompt Library Coming Soon</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-sm">Upload, record, and manage text-to-speech AI voice prompts for all IVR menus in this module.</p>
          </div>
        )}
      </div>
    </div>
  );
}
