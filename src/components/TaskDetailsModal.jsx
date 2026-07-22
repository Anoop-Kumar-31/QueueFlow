import { useState, useEffect, useCallback, useActionState, useTransition } from 'react';
import { useSelector } from 'react-redux';
import { X, Send, User, Clock, Edit2, Trash2, Loader2 } from 'lucide-react';
import { createStickyNoteAPI, updateStickyNoteAPI, deleteStickyNoteAPI, fetchTaskNotesAPI } from '../services/api';

const TaskDetailsModal = ({ isOpen, onClose, task, projectId, isPM, onEditClick, onDeleteClick }) => {
  const [noteText, setNoteText] = useState('');
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Notes are fetched on-demand (nested resource: GET /tasks/:taskId/notes)
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesPage, setNotesPage] = useState(1);
  const [notesPagination, setNotesPagination] = useState(null);

  const { user } = useSelector(state => state.auth);

  const loadNotes = useCallback(async (taskId, page = 1, replace = false) => {
    setNotesLoading(true);
    try {
      const res = await fetchTaskNotesAPI(taskId, { page, limit: 20 });
      if (res.success) {
        setNotes(prev => replace ? res.data : [...prev, ...res.data]);
        setNotesPagination(res.pagination);
        setNotesPage(res.pagination.page);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setNotesLoading(false);
    }
  }, []);

  // Fetch notes when modal opens or task changes
  useEffect(() => {
    if (isOpen && task?.id) {
      setNotes([]);
      setNotesPage(1);
      setNotesPagination(null);
      loadNotes(task.id, 1, true);
    }
  }, [isOpen, task?.id, loadNotes]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
      case 2: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
      case 3: return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const [formState, formAction, isSubmitting] = useActionState(async () => {
    if (!noteText.trim()) return null;
    try {
      const note = await createStickyNoteAPI(task.id, noteText.trim());
      // Prepend to the local notes list (server also broadcasts via socket)
      setNotes(prev => [note, ...prev]);
      setNotesPagination(prev => prev ? { ...prev, total: prev.total + 1 } : null);
      setNoteText('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
    return null;
  }, null);

  const handleDeleteNote = async (noteId) => {
    startDeleteTransition(async () => {
      try {
        await deleteStickyNoteAPI(noteId);
        setNotes(prev => prev.filter(n => n.id !== noteId));
        setNotesPagination(prev => prev ? { ...prev, total: Math.max(0, prev.total - 1) } : null);
      } catch (err) {
        console.error('Failed delete', err);
      }
    });
  };

  const handleUpdateNote = async (noteId) => {
    if (!editingText.trim()) return;
    startUpdateTransition(async () => {
      try {
        const updated = await updateStickyNoteAPI(noteId, editingText.trim());
        setNotes(prev => prev.map(n => n.id === noteId ? { ...n, text: updated.text ?? editingText } : n));
        setEditingNoteId(null);
      } catch (err) {
        console.error('Failed update', err);
      }
    });
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

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{task.title}</h2>
            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(task.status)} tracking-wide`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isPM && (
              [<button
                key="edit"
                onClick={onEditClick}
                className="text-slate-400 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer bg-slate-100 dark:bg-slate-800 p-2 rounded-full"
                title="Edit Task"
              >
                <Edit2 size={20} />
              </button>,
              <button
                key="delete"
                onClick={onDeleteClick}
                className="text-red-500 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 dark:hover:bg-red-800/30 p-2 rounded-full transition-all cursor-pointer"
              >
                <Trash2 size={20} />
              </button>]
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-500/10 p-2 rounded-full transition-all cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          <div className="space-y-4">

            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                {task.description && task.description || "No description"}
              </p>
            </div>

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
                  Priority: <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getPriorityColor(task.priority)} tracking-wide`}>{task.priority === 1 ? 'HIGH' : task.priority === 2 ? 'MEDIUM' : 'LOW'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Notes Section — loaded on demand */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-2">
              Sticky Notes
              {notesPagination && (
                <span className="text-slate-500 font-normal normal-case tracking-normal">({notesPagination.total})</span>
              )}
            </h4>

            <div className="space-y-4 mb-2">
              {notesLoading && notes.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                  <Loader2 size={16} className="animate-spin" /> Loading notes...
                </div>
              ) : notes.length === 0 ? (
                <div className="text-center py-6 text-sm text-slate-400 italic">
                  No notes yet. Be the first to add one!
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="bg-[#FFF9C4] dark:bg-amber-500/10 p-4 rounded-xl border border-[#FFF59D] dark:border-amber-500/20 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-400 opacity-50"></div>

                    {user?.id === note.user_id && editingNoteId !== note.id && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button disabled={isSubmitting || isUpdating || isDeleting} onClick={() => { setEditingNoteId(note.id); setEditingText(note.text); }} className="text-amber-600 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"><Edit2 size={13} /></button>
                        <button disabled={isSubmitting || isUpdating || isDeleting} onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"><Trash2 size={13} /></button>
                      </div>
                    )}

                    {editingNoteId === note.id ? (
                      <div className="flex flex-col gap-2 w-full pl-2">
                        <textarea disabled={isSubmitting || isUpdating || isDeleting} className="w-full bg-white/60 dark:bg-black/20 focus:ring-1 focus:ring-amber-400 outline-none text-slate-900 dark:text-amber-50 p-2 rounded text-sm min-h-15" value={editingText} onChange={(e) => setEditingText(e.target.value)} />
                        <div className="flex gap-2 justify-end mt-1">
                          <button disabled={isSubmitting || isUpdating || isDeleting} onClick={() => setEditingNoteId(null)} className="text-xs text-slate-500 font-bold px-2 py-1 disabled:opacity-50">Cancel</button>
                          <button disabled={isSubmitting || isUpdating || isDeleting || !editingText.trim()} onClick={() => handleUpdateNote(note.id)} className="text-xs bg-amber-500 text-white rounded font-bold px-3 py-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
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
                ))
              )}

              {/* Load More Notes */}
              {notesPagination?.hasNextPage && (
                <button
                  onClick={() => loadNotes(task.id, notesPage + 1, false)}
                  disabled={notesLoading || isSubmitting || isUpdating || isDeleting}
                  className="w-full py-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors disabled:cursor-not-allowed"
                >
                  {notesLoading ? <><Loader2 size={14} className="animate-spin" /> Loading...</> : 'Load more notes'}
                </button>
              )}
            </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl shrink-0">
          <form action={formAction} className="flex flex-col gap-3">
            <textarea
              className="w-full bg-white dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white text-sm p-4 rounded-xl shadow-sm resize-none"
              placeholder={`Add a sticky note as ${user?.name}...`}
              rows={2}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              required
              disabled={isSubmitting || isUpdating || isDeleting}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || isUpdating || isDeleting || !noteText.trim()}
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
