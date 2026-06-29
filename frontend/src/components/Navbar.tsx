import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { RootState } from '../store';
import { Bell, LogOut, Shield, User } from 'lucide-react';

interface NavbarProps {
  role: string;
  notificationsCount?: number;
  onToggleNotifications?: () => void;
}

export default function Navbar({ role, notificationsCount = 0, onToggleNotifications }: NavbarProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const username = useSelector((state: RootState) => state.auth.username) || 'User';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-emerald-400 animate-pulse" />
        <div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            JustInTime
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs font-semibold uppercase px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full border border-slate-700">
            MRP System
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-sm">
          <User className="w-4 h-4 text-emerald-400" />
          <div>
            <div className="font-medium text-slate-200 capitalize">{username}</div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{role}</div>
          </div>
        </div>

        {onToggleNotifications && (
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {notificationsCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 hover:border-red-700/50 text-red-300 rounded-lg text-sm font-semibold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
