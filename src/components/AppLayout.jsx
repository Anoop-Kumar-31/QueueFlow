import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { initSocket, disconnectSocket } from '../services/socket';
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketQueueReordered, socketNewStickyNote, socketNoteUpdated, socketNoteDeleted } from '../features/tasksSlice';
import { setOnlineUsers } from '../features/authSlice';

import AppSidebar      from './layout/AppSidebar';
import SearchBar       from './layout/SearchBar';
import NotificationBell from './layout/NotificationBell';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [unreadCount, setUnreadCount]     = useState(0);

  const dispatch = useDispatch();
  const { user }            = useSelector((s) => s.auth);
  const { items: projects } = useSelector((s) => s.projects);

  useEffect(() => {
    if (!user?.id) { disconnectSocket(); return; }

    const socket = initSocket();
    socket.emit('join_user', user.id);

    socket.on('task_created',   (t)   => dispatch(socketTaskCreated(t)));
    socket.on('task_updated',   (t)   => dispatch(socketTaskUpdated(t)));
    socket.on('task_deleted',   (id)  => dispatch(socketTaskDeleted(id)));
    socket.on('queue_reordered',(arr) => dispatch(socketQueueReordered(arr)));
    socket.on('online_users',   (ids) => dispatch(setOnlineUsers(ids)));
    socket.on('new_sticky_note',(n)   => dispatch(socketNewStickyNote(n)));
    socket.on('note_updated',   (n)   => dispatch(socketNoteUpdated(n)));
    socket.on('note_deleted',   (p)   => dispatch(socketNoteDeleted(p)));

    // Real-time notification feed (ignore own actions)
    socket.on('new_activity', (activity) => {
      if (activity.user_id === user.id) return;
      setNotifications(prev => [{ ...activity, _id: Date.now() }, ...prev].slice(0, 40));
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      ['task_created','task_updated','task_deleted','queue_reordered',
       'online_users','new_sticky_note','note_updated','note_deleted','new_activity']
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

  const roleLabel =
    user?.role === 'PM' ? 'Project Manager' :
    user?.role === 'DEVELOPER' ? 'Developer' : 'Client';

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

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">

        <header className="h-[70px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">

          <SearchBar />

          <div className="flex items-center gap-5">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              isOpen={notifOpen}
              onToggle={openNotifications}
              onClose={() => setNotifOpen(false)}
              onClearAll={() => setNotifications([])}
            />

            {/* User chip */}
            <div className="flex items-center gap-3">
              <div className="text-right min-w-[100px]">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
                <div className="text-xs text-slate-500">{roleLabel}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#482acc] to-[#8b5cf6] text-white flex items-center justify-center font-bold shadow-lg shadow-primary/30">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default AppLayout;
