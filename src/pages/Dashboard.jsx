import { useEffect, useState } from 'react';
import { Plus, Users, FolderOpen, RectangleEllipsis } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects } from '../features/projectSlice';
import CreateProjectModal from '../components/CreateProjectModal';
import JoinProjectModal from '../components/JoinProjectModal';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  const { items: projects, loading } = useSelector(state => state.projects);
  console.log(projects)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's what's happening in your workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Plus size={18} /> Join Project
          </button>

          {user?.role === 'PM' && (
            <button
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-primary hover:bg-primary-hover text-white hover:-translate-y-px shadow-lg shadow-primary/30 transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} /> New Project
            </button>
          )}
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <Loading message="Loading your workspace" textSize="text-md" iconSize="w-2 h-2" iconColor="bg-primary" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-16 text-center">
              <FolderOpen size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Create your first project to start organizing tasks and collaborating with your team.</p>
              <div className="flex justify-center flex-wrap gap-4">
                <button
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  onClick={() => setIsJoinModalOpen(true)}
                >
                  <RectangleEllipsis size={18} /> Join via Code
                </button>
                {user?.role === 'PM' && (
                  <button
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 transition-all"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <Plus size={18} /> Create Project
                  </button>
                )}
              </div>
            </div>
          ) : (
            projects.map(project => (
              <div key={project.id} onClick={() => navigate(`/project/${project.id}`)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md hover:border-primary transition-all cursor-pointer flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate pr-4">{project.name}</h3>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary shrink-0">
                    {project.userRole}
                  </span>
                </div>

                <p className="text-slate-500 dark:text-slate-400 mb-6 flex-1 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                <p className="text-slate-500/70 dark:text-slate-500/70 mb-2 flex-1 line-clamp-2 text-xs">
                  <b>Created by:</b> {project.creatorName}
                </p>

                <div className="h-px bg-slate-200 dark:bg-slate-800 -mx-6 mb-4" />

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Users size={16} /> Team
                  </div>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <JoinProjectModal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} />
    </div>
  );
};

export default Dashboard;
