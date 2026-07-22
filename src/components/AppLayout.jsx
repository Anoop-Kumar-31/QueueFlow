import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

import { initSocket, disconnectSocket } from '../services/socket';
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketQueueReordered, socketNewStickyNote, socketNoteDeleted } from '../features/tasksSlice';
import { setOnlineUsers } from '../features/authSlice';

import AppSidebar from './layout/AppSidebar';
import SearchBar from './layout/SearchBar';
import NotificationBell from './layout/NotificationBell';
import ThemeToggle from './layout/ThemeToggle';
import { Menu, ChevronDown, ChevronUp, User, LogOut } from 'lucide-react';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { items: projects } = useSelector((s) => s.projects);

  // Open sidebar by default on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsSidebarOpen(true);
      else setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user?.id) { disconnectSocket(); return; }

    const socket = initSocket();
    socket.emit('join_user', user.id);

    socket.on('task_created', (t) => dispatch(socketTaskCreated(t)));
    socket.on('task_updated', (t) => dispatch(socketTaskUpdated(t)));
    socket.on('task_deleted', (id) => dispatch(socketTaskDeleted(id)));
    socket.on('queue_reordered', (arr) => dispatch(socketQueueReordered(arr)));
    socket.on('online_users', (ids) => dispatch(setOnlineUsers(ids)));
    socket.on('new_sticky_note', (n) => dispatch(socketNewStickyNote(n)));
    socket.on('note_deleted', (p) => dispatch(socketNoteDeleted(p)));

    // Real-time notification feed (ignore own actions)
    socket.on('new_activity', (activity) => {
      if (activity.user_id === user.id) return;
      setNotifications(prev => [{ ...activity, _id: Date.now() }, ...prev].slice(0, 40));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      ['task_created', 'task_updated', 'task_deleted', 'queue_reordered',
        'online_users', 'new_sticky_note', 'note_deleted', 'new_activity']
        .forEach(e => socket.off(e));
    };
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!user?.id || !projects?.length) return;
    const socket = initSocket();
    projects.forEach(p => socket.emit('join_project', p.id));
    return () => projects.forEach(p => socket.emit('leave_project', p.id));
  }, [projects, user?.id]);

  const openNotifications = () => {
    setNotifOpen(prev => !prev);
    setUnreadCount(0);
  };

  const initials = user?.name
    ? (() => {
      const parts = user.name.split(' ');
      return parts.length > 1
        ? parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
        : parts[0].charAt(0).toUpperCase();
    })()
    : 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">

      <AppSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(o => !o)} />

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 min-w-0">

        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 shrink-0 gap-3">

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsSidebarOpen(o => !o)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 min-w-0">
            <SearchBar />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              isOpen={notifOpen}
              onToggle={openNotifications}
              onClose={() => setNotifOpen(false)}
              onClearAll={() => setNotifications([])}
            />

            {/* User chip */}
            <div className={`relative flex items-center gap-2 select-none hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl p-2 transition-colors cursor-pointer ${profileDropdownOpen ? 'bg-slate-100 dark:bg-slate-800/50' : ''}`} onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}>
              {
                profileDropdownOpen && (
                  <div className="absolute top-16 right-0 min-w-40 w-full bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-2 flex flex-col gap-2">

                    <Link to="/profile" className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-2 transition-colors cursor-pointer" onClick={() => { setProfileDropdownOpen(false); }}>
                      <User size={20} />
                      <div className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-35">Profile</div>
                    </Link>
                    <div className="flex items-center gap-2 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl p-2 transition-colors cursor-pointer text-red-800 dark:text-red-500" onClick={() => { setProfileDropdownOpen(false); dispatch(logout()); }}>
                      <LogOut size={20} />
                      <div className="text-sm font-semibold truncate max-w-35">Logout</div>
                    </div>
                  </div>
                )
              }
              {/* Show name/email only on md+ */}
              <div className="hidden md:block text-right">
                <div className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-35">{user?.name}</div>
                <div className="text-xs text-slate-500 truncate max-w-35">{user?.email}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-[#482acc] to-[#8b5cf6] text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/30 shrink-0">
                {initials}
              </div>
              {profileDropdownOpen ? <ChevronUp size={20} className='text-slate-500' /> : <ChevronDown size={20} className='text-slate-500' />}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
