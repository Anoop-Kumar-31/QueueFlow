import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import {
  AlertTriangle, CheckCircle2, TrendingUp, Users,
  ClipboardList, Zap, Sun, BarChart2, Clock, StickyNote,
  PlayCircle, ArrowLeft, Timer, Activity, Flag
} from 'lucide-react';
import { fetchProjectAnalyticsAPI } from '../services/api';

const STATUS_COLORS = {
  done: '#22c55e',
  inProgress: '#3b82f6',
  review: '#f59e0b',
  pending: '#94a3b8',
};

const InsightCard = ({ type, title, text }) => {
  const styles = {
    WARNING: { bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-300 dark:border-amber-500/30', icon: <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />, text: 'text-amber-800 dark:text-amber-300' },
    ALERT: { bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-300 dark:border-red-500/30', icon: <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />, text: 'text-red-800 dark:text-red-300' },
    SUCCESS: { bg: 'bg-green-50 dark:bg-green-500/10', border: 'border-green-300 dark:border-green-500/30', icon: <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />, text: 'text-green-800 dark:text-green-300' },
  };
  const s = styles[type] || styles.SUCCESS;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg} ${s.border}`}>
      {s.icon}
      <div>
        <p className={`font-bold text-sm ${s.text}`}>{title}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{text}</p>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const formatAge = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr);
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const AnalyticsDashboard = () => {
  const { projectId } = useParams();
  const { items: projects } = useSelector(s => s.projects);
  const project = projects.find(p => p.id === projectId);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetchProjectAnalyticsAPI(projectId)
      .then(res => { if (res.success) setData(res.data); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <div className="max-w-6xl mx-auto">
      <div className="h-80 flex items-center justify-center text-slate-400 animate-pulse text-lg font-semibold">Building intelligence report...</div>
    </div>
  );

  if (error) return (
    <div className="max-w-6xl mx-auto">
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">{error}</div>
    </div>
  );

  if (!data) return null;

  const { metrics, developerLoad, insights, dailySummary, trendData, inProgressChips, priorityBreakdown, overallSummary } = data;

  const pieData = [
    { name: 'Done', value: metrics.done, color: STATUS_COLORS.done },
    { name: 'In Progress', value: metrics.inProgress, color: STATUS_COLORS.inProgress },
    { name: 'Review', value: metrics.review, color: STATUS_COLORS.review },
    { name: 'Pending', value: metrics.pending, color: STATUS_COLORS.pending },
  ].filter(d => d.value > 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/project/${projectId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors mb-2">
            <ArrowLeft size={14} /> Back to Board
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart2 className="text-primary" /> Workflow Intelligence
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{project?.name} — Smart analytics, bottleneck detection & team insights</p>
        </div>
      </div>

      {/* ── OVERALL SUMMARY BANNER ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2 uppercase tracking-wider text-xs">
          <Activity size={14} className="text-primary" /> Overall Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{overallSummary.completionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Completion Rate</p>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{metrics.total}</p>
            <p className="text-xs text-slate-500 mt-1">Total Tasks</p>
          </div>
          <div>
            <p className="text-3xl font-black text-green-500">{metrics.done}</p>
            <p className="text-xs text-slate-500 mt-1">Completed</p>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{metrics.memberCount}</p>
            <p className="text-xs text-slate-500 mt-1">Team Members</p>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-500">{overallSummary.totalStickyNotes}</p>
            <p className="text-xs text-slate-500 mt-1">Sticky Notes</p>
          </div>
          <div>
            <p className="text-3xl font-black text-blue-500">
              {overallSummary.avgCompletionHours !== null ? `${overallSummary.avgCompletionHours}h` : '—'}
            </p>
            <p className="text-xs text-slate-500 mt-1">Avg Completion</p>
          </div>
        </div>

        {/* Oldest pending task callout */}
        {overallSummary.oldestPending && (
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-sm">
            <Timer size={15} className="text-red-400 shrink-0" />
            <span className="text-slate-500">Oldest unfinished task:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{overallSummary.oldestPending.title}</span>
            <span className="text-slate-400">· assigned to {overallSummary.oldestPending.assignee}</span>
            <span className="ml-auto text-xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-semibold text-slate-600 dark:text-slate-400">
              {overallSummary.oldestPending.status.replace('_', ' ')} · {formatAge(overallSummary.oldestPending.createdAt)}
            </span>
          </div>
        )}
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="In Progress" value={metrics.inProgress} icon={<PlayCircle size={22} className="text-blue-500" />} color="bg-blue-500/10" sub={`${metrics.pending} pending`} />
        <StatCard label="In Review" value={metrics.review} icon={<Clock size={22} className="text-amber-500" />} color="bg-amber-500/10" sub="Awaiting approval" />
        <StatCard label="Team Members" value={metrics.memberCount} icon={<Users size={22} className="text-primary" />} color="bg-primary/10" sub={`${overallSummary.recentActivityCount} actions this week`} />
        <StatCard label="Sticky Notes" value={metrics.totalNotes} icon={<StickyNote size={22} className="text-yellow-500" />} color="bg-yellow-500/10" sub="Client feedback" />
      </div>

      {/* In-Progress Task Chips */}
      {inProgressChips.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <PlayCircle size={16} className="text-blue-500" /> Currently In Progress
            <span className="ml-auto text-xs bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-full font-bold">{inProgressChips.length} active</span>
          </h2>
          <div className="flex flex-wrap gap-3">
            {inProgressChips.map(chip => (
              <div key={chip.id} className="flex items-center gap-2.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl px-4 py-2.5 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">{chip.title}</span>
                <span className="text-slate-400">·</span>
                <span className="text-blue-600 dark:text-blue-400">{chip.assignee}</span>
                {chip.startedAt && (
                  <span className="text-xs text-slate-400 ml-1">{formatAge(chip.startedAt)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Summary */}
      <div className="bg-linear-to-r from-primary/5 to-violet-500/5 border border-primary/20 rounded-2xl p-6 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sun size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-slate-500">Today's Summary</p>
            <p className="text-slate-900 dark:text-white font-semibold">
              {dailySummary.completedToday > 0
                ? `${dailySummary.completedToday} task${dailySummary.completedToday > 1 ? 's' : ''} completed today 🎉`
                : 'No completions yet today — keep pushing!'}
            </p>
          </div>
        </div>
        <div className="flex gap-6 text-sm ml-auto">
          <div className="text-center">
            <p className="font-black text-2xl text-green-500">{dailySummary.completedToday}</p>
            <p className="text-slate-500 text-xs">Completed</p>
          </div>
          <div className="text-center">
            <p className="font-black text-2xl text-blue-500">{dailySummary.createdToday}</p>
            <p className="text-slate-500 text-xs">Created</p>
          </div>
          <div className="text-center">
            <p className={`font-black text-2xl ${dailySummary.netBurn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {dailySummary.netBurn >= 0 ? '+' : ''}{dailySummary.netBurn}
            </p>
            <p className="text-slate-500 text-xs">Net Burn</p>
          </div>
        </div>
      </div>

      {/* Smart Insights */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap size={18} className="text-primary" /> Smart Insights
        </h2>
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <InsightCard key={i} {...insight} />
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-5">Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16 text-sm">No tasks yet.</p>}
        </div>

        {/* Priority Pie */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Flag size={15} /> Priority Mix</h3>
          {priorityBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={3}>
                  {priorityBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', fontSize: 13 }} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16 text-sm">No priority data.</p>}
        </div>

        {/* Workload Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><Users size={15} /> Workload</h3>
          {developerLoad.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={developerLoad} layout="vertical" barCategoryGap="30%">
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={80} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', fontSize: 13 }} />
                <Bar dataKey="tasks" fill="#7c3aed" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-slate-400 py-16 text-sm">No active assignments.</p>}
        </div>
      </div>

      {/* Trend Line Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <TrendingUp size={16} /> Task Completion Trend
          <span className="ml-auto text-xs text-slate-400 font-normal">{overallSummary.recentActivityCount} team actions in the last 7 days</span>
        </h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, color: '#e2e8f0', fontSize: 13 }} />
              <Legend />
              <Line type="monotone" dataKey="created" stroke="#7c3aed" strokeWidth={2} dot={{ r: 4 }} name="Created" />
              <Line type="monotone" dataKey="completed" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        ) : <p className="text-center text-slate-400 py-12 text-sm">Not enough history yet. Complete some tasks to see trends.</p>}
      </div>

    </div>
  );
};

export default AnalyticsDashboard;
