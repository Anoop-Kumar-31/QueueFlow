import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { initSocket, disconnectSocket } from '../services/socket';
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted, socketQueueReordered, socketNewStickyNote, socketNoteUpdated, socketNoteDeleted } from '../features/tasksSlice';
import { setOnlineUsers } from '../features/authSlice';
import { LayoutDashboard, CheckSquare, Settings, LogOut, Activity, Bell, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { items: projects } = useSelector((state) => state.projects);

  useEffect(() => {
    if (user?.id) {
      const socket = initSocket();

      // Join isolated user event stream tracking specifically remote PM adjustments
      socket.emit('join_user', user.id);

      // Subscribe to live multi-player events
      socket.on('task_created', (task) => dispatch(socketTaskCreated(task)));
      socket.on('task_updated', (task) => dispatch(socketTaskUpdated(task)));
      socket.on('task_deleted', (taskId) => dispatch(socketTaskDeleted(taskId)));
      socket.on('queue_reordered', (tasksArr) => dispatch(socketQueueReordered(tasksArr)));
      socket.on('online_users', (userIds) => dispatch(setOnlineUsers(userIds)));
      socket.on('new_sticky_note', (note) => dispatch(socketNewStickyNote(note)));
      socket.on('note_updated', (note) => dispatch(socketNoteUpdated(note)));
      socket.on('note_deleted', (payload) => dispatch(socketNoteDeleted(payload)));

      return () => {
        socket.off('task_created');
        socket.off('task_updated');
        socket.off('task_deleted');
        socket.off('queue_reordered');
        socket.off('online_users');
        socket.off('new_sticky_note');
        socket.off('note_updated');
        socket.off('note_deleted');
      };
    } else {
      disconnectSocket();
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    // Allows PMs globally observing a workspace to dynamically catch real-time developer drag-and-drop actions!
    if (user?.id && projects?.length > 0) {
      const socket = initSocket();
      projects.forEach(p => socket.emit('join_project', p.id));
      return () => projects.forEach(p => socket.emit('leave_project', p.id));
    }
  }, [projects, user?.id]);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-[260px]' : 'w-[80px]'} transition-all duration-300 bg-[#111113] text-[#88888e] flex flex-col shrink-0 border-r border-white/5 relative`}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-8 bg-[#111113] border border-white/10 rounded-full p-1 text-white hover:bg-white/10 transition-colors z-50 shadow-sm"
        >
          {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`py-6 text-2xl font-bold text-white flex items-center gap-3 overflow-hidden ${isSidebarOpen ? 'px-6' : 'px-0 justify-center'}`}>
          <Activity size={28} className="text-primary shrink-0" />
          {isSidebarOpen && <span className="whitespace-nowrap transition-opacity duration-300">QueueFlow</span>}
        </div>

        <nav className="p-4 flex flex-col gap-1 flex-1 overflow-hidden">
          {isSidebarOpen ? (
            <div className="text-xs uppercase tracking-wider px-4 mb-2 mt-4 transition-opacity duration-300 whitespace-nowrap">Menu</div>
          ) : (
            <div className="text-xs uppercase tracking-wider mb-2 mt-4 transition-opacity duration-300 whitespace-nowrap">Menu</div>
          )}

          <Link to="/" className={`flex items-center gap-3 py-3 rounded-lg font-medium transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'} ${location.pathname === '/' || location.pathname.startsWith('/project') ? 'bg-primary text-white' : 'hover:bg-white/5 hover:text-white'}`} title={!isSidebarOpen ? "Dashboard" : ""}>
            <LayoutDashboard size={20} className="shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap transition-opacity duration-300">Dashboard</span>}
          </Link>

          <Link to="/tasks" className={`flex items-center gap-3 py-3 rounded-lg font-medium transition-all ${isSidebarOpen ? 'px-4' : 'justify-center'} ${location.pathname === '/tasks' ? 'bg-primary text-white' : 'hover:bg-white/5 hover:text-white'}`} title={!isSidebarOpen ? "My Tasks" : ""}>
            <CheckSquare size={20} className="shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap transition-opacity duration-300">My Tasks</span>}
          </Link>
        </nav>

        <div className="p-4 overflow-hidden">
          <button onClick={handleLogout} className={`flex items-center w-full gap-3 py-3 rounded-lg font-medium transition-all hover:bg-red-500/5 hover:text-red-500/70 ${isSidebarOpen ? 'px-4 text-left' : 'justify-center'}`} title={!isSidebarOpen ? "Logout" : ""}>
            <LogOut size={20} className="shrink-0" />
            {isSidebarOpen && <span className="whitespace-nowrap transition-opacity duration-300">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Top Header */}
        <header className="h-[70px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4 text-slate-500 w-full max-w-md">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search workspaces..."
              className="bg-transparent border-none outline-none text-slate-900 dark:text-white w-full text-base placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
              <Bell size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right min-w-[100px]">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</div>
                <div className="text-xs text-slate-500">{user?.role == "PM" ? "Project Manager" : user?.role == "DEVELOPER" ? "Developer" : "Client"}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#482acc] to-[#8b5cf6] text-white flex items-center justify-center font-bold shadow-lg shadow-primary/30">
                {user?.name ? (
                  user.name.split(" ").length > 2
                    ? user.name.split(" ")[0].charAt(0).toUpperCase() + user.name.split(" ")[user.name.split(" ").length - 1].charAt(0).toUpperCase()
                    : user.name.split(" ")[0].charAt(0).toUpperCase() + (user.name.split(" ")[1]?.charAt(0).toUpperCase() || '')
                ) : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
