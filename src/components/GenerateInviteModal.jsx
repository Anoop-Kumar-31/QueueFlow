import { useState } from 'react';
import { X, Copy, CheckCircle } from 'lucide-react';
import { generateInviteCodeAPI } from '../services/api';

const GenerateInviteModal = ({ isOpen, onClose, projectId }) => {
  const [expiresInHours, setExpiresInHours] = useState('1');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateInviteCodeAPI(projectId, expiresInHours);
      console.log(res);
      if (res.success) {
        setInviteCode(res.data.code);
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.log(err)
      setError('Failed to generate invite code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setInviteCode(null);
    setCopied(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl animate-fade-in relative p-8">
        <button onClick={handleClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Generate Invite Code</h2>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

        {!inviteCode ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Code Expiration</label>
              <select
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 appearance-none"
                value={expiresInHours} onChange={e => setExpiresInHours(e.target.value)}
              >
                <option value="0.25">15 Minutes</option>
                <option value="1">1 Hour</option>
                <option value="6">6 Hours</option>
              </select>
            </div>
            <button onClick={handleGenerate} className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 mt-4 rounded-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Code'}
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-slate-500 dark:text-slate-400">Share this code with your team members to grant them access to this project.</p>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 relative">
              <div className="text-4xl font-mono font-bold tracking-[0.2em] text-slate-900 dark:text-white mb-4">
                {inviteCode}
              </div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary transition-colors text-sm"
              >
                {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerateInviteModal;
