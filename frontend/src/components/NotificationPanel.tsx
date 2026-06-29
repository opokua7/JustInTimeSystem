import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  msg: string;
  time: string;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onClearNotification: (id: string) => void;
}

export default function NotificationPanel({ notifications, onClose, onClearNotification }: NotificationPanelProps) {
  const iconMap = {
    critical: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
  };

  const bgMap = {
    critical: 'bg-red-50/70 border-red-100',
    warning: 'bg-amber-50/70 border-amber-100',
    info: 'bg-blue-50/70 border-blue-100',
    success: 'bg-emerald-50/70 border-emerald-100',
  };

  return (
    <div className="absolute right-6 top-20 w-96 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <span className="font-bold text-sm">Recent Notifications</span>
        <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No new notifications
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-3 border rounded-lg transition-all hover:shadow-sm ${bgMap[n.type]}`}
            >
              {iconMap[n.type]}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-800 break-words">{n.msg}</div>
                <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
              </div>
              <button
                onClick={() => onClearNotification(n.id)}
                className="p-0.5 hover:bg-slate-200/50 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
