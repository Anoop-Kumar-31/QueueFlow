import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import {
  LayoutDashboard, CheckSquare, LogOut,
  X, ChevronLeft, ChevronRight
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
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-[2px]"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          ${isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] lg:translate-x-0 lg:w-[80px]'}
          fixed lg:relative z-50 lg:z-auto h-full lg:h-screen
          transition-all duration-300
          bg-[#111113] text-[#88888e] flex flex-col shrink-0 border-r border-white/5
        `}
      >
        {/* Desktop collapse toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex absolute -right-3 top-8 bg-[#111113] border border-white/10 rounded-full p-1 text-white hover:bg-white/10 transition-colors z-50 shadow-sm items-center justify-center"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onToggle}
          className={`lg:hidden absolute top-0 right-[-60px] bg-[#111113] text-white/60 hover:text-white transition-colors h-15 w-15 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}
        >
          <X size={24} />
        </button>

        <div className={`py-6 text-2xl font-bold text-white flex items-center gap-3 overflow-hidden px-6`}>
          <img src="/logo.png" alt="logo" className="w-10 h-10 shrink-0" />
          <span className="whitespace-nowrap transition-opacity duration-300">QueueFlow</span>
        </div>

        <nav className="p-4 flex flex-col gap-1 flex-1 overflow-hidden">
          <div className="text-xs uppercase tracking-wider mb-2 mt-4 whitespace-nowrap px-1.5">
            Menu
          </div>

          <Link to="/" className={linkClass('/')} onClick={() => { if (window.innerWidth < 1024) onToggle(); }}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span className="whitespace-nowrap transition-opacity duration-300">Dashboard</span>
          </Link>

          <Link to="/tasks" className={linkClass('/tasks')} onClick={() => { if (window.innerWidth < 1024) onToggle(); }}>
            <CheckSquare size={20} className="shrink-0" />
            <span className="whitespace-nowrap transition-opacity duration-300">My Tasks</span>
          </Link>
        </nav>

        <div className="p-4 overflow-hidden">
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center w-full gap-3 py-3 px-4 rounded-lg font-medium transition-all hover:bg-red-500/5 hover:text-red-500/70 text-left"
          >
            <LogOut size={20} className="shrink-0" />
            <span className="whitespace-nowrap transition-opacity duration-300">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
