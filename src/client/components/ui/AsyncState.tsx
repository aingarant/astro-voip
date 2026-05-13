import React from 'react';

export function LoadingSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, idx) => (
        <div key={idx} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}

export function SpinnerBlock({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="py-10 flex flex-col items-center gap-3">
      <span className="loading loading-spinner loading-lg text-primary" />
      <p className="text-sm text-base-content/70">{label}</p>
    </div>
  );
}

export function ErrorAlert({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="alert alert-error">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" className="btn btn-sm btn-ghost" onClick={onRetry}>
          Retry
        </button>
      ) : null}
    </div>
  );
}
