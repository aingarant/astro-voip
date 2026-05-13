import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Drawer } from './ui/Drawer';
import { FormField, Input, Select } from './ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type Trunk = {
  id: number;
  name: string;
  host: string;
  port: number;
  status: 'Online' | 'Offline' | 'Degraded';
  activeCalls: number;
  maxCalls: number;
};

const trunkSchema = z.object({
  name: z.string().min(2, "Trunk name is required"),
  host: z.string().min(2, "Host/IP is required"),
  port: z.coerce.number().min(1, "Port is required").max(65535),
  maxCalls: z.coerce.number().min(1, "Max calls must be at least 1"),
  status: z.enum(['Online', 'Offline', 'Degraded']),
});
type TrunkFormData = z.infer<typeof trunkSchema>;

const MOCK_TRUNKS: Trunk[] = [
  { id: 1, name: 'Primary SIP Trunk', host: 'sip.provider.com', port: 5060, status: 'Online', activeCalls: 14, maxCalls: 50 },
  { id: 2, name: 'Backup EU Trunk', host: 'eu.provider.com', port: 5061, status: 'Online', activeCalls: 2, maxCalls: 50 },
  { id: 3, name: 'Legacy T1 Gateway', host: '10.0.5.100', port: 5060, status: 'Degraded', activeCalls: 20, maxCalls: 24 },
  { id: 4, name: 'Toll-Free Inbound', host: 'tf.provider.com', port: 5060, status: 'Online', activeCalls: 8, maxCalls: 100 },
];

export function TrunksManager() {
  return (
    <QueryProvider>
      <TrunksManagerInner />
    </QueryProvider>
  );
}

function TrunksManagerInner() {
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TrunkFormData>({
    resolver: zodResolver(trunkSchema),
    defaultValues: { name: '', host: '', port: 5060, maxCalls: 50, status: 'Offline' }
  });

  const { data, isLoading } = useQuery<{ trunks: Trunk[] }>({
    queryKey: ['trunks'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/trunks');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { trunks: MOCK_TRUNKS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newTrunk: TrunkFormData) => {
      const res = await fetch('http://127.0.0.1:8787/trunks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTrunk, activeCalls: 0 }),
      });
      if (!res.ok) throw new Error('Failed to create trunk');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trunks'] });
      setIsDrawerOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (trunk: TrunkFormData & { id: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/trunks/${trunk.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trunk),
      });
      if (!res.ok) throw new Error('Failed to update trunk');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trunks'] });
      setIsDrawerOpen(false);
      setEditingId(null);
      reset();
    },
  });

  const onSubmit = (formData: TrunkFormData) => {
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (trunk: Trunk) => {
    reset({
      name: trunk.name,
      host: trunk.host,
      port: trunk.port,
      maxCalls: trunk.maxCalls,
      status: trunk.status
    });
    setEditingId(trunk.id);
    setIsDrawerOpen(true);
  };

  const openCreate = () => {
    reset({ name: '', host: '', port: 5060, maxCalls: 50, status: 'Offline' });
    setEditingId(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SIP Trunks</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage inbound and outbound PSTN connectivity.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          onClick={openCreate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Add Trunk
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Trunks...</span>
            </div>
          </div>
        ) : data?.trunks.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300">
            <span className="text-sm font-bold uppercase tracking-widest">No Trunks Found</span>
          </div>
        ) : (
          data?.trunks.map((trunk) => (
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
                  <button 
                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-all"
                    onClick={() => openEdit(trunk)}
                  >
                    Configure
                  </button>
                  <button className="flex-1 py-3 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                    View Metrics
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? 'Edit SIP Trunk' : 'Add SIP Trunk'}
        description="Configure outbound connection parameters and capacity limits."
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
              {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingId ? 'Save Changes' : 'Create Trunk')}
            </button>
          </div>
        }
      >
        <form id="trunk-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField label="Trunk Name" error={errors.name} required>
            <Input {...register('name')} placeholder="e.g. Primary SIP Provider" error={!!errors.name} />
          </FormField>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormField label="Host / IP" error={errors.host} required>
                <Input {...register('host')} placeholder="e.g. sip.provider.com" className="font-mono" error={!!errors.host} />
              </FormField>
            </div>
            <div>
              <FormField label="Port" error={errors.port} required>
                <Input type="number" {...register('port')} placeholder="5060" className="font-mono" error={!!errors.port} />
              </FormField>
            </div>
          </div>
          
          <FormField label="Maximum Concurrent Calls" error={errors.maxCalls} required description="Channel capacity limits.">
            <Input type="number" {...register('maxCalls')} placeholder="50" error={!!errors.maxCalls} />
          </FormField>
          
          <FormField label="Initial Status" error={errors.status} required>
            <Select 
              {...register('status')} 
              options={[
                { label: 'Online', value: 'Online' },
                { label: 'Degraded', value: 'Degraded' },
                { label: 'Offline', value: 'Offline' },
              ]}
              error={!!errors.status} 
            />
          </FormField>
        </form>
      </Drawer>
    </div>
  );
}
