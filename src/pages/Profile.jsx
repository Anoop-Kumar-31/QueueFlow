import { useActionState } from 'react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle2, ShieldCheck, Pencil, KeyRound,
  Loader2, AlertCircle, Check
} from 'lucide-react';
import { updateUser } from '../features/authSlice';
import { verifyPasswordAPI, updateProfileAPI, changePasswordAPI } from '../services/api';

// ── Tiny status banner ───────────────────────────────────────────
const Banner = ({ type, message }) => {
  if (!message) return null;
  const styles = type === 'success'
    ? 'bg-green-500/10 border-green-500/20 text-green-500'
    : type === 'alert'
      ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
      : 'bg-red-500/10 border-red-500/20 text-red-500';
  const Icon = type === 'success' ? CheckCircle2 : type === 'alert' ? AlertCircle : ShieldCheck;
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium mt-4 ${styles}`}>
      <Icon size={15} className="shrink-0" />
      {message}
    </div>
  );
};

// ── Reusable input with optional right addon ──────────────────────
const Field = ({ label, icon: Icon, type = 'text', value, onChange, disabled, placeholder, right }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-1">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={16} />
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {right}
        </div>
      )}
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────
const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  // ── Profile info controlled state ──
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // ── Password section state ──
  const [oldPassword, setOldPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [verified, setVerified] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Initials helper ──
  const initials = user?.name
    ? (() => {
      const parts = user.name.trim().split(' ');
      return parts.length > 1
        ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
        : parts[0][0].toUpperCase();
    })()
    : 'U';

  // ── Action: Save Profile Info ──────────────────────────────────
  const [profileState, profileAction, profilePending] = useActionState(async (prevState) => {
    if (name === user?.name && email === user?.email) {
      return { type: 'alert', message: 'No changes to update.' };
    }
    try {
      const res = await updateProfileAPI({ name, email });
      dispatch(updateUser(res.data));
      return { type: 'success', message: 'Profile updated successfully!' };
    } catch (err) {
      return { type: 'error', message: err.message };
    }
  }, null);

  // ── Action: Verify Old Password ──────────────────────────────────
  const [verifyState, verifyAction, verifyPending] = useActionState(async (prevState) => {
    if (!oldPassword) return { type: 'alert', message: 'Please enter your current password.' };
    try {
      await verifyPasswordAPI(oldPassword);
      setVerified(true);
      return { type: 'success', message: 'Password confirmed — set your new password below.' };
    } catch (err) {
      setVerified(false);
      return { type: 'alert', message: err.message };
    }
  }, null);

  // ── Action: Change Password ──────────────────────────────────────
  const [changePwdState, changePwdAction, changePwdPending] = useActionState(async (prevState) => {
    if (newPassword !== confirmPassword) {
      return { type: 'alert', message: 'New passwords do not match.' };
    }
    if (newPassword.length < 6) {
      return { type: 'alert', message: 'Password must be at least 6 characters.' };
    }
    if (newPassword === oldPassword) {
      return { type: 'alert', message: 'New password cannot be same as old password.' };
    }
    try {
      await changePasswordAPI({ oldPassword, newPassword });
      // Reset everything
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setVerified(false);
      return { type: 'success', message: 'Password changed successfully!' };
    } catch (err) {
      return { type: 'error', message: err.message };
    }
  }, null);

  const resetPasswordSection = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setVerified(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">Manage your account details and security settings.</p>
      </div>

      {/* ── Profile Info Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        {/* Avatar + identity row */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#482acc] to-[#8b5cf6] text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30 shrink-0 select-none">
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{user?.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        {/* Edit form */}
        <form action={profileAction} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Pencil size={14} className="text-primary" />
            <span className="font-bold text-slate-900 dark:text-white text-base">Edit Info</span>
          </div>

          <Field
            label="Full Name"
            icon={User}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
          />
          <Field
            label="Email Address"
            icon={Mail}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Banner {...(profileState || {})} />

          <button
            type="submit"
            disabled={profilePending || (!name && !email)}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {profilePending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
            {profilePending ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* ── Change Password Card ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound size={16} className="text-primary" />
          <h2 className="font-bold text-slate-900 dark:text-white text-base">Change Password</h2>
        </div>

        {/* Step 1 — verify current password */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${verified ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              {verified ? <Check size={12} /> : '1'}
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Verify current password</span>
            {verified && <ShieldCheck size={14} className="text-green-500 ml-auto" />}
          </div>

          <Field
            label="Current Password"
            icon={Lock}
            type={showOld ? 'text' : 'password'}
            value={oldPassword}
            onChange={e => { setOldPassword(e.target.value); if (verified) resetPasswordSection(); }}
            disabled={verified}
            placeholder="Enter your current password"
            right={
              <button type="button" onClick={() => setShowOld(v => !v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors h-full w-full flex items-center justify-center">
                {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          {!verified && (
            <form action={verifyAction}>
              <button
                type="submit"
                disabled={!oldPassword || verifyPending}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyPending ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                {verifyPending ? 'Verifying…' : 'Verify Password'}
              </button>
            </form>
          )}

          {/* Banner for Step 1 only */}
          <Banner {...(verifyState || {})} />
        </div>

        {/* Step 2 — set new password (gated) */}
        <div className={`mt-6 space-y-3 transition-all duration-300 ${verified ? 'opacity-100' : 'opacity-30 pointer-events-none select-none'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${verified ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
              2
            </div>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Set new password</span>
          </div>

          <form action={changePwdAction} className="space-y-3">
            <Field
              label="New Password"
              icon={Lock}
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              disabled={!verified}
              placeholder="Minimum 6 characters"
              right={
                <button type="button" onClick={() => setShowNew(v => !v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Field
              label="Confirm New Password"
              icon={Lock}
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={!verified}
              placeholder="Repeat your new password"
              right={
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={!verified || !newPassword || !confirmPassword || changePwdPending}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePwdPending ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                {changePwdPending ? 'Updating…' : 'Update Password'}
              </button>
              {verified && (
                <button
                  type="button"
                  onClick={resetPasswordSection}
                  className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors underline underline-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Banner for Step 2 only */}
            <Banner {...(changePwdState || {})} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
