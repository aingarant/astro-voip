import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Subscriber = {
  id: number;
  accountId: number;
  extensionId: number;
  defaultDid: string;
  username: string;
  domain: string;
};

export function SubscribersManager() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: '',
    extensionId: '',
    defaultDid: '',
    username: '',
    domain: '',
    password: ''
  });

  const { data, isLoading } = useQuery<{ subscribers: Subscriber[] }>({
    queryKey: ['subscribers'],
    queryFn: async () => {
      const res = await fetch('http://127.0.0.1:8787/subscribers');
      if (!res.ok) throw new Error('Failed to fetch subscribers');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newSub: typeof formData) => {
      const res = await fetch('http://127.0.0.1:8787/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSub,
          accountId: parseInt(newSub.accountId),
          extensionId: parseInt(newSub.extensionId),
        }),
      });
      if (!res.ok) throw new Error('Failed to create subscriber');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
      setIsModalOpen(false);
      setFormData({ accountId: '', extensionId: '', defaultDid: '', username: '', domain: '', password: '' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Subscribers</h2>
          <p className="text-sm text-base-content/60 mt-1">Manage users and SIP registrations</p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-primary/30" onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
          Add Subscriber
        </button>
      </div>

      <div className="card bg-base-100 border border-base-content/5 shadow-xl shadow-base-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs tracking-wider">
              <tr>
                <th className="font-semibold">Subscriber</th>
                <th className="font-semibold">Account ID</th>
                <th className="font-semibold">Ext / DID</th>
                <th className="font-semibold">Domain</th>
                <th className="font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </td>
                </tr>
              ) : data?.subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-base-content/50">No subscribers found</td>
                </tr>
              ) : (
                data?.subscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-base-200/50 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-10">
                            <span className="text-xs">{sub.username.substring(0, 2).toUpperCase()}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{sub.username}</div>
                          <div className="text-xs opacity-50">ID: {sub.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-base-content/70">#{sub.accountId}</td>
                    <td>
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-primary">{sub.extensionId}</span>
                        <span className="text-xs text-base-content/50">{sub.defaultDid}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-ghost">{sub.domain}</span></td>
                    <td className="text-right">
                      <button className="btn btn-sm btn-ghost text-base-content/70 hover:text-primary">
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

      <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-2xl">
          <h3 className="font-bold text-lg mb-4">New Subscriber</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Account ID</span></label>
                <input
                  type="number"
                  required
                  className="input input-bordered w-full"
                  value={formData.accountId}
                  onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Extension ID</span></label>
                <input
                  type="number"
                  required
                  className="input input-bordered w-full"
                  value={formData.extensionId}
                  onChange={(e) => setFormData({ ...formData, extensionId: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Default DID</span></label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full"
                  value={formData.defaultDid}
                  onChange={(e) => setFormData({ ...formData, defaultDid: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Username</span></label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Domain</span></label>
                <input
                  type="text"
                  required
                  className="input input-bordered w-full"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Password</span></label>
                <input
                  type="password"
                  required
                  className="input input-bordered w-full"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={createMutation.isPending}>
                {createMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : 'Save'}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
}
