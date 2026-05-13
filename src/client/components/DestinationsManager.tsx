import React, { useState } from 'react';
import { useCreateInboundRoute, useInboundRoutes, useUpdateInboundRoute } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type Destination = {
  id: number;
  did: string;
  targetType: string;
  targetValue: string;
  priority: number;
  isActive: number;
};
const defaultScope = { accountId: 1, domain: 'sip.iqfone.com' };

export function DestinationsManager() {
  return (
    <AppProviders>
      <DestinationsManagerInner />
    </AppProviders>
  );
}

function DestinationsManagerInner() {
  const { data, isLoading, isError, error, refetch } = useInboundRoutes(defaultScope);
  const createMutation = useCreateInboundRoute<{
    did: string;
    targetType: string;
    targetValue: string;
    priority: number;
    isActive: number;
  }>(defaultScope);
  const updateMutation = useUpdateInboundRoute<{
    id: number;
    did: string;
    targetType: string;
    targetValue: string;
    priority: number;
    isActive: number;
  }>(defaultScope);
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    did: '',
    targetType: 'extension',
    targetValue: '',
    priority: 100,
    isActive: 1,
  });
  const destinations = data?.inboundRoutes ?? [];
  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inbound Destinations</h2>
        <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Add Route
        </button>
      </div>

      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading routes..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Priority</th>
                    <th>DID</th>
                    <th>Target Type</th>
                    <th>Target Value</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {destinations.map((dest: Destination) => (
                    <tr key={dest.id}>
                      <td>{dest.priority}</td>
                      <td>{dest.did}</td>
                      <td>{dest.targetType}</td>
                      <td>{dest.targetValue}</td>
                      <td>{dest.isActive ? 'Active' : 'Inactive'}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(dest.id);
                            setForm({
                              did: dest.did,
                              targetType: dest.targetType,
                              targetValue: dest.targetValue,
                              priority: dest.priority,
                              isActive: dest.isActive,
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
        title={editingId ? 'Edit Route' : 'Create Route'}
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
                    showToast('Route updated', 'success');
                  } else {
                    await createMutation.mutateAsync(form);
                    showToast('Route created', 'success');
                  }
                  setIsModalOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Failed to save route', 'error');
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
          placeholder="DID pattern"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input input-bordered"
            value={form.targetType}
            onChange={(event) => setForm((prev) => ({ ...prev, targetType: event.target.value }))}
            placeholder="target type"
          />
          <input
            className="input input-bordered"
            value={form.targetValue}
            onChange={(event) => setForm((prev) => ({ ...prev, targetValue: event.target.value }))}
            placeholder="target value"
          />
        </div>
      </DaisyModal>
    </div>
  );
}
