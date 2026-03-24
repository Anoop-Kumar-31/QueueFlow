import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, Send, User, Clock, Edit2, Trash2 } from 'lucide-react';
import { createStickyNoteAPI, updateStickyNoteAPI, deleteStickyNoteAPI } from '../services/api';

const TaskDetailsModal = ({ isOpen, onClose, task, projectId }) => {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const { user } = useSelector(state => state.auth);

  console.log(task)

  if (!isOpen || !task) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSubmitting(true);
    try {
      await createStickyNoteAPI(task.id, noteText);
      setNoteText('');
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'REVIEW': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400';
      case 'DONE': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h2>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(task.status)} tracking-wide`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {/* Details Section */}
          <div className="space-y-4">
            {task.description && (
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                  {task.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Assignee: <span className="text-slate-900 dark:text-white font-bold">{task.assignee?.name || 'Unknown'}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Priority: <span className="text-slate-900 dark:text-white font-bold">{task.priority === 0 ? 'Normal' : 'High'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Sticky Notes Feed */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
              Sticky Notes ({task.sticky_notes?.length || 0})
            </h4>

            <div className="space-y-4 mb-2">
              {task.sticky_notes?.map(note => (
                <div key={note.id} className="bg-[#FFF9C4] dark:bg-amber-500/10 p-4 rounded-xl border border-[#FFF59D] dark:border-amber-500/20 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 opacity-50"></div>

                  {user?.id === note.user_id && editingNoteId !== note.id && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button onClick={() => { setEditingNoteId(note.id); setEditingText(note.text); }} className="text-amber-600 hover:text-amber-800"><Edit2 size={13} /></button>
                      <button onClick={async () => {
                        try {
                          await deleteStickyNoteAPI(note.id);
                        } catch (err) { console.error('Failed delete', err); }
                      }} className="text-red-500 hover:text-red-700"><Trash2 size={13} /></button>
                    </div>
                  )}

                  {editingNoteId === note.id ? (
                    <div className="flex flex-col gap-2 w-full pl-2">
                      <textarea className="w-full bg-white/60 dark:bg-black/20 focus:ring-1 focus:ring-amber-400 outline-none text-slate-900 dark:text-amber-50 p-2 rounded text-sm min-h-[60px]" value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                      <div className="flex gap-2 justify-end mt-1">
                        <button onClick={() => setEditingNoteId(null)} className="text-xs text-slate-500 font-bold px-2 py-1">Cancel</button>
                        <button onClick={async () => {
                          if (!editingText.trim()) return;
                          try { await updateStickyNoteAPI(note.id, editingText); setEditingNoteId(null); }
                          catch (err) { console.error('Failed update', err); }
                        }} className="text-xs bg-amber-500 text-white rounded font-bold px-3 py-1 shadow-sm">Save</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-slate-800 dark:text-amber-100/90 text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">{note.text}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-amber-500/70">
                        <span>{note.author?.name || 'User'}</span>
                        <span>{new Date(note.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {(!task.sticky_notes || task.sticky_notes.length === 0) && (
                <div className="text-center py-6 text-sm text-slate-400 italic">
                  No notes yet. Be the first to add one!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl shrink-0">
          <form onSubmit={handleAddNote} className="flex flex-col gap-3">
            <textarea
              className="w-full bg-white dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white text-sm p-4 rounded-xl shadow-sm resize-none"
              placeholder={`Add a sticky note as ${user?.name}...`}
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !noteText.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg font-bold text-sm shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2"
              >
                {isSubmitting ? 'Posting...' : <>Drop Note <Send size={14} /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
