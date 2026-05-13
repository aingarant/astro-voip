import React, { useEffect, useRef } from 'react';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Drawer({ isOpen, onClose, title, description, children, footer }: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="fixed inset-y-0 right-0 w-full max-w-md flex animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div ref={drawerRef} className="w-full h-full bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700 flex flex-col">
          <div className="px-8 py-8 border-b border-slate-50 dark:border-slate-700/50">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
                {description && <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{description}</p>}
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            {children}
          </div>

          {footer && (
            <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
