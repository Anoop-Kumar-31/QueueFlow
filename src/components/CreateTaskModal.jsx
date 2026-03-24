import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createTask } from '../features/tasksSlice';
import { X, Users } from 'lucide-react';
import { fetchProjectMembersAPI } from '../services/api';

const CreateTaskModal = ({ isOpen, onClose, projectId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [priority, setPriority] = useState(1);

  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.tasks);

  useEffect(() => {
    if (isOpen && projectId) {
      setLoadingMembers(true);
      fetchProjectMembersAPI(projectId)
        .then(res => {
          if (res.success) setMembers(res.data);
          setLoadingMembers(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingMembers(false);
        });
    } else {
      setMembers([]);
      setAssignedTo('');
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignedTo) return alert("You must provide an Assigned User ID");

    const result = await dispatch(createTask({
      projectId,
      taskData: { title, description, assigned_to: assignedTo, priority }
    }));

    if (createTask.fulfilled.match(result)) {
      setTitle('');
      setDescription('');
      setAssignedTo('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-100 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl animate-fade-in relative p-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Assign Task</h2>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
              value={title} onChange={e => setTitle(e.target.value)} required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Description</label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 resize-none"
              value={description} onChange={e => setDescription(e.target.value)} rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Priority</label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 appearance-none"
              value={priority} onChange={e => setPriority(e.target.value)} required
            >
              <option value="1" className="bg-white dark:bg-slate-900 text-red-500">High</option>
              <option value="2" className="bg-white dark:bg-slate-900 text-yellow-500">Medium</option>
              <option value="3" className="bg-white dark:bg-slate-900 text-green-500">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Assign to Developer</label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 appearance-none"
                value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required disabled={loadingMembers}
              >
                <option value="" disabled>Select a team member</option>
                {members.map(member => (
                  <option key={member.user.id} value={member.user.id} className="bg-white dark:bg-slate-900">
                    {member.user.name} ({member.user.role})
                  </option>
                ))}
              </select>
              <Users className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
            {loadingMembers && <p className="text-xs text-primary mt-2">Fetching project roster...</p>}
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 mt-4 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30" disabled={loading || !assignedTo}>
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
