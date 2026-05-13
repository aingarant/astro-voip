import React, { useState } from 'react';
import { useCreateDid, useDids, useUpdateDid } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type PhoneNumber = {
  id: number;
  did: string;
  accountId: number;
  domain: string;
  isActive: number;
};
export function NumbersManager() {
  return (
    <AppProviders>
      <NumbersManagerInner />
    </AppProviders>
  );
}

function NumbersManagerInner() {
  const { data, isLoading, isError, error, refetch } = useDids();
  const createMutation = useCreateDid<{ did: string; accountId: number; domain: string; isActive: number }>();
  const updateMutation = useUpdateDid<{ id: number; did: string; accountId: number; domain: string; isActive: number }>();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ did: '', accountId: 1, domain: '', isActive: 1 });
  const numbers = data?.dids ?? [];
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Numbers (DIDs)</h2>
        <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Add DID
        </button>
      </div>

      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading DIDs..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>DID</th>
                    <th>Account</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {numbers.map((number: PhoneNumber) => (
                    <tr key={number.id}>
                      <td>{number.did}</td>
                      <td>{number.accountId}</td>
                      <td>{number.domain}</td>
                      <td>
                        <span className={`badge ${number.isActive ? 'badge-success' : 'badge-error'}`}>
                          {number.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(number.id);
                            setForm({
                              did: number.did,
                              accountId: number.accountId,
                              domain: number.domain,
                              isActive: number.isActive,
                            });
                            setIsModalOpen(true);
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
        open={isModalOpen}
        title={editingId ? 'Edit DID' : 'Create DID'}
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending}
              onClick={async () => {
                try {
                  if (editingId) {
                    await updateMutation.mutateAsync({ id: editingId, ...form });
                    showToast('DID updated', 'success');
                  } else {
                    await createMutation.mutateAsync(form);
                    showToast('DID created', 'success');
                  }
                  setIsModalOpen(false);
                  setEditingId(null);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Failed to save DID', 'error');
                }
              }}
            >
              {pending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <input
          className="input input-bordered w-full"
          value={form.did}
          onChange={(event) => setForm((prev) => ({ ...prev, did: event.target.value }))}
          placeholder="+14165550198"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input input-bordered"
            type="number"
            value={form.accountId}
            onChange={(event) => setForm((prev) => ({ ...prev, accountId: Number(event.target.value) }))}
            placeholder="Account ID"
          />
          <input
            className="input input-bordered"
            value={form.domain}
            onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
            placeholder="Domain"
          />
        </div>
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
