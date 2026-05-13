import React, { useState } from 'react';
import { useCreateSubscriber, useSubscribers, useUpdateSubscriber } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type Subscriber = {
  id: number;
  accountId: number;
  extensionId: string;
  defaultDid: string;
  username: string;
  domain: string;
};

export function SubscribersManager() {
  return (
    <AppProviders>
      <SubscribersManagerInner />
    </AppProviders>
  );
}

function SubscribersManagerInner() {
  const { data, isLoading, isError, error, refetch } = useSubscribers();
  const createMutation = useCreateSubscriber<{
    accountId: number;
    extensionId: string;
    defaultDid: string;
    username: string;
    domain: string;
    password?: string;
  }>();
  const updateMutation = useUpdateSubscriber<{
    id: number;
    accountId: number;
    extensionId: string;
    defaultDid: string;
    username: string;
    domain: string;
    password?: string;
  }>();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    accountId: 1,
    extensionId: '',
    defaultDid: '',
    username: '',
    domain: 'sip.iqfone.com',
    password: '',
  });

  const subscribers = data?.subscribers ?? [];
  const pending = createMutation.isPending || updateMutation.isPending;

  const submit = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ ...form, id: editingId });
        showToast('Subscriber updated', 'success');
      } else {
        await createMutation.mutateAsync(form);
        showToast('Subscriber created', 'success');
      }
      setOpen(false);
      setEditingId(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save subscriber', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Subscribers</h2>
        <button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>
          Add Subscriber
        </button>
      </div>

      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading subscribers..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Account</th>
                    <th>Extension</th>
                    <th>DID</th>
                    <th>Domain</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber: Subscriber) => (
                    <tr key={subscriber.id}>
                      <td>{subscriber.username}</td>
                      <td>{subscriber.accountId}</td>
                      <td>{subscriber.extensionId}</td>
                      <td>{subscriber.defaultDid}</td>
                      <td>{subscriber.domain}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(subscriber.id);
                            setForm({
                              accountId: Number(subscriber.accountId),
                              extensionId: subscriber.extensionId,
                              defaultDid: subscriber.defaultDid,
                              username: subscriber.username,
                              domain: subscriber.domain,
                              password: '',
                            });
                            setOpen(true);
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DaisyModal
        open={open}
        title={editingId ? 'Edit Subscriber' : 'Create Subscriber'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" disabled={pending} onClick={submit}>
              {pending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <input
          className="input input-bordered w-full"
          placeholder="Username"
          value={form.username}
          onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
        />
        <input
          className="input input-bordered w-full"
          placeholder="Domain"
          value={form.domain}
          onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
        />
        <input
          className="input input-bordered w-full"
          placeholder="Default DID"
          value={form.defaultDid}
          onChange={(event) => setForm((prev) => ({ ...prev, defaultDid: event.target.value }))}
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input input-bordered"
            placeholder="Account ID"
            type="number"
            value={form.accountId}
            onChange={(event) => setForm((prev) => ({ ...prev, accountId: Number(event.target.value) }))}
          />
          <input
            className="input input-bordered"
            placeholder="Extension ID"
            value={form.extensionId}
            onChange={(event) => setForm((prev) => ({ ...prev, extensionId: event.target.value }))}
          />
        </div>
        <input
          className="input input-bordered w-full"
          placeholder="Password (optional on edit)"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
        />
      </DaisyModal>
    </div>
  );
}
