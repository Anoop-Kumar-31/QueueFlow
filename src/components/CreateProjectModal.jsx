import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createProject } from '../features/projectSlice';
import { X } from 'lucide-react';

const CreateProjectModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.projects);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createProject({ name, description }));
    if (createProject.fulfilled.match(result)) {
      setName('');
      setDescription('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-100 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl animate-fade-in relative p-8">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">New Project</h2>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Project Name</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all resize-none"
              placeholder="Brief details about the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 mt-2 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-white hover:-translate-y-px shadow-lg shadow-primary/30 transition-all" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
