import React, { useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Support';
  lastLogin: string;
};

const MOCK_USERS: User[] = [
  { id: 1, name: 'Admin User', email: 'admin@iqfone.com', role: 'Super Admin', lastLogin: '2026-05-13 00:15:00' },
  { id: 2, name: 'Support Staff 1', email: 'support1@iqfone.com', role: 'Support', lastLogin: '2026-05-12 09:30:00' },
  { id: 3, name: 'System Manager', email: 'sysop@iqfone.com', role: 'Admin', lastLogin: '2026-05-10 14:20:00' },
];

export function UsersManager() {
  const [data] = useState<User[]>(MOCK_USERS);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Portal Users</h2>
        <button className="btn btn-primary">
          Invite User
        </button>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="font-bold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'Super Admin' ? 'badge-primary' : user.role === 'Admin' ? 'badge-secondary' : 'badge-ghost'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-base-content/70">{user.lastLogin}</td>
                  <td>
                    <button className="btn btn-sm btn-ghost">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
