import React, { useState } from 'react';
import { ImagePlus, Save } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import axios from '../api/axios';
import Layout from '../components/Layout';
import { Button, PageHeader, Panel } from './ui';

const AddLicencePlate: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!photo) {
      toast.error('Please upload a photo.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('name', name);
    formData.append('plateNumber', plateNumber);
    formData.append('photo', photo);

    try {
      setSaving(true);
      await axios.post('/plates', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('License plate added successfully.');
      setEmail('');
      setName('');
      setPlateNumber('');
      setPhoto(null);
    } catch (error) {
      console.error('Error adding license plate:', error);
      toast.error('Failed to add license plate.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout pageTitle="Add License Plate">
      <PageHeader
        title="Add License Plate"
        description="Create a vehicle registration record for parking access."
      />
      <Panel className="max-w-3xl p-5">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} />
            <Field label="Name" value={name} onChange={setName} />
            <Field label="Plate Number" value={plateNumber} onChange={setPlateNumber} />
          </div>
          <div className="flex flex-col gap-4">
            <label className="block text-sm font-semibold text-[var(--pp-ink)]">
              Plate Photo
              <span className="mt-1 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[var(--pp-radius)] border-2 border-dashed border-[var(--pp-line)] bg-[var(--pp-canvas)] p-4 text-center text-[var(--pp-muted)] hover:border-[var(--pp-blue)]">
                <ImagePlus size={28} />
                <span className="mt-2 text-sm font-semibold">{photo ? photo.name : 'Upload photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => setPhoto(event.target.files?.[0] || null)}
                />
              </span>
            </label>
            <Button type="submit" loading={saving} className="md:self-start">
              <Save size={16} /> Add license plate
            </Button>
          </div>
        </form>
      </Panel>
      <ToastContainer position="bottom-right" />
    </Layout>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}> = ({ label, value, onChange, type = 'text' }) => (
  <label className="block text-sm font-semibold text-[var(--pp-ink)]">
    {label}
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
      className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
    />
  </label>
);

export default AddLicencePlate;
