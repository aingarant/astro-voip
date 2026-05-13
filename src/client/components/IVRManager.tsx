import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Drawer } from './ui/Drawer';
import { FormField, Input, Select } from './ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type IVRMenu = {
  id: number;
  name: string;
  tenant: string;
  greeting: string;
  optionsCount: number;
  status: 'Active' | 'Draft' | 'Disabled';
};

const ivrSchema = z.object({
  name: z.string().min(2, "Menu name is required"),
  tenant: z.string().min(2, "Tenant identifier is required"),
  greeting: z.string().min(2, "Greeting file or text is required"),
  status: z.enum(['Active', 'Draft', 'Disabled']),
});
type IVRFormData = z.infer<typeof ivrSchema>;

const MOCK_IVRS: IVRMenu[] = [
  { id: 1, name: 'Main Corporate Menu', tenant: 'acme.com', greeting: 'welcome-acme.wav', optionsCount: 4, status: 'Active' },
  { id: 2, name: 'After Hours Attendant', tenant: 'acme.com', greeting: 'after-hours.wav', optionsCount: 2, status: 'Active' },
  { id: 3, name: 'Support Queue Intro', tenant: 'techcorp.net', greeting: 'support-intro.wav', optionsCount: 3, status: 'Active' },
  { id: 4, name: 'Holiday Special', tenant: 'globalretail.com', greeting: 'holiday-2026.wav', optionsCount: 5, status: 'Draft' },
  { id: 5, name: 'Billing IVR', tenant: 'acme.com', greeting: 'tts-billing-greeting', optionsCount: 3, status: 'Disabled' },
];

export function IVRManager() {
  return (
    <QueryProvider>
      <IVRManagerInner />
    </QueryProvider>
  );
}

function IVRManagerInner() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'menus' | 'prompts'>('menus');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<IVRFormData>({
    resolver: zodResolver(ivrSchema),
    defaultValues: { name: '', tenant: '', greeting: '', status: 'Draft' }
  });

  const { data, isLoading } = useQuery<{ ivrs: IVRMenu[] }>({
    queryKey: ['ivrs'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/ivrs');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { ivrs: MOCK_IVRS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newIvr: IVRFormData) => {
      const res = await fetch('http://127.0.0.1:8787/ivrs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newIvr, optionsCount: 0 }),
      });
      if (!res.ok) throw new Error('Failed to create IVR');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivrs'] });
      setIsDrawerOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (ivr: IVRFormData & { id: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/ivrs/${ivr.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ivr),
      });
      if (!res.ok) throw new Error('Failed to update IVR');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ivrs'] });
      setIsDrawerOpen(false);
      setEditingId(null);
      reset();
    },
  });

  const onSubmit = (formData: IVRFormData) => {
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (ivr: IVRMenu) => {
    reset({
      name: ivr.name,
      tenant: ivr.tenant,
      greeting: ivr.greeting,
      status: ivr.status
    });
    setEditingId(ivr.id);
    setIsDrawerOpen(true);
  };

  const openCreate = () => {
    reset({ name: '', tenant: '', greeting: '', status: 'Draft' });
    setEditingId(null);
    setIsDrawerOpen(true);
  };

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
          <button 
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
            onClick={openCreate}
          >
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
              {isLoading ? (
                <div className="col-span-full py-20 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Menus...</span>
                  </div>
                </div>
              ) : data?.ivrs.length === 0 ? (
                <div className="col-span-full py-20 text-center text-slate-300">
                  <span className="text-sm font-bold uppercase tracking-widest">No Menus Found</span>
                </div>
              ) : (
                data?.ivrs.map((ivr) => (
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
                      <button 
                        className="flex-[2] py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
                        onClick={() => openEdit(ivr)}
                      >
                        Edit Configuration
                      </button>
                      <button className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all">
                        Flow Editor
                      </button>
                    </div>
                  </div>
                ))
              )}
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

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? 'Edit IVR Menu' : 'Create IVR Menu'}
        description="Configure the entry point and greeting for your auto-attendant."
        footer={
          <div className="flex gap-4 w-full">
            <button 
              type="button" 
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              onClick={() => setIsDrawerOpen(false)}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingId ? 'Save Changes' : 'Initialize IVR')}
            </button>
          </div>
        }
      >
        <form id="ivr-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField label="Menu Name" error={errors.name} required>
            <Input {...register('name')} placeholder="e.g. Main Corporate Menu" error={!!errors.name} />
          </FormField>
          
          <FormField label="Tenant Identifier" error={errors.tenant} required>
            <Input {...register('tenant')} placeholder="e.g. acme.com" className="font-mono" error={!!errors.tenant} />
          </FormField>
          
          <FormField label="Entry Greeting" error={errors.greeting} required description="WAV file from Prompt Library or direct TTS string.">
            <Input {...register('greeting')} placeholder="e.g. welcome-acme.wav" error={!!errors.greeting} />
          </FormField>
          
          <FormField label="Status" error={errors.status} required>
            <Select 
              {...register('status')} 
              options={[
                { label: 'Active - Handling Calls', value: 'Active' },
                { label: 'Draft - Configuration Phase', value: 'Draft' },
                { label: 'Disabled - Offline', value: 'Disabled' },
              ]}
              error={!!errors.status} 
            />
          </FormField>
        </form>
      </Drawer>
    </div>
  );
}
