import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import Layout from '../components/Layout';
import { Button, PageHeader, Panel } from './ui';

const AddAdminProfile: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [emailError, setEmailError] = useState('');
  const [saving, setSaving] = useState(false);

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateEmail(email)) {
      setEmailError('Invalid email format.');
      return;
    }
    setEmailError('');

    try {
      setSaving(true);
      await axios.post('/admins', {
        username: name,
        email,
        password,
        role,
      });
      navigate('/admin-profile');
    } catch (error: any) {
      window.alert(error.response?.data?.detail || 'Error creating admin.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout pageTitle="Add Admin">
      <PageHeader
        title="Add Admin Profile"
        description="Create a local administrator profile and assign dashboard role."
      />
      <Panel className="max-w-xl p-5">
        <form onSubmit={handleRegister} className="space-y-4">
          <Field
            label="Email"
            type="email"
            value={email}
            error={emailError}
            onChange={(value) => {
              setEmail(value);
              if (emailError) setEmailError('');
            }}
          />
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Password" type="password" value={password} onChange={setPassword} />
          <label className="block text-sm font-semibold text-[var(--pp-ink)]">
            Role
            <select
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
            >
              <option value="admin">Admin</option>
              <option value="operator">Operator</option>
            </select>
          </label>
          <Button type="submit" loading={saving}>
            <Save size={16} /> Create admin
          </Button>
        </form>
      </Panel>
    </Layout>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
}> = ({ label, value, onChange, type = 'text', error }) => (
  <label className="block text-sm font-semibold text-[var(--pp-ink)]">
    {label}
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
    />
    {error && <span className="mt-1 block text-xs font-semibold text-[var(--pp-danger)]">{error}</span>}
  </label>
);

export default AddAdminProfile;
