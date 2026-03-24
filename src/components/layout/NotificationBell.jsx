import { useRef, useEffect } from 'react';
import {
  Bell, X, PlusCircle, RefreshCw, LogIn,
  Trash2, StickyNote, Folder, Activity
} from 'lucide-react';

const ACTION_META = {
  CREATED_TASK:    { icon: <PlusCircle size={13} />,  color: 'text-green-500',  bg: 'bg-green-500/10'  },
  MOVED_TASK:      { icon: <RefreshCw size={13} />,   color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
  JOINED_PROJECT:  { icon: <LogIn size={13} />,       color: 'text-lime-500',   bg: 'bg-lime-500/10'   },
  DELETED_TASK:    { icon: <Trash2 size={13} />,      color: 'text-red-500',    bg: 'bg-red-500/10'    },
  ADDED_NOTE:      { icon: <StickyNote size={13} />,  color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  UPDATED_NOTE:    { icon: <StickyNote size={13} />,  color: 'text-blue-500',   bg: 'bg-blue-500/10'   },
  DELETED_NOTE:    { icon: <Trash2 size={13} />,      color: 'text-red-500',    bg: 'bg-red-500/10'    },
  CREATED_PROJECT: { icon: <Folder size={13} />,      color: 'text-primary',    bg: 'bg-primary/10'    },
};

const getMeta = (action) =>
  ACTION_META[action] ?? { icon: <Activity size={13} />, color: 'text-slate-400', bg: 'bg-slate-500/10' };

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr);
  const m = Math.floor(diff / 60000);
  if (m <= 0) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = ({ notifications, unreadCount, isOpen, onToggle, onClose, onClearAll }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className="relative text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-1"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none shadow">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-[340px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-200 overflow-hidden">

          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Bell size={14} className="text-primary" /> Notifications
              {notifications.length > 0 && (
                <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button onClick={onClearAll} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                  Clear all
                </button>
              )}
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                <Bell size={28} className="mx-auto mb-3 opacity-30" />
                No notifications yet.<br />
                <span className="text-xs text-slate-500">Activity from your workspaces will appear here.</span>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = getMeta(n.action);
                return (
                  <div key={n._id} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${meta.bg} ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.user?.name || 'Someone'}</p>
                      <p className="text-xs text-slate-500 truncate">{n.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 mt-1">{timeAgo(n.created_at)}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
