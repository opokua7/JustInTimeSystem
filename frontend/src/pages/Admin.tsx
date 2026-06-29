import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { Users, Settings, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

const FALLBACK_USERS = [
  { username: 'floormanager', role: 'Floor Manager', status: 'Active' },
  { username: 'stamper01', role: 'Stamper', status: 'Active' },
  { username: 'prodop01', role: 'Production Operative', status: 'Active' },
  { username: 'prodeng01', role: 'Product Engineer', status: 'Active' },
  { username: 'prodmgr', role: 'Production Manager', status: 'Active' },
  { username: 'marketing', role: 'Marketing Director', status: 'Active' },
  { username: 'admin', role: 'Admin', status: 'Active' }
];

export default function Admin() {
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Stamper');
  
  // System states
  const [wsSync, setWsSync] = useState(true);
  const [autoPOTrigger, setAutoPOTrigger] = useState(true);

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users`);
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (e) {
      console.warn('API error, falling back to mock users.');
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, role })
      });
      if (response.ok) {
        loadUsers();
        setUsername('');
        return;
      }
    } catch (e) {
      console.warn('API error, creating user locally.');
    }

    const newUser = {
      username: username.toLowerCase().replace(/\s+/g, ''),
      role: role,
      status: 'Active'
    };

    setUsers([...users, newUser]);
    setUsername('');
  };

  const toggleUserAccess = async (usernameToToggle: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${usernameToToggle}`, {
        method: 'PUT'
      });
      if (response.ok) {
        loadUsers();
        return;
      }
    } catch (e) {
      console.warn('API error, toggling status locally.');
    }

    setUsers(prev => prev.map(u => {
      if (u.username === usernameToToggle) {
        return {
          ...u,
          status: u.status === 'Active' ? 'Revoked' : 'Active'
        };
      }
      return u;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar role="Admin" />

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Management Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-500" />
              User Accounts
            </h2>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Username</th>
                  <th className="pb-3">System Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-655 bg-white">
                {users.map((u, i) => (
                  <tr key={i}>
                    <td className="py-3 font-mono font-semibold text-slate-800">{u.username}</td>
                    <td className="py-3 font-medium">{u.role}</td>
                    <td className="py-3">
                      <span className={`border text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        u.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => toggleUserAccess(u.username)}
                        className={`text-[10px] font-bold hover:underline ${u.status === 'Active' ? 'text-red-650' : 'text-emerald-650'}`}
                      >
                        {u.status === 'Active' ? 'Revoke Token' : 'Grant Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add User form */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Plus className="w-4 h-4 text-slate-400" />
              Provision New User
            </h3>
            <form onSubmit={handleAddUser} className="flex flex-col sm:flex-row gap-4 text-xs">
              <input
                type="text"
                required
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 flex-1 focus:outline-none focus:border-emerald-500"
                placeholder="Username (e.g. jdoe)"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
              <select
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded px-3 py-2 flex-1 focus:outline-none focus:border-emerald-500"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="Floor Manager">Floor Manager</option>
                <option value="Stamper">Stamper</option>
                <option value="Production Operative">Production Operative</option>
                <option value="Product Engineer">Product Engineer</option>
                <option value="Production Manager">Production Manager</option>
                <option value="Marketing Director">Marketing Director</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded transition-all text-xs shrink-0"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>

        {/* Global Settings Panel */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-emerald-500" />
            System Control Panel
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Global toggle switches for system configurations and automation runners.
          </p>

          <div className="space-y-4 text-xs text-slate-700">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-bold block text-slate-800">WebSocket Live Telemetry</span>
                <span className="text-[10px] text-slate-400">Pushes real-time machine speeds</span>
              </div>
              <button onClick={() => setWsSync(!wsSync)}>
                {wsSync ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-bold block text-slate-800">Automatic Purchase Orders</span>
                <span className="text-[10px] text-slate-400">Order automatically when stock falls low</span>
              </div>
              <button onClick={() => setAutoPOTrigger(!autoPOTrigger)}>
                {autoPOTrigger ? (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold block text-slate-800">Debug Logging Mode</span>
                <span className="text-[10px] text-slate-400">Detailed browser console records</span>
              </div>
              <span className="bg-red-50 text-red-650 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded">
                DISABLED
              </span>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
