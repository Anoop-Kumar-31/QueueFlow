import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Activity, Eye, EyeOff, ShieldCheck, GitBranch, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../features/authSlice';

const FEATURES = [
  { icon: <ShieldCheck size={16} className="text-violet-400" />, text: 'Secure JWT-authenticated sessions' },
  { icon: <GitBranch size={16} className="text-indigo-400" />, text: 'Project workspaces with invite codes' },
  { icon: <Clock size={16} className="text-violet-400" />, text: 'Activity timeline & audit logs' },
];

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

  const ROLE_OPTIONS = [
    { value: 'PM', label: 'Project Manager', desc: 'Create & manage projects' },
    { value: 'DEVELOPER', label: 'Developer', desc: 'Receive & complete tasks' },
    { value: 'CLIENT', label: 'Client', desc: 'View progress & leave feedback' },
  ];

  return (
    <div className="flex min-h-screen font-sans bg-[#09090b]">

      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden p-16">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 text-center max-w-md">
          <img src="/logo.png" alt="logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white tracking-tight mb-3">QueueFlow</h1>
          <p className="text-lg text-white/50 mb-12">Join teams shipping better software, faster.</p>

          <div className="space-y-4 text-left">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{f.icon}</div>
                <p className="text-sm text-white/70">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[300px] h-[600px] bg-violet-600/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-left ">
            <img src="/logo.png" alt="logo" className="w-20 h-20" />
            <span className="text-white font-black text-4xl">QueueFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Create account</h2>
            <p className="text-slate-400">Start managing your projects for free today.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/15 transition-all"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Work Email</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/15 transition-all"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/15 transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Role Selector — card style */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Account Role</label>
              <div className="grid grid-cols-1 gap-1">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${role === opt.value
                      ? 'border-violet-500 bg-violet-500/10 text-white'
                      : 'border-white/10 bg-white/3 text-slate-400 hover:border-white/20 hover:text-slate-300'
                      }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 ${role === opt.value ? 'border-violet-500 bg-violet-500' : 'border-slate-600'}`} />
                    <div>
                      <p className="text-xs font-semibold">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/25 transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating...' : <><UserPlus size={18} /> Create Account</>}
            </button>
          </form>

          <p className="text-center mt-4 text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
