import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Modal } from './ui/Modal';
import { FormField, Input, Select } from './ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type PhoneNumber = {
  id: number;
  number: string;
  provider: string;
  accountId: number;
  status: 'Active' | 'Inactive' | 'Porting';
  type: 'Local' | 'Toll-Free' | 'International';
};

const numberSchema = z.object({
  number: z.string().min(10, "Valid E.164 number required"),
  provider: z.string().min(2, "Provider is required"),
  accountId: z.coerce.number().min(1, "Account ID is required"),
  type: z.enum(['Local', 'Toll-Free', 'International']),
});
type NumberFormData = z.infer<typeof numberSchema>;

const MOCK_NUMBERS: PhoneNumber[] = [
  { id: 1, number: '+1 (416) 555-0198', provider: 'Twilio', accountId: 101, status: 'Active', type: 'Local' },
  { id: 2, number: '+1 (800) 555-0199', provider: 'Bandwidth', accountId: 101, status: 'Active', type: 'Toll-Free' },
  { id: 3, number: '+1 (647) 555-0200', provider: 'Twilio', accountId: 102, status: 'Porting', type: 'Local' },
  { id: 4, number: '+44 20 7123 4567', provider: 'Telnyx', accountId: 103, status: 'Inactive', type: 'International' },
  { id: 5, number: '+1 (212) 555-0987', provider: 'Telnyx', accountId: 104, status: 'Active', type: 'Local' },
  { id: 6, number: '+1 (888) 123-4567', provider: 'Twilio', accountId: 105, status: 'Active', type: 'Toll-Free' },
  { id: 7, number: '+33 1 70 38 00 00', provider: 'Colt', accountId: 106, status: 'Active', type: 'International' },
  { id: 8, number: '+1 (604) 555-1234', provider: 'Flowroute', accountId: 107, status: 'Porting', type: 'Local' },
];

export function NumbersManager() {
  return (
    <QueryProvider>
      <NumbersManagerInner />
    </QueryProvider>
  );
}

function NumbersManagerInner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<NumberFormData>({
    resolver: zodResolver(numberSchema),
    defaultValues: { number: '', provider: '', accountId: undefined, type: 'Local' }
  });

  const { data, isLoading } = useQuery<{ numbers: PhoneNumber[] }>({
    queryKey: ['numbers'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/numbers');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { numbers: MOCK_NUMBERS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newNum: NumberFormData) => {
      const res = await fetch('http://127.0.0.1:8787/numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNum),
      });
      if (!res.ok) throw new Error('Failed to create number');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numbers'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (num: NumberFormData & { id: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/numbers/${num.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(num),
      });
      if (!res.ok) throw new Error('Failed to update number');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['numbers'] });
      setIsModalOpen(false);
      setEditingId(null);
      reset();
    },
  });

  const onSubmit = (formData: NumberFormData) => {
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (num: PhoneNumber) => {
    reset({
      number: num.number,
      provider: num.provider,
      accountId: num.accountId,
      type: num.type
    });
    setEditingId(num.id);
    setIsModalOpen(true);
  };

  const openCreate = () => {
    reset({ number: '', provider: '', accountId: undefined, type: 'Local' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Phone Numbers</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage DIDs, porting requests, and global numbering assets.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          onClick={openCreate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Provision New Number
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Phone Number</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Classification</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Carrier / Provider</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Account Linked</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">State</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Phone Numbers...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.numbers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-300">
                    <span className="text-sm font-bold uppercase tracking-widest">No Active Numbers Found</span>
                  </td>
                </tr>
              ) : (
                data?.numbers.map((num) => (
                  <tr key={num.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-transparent transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{num.number}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">ID: #{num.id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${num.type === 'Toll-Free' ? 'bg-rose-50 text-rose-600' : num.type === 'Local' ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-sky-50 text-sky-600'}`}>
                        {num.type}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[8px] font-bold text-slate-400 dark:text-slate-500">
                          {num.provider.substring(0, 1).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{num.provider}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 font-mono">#{num.accountId}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${num.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : num.status === 'Porting' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${num.status === 'Active' ? 'bg-emerald-500 animate-pulse' : num.status === 'Porting' ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                        {num.status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
                        onClick={() => openEdit(num)}
                      >
                        Configure
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
        title={editingId ? 'Edit Asset' : 'Provision New Asset'}
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
              {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingId ? 'Save Changes' : 'Provision Number')}
            </button>
          </div>
        }
      >
        <form id="number-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <FormField label="Phone Number (E.164)" error={errors.number} required>
            <Input {...register('number')} placeholder="+1 (xxx) xxx-xxxx" className="font-mono" error={!!errors.number} />
          </FormField>
          
          <div className="grid grid-cols-2 gap-6">
            <FormField label="Classification" error={errors.type} required>
              <Select 
                {...register('type')} 
                options={[
                  { label: 'Local', value: 'Local' },
                  { label: 'Toll-Free', value: 'Toll-Free' },
                  { label: 'International', value: 'International' },
                ]}
                error={!!errors.type} 
              />
            </FormField>
            
            <FormField label="Carrier Provider" error={errors.provider} required>
              <Input {...register('provider')} placeholder="e.g. Twilio" error={!!errors.provider} />
            </FormField>
          </div>
          
          <FormField label="Parent Account ID" error={errors.accountId} required>
            <Input type="number" {...register('accountId')} placeholder="Enter system ID" className="font-mono" error={!!errors.accountId} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
