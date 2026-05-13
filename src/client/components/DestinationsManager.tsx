import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Modal } from './ui/Modal';
import { FormField, Input, Select } from './ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type Destination = {
  id: number;
  pattern: string;
  type: 'Extension' | 'IVR' | 'Ring Group' | 'Voicemail';
  target: string;
  priority: number;
};

const destinationSchema = z.object({
  pattern: z.string().min(1, "Pattern is required"),
  type: z.enum(['Extension', 'IVR', 'Ring Group', 'Voicemail']),
  target: z.string().min(1, "Target destination is required"),
  priority: z.coerce.number().min(1, "Priority is required"),
});
type DestinationFormData = z.infer<typeof destinationSchema>;

const MOCK_DESTINATIONS: Destination[] = [
  { id: 1, pattern: '^18005550100$', type: 'IVR', target: 'Main Auto Attendant', priority: 10 },
  { id: 2, pattern: '^18005550101$', type: 'Ring Group', target: 'Sales Queue', priority: 20 },
  { id: 3, pattern: '^18005550102$', type: 'Extension', target: 'Ext 101 (CEO)', priority: 30 },
  { id: 4, pattern: '.*', type: 'Voicemail', target: 'General Delivery', priority: 999 },
];

export function DestinationsManager() {
  return (
    <QueryProvider>
      <DestinationsManagerInner />
    </QueryProvider>
  );
}

function DestinationsManagerInner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DestinationFormData>({
    resolver: zodResolver(destinationSchema),
    defaultValues: { pattern: '', type: 'Extension', target: '', priority: 100 }
  });

  const { data, isLoading } = useQuery<{ destinations: Destination[] }>({
    queryKey: ['destinations'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/destinations');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { destinations: MOCK_DESTINATIONS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newDest: DestinationFormData) => {
      const res = await fetch('http://127.0.0.1:8787/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDest),
      });
      if (!res.ok) throw new Error('Failed to create destination');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (dest: DestinationFormData & { id: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/destinations/${dest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dest),
      });
      if (!res.ok) throw new Error('Failed to update destination');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destinations'] });
      setIsModalOpen(false);
      setEditingId(null);
      reset();
    },
  });

  const onSubmit = (formData: DestinationFormData) => {
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (dest: Destination) => {
    reset({
      pattern: dest.pattern,
      type: dest.type,
      target: dest.target,
      priority: dest.priority
    });
    setEditingId(dest.id);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    reset({ pattern: '', type: 'Extension', target: '', priority: 100 });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inbound Destinations</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Route incoming DID patterns to internal endpoints.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          onClick={openCreate}
        >
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Routes...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.destinations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300">
                    <span className="text-sm font-bold uppercase tracking-widest">No Routes Found</span>
                  </td>
                </tr>
              ) : (
                data?.destinations.map((dest) => (
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
                      <button 
                        className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
                        onClick={() => openEdit(dest)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Route' : 'Add Route'}
        footer={
          <div className="flex gap-4 w-full">
            <button 
              type="button" 
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit(onSubmit)}
              className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingId ? 'Save Changes' : 'Create Route')}
            </button>
          </div>
        }
      >
        <form id="destination-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField label="Routing Priority" error={errors.priority} required description="Lower number means higher priority.">
            <Input type="number" {...register('priority')} placeholder="100" className="font-mono" error={!!errors.priority} />
          </FormField>
          
          <FormField label="Match Pattern" error={errors.pattern} required description="Regex pattern to match the incoming DID.">
            <Input {...register('pattern')} placeholder="^18005550100$" className="font-mono" error={!!errors.pattern} />
          </FormField>
          
          <FormField label="Target Type" error={errors.type} required>
            <Select 
              {...register('type')} 
              options={[
                { label: 'Extension', value: 'Extension' },
                { label: 'IVR Menu', value: 'IVR' },
                { label: 'Ring Group', value: 'Ring Group' },
                { label: 'Voicemail', value: 'Voicemail' },
              ]}
              error={!!errors.type} 
            />
          </FormField>
          
          <FormField label="Destination Target" error={errors.target} required description="Name or identifier of the endpoint.">
            <Input {...register('target')} placeholder="e.g. Main Auto Attendant" error={!!errors.target} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
