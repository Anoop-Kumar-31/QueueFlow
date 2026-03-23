import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectTasks } from '../features/tasksSlice';
import { fetchProjects } from '../features/projectSlice';
import { Plus, Users, Clock, CheckCircle, Circle, PlayCircle } from 'lucide-react';
import CreateTaskModal from '../components/CreateTaskModal';
import GenerateInviteModal from '../components/GenerateInviteModal';
import ActivityTimeline from '../components/ActivityTimeline';

const statusIcons = {
  PENDING: <Circle size={16} className="text-slate-400" />,
  IN_PROGRESS: <PlayCircle size={16} className="text-blue-500" />,
  REVIEW: <Clock size={16} className="text-amber-500" />,
  DONE: <CheckCircle size={16} className="text-green-500" />
};

const ProjectBoard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items: tasks, loading } = useSelector(state => state.tasks);
  const { items: projects } = useSelector(state => state.projects);
  const { onlineUsers } = useSelector(state => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    dispatch(fetchProjectTasks(projectId));
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [dispatch, projectId, projects.length]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{project?.name || 'Project Board'}</h1>
          <p className="text-slate-500 dark:text-slate-400">All tasks assigned within this workspace.</p>
        </div>
        {user?.role === 'PM' && (
          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Users size={18} /> Invite Team
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} /> Assign Task
            </button>
          </div>
        )}
      </div>

      {loading && tasks.length === 0 ? (
        <div className="p-8 text-center text-slate-500">Loading workspace tasks...</div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['PENDING', 'IN_PROGRESS', 'REVIEW', 'DONE'].map(statusGroup => {
                const groupTasks = tasks.filter(t => t.status === statusGroup);
                return (
                  <div key={statusGroup} className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 text-sm tracking-wide">
                        {statusIcons[statusGroup]} {statusGroup.replace('_', ' ')}
                      </h3>
                      <span className="bg-white dark:bg-slate-800 text-slate-500 text-xs py-1 px-2.5 rounded-full font-bold shadow-sm">{groupTasks.length}</span>
                    </div>

                    <div className="space-y-3">
                      {groupTasks.map(task => (
                        <div key={task.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:border-primary transition-all">
                          <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{task.title}</h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{task.description}</p>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-md relative cursor-help" title={onlineUsers.includes(task.assigned_to) ? "Online" : "Offline"}>
                              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${onlineUsers.includes(task.assigned_to) ? 'bg-green-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                              <Users size={14} /> {task.assignee?.name?.split(' ')[0] || 'Unknown'}
                            </div>
                            <div className="text-slate-400">#{task.position + 1}</div>
                          </div>
                        </div>
                      ))}
                      {groupTasks.length === 0 && (
                        <div className="p-6 text-center text-sm font-medium text-slate-400/60 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                          No tasks
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full xl:w-[320px] shrink-0 h-[500px] xl:h-[calc(100vh-200px)] xl:sticky xl:top-6">
            <ActivityTimeline projectId={projectId} />
          </div>
        </div>
      )}

      {user?.role === 'PM' && (
        <>
          <CreateTaskModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            projectId={projectId}
          />
          <GenerateInviteModal
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
            projectId={projectId}
          />
        </>
      )}
    </div>
  );
};

export default ProjectBoard;
