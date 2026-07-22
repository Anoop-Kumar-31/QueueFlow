import { useActionState } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Zap, Users, BarChart2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/authSlice';

const FEATURES = [
  { icon: <Zap size={16} className="text-violet-400" />, text: 'Real-time task sync across your team' },
  { icon: <Users size={16} className="text-indigo-400" />, text: 'Role-based access for PMs, Devs & Clients' },
  { icon: <BarChart2 size={16} className="text-violet-400" />, text: 'Workflow intelligence & bottleneck detection' },
];

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formState, formAction, isPending] = useActionState(async (prevState, formData) => {
    const email = formData.get('email');
    const password = formData.get('password');
    const resultAction = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/');
      return { error: null };
    }
    return { error: resultAction.payload || 'Invalid email or password.' };
  }, { error: null });

  return (
    <div className="flex min-h-screen font-sans bg-[#09090b]">

      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden p-16">
        {/* Glow blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 rounded-full bg-violet-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-100 h-100 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 text-center max-w-md">
          <img src="/logo.png" alt="logo" className="w-20 h-20 mx-auto mb-4" />
          <h1 className="text-5xl font-black text-white tracking-tight mb-2">QueueFlow</h1>
          <p className="text-lg text-white/50 mb-12">Where Teams Work. Live.</p>

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
        {/* Subtle right-side glow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-105 h-150 bg-violet-600/5 blur-[100px] pointer-events-none" />

        <div className="w-full max-w-105 relative z-10">
          {/* Mobile logo */}

          <div className="lg:hidden flex items-center gap-3 mb-8 justify-left ">
            <img src="/logo.png" alt="logo" className="w-20 h-20" />
            <span className="text-white font-black text-4xl">QueueFlow</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to your workspace to continue.</p>
          </div>

          {formState.error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formState.error}</div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Work Email</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/15 transition-all"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-slate-600 outline-none focus:border-violet-500 focus:ring-3 focus:ring-violet-500/15 transition-all"
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/25 transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isPending ? 'Signing in...' : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <p className="text-center mt-7 text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 font-semibold hover:text-violet-300 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
