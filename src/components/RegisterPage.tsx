import React, { useState } from 'react';
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Package,
  User,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

interface Props {
  onLoginClick: () => void;
  onSuccess: (accessToken: string, user: any) => void;
}

interface FormData {
  // Step 1 — org
  orgName: string;
  // Step 2 — admin user
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
  // Step 3 — first app (optional)
  appName: string;
  environment: string;
  skipApp: boolean;
}

const STEPS = [
  { label: 'Organization', icon: Building2 },
  { label: 'Account',      icon: User },
  { label: 'First App',    icon: Package },
];

const Logo = () => (
  <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center mx-auto mb-4">
    <svg className="w-7 h-7 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  </div>
);

export const RegisterPage: React.FC<Props> = ({ onLoginClick, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState<FormData>({
    orgName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    appName: '',
    environment: 'production',
    skipApp: false,
  });

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const canNext = () => {
    if (step === 0) return form.orgName.trim().length >= 2;
    if (step === 1) {
      return (
        form.userName.trim().length >= 2 &&
        form.email.includes('@') &&
        form.password.length >= 8 &&
        form.password === form.confirmPassword
      );
    }
    return true;
  };

  const submit = async () => {
    setLoading(true);
    try {
      // 1. Create organization
      const { data: org } = await api.post('/organization', { name: form.orgName });

      // 2. Create admin user
      const { data: auth } = await api.post('/auth/user', {
        name: form.userName,
        email: form.email,
        password: form.password,
        organizationId: org.id,
        role: 'ADMIN',
      });

      // 3. Create first app (optional)
      if (!form.skipApp && form.appName.trim()) {
        await api.post('/applications', {
          name: form.appName.trim(),
          organization_id: org.id,
          environment: form.environment,
        });
      }

      toast.success('Account created! Welcome to Deep Eyes.');
      onSuccess(auth.accessToken, auth.user);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Logo />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Set up Deep Eyes for your organization</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                    done   ? 'bg-green-500 border-green-500 text-white' :
                    active ? 'bg-white dark:bg-gray-800 border-blue-500 text-blue-500' :
                             'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}>
                    {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium ${active ? 'text-blue-500' : 'text-gray-400'}`}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-12 mx-1 mb-5 transition-colors ${i < step ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          {/* Step 0 — Organization */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Organization name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={form.orgName} onChange={set('orgName')}
                    autoFocus required
                    className="w-full pl-9 pr-3 py-2 text-sm form-input"
                    placeholder="Acme Corp"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  This will be the workspace name visible to all team members.
                </p>
              </div>
            </>
          )}

          {/* Step 1 — Admin user */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={form.userName} onChange={set('userName')}
                    autoFocus required
                    className="w-full pl-9 pr-3 py-2 text-sm form-input"
                    placeholder="Jane Smith"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email" value={form.email} onChange={set('email')}
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm form-input"
                    placeholder="jane@acme.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')}
                    required
                    className="w-full pl-9 pr-9 py-2 text-sm form-input"
                    placeholder="Min. 8 characters"
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                    required
                    className={`w-full pl-9 pr-9 py-2 text-sm form-input ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? 'border-red-400 focus:ring-red-400'
                        : ''
                    }`}
                    placeholder="Repeat password"
                  />
                  <button type="button" onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </>
          )}

          {/* Step 2 — First app */}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create your first application to start sending logs. You can skip and do this later.
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application name</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={form.appName} onChange={set('appName')}
                    disabled={form.skipApp}
                    autoFocus
                    className="w-full pl-9 pr-3 py-2 text-sm form-input disabled:opacity-50"
                    placeholder="my-app-web"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Environment</label>
                <select
                  value={form.environment} onChange={set('environment')}
                  disabled={form.skipApp}
                  className="w-full py-2 px-3 text-sm form-input disabled:opacity-50"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.skipApp}
                  onChange={e => setForm(f => ({ ...f, skipApp: e.target.checked, appName: '' }))}
                  className="rounded"
                />
                Skip for now — I'll add apps later
              </label>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext()}
                className="flex-1 flex items-center justify-center gap-1 btn-primary py-2 text-sm font-medium disabled:opacity-50"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="flex-1 btn-primary py-2 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{' '}
          <button onClick={onLoginClick} className="text-blue-500 hover:underline font-medium">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
