import React, { memo } from 'react';
import { Users } from 'lucide-react';

const TaskCard = memo(({ task, isOnline, onClick }) => {
  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary transition-all cursor-pointer relative group"
    >
      {task._count?.sticky_notes > 0 && (
        <div className="absolute -top-2 -left-2 bg-amber-400 text-amber-900 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
          {task._count.sticky_notes}
        </div>
      )}
      <div className={`absolute top-1 right-1 rounded-tr-lg w-3 h-3 ${task.priority === 1 ? 'bg-red-500/70' : task.priority === 2 ? 'bg-yellow-500/70' : 'bg-green-500/70'}`} />
      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors text-sm">{task.title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>
      <div className="flex items-center justify-between text-xs font-semibold">
        <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md relative cursor-help" title={isOnline ? "Online" : "Offline"}>
          <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
          <Users size={14} /> {task.assignee?.name?.split(' ')[0] || 'Unknown'}
        </div>
        <div className="text-slate-400">#{task.position}</div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isOnline === nextProps.isOnline &&
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.priority === nextProps.task.priority &&
    prevProps.task.position === nextProps.task.position &&
    prevProps.task._count?.sticky_notes === nextProps.task._count?.sticky_notes &&
    prevProps.task.assignee?.id === nextProps.task.assignee?.id &&
    prevProps.task.assignee?.name === nextProps.task.assignee?.name
  );
});

export default TaskCard;
