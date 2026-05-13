import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from '../ui/Toast';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ToastProvider>{children}</ToastProvider>
    </QueryProvider>
  );
}
