import { useState, useRef, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Search, X, Folder, CheckSquare2 } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const { items: projects } = useSelector((s) => s.projects);
  const { items: tasks }    = useSelector((s) => s.tasks);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { projects: [], tasks: [] };
    return {
      projects: projects
        .filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
        .slice(0, 4),
      tasks: tasks
        .filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
        .slice(0, 5),
    };
  }, [query, projects, tasks]);

  const hasResults = results.projects.length > 0 || results.tasks.length > 0;

  const go = (url) => {
    navigate(url);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative w-full max-w-md" ref={wrapperRef}>

      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-500">
        <Search size={16} className="shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search projects & tasks..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full text-sm placeholder:text-slate-400"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-200 overflow-hidden">
          {!hasResults ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No results for <span className="font-semibold text-slate-600 dark:text-slate-300">"{query}"</span>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto">

              {results.projects.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    Projects
                  </div>
                  {results.projects.map(p => (
                    <button key={p.id} onClick={() => go(`/project/${p.id}`)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left">
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Folder size={13} className="text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{p.name}</p>
                        {p.description && <p className="text-xs text-slate-400 truncate">{p.description}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                    Tasks
                  </div>
                  {results.tasks.map(t => (
                    <button key={t.id} onClick={() => go('/tasks')}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left">
                      <div className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <CheckSquare2 size={13} className="text-green-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.title}</p>
                        <p className="text-xs text-slate-400">{t.status.replace('_', ' ')} · {t.assignee?.name || 'Unassigned'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
