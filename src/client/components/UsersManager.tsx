import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from './providers/QueryProvider';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Support';
  lastLogin: string;
};

const MOCK_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@iqfone.com', role: 'Super Admin', lastLogin: '2 mins ago' },
  { id: 2, name: 'Sarah Connor', email: 'sarah.c@iqfone.com', role: 'Support', lastLogin: '1 hour ago' },
  { id: 3, name: 'Marcus Wright', email: 'marcus.w@iqfone.com', role: 'Admin', lastLogin: '2 days ago' },
  { id: 4, name: 'Kyle Reese', email: 'kyle.r@iqfone.com', role: 'Support', lastLogin: '5 mins ago' },
  { id: 5, name: 'John Doe', email: 'john.d@iqfone.com', role: 'Admin', lastLogin: '12 hours ago' },
  { id: 6, name: 'Jane Smith', email: 'jane.s@iqfone.com', role: 'Support', lastLogin: 'Just now' },
  { id: 7, name: 'Robert Paulson', email: 'bob.p@iqfone.com', role: 'Support', lastLogin: '3 days ago' },
];

export function UsersManager() {
  return (
    <QueryProvider>
      <UsersManagerInner />
    </QueryProvider>
  );
}

function UsersManagerInner() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ users: User[] }>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const res = await fetch('http://127.0.0.1:8787/users');
        if (!res.ok) throw new Error('API Unavailable');
        return res.json();
      } catch (e) {
        return { users: MOCK_USERS };
      }
    },
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Portal Access Control</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage administrative users, RBAC roles, and portal security logs.</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
          Invite Administrator
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Administrator</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Role</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Activity</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Loading Users...</span>
                    </div>
                  </td>
                </tr>
              ) : data?.users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-300">
                    <span className="text-sm font-bold uppercase tracking-widest">No Portal Users Found</span>
                  </td>
                </tr>
              ) : (
                data?.users.map((user) => (
                  <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 dark:bg-transparent transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-600">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=ffffff&color=4f46e5&bold=true`} alt="" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">UID: 00{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{user.email}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                        user.role === 'Super Admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                        user.role === 'Admin' ? 'bg-sky-50 text-sky-600 border-sky-100' : 
                        'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{user.lastLogin}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase">Active Session</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                        </button>
                        <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
