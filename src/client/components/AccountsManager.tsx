import React, { useState } from 'react';
import { useCreateAccount, useUpdateAccount, useAccounts } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type Account = { id: number; extAccountId: string; domain: string; isActive: number };

export function AccountsManager() {
  return (
    <AppProviders>
      <AccountsManagerInner />
    </AppProviders>
  );
}

function AccountsManagerInner() {
  const { data, isLoading, isError, error, refetch } = useAccounts();
  const createMutation = useCreateAccount<{ extAccountId: string; domain: string; isActive: number }>();
  const updateMutation = useUpdateAccount<{ id: number; extAccountId: string; domain: string; isActive: number }>();
  const { showToast } = useToast();
  const [form, setForm] = useState({ extAccountId: '', domain: '', isActive: 1 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const accounts = data?.accounts ?? [];
  const pending = createMutation.isPending || updateMutation.isPending;

  const submit = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...form });
        showToast('Account updated', 'success');
      } else {
        await createMutation.mutateAsync(form);
        showToast('Account created', 'success');
      }
      setOpen(false);
      setEditingId(null);
      setForm({ extAccountId: '', domain: '', isActive: 1 });
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save account', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Accounts</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingId(null);
            setForm({ extAccountId: '', domain: '', isActive: 1 });
            setOpen(true);
          }}
        >
          Add Account
        </button>
      </div>

      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading accounts..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Account</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account: Account) => (
                    <tr key={account.id}>
                      <td>{account.id}</td>
                      <td>{account.extAccountId}</td>
                      <td>{account.domain}</td>
                      <td>
                        <span className={`badge ${account.isActive ? 'badge-success' : 'badge-error'}`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(account.id);
                            setForm({
                              extAccountId: account.extAccountId,
                              domain: account.domain,
                              isActive: account.isActive ? 1 : 0,
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
        title={editingId ? 'Edit Account' : 'Create Account'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={submit} disabled={pending}>
              {pending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <label className="form-control w-full">
          <span className="label-text">External Account ID</span>
          <input
            className="input input-bordered w-full"
            value={form.extAccountId}
            onChange={(event) => setForm((prev) => ({ ...prev, extAccountId: event.target.value }))}
          />
        </label>
        <label className="form-control w-full">
          <span className="label-text">Domain</span>
          <input
            className="input input-bordered w-full"
            value={form.domain}
            onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
          />
        </label>
        <label className="label cursor-pointer justify-start gap-3">
          <input
            type="checkbox"
            className="toggle toggle-primary"
            checked={Boolean(form.isActive)}
            onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked ? 1 : 0 }))}
          />
          <span className="label-text">Active</span>
        </label>
      </DaisyModal>
    </div>
  );
}
