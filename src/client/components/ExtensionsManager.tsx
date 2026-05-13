import React, { useState } from 'react';
import { useCreateExtension, useExtensions, useUpdateExtension } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type Extension = {
  id: number;
  extensionId: string;
  accountId: number;
  domain: string;
  voicemailEnabled: number;
  isActive: number;
};
export function ExtensionsManager() {
  return (
    <AppProviders>
      <ExtensionsManagerInner />
    </AppProviders>
  );
}

function ExtensionsManagerInner() {
  const { data, isLoading, isError, error, refetch } = useExtensions();
  const createMutation = useCreateExtension<{
    extensionId: string;
    accountId: number;
    domain: string;
    voicemailEnabled: number;
    isActive: number;
  }>();
  const updateMutation = useUpdateExtension<{
    id: number;
    extensionId: string;
    accountId: number;
    domain: string;
    voicemailEnabled: number;
    isActive: number;
  }>();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    extensionId: '',
    accountId: 1,
    domain: '',
    voicemailEnabled: 1,
    isActive: 1,
  });
  const extensions = data?.extensions ?? [];
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Extensions</h2>
        <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Extension
        </button>
      </div>

      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading extensions..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Extension</th>
                    <th>Account</th>
                    <th>Domain</th>
                    <th>Voicemail</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {extensions.map((ext: Extension) => (
                    <tr key={ext.id}>
                      <td>{ext.extensionId}</td>
                      <td>{ext.accountId}</td>
                      <td>{ext.domain}</td>
                      <td>{ext.voicemailEnabled ? 'Enabled' : 'Disabled'}</td>
                      <td>{ext.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(ext.id);
                            setForm({
                              extensionId: ext.extensionId,
                              accountId: ext.accountId,
                              domain: ext.domain,
                              voicemailEnabled: ext.voicemailEnabled,
                              isActive: ext.isActive,
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
        title={editingId ? 'Edit Extension' : 'Create Extension'}
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
                    showToast('Extension updated', 'success');
                  } else {
                    await createMutation.mutateAsync(form);
                    showToast('Extension created', 'success');
                  }
                  setIsModalOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Failed to save extension', 'error');
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
          value={form.extensionId}
          placeholder="Extension ID"
          onChange={(event) => setForm((prev) => ({ ...prev, extensionId: event.target.value }))}
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
