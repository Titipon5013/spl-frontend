import React, { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Landmark, Lock, User } from 'lucide-react';
import axiosInstance from '../api/axios';
import { Button, Panel, StatusBadge } from '../components/ui';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const oauthStatus = searchParams.get('oauth_status');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/dashboard');
      return;
    }

    if (oauthStatus === 'pending') setInfo('Your Google account is pending administrator approval.');
    else if (oauthStatus === 'rejected') setError('Your access request was rejected by an administrator.');
    else if (oauthStatus === 'revoked') setError('Your administrator access has been revoked.');
  }, [searchParams, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setInfo(null);

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const res = await axiosInstance.post('/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      localStorage.setItem('token', res.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Invalid username or password');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--pp-canvas)] px-4 py-10 text-[var(--pp-ink)]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-[1fr_420px]">
          <Panel className="hidden p-8 lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-[var(--pp-radius)] bg-[var(--pp-blue-deep)] p-2 text-white">
                  <Landmark size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold">ParkPilot</h1>
                  <p className="text-sm text-[var(--pp-muted)]">CAMT Field Ops Console</p>
                </div>
              </div>
              <h2 className="max-w-xl text-3xl font-bold leading-tight">Admin access for live parking operations.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--pp-muted)]">
                Review occupancy, camera health, reports, and administrator access from one protected operations surface.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3">
              <StatusBadge tone="success">Live occupancy</StatusBadge>
              <StatusBadge tone="info">Reports</StatusBadge>
              <StatusBadge tone="warning">Access review</StatusBadge>
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="rounded-[var(--pp-radius)] bg-[var(--pp-blue-deep)] p-2 text-white">
                <Landmark size={22} />
              </div>
              <div>
                <h1 className="font-bold">ParkPilot</h1>
                <p className="text-sm text-[var(--pp-muted)]">Admin Portal</p>
              </div>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-bold">Sign in</h2>
              <p className="mt-1 text-sm text-[var(--pp-muted)]">Use approved administrator credentials or Google OAuth.</p>
            </div>

            {info && <div className="mb-4 rounded-[var(--pp-radius)] border border-[#b7d0eb] bg-[var(--pp-blue-soft)] p-3 text-sm font-medium text-[var(--pp-blue-deep)]">{info}</div>}
            {error && <div className="mb-4 rounded-[var(--pp-radius)] border border-[#f3b5bb] bg-[var(--pp-danger-soft)] p-3 text-sm font-medium text-[var(--pp-danger)]">{error}</div>}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <Field
                label="Email"
                icon={<User size={18} />}
                value={username}
                onChange={setUsername}
                placeholder="admin@example.com"
              />
              <Field
                label="Password"
                icon={<Lock size={18} />}
                value={password}
                onChange={setPassword}
                placeholder="Password"
                type="password"
              />
              <Button type="submit" loading={submitting} className="w-full">
                Sign in to dashboard
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3 text-xs text-[var(--pp-muted)]">
              <div className="h-px flex-1 bg-[var(--pp-line)]" />
              <span>or continue with</span>
              <div className="h-px flex-1 bg-[var(--pp-line)]" />
            </div>

            <Button type="button" variant="secondary" onClick={() => { window.location.href = `${apiUrl}/api/oauth/google/login`; }} className="w-full">
              Sign in with Google
            </Button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--pp-muted)] hover:text-[var(--pp-blue)]"
            >
              <ArrowLeft size={16} />
              Back to public portal
            </button>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}> = ({ label, icon, value, onChange, placeholder, type = 'text' }) => (
  <label className="block text-sm font-semibold text-[var(--pp-ink)]">
    <span>{label}</span>
    <span className="mt-1 flex min-h-11 items-center gap-2 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 focus-within:border-[var(--pp-blue)] focus-within:ring-2 focus-within:ring-[var(--pp-blue)]/20">
      <span className="text-[var(--pp-muted)]">{icon}</span>
      <input
        type={type}
        required
        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[var(--pp-ink)] outline-none placeholder:text-[var(--pp-muted)]"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </span>
  </label>
);

export default Login;
