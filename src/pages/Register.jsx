import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Activity, Eye, EyeOff } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/authSlice';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('PM');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    const resultAction = await dispatch(registerUser({ name, email, password, role }));
    if (registerUser.fulfilled.match(resultAction)) {
      navigate('/login');
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-[#111113] to-[#2a2a35] text-white p-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#6F4EFF] rounded-full blur-[100px] opacity-15"></div>
        <div className="relative z-10 text-center">
          <Activity size={64} className="text-[#6F4EFF] mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-4">QueueFlow</h1>
          <p className="text-xl text-white/70 max-w-md mx-auto">
            Join thousands of teams shipping better software, faster.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-[440px] animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400">Start managing your projects for free.</p>
          </div>

          {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-[#6F4EFF] focus:ring-3 focus:ring-[#6F4EFF]/15 transition-all" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Work Email</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-[#6F4EFF] focus:ring-3 focus:ring-[#6F4EFF]/15 transition-all" 
                placeholder="you@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 bg-transparent text-slate-900 dark:border-slate-800 dark:text-white outline-none focus:border-[#6F4EFF] focus:ring-3 focus:ring-[#6F4EFF]/15 transition-all" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Account Role</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:border-[#6F4EFF] focus:ring-3 focus:ring-[#6F4EFF]/15 transition-all appearance-none" 
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="PM" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Project Manager (Can create projects)</option>
                <option value="DEVELOPER" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Developer (Assign tasks to me)</option>
                <option value="CLIENT" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Client (View-only and feedback)</option>
              </select>
            </div>
            
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 mt-4 rounded-lg font-semibold bg-[#6F4EFF] hover:bg-[#5B3AE8] text-white hover:-translate-y-[1px] shadow-lg shadow-[#6F4EFF]/30 transition-all" disabled={loading}>
              {loading ? 'Creating...' : 'Create Account'} <UserPlus size={18} />
            </button>
          </form>
          
          <div className="text-center mt-6 text-slate-500 dark:text-slate-400">
            Already have an account? <Link to="/login" className="text-[#6F4EFF] font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
