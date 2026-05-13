import React, { useState } from 'react';
import { useUpdateVoicemailBox, useVoicemailBoxes } from '../api';
import { AppProviders } from './providers/AppProviders';
import { ErrorAlert, SpinnerBlock } from './ui/AsyncState';
import { DaisyModal } from './ui/DaisyModal';
import { useToast } from './ui/Toast';

type VoicemailBox = {
  id: number;
  voicemailBoxId: string;
  extensionId: string;
  accountId: number;
  domain: string;
  messageCount: number;
  messageCapacity: number;
};
export function VoicemailManager() {
  return (
    <AppProviders>
      <VoicemailManagerInner />
    </AppProviders>
  );
}

function VoicemailManagerInner() {
  const { data, isLoading, isError, error, refetch } = useVoicemailBoxes();
  const updateMutation = useUpdateVoicemailBox<{
    id: number;
    extensionId: string;
    accountId: number;
    domain: string;
    messageCapacity: number;
  }>();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    extensionId: '',
    accountId: 1,
    domain: '',
    messageCapacity: 100,
  });
  const boxes = data?.voicemailBoxes ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Voicemail Boxes</h2>
      {isError ? <ErrorAlert message={(error as Error).message} onRetry={refetch} /> : null}

      <div className="card bg-base-100 shadow">
        <div className="card-body p-0">
          {isLoading ? (
            <SpinnerBlock label="Loading voicemail boxes..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Mailbox</th>
                    <th>Extension</th>
                    <th>Account</th>
                    <th>Domain</th>
                    <th>Messages</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {boxes.map((box: VoicemailBox) => (
                    <tr key={box.id}>
                      <td>{box.voicemailBoxId}</td>
                      <td>{box.extensionId}</td>
                      <td>{box.accountId}</td>
                      <td>{box.domain}</td>
                      <td>
                        {box.messageCount}/{box.messageCapacity}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          className="btn btn-sm"
                          onClick={() => {
                            setEditingId(box.id);
                            setForm({
                              extensionId: box.extensionId,
                              accountId: box.accountId,
                              domain: box.domain,
                              messageCapacity: box.messageCapacity,
                            });
                            setIsModalOpen(true);
                          }}
                        >
                          Settings
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
        title="Mailbox Settings"
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={updateMutation.isPending}
              onClick={async () => {
                if (!editingId) return;
                try {
                  await updateMutation.mutateAsync({ id: editingId, ...form });
                  showToast('Mailbox updated', 'success');
                  setIsModalOpen(false);
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Failed to update mailbox', 'error');
                }
              }}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input input-bordered"
            value={form.extensionId}
            onChange={(event) => setForm((prev) => ({ ...prev, extensionId: event.target.value }))}
            placeholder="Extension"
          />
          <input
            className="input input-bordered"
            type="number"
            value={form.accountId}
            onChange={(event) => setForm((prev) => ({ ...prev, accountId: Number(event.target.value) }))}
            placeholder="Account ID"
          />
        </div>
        <input
          className="input input-bordered w-full"
          value={form.domain}
          onChange={(event) => setForm((prev) => ({ ...prev, domain: event.target.value }))}
          placeholder="Domain"
        />
        <input
          className="input input-bordered w-full"
          type="number"
          value={form.messageCapacity}
          onChange={(event) => setForm((prev) => ({ ...prev, messageCapacity: Number(event.target.value) }))}
          placeholder="Message capacity"
        />
      </DaisyModal>
    </div>
  );
}
