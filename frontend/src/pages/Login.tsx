import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { API_URL } from '../config';
import { ShieldAlert, LogIn } from 'lucide-react';

const FALLBACK_USERS = [
  { username: 'floormanager', password: 'Floor@1234',  role: 'Floor Manager',        path: '/floor-manager' },
  { username: 'stamper01',    password: 'Stamp@1234',  role: 'Stamper',              path: '/stamper' },
  { username: 'prodop01',     password: 'ProdOp@1234', role: 'Production Operative', path: '/production-operative' },
  { username: 'prodeng01',    password: 'ProdEng@1234',role: 'Product Engineer',     path: '/product-engineer' },
  { username: 'prodmgr',      password: 'ProdMgr@1234',role: 'Production Manager',    path: '/production-manager' },
  { username: 'marketing',    password: 'Market@1234', role: 'Marketing Director',   path: '/marketing-director' },
  { username: 'admin',        password: 'Admin@1234',  role: 'Admin',                path: '/admin' }
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Attempt login via Backend API
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        dispatch(loginSuccess({ username: data.username, role: data.role }));
        
        // Match routing path
        const userPath = FALLBACK_USERS.find(u => u.username === data.username)?.path || '/';
        navigate(userPath);
        return;
      } else {
        setError(data.error || 'Invalid credentials.');
        return;
      }
    } catch (err) {
      console.warn('API Connection failed, falling back to local simulation data.');
      // Local fallback mode
      const user = FALLBACK_USERS.find(u => u.username === username.trim() && u.password === password);
      if (user) {
        dispatch(loginSuccess({ username: user.username, role: user.role }));
        navigate(user.path);
      } else {
        setError('Invalid username or password. Please check credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-3">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">JustInTime</h1>
          <p className="text-xs text-slate-400 mt-1">FloatFry Manufacturing Resource Planning</p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-900/50 text-red-300 text-xs px-4 py-2.5 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="username-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Username
            </label>
            <input
              id="username-input"
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="e.g. floormanager"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <input
              id="password-input"
              type="password"
              required
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition-all"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">
            Pre-seeded Test Accounts
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 max-h-40 overflow-y-auto pr-1">
            {FALLBACK_USERS.map((u, i) => (
              <div key={i} className="bg-slate-950/60 p-1.5 rounded border border-slate-800/40">
                <span className="font-semibold text-emerald-400">{u.role}</span>
                <div className="mt-0.5">U: <code className="text-slate-200">{u.username}</code></div>
                <div>P: <code className="text-slate-200">{u.password}</code></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
