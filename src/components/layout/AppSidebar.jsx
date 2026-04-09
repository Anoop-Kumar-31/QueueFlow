import { Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../features/authSlice';
import {
  LayoutDashboard, CheckSquare, LogOut,
  X, ChevronLeft, ChevronRight, UserCircle
} from 'lucide-react';

const AppSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/' || location.pathname.startsWith('/project');
    return location.pathname === path;
  };

  // Always px-4, never justify-center — icon position stays fixed during width animation
  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive(path) ? 'bg-primary text-white' : 'hover:bg-white/5 hover:text-white'
    }`;

  // Text fades & collapses via max-width + opacity — no layout relayout
  const labelClass = `
    overflow-hidden whitespace-nowrap transition-all duration-300
    ${isOpen ? 'max-w-[200px] opacity-100 ml-0' : 'max-w-0 opacity-0'}
  `;

  const NavLink = ({ to, icon: Icon, label, onClick }) => (
    <Link to={to} className={linkClass(to)} onClick={onClick}>
      <Icon size={20} className="shrink-0" />
      <span className={labelClass}>{label}</span>
    </Link>
  );

  const handleMobileClose = () => {
    if (window.innerWidth < 1024) onToggle();
  };

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
          ${isOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full w-[260px] lg:translate-x-0 lg:w-[69px]'}
          fixed lg:relative z-50 lg:z-auto h-full lg:h-screen
          transition-all duration-300 ease-in-out
          bg-[#111113] text-[#88888e] flex flex-col shrink-0 border-r border-white/5
        `}
      >

        {/* Mobile close button — floats outside the sidebar edge */}
        <button
          onClick={onToggle}
          className={`lg:hidden absolute top-0 right-[-60px] bg-[#111113] text-white/60 hover:text-white transition-colors h-15 w-15 flex items-center justify-center ${isOpen ? 'flex' : 'hidden'}`}
        >
          <X size={24} />
        </button>

        {/* Logo row — fixed height matches header */}
        <div className="flex items-center h-[64px] px-4 gap-3 overflow-hidden shrink-0">
          <img src="/logo.png" alt="logo" className="w-9 h-9 shrink-0" />
          <span className={`text-xl font-bold text-white ${labelClass}`}>QueueFlow</span>
        </div>

        {/* Nav */}
        <nav className=" relative px-2 flex flex-col gap-1 flex-1 pt-2">

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggle}
            className="hidden lg:flex absolute -right-3 top-1 bg-[#111113] border border-white/10 rounded-full p-1 text-white hover:bg-white/10 transition-colors z-50 shadow-sm items-center justify-center"
          >
            {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>

          <div className={`text-xs uppercase tracking-wider mb-2 px-2 overflow-hidden transition-all duration-300 opacity-60 max-h-6`}>
            Menu
          </div>

          <NavLink to="/" icon={LayoutDashboard} label="Dashboard" onClick={handleMobileClose} />
          <NavLink to="/tasks" icon={CheckSquare} label="My Tasks" onClick={handleMobileClose} />
        </nav>

        {/* Bottom section */}
        <div className="px-2 pb-4 flex flex-col gap-1 shrink-0">
          <NavLink to="/profile" icon={UserCircle} label="Profile" onClick={handleMobileClose} />

          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg font-medium transition-colors hover:bg-red-500/5 hover:text-red-500/70 text-left"
          >
            <LogOut size={20} className="shrink-0" />
            <span className={labelClass}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AppSidebar;
