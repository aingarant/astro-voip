import React, { useState } from 'react';
import { useCreateIvrProfile, useIvrProfiles, useUpdateIvrProfile } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type IVRMenu = {
  id: number;
  name: string;
  domain: string;
  accountId: number;
  isActive: number;
};
const defaultScope = { accountId: 1, domain: 'sip.iqfone.com' };

export function IVRManager() {
  return (
    <AppProviders>
      <IVRManagerInner />
    </AppProviders>
  );
}

function IVRManagerInner() {
  const { data, isLoading, isError, error, refetch } = useIvrProfiles(defaultScope);
  const createMutation = useCreateIvrProfile<{ name: string; accountId: number; domain: string; isActive: number }>(defaultScope);
  const updateMutation = useUpdateIvrProfile<{ id: number; name: string; accountId: number; domain: string; isActive: number }>(defaultScope);
  const { showToast } = useToast();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', accountId: defaultScope.accountId, domain: defaultScope.domain, isActive: 1 });
  const menus = data?.ivrProfiles ?? [];
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">IVR Profiles</h2>
        <button type="button" className="btn btn-primary" onClick={() => setIsDrawerOpen(true)}>
          Add IVR
        </button>
      </div>

      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading IVR profiles..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Account</th>
                    <th>Domain</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {menus.map((menu: IVRMenu) => (
                    <tr key={menu.id}>
                      <td>{menu.name}</td>
                      <td>{menu.accountId}</td>
                      <td>{menu.domain}</td>
                      <td>{menu.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(menu.id);
                            setForm({
                              name: menu.name,
                              accountId: menu.accountId,
                              domain: menu.domain,
                              isActive: menu.isActive,
                            });
                            setIsDrawerOpen(true);
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
        open={isDrawerOpen}
        title={editingId ? 'Edit IVR Profile' : 'Create IVR Profile'}
        onClose={() => setIsDrawerOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setIsDrawerOpen(false)}>
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
                    showToast('IVR profile updated', 'success');
                  } else {
                    await createMutation.mutateAsync(form);
                    showToast('IVR profile created', 'success');
                  }
                  setIsDrawerOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Failed to save IVR profile', 'error');
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
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="IVR Name"
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
      </DaisyModal>
    </div>
  );
}
