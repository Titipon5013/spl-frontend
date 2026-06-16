import React, { useEffect, useState } from 'react';
import { Edit2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Button, Dialog, EmptyState, PageHeader, Panel } from './ui';

interface PlateEntry {
  id: number;
  plate_number: string;
  plate_image_url: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const LicencePlateTable: React.FC = () => {
  const [data, setData] = useState<PlateEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [editEntry, setEditEntry] = useState<PlateEntry | null>(null);
  const [editForm, setEditForm] = useState({ plate_number: '', user_email: '', username: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      const res = await axiosInstance.get(`/plates?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load license plate records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleDelete = async () => {
    if (targetId === null) return;
    try {
      await axiosInstance.delete(`/plates/${targetId}`);
      setData((prev) => prev.filter((item) => item.id !== targetId));
    } catch (err) {
      console.error('Delete failed:', err);
      window.alert('Unable to delete license plate record.');
    } finally {
      setTargetId(null);
    }
  };

  const handleEdit = (entry: PlateEntry) => {
    setEditEntry(entry);
    setEditForm({
      plate_number: entry.plate_number,
      user_email: entry.user.email,
      username: entry.user.name,
    });
  };

  const handleEditSubmit = async () => {
    if (!editEntry) return;
    const formData = new FormData();
    formData.append('plate_number', editForm.plate_number);
    formData.append('user_email', editForm.user_email);
    formData.append('username', editForm.username);
    if (selectedFile) formData.append('file', selectedFile);

    try {
      setSaving(true);
      const res = await axiosInstance.put(`/plates/${editEntry.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setData((prev) => prev.map((item) => (item.id === editEntry.id ? res.data : item)));
      setEditEntry(null);
      setSelectedFile(null);
    } catch (err) {
      console.error('Update failed:', err);
      window.alert('Unable to update license plate record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title="License Plate Registry"
        description="Manage registered vehicles and plate images used by the parking access workflow."
        actions={<Button onClick={() => navigate('/add-licence')}><Plus size={16} /> Add plate</Button>}
      />

      {error && <div className="mb-4"><EmptyState title="Unable to load records" description={error} tone="warning" /></div>}

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-[var(--pp-line)] bg-[var(--pp-canvas)] text-[var(--pp-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Plate Number</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Image</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pp-line)]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center font-medium text-[var(--pp-muted)]">Loading license plates...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8"><EmptyState title="No license plates found" description="Add a vehicle registration to populate this table." /></td></tr>
              ) : (
                data.map((entry, index) => (
                  <tr key={entry.id} className="bg-white hover:bg-[var(--pp-canvas)]">
                    <td className="px-4 py-3 text-[var(--pp-muted)]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--pp-ink)]">{entry.user.name}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[var(--pp-ink)]">{entry.plate_number}</td>
                    <td className="px-4 py-3 text-[var(--pp-muted)]">{entry.user.email}</td>
                    <td className="px-4 py-3">
                      {entry.plate_image_url ? (
                        <img src={entry.plate_image_url} alt={`Plate ${entry.plate_number}`} className="h-12 w-24 rounded-[var(--pp-radius)] object-cover" />
                      ) : (
                        <span className="inline-flex h-12 w-24 items-center justify-center rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-[var(--pp-canvas)] text-xs font-semibold text-[var(--pp-muted)]">
                          <ImageIcon size={14} /> No image
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" className="min-h-9 px-2" onClick={() => handleEdit(entry)} aria-label={`Edit ${entry.plate_number}`}>
                          <Edit2 size={15} />
                        </Button>
                        <Button variant="danger" className="min-h-9 px-2" onClick={() => setTargetId(entry.id)} aria-label={`Delete ${entry.plate_number}`}>
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>Previous</Button>
        <span className="text-sm font-semibold text-[var(--pp-muted)]">Page {currentPage}</span>
        <Button variant="secondary" disabled={data.length < itemsPerPage} onClick={() => setCurrentPage((page) => page + 1)}>Next</Button>
      </div>

      <Dialog
        open={targetId !== null}
        title="Delete license plate"
        onClose={() => setTargetId(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTargetId(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="p-4 text-sm text-[var(--pp-muted)]">This will remove the selected license plate record from the registry.</p>
      </Dialog>

      <Dialog
        open={editEntry !== null}
        title="Edit license plate"
        onClose={() => setEditEntry(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditEntry(null)}>Cancel</Button>
            <Button loading={saving} onClick={handleEditSubmit}>Save changes</Button>
          </>
        }
      >
        <div className="grid gap-4 p-4">
          <Field label="Plate Number" value={editForm.plate_number} onChange={(value) => setEditForm({ ...editForm, plate_number: value })} />
          <Field label="Client Email" type="email" value={editForm.user_email} onChange={(value) => setEditForm({ ...editForm, user_email: value })} />
          <Field label="Username" value={editForm.username} onChange={(value) => setEditForm({ ...editForm, username: value })} />
          <label className="block text-sm font-semibold text-[var(--pp-ink)]">
            Image
            <input
              type="file"
              className="mt-1 block w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm"
              onChange={(event) => setSelectedFile(event.target.files ? event.target.files[0] : null)}
            />
          </label>
        </div>
      </Dialog>
    </>
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
      className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
    />
  </label>
);

export default LicencePlateTable;
