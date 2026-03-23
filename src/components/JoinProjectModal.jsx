import { useState } from 'react';
import { X, Key } from 'lucide-react';
import { fetchAPI } from '../services/api';
import { useDispatch } from 'react-redux';
import { fetchProjects } from '../features/projectSlice';
import { useNavigate } from 'react-router-dom';

const JoinProjectModal = ({ isOpen, onClose }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI(`/projects/join`, {
        method: 'POST',
        body: JSON.stringify({ code: code.trim().toUpperCase() })
      });
      if (res.success) {
        // Force refresh of User's Projects immediately since they joined a workspace
        await dispatch(fetchProjects());
        onClose();
        navigate(`/project/${res.data.id}`);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Failed to join project. Verify your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl animate-fade-in relative p-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
        
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Key className="text-primary" size={24} />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white mb-2">Join Project</h2>
        <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">Enter the 6-character invite code provided by your Project Manager.</p>
        
        {error && <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent font-mono text-center text-lg tracking-[0.2em] uppercase text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all placeholder:tracking-normal placeholder:normal-case placeholder:text-slate-400" 
              placeholder="e.g. X9KZ2P"
              maxLength={6}
              value={code} onChange={e => setCode(e.target.value)} required 
            />
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 mt-4 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 transition-all font-sans" disabled={loading || code.length < 6}>
            {loading ? 'Verifying...' : 'Join Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinProjectModal;
