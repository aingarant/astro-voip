import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Modal } from './ui/Modal';
import { FormField, Input } from './ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type VoicemailBox = {
  id: number;
  extension: string;
  owner: string;
  newMessages: number;
  totalMessages: number;
  quotaPercent: number;
};

const voicemailSchema = z.object({
  extension: z.string().min(1, "Extension is required"),
  owner: z.string().min(2, "Owner name is required"),
  quotaPercent: z.coerce.number().min(0).max(100),
});
type VoicemailFormData = z.infer<typeof voicemailSchema>;

const MOCK_VOICEMAILS: VoicemailBox[] = [
  { id: 1, extension: '101', owner: 'Alice Smith', newMessages: 3, totalMessages: 15, quotaPercent: 10 },
  { id: 2, extension: '102', owner: 'Bob Johnson', newMessages: 0, totalMessages: 45, quotaPercent: 30 },
  { id: 3, extension: '103', owner: 'Charlie Brown', newMessages: 12, totalMessages: 140, quotaPercent: 95 },
  { id: 4, extension: '200', owner: 'Sales General', newMessages: 5, totalMessages: 20, quotaPercent: 15 },
];

export function VoicemailManager() {
  return (
    <QueryProvider>
      <VoicemailManagerInner />
    </QueryProvider>
  );
}

function VoicemailManagerInner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VoicemailFormData>({
    resolver: zodResolver(voicemailSchema),
    defaultValues: { extension: '', owner: '', quotaPercent: 10 }
  });

  const { data, isLoading } = useQuery<{ voicemails: VoicemailBox[] }>({
    queryKey: ['voicemails'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/voicemails');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { voicemails: MOCK_VOICEMAILS };
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (vm: VoicemailFormData & { id: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/voicemails/${vm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vm),
      });
      if (!res.ok) throw new Error('Failed to update voicemail');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voicemails'] });
      setIsModalOpen(false);
      setEditingId(null);
      reset();
    },
  });

  const onSubmit = (formData: VoicemailFormData) => {
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    }
  };

  const openEdit = (vm: VoicemailBox) => {
    reset({
      extension: vm.extension,
      owner: vm.owner,
      quotaPercent: vm.quotaPercent
    });
    setEditingId(vm.id);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Voicemail Boxes</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage user voicemail inboxes, messages, and storage quotas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Voicemails...</span>
            </div>
          </div>
        ) : data?.voicemails.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-300">
            <span className="text-sm font-bold uppercase tracking-widest">No Mailboxes Found</span>
          </div>
        ) : (
          data?.voicemails.map((vm) => (
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
                  <button 
                    className="flex-1 py-3 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-600 dark:bg-slate-700 transition-all"
                    onClick={() => openEdit(vm)}
                  >
                    Settings
                  </button>
                  <button className="flex-1 py-3 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-indigo-100 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                    View Inbox
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Mailbox Settings"
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
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        }
      >
        <form id="voicemail-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField label="Extension" error={errors.extension} required>
            <Input {...register('extension')} disabled className="opacity-50 font-mono" error={!!errors.extension} />
          </FormField>
          
          <FormField label="Mailbox Owner" error={errors.owner} required>
            <Input {...register('owner')} placeholder="e.g. Alice Smith" error={!!errors.owner} />
          </FormField>
          
          <FormField label="Storage Quota Penalty (%)" error={errors.quotaPercent} required description="Simulate storage usage out of 100%.">
            <Input type="number" {...register('quotaPercent')} placeholder="10" error={!!errors.quotaPercent} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
