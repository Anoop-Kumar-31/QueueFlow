import { useState, useEffect } from 'react';
import { initSocket } from '../services/socket';
import { fetchProjectActivitiesAPI } from '../services/api';
import { Clock, PlusCircle, CheckCircle, RefreshCw, LogIn, Trash2, StickyNote, Folder, UserRoundMinus, LogOut } from 'lucide-react';

const formatTimeAgo = (dateString) => {
  const diff = new Date() - new Date(dateString);
  const minutes = Math.floor(diff / 60000);
  if (minutes <= 0) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getActionIcon = (action) => {
  switch (action) {
    case 'CREATED_PROJECT': return <Folder size={14} className="text-primary" />;
    case 'CREATED_TASK': return <PlusCircle size={14} className="text-green-500" />;
    case 'MOVED_TASK': return <RefreshCw size={14} className="text-blue-500" />;
    case 'JOINED_PROJECT': return <LogIn size={14} className="text-lime-500" />;
    case 'DELETED_TASK': return <Trash2 size={14} className="text-red-500" />;
    case 'ADDED_NOTE': return <StickyNote size={14} className="text-yellow-500" />;
    case 'UPDATED_NOTE': return <StickyNote size={14} className="text-blue-500" />;
    case 'DELETED_NOTE': return <Trash2 size={14} className="text-red-500" />;
    case 'REMOVED_MEMBER': return <UserRoundMinus size={14} className="text-red-500" />;
    case 'LEFT_PROJECT': return <LogOut size={14} className="text-red-500" />;
    default: return <CheckCircle size={14} className="text-slate-400" />;
  }
};

const ActivityTimeline = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    fetchProjectActivitiesAPI(projectId)
      .then(res => {
        if (res.success) setActivities(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load activities", err);
        setLoading(false);
      });

    const socket = initSocket();
    const handleNewActivity = (activity) => {
      setActivities(prev => [activity, ...prev].slice(0, 50));
    };

    socket.on('new_activity', handleNewActivity);

    return () => {
      socket.off('new_activity', handleNewActivity);
    };
  }, [projectId]);

  if (loading) {
    return <div className="text-sm text-slate-400 animate-pulse p-4">Loading timeline...</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-full max-h-[800px] shadow-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50">
        <Clock size={16} className="text-slate-500" />
        <h3 className="font-semibold text-slate-900 dark:text-white">Activity Log</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-8">No recent activity</div>
        ) : (
          <div className="relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
            {activities.map((activity, idx) => (
              <div key={activity.id} className="relative flex gap-4 mb-5 last:mb-0 group">
                
                <div className="relative z-10 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:border-primary/50 transition-colors p-0">
                  {getActionIcon(activity.action)}
                </div>

                <div className="flex-1 pt-1 pb-1">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white">
                      {activity.user?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {activity.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
