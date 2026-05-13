import React from 'react';

export function DaisyModal({
  open,
  title,
  children,
  onClose,
  footer,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  footer: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
        <div className="modal-action">{footer}</div>
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose}>
        close
      </button>
    </dialog>
  );
}
