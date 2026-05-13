import React, { useState } from 'react';

type Extension = {
  id: number;
  extension: string;
  name: string;
  accountId: number;
  voicemailEnabled: boolean;
  status: 'Online' | 'Offline';
};

const MOCK_EXTENSIONS: Extension[] = [
  { id: 1, extension: '1001', name: 'Alice Smith', accountId: 101, voicemailEnabled: true, status: 'Online' },
  { id: 2, extension: '1002', name: 'Bob Jones', accountId: 101, voicemailEnabled: false, status: 'Offline' },
  { id: 3, extension: '1003', name: 'Charlie Davis', accountId: 101, voicemailEnabled: true, status: 'Online' },
  { id: 4, extension: '2001', name: 'Front Desk', accountId: 102, voicemailEnabled: true, status: 'Online' },
];

export function ExtensionsManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState<Extension[]>(MOCK_EXTENSIONS);
  const [formData, setFormData] = useState({ extension: '', name: '', accountId: '', voicemailEnabled: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExt: Extension = {
      id: data.length + 1,
      extension: formData.extension,
      name: formData.name,
      accountId: parseInt(formData.accountId),
      voicemailEnabled: formData.voicemailEnabled,
      status: 'Offline',
    };
    setData([...data, newExt]);
    setIsModalOpen(false);
    setFormData({ extension: '', name: '', accountId: '', voicemailEnabled: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Extensions</h2>
          <p className="text-sm text-base-content/60 mt-1">Manage internal extensions and voicemail</p>
        </div>
        <button className="btn btn-primary shadow-lg shadow-primary/30" onClick={() => setIsModalOpen(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Create Extension
        </button>
      </div>

      <div className="card bg-base-100 border border-base-content/5 shadow-xl shadow-base-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs tracking-wider">
              <tr>
                <th className="font-semibold">Extension</th>
                <th className="font-semibold">Name</th>
                <th className="font-semibold">Account ID</th>
                <th className="font-semibold">Voicemail</th>
                <th className="font-semibold">Status</th>
                <th className="font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((ext) => (
                <tr key={ext.id} className="hover:bg-base-200/50 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-mono font-bold border border-primary/20">
                        {ext.extension}
                      </div>
                    </div>
                  </td>
                  <td className="font-medium text-base-content">{ext.name}</td>
                  <td className="text-base-content/70 font-mono text-sm">#{ext.accountId}</td>
                  <td>
                    {ext.voicemailEnabled ? (
                      <span className="badge badge-accent badge-outline gap-1 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Enabled
                      </span>
                    ) : (
                      <span className="text-base-content/40 text-sm">Disabled</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2 font-medium">
                      <span className="relative flex h-3 w-3">
                        {ext.status === 'Online' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-40"></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${ext.status === 'Online' ? 'bg-success' : 'bg-base-300'}`}></span>
                      </span>
                      <span className={ext.status === 'Online' ? 'text-success' : 'text-base-content/50'}>{ext.status}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-sm btn-ghost text-base-content/70 hover:text-primary">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <dialog className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create New Extension</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Extension Number</span></label>
              <input
                type="text"
                required
                className="input input-bordered w-full font-mono"
                value={formData.extension}
                onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Display Name</span></label>
              <input
                type="text"
                required
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
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
              <label className="label cursor-pointer">
                <span className="label-text">Enable Voicemail</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={formData.voicemailEnabled}
                  onChange={(e) => setFormData({ ...formData, voicemailEnabled: e.target.checked })}
                />
              </label>
            </div>
            <div className="modal-action">
              <button type="button" className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save</button>
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
