import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const BOOT_STEPS = [
  'Establishing secure connection...',
  'Authenticating session...',
  'Loading workspace data...',
  'Syncing real-time engine...',
  'Fetching project roster...',
  'Warming up analytics...',
  'Almost there...',
  'Waiting for server response...',
];

const Loading = ({ message }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showServerNote, setShowServerNote] = useState(false);

  // Cycle through boot step messages every 2.5s, looping
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % BOOT_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Show render server note after 3s
  useEffect(() => {
    const t = setTimeout(() => setShowServerNote(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // Smooth progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev; // hold at 95 until real load finishes
        return prev + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const currentStep = BOOT_STEPS[stepIndex];

  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-[#09090b] overflow-hidden select-none">

      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse [animation-delay:1s]" />
      </div>

      {/* Grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm px-8">

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/40">
              <Activity size={32} className="text-white" />
            </div>
            <div className="absolute inset-[-6px] rounded-full border-2 border-transparent border-t-violet-500 border-r-violet-500/30 animate-spin" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black text-white tracking-tight">QueueFlow</h1>
            <p className="text-sm text-slate-500 mt-0.5">Where Teams Work. Live.</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-violet-600 to-indigo-500 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(124,58,237,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 animate-pulse">{currentStep}</span>
            <span className="text-slate-600 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-500"
              style={{
                animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
                opacity: 0.4 + i * 0.15
              }}
            />
          ))}
        </div>

        <div
          className={`w-full transition-all duration-700 ${showServerNote ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
        >
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3 text-center">
            <p className="text-amber-500 text-xs font-semibold mb-1">⚡ Render Free Tier Notice</p>
            <p className="text-slate-500 text-xs leading-relaxed">
              The backend server may be waking up from sleep.<br />
              First load can take <span className="text-slate-300 font-semibold">10–20 seconds</span>. Please wait!
            </p>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
};

export default Loading;