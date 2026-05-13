import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';
import { Drawer } from './ui/Drawer';
import { FormField, Input } from './ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type Subscriber = {
  id: number;
  accountId: number;
  extensionId: number;
  defaultDid: string;
  username: string;
  domain: string;
};

const subscriberSchema = z.object({
  accountId: z.coerce.number().min(1, "Account ID is required"),
  extensionId: z.coerce.number().min(1, "Extension ID is required"),
  defaultDid: z.string().min(10, "Valid DID pattern required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  domain: z.string().min(5, "Domain is required"),
  password: z.string().optional(),
});
type SubscriberFormData = z.infer<typeof subscriberSchema>;

const MOCK_SUBSCRIBERS: Subscriber[] = [
  { id: 1, accountId: 101, extensionId: 1001, defaultDid: '+1 (416) 555-0198', username: 'alice_sip', domain: 'sip.iqfone.com' },
  { id: 2, accountId: 101, extensionId: 1002, defaultDid: '+1 (416) 555-0199', username: 'bob_dev', domain: 'sip.iqfone.com' },
  { id: 3, accountId: 102, extensionId: 2001, defaultDid: '+1 (800) 555-0100', username: 'reception_front', domain: 'sip.iqfone.com' },
  { id: 4, accountId: 103, extensionId: 3010, defaultDid: '+44 20 7123 4567', username: 'uk_office_main', domain: 'sip.iqfone.com' },
  { id: 5, accountId: 104, extensionId: 4001, defaultDid: '+1 (212) 555-0987', username: 'exec_line_01', domain: 'sip.iqfone.com' },
  { id: 6, accountId: 105, extensionId: 5001, defaultDid: '+1 (310) 555-7788', username: 'warehouse_01', domain: 'sip.iqfone.com' },
  { id: 7, accountId: 105, extensionId: 5002, defaultDid: '+1 (310) 555-7789', username: 'warehouse_02', domain: 'sip.iqfone.com' },
  { id: 8, accountId: 101, extensionId: 1003, defaultDid: '+1 (416) 555-0200', username: 'charlie_sales', domain: 'sip.iqfone.com' },
];

export function SubscribersManager() {
  return (
    <QueryProvider>
      <SubscribersManagerInner />
    </QueryProvider>
  );
}

function SubscribersManagerInner() {
  const queryClient = useQueryClient();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SubscriberFormData>({
    resolver: zodResolver(subscriberSchema),
    defaultValues: { accountId: undefined, extensionId: undefined, defaultDid: '', username: '', domain: 'sip.iqfone.com', password: '' }
  });

  const { data, isLoading } = useQuery<{ subscribers: Subscriber[] }>({
    queryKey: ['subscribers'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/subscribers');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { subscribers: MOCK_SUBSCRIBERS };
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSub: SubscriberFormData) => {
      const res = await fetch('http://127.0.0.1:8787/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSub),
      });
      if (!res.ok) throw new Error('Failed to create subscriber');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setIsDrawerOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (sub: SubscriberFormData & { id: number }) => {
      const res = await fetch(`http://127.0.0.1:8787/subscribers/${sub.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (!res.ok) throw new Error('Failed to update subscriber');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setIsDrawerOpen(false);
      setEditingId(null);
      reset();
    },
  });

  const onSubmit = (formData: SubscriberFormData) => {
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (sub: Subscriber) => {
    reset({
      accountId: sub.accountId,
      extensionId: sub.extensionId,
      defaultDid: sub.defaultDid,
      username: sub.username,
      domain: sub.domain,
      password: ''
    });
    setEditingId(sub.id);
    setIsDrawerOpen(true);
  };

  const openCreate = () => {
    reset({ accountId: undefined, extensionId: undefined, defaultDid: '', username: '', domain: 'sip.iqfone.com', password: '' });
    setEditingId(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Subscribers</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage global SIP registration credentials and user-level routing.</p>
        </div>
        <button 
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group"
          onClick={openCreate}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add Subscriber
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Subscriber Identity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Parent Account</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Extension / DID Mapping</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Network Domain</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Fetching SIP Database...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300">
                    <span className="text-sm font-bold uppercase tracking-widest">No Active Subscribers Found</span>
                  </td>
                </tr>
              ) : (
                data?.subscribers.map((sub) => (
                  <tr key={sub.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-transparent transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                          {sub.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{sub.username}</div>
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">System ID: {sub.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">#{sub.accountId}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-indigo-600 font-mono tracking-tight">{sub.extensionId}</span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">{sub.defaultDid}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-slate-100 dark:border-slate-700">
                        {sub.domain}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        className="px-4 py-2 text-indigo-600 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-50 rounded-xl transition-all"
                        onClick={() => openEdit(sub)}
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

      <Drawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        title={editingId ? 'Edit Subscriber' : 'Provision Subscriber'}
        description="Configure SIP user credentials and routing mappings."
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
              {createMutation.isPending || updateMutation.isPending ? 'Processing...' : (editingId ? 'Apply Changes' : 'Authorize Subscriber')}
            </button>
          </div>
        }
      >
        <form id="subscriber-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 pt-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Routing Link</h4>
            <div className="space-y-4">
              <FormField label="Account ID" error={errors.accountId} required>
                <Input type="number" {...register('accountId')} placeholder="e.g. 101" className="font-mono" error={!!errors.accountId} />
              </FormField>
              <FormField label="Extension ID" error={errors.extensionId} required>
                <Input type="number" {...register('extensionId')} placeholder="e.g. 1001" className="font-mono" error={!!errors.extensionId} />
              </FormField>
              <FormField label="Default DID" error={errors.defaultDid} required>
                <Input type="text" {...register('defaultDid')} placeholder="+1 (xxx) xxx-xxxx" className="font-mono" error={!!errors.defaultDid} />
              </FormField>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest border-t border-slate-100 dark:border-slate-700 pt-6">SIP Credentials</h4>
            <div className="space-y-4">
              <FormField label="SIP Username" error={errors.username} required>
                <Input type="text" {...register('username')} placeholder="e.g. alice_sip" error={!!errors.username} />
              </FormField>
              <FormField label="Network Domain" error={errors.domain} required>
                <Input type="text" {...register('domain')} placeholder="sip.iqfone.com" error={!!errors.domain} />
              </FormField>
              <FormField label="SIP Password" description={editingId ? "Leave blank to keep current password" : "Required for initial provision"} error={errors.password} required={!editingId}>
                <Input type="password" {...register('password')} placeholder="••••••••••••" error={!!errors.password} />
              </FormField>
            </div>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
