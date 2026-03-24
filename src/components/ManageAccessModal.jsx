import { useState, useEffect } from 'react';
import { X, UserRoundMinus, ShieldAlert } from 'lucide-react';
import { fetchProjectMembersAPI, removeProjectMemberAPI } from '../services/api';
import { useSelector } from 'react-redux';

const ManageAccessModal = ({ isOpen, onClose, projectId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);

  const loadMembers = () => {
    if (!projectId) return;
    setLoading(true);
    fetchProjectMembersAPI(projectId)
      .then(res => {
        if (res.success) setMembers(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) loadMembers();
  }, [isOpen, projectId]);

  const handleRemove = async (userId, name) => {
    if (window.confirm(`Are you sure you want to remove ${name} from this workspace?`)) {
      try {
        await removeProjectMemberAPI(projectId, userId);
        loadMembers();
      } catch (err) {
        console.error(err);
        alert('Failed to remove member');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-100 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl relative p-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><ShieldAlert className="text-primary" /> Manage Access</h2>
        <p className="text-slate-500 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">View and remove members from this workspace.</p>

        {loading ? (
          <p className="text-slate-400 p-4 text-center">Loading roster...</p>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {members.map(member => (
              <div key={member.user.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    {member.user.name}
                    {member.user.id === user.id && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">You</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-semibold tracking-wider">{member.role} • {member.user.email}</p>
                </div>
                {member.user.id !== user.id && (
                  <button onClick={() => handleRemove(member.user.id, member.user.name)} className="text-red-500 hover:bg-red-500/10 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20" title="Remove Member">
                    <UserRoundMinus size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageAccessModal;
