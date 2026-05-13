import React, { forwardRef } from 'react';
import type { FieldError } from 'react-hook-form';

type FieldWrapperProps = {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  description?: string;
  required?: boolean;
};

export function FormField({ label, error, children, description, required }: FieldWrapperProps) {
  return (
    <div className="space-y-2 mb-5">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {description && <p className="text-xs text-slate-500 dark:text-slate-400 -mt-1 mb-2">{description}</p>}
      {children}
      {error && <p className="text-xs font-bold text-rose-500 mt-1">{error.message}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-slate-50 dark:bg-slate-900 border ${error ? 'border-rose-300 dark:border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all focus:ring-4 ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`w-full appearance-none bg-slate-50 dark:bg-slate-900 border ${error ? 'border-rose-300 dark:border-rose-500/50 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20'} rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition-all focus:ring-4 pr-10 ${className}`}
          {...props}
        >
          <option value="" disabled>Select an option</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';

export const Toggle = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = '', ...props }, ref) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" ref={ref} {...props} />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
      </label>
    );
  }
);
Toggle.displayName = 'Toggle';
