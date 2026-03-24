import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import {
  LayoutDashboard, CheckSquare, LogOut,
  Activity, ChevronLeft, ChevronRight
} from 'lucide-react';

const AppSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/project');
    return location.pathname === path;
  };

  const linkClass = (path) =>
    `flex items-center gap-3 py-3 rounded-lg font-medium transition-all ${isOpen ? 'px-4' : 'justify-center'} ${isActive(path) ? 'bg-primary text-white' : 'hover:bg-white/5 hover:text-white'}`;

  return (
    <aside
      className={`${isOpen ? 'w-[260px]' : 'w-[80px]'} transition-all duration-300 bg-[#111113] text-[#88888e] flex flex-col shrink-0 border-r border-white/5 relative`}
    >
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 bg-[#111113] border border-white/10 rounded-full p-1 text-white hover:bg-white/10 transition-colors z-50 shadow-sm"
      >
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className={`py-6 text-2xl font-bold text-white flex items-center gap-3 overflow-hidden ${isOpen ? 'px-6' : 'px-0 justify-center'}`}>
        <Activity size={28} className="text-primary shrink-0" />
        {isOpen && <span className="whitespace-nowrap transition-opacity duration-300">QueueFlow</span>}
      </div>

      <nav className="p-4 flex flex-col gap-1 flex-1 overflow-hidden">
        <div className={`text-xs uppercase tracking-wider mb-2 mt-4 whitespace-nowrap ${isOpen ? 'px-4' : ''}`}>
          Menu
        </div>

        <Link to="/" className={linkClass('/')} title={!isOpen ? 'Dashboard' : ''}>
          <LayoutDashboard size={20} className="shrink-0" />
          {isOpen && <span className="whitespace-nowrap transition-opacity duration-300">Dashboard</span>}
        </Link>

        <Link to="/tasks" className={linkClass('/tasks')} title={!isOpen ? 'My Tasks' : ''}>
          <CheckSquare size={20} className="shrink-0" />
          {isOpen && <span className="whitespace-nowrap transition-opacity duration-300">My Tasks</span>}
        </Link>
      </nav>

      <div className="p-4 overflow-hidden">
        <button
          onClick={() => dispatch(logout())}
          className={`flex items-center w-full gap-3 py-3 rounded-lg font-medium transition-all hover:bg-red-500/5 hover:text-red-500/70 ${isOpen ? 'px-4 text-left' : 'justify-center'}`}
          title={!isOpen ? 'Logout' : ''}
        >
          <LogOut size={20} className="shrink-0" />
          {isOpen && <span className="whitespace-nowrap transition-opacity duration-300">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
