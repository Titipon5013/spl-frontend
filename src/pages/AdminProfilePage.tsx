import React, { useEffect, useState } from 'react';
import { Edit2, Plus, Save, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import Layout from '../components/Layout';
import { Button, Dialog, EmptyState, PageHeader, Panel, StatusBadge } from '../components/ui';

interface Admin {
  id: number;
  username: string;
  password: string;
  role: string;
}

const AdminProfilePage = () => {
  const navigate = useNavigate();
  const [adminList, setAdminList] = useState<Admin[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Admin>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', currentPage.toString());
        params.append('limit', itemsPerPage.toString());
        const res = await axiosInstance.get(`/admins?${params.toString()}`);
        if (Array.isArray(res.data)) {
          setAdminList(res.data);
          setTotalPages(1);
        } else {
          setAdminList(res.data.admins);
          setTotalPages(res.data.total_pages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch admins', err);
        setError('Unable to load administrator profiles.');
      } finally {
        setLoading(false);
      }
    };
    fetchAdmins();
  }, [currentPage]);

  const confirmDelete = async () => {
    if (targetId === null) return;
    try {
      await axiosInstance.delete(`/admins/${targetId}`);
      const updated = adminList.filter((admin) => admin.id !== targetId);
      setAdminList(updated);
      localStorage.setItem('adminList', JSON.stringify(updated));
    } catch (err: any) {
      window.alert(err.response?.data?.detail || 'Failed to delete admin.');
      console.error(err);
    } finally {
      setTargetId(null);
    }
  };

  const handleEditClick = (admin: Admin) => {
    setEditingId(admin.id);
    setEditData({ username: admin.username, password: '', role: admin.role });
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    try {
      setSaving(true);
      const payload: { username?: string; password?: string; role?: string } = {
        username: editData.username,
        role: editData.role,
      };
      if (editData.password) payload.password = editData.password;
      await axiosInstance.patch(`/admins/${editingId}`, payload);

      setAdminList((prev) =>
        prev.map((admin) =>
          admin.id === editingId
            ? { ...admin, username: editData.username || '', role: editData.role || '' }
            : admin
        )
      );
      setEditingId(null);
      setEditData({});
    } catch (err) {
      console.error('Error updating user', err);
      window.alert('Unable to update administrator profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout pageTitle="Admin Profile">
      <PageHeader
        title="Admin Profiles"
        description="Manage local administrator credentials and roles for the dashboard."
        actions={<Button onClick={() => navigate('/add-admin')}><Plus size={16} /> Add admin</Button>}
      />

      {error && <div className="mb-4"><EmptyState title="Unable to load administrators" description={error} tone="warning" /></div>}

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--pp-line)] bg-[var(--pp-canvas)] text-[var(--pp-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Password</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pp-line)]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center font-medium text-[var(--pp-muted)]">Loading administrators...</td></tr>
              ) : adminList.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8"><EmptyState title="No administrators found" description="Create an administrator profile to populate this table." /></td></tr>
              ) : (
                adminList.map((admin, index) => (
                  <tr key={admin.id} className="bg-white hover:bg-[var(--pp-canvas)]">
                    <td className="px-4 py-3 text-[var(--pp-muted)]">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    {editingId === admin.id ? (
                      <>
                        <td className="px-4 py-3"><Input value={editData.username || ''} onChange={(value) => setEditData((prev) => ({ ...prev, username: value }))} /></td>
                        <td className="px-4 py-3"><Input type="password" value={editData.password || ''} onChange={(value) => setEditData((prev) => ({ ...prev, password: value }))} placeholder="Leave blank to keep password" /></td>
                        <td className="px-4 py-3">
                          <select
                            value={editData.role || ''}
                            onChange={(event) => setEditData((prev) => ({ ...prev, role: event.target.value }))}
                            className="min-h-10 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
                          >
                            <option value="">Select role</option>
                            <option value="admin">Admin</option>
                            <option value="operator">Operator</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button loading={saving} className="min-h-9 px-2" onClick={saveEdit} aria-label="Save admin"><Save size={15} /></Button>
                            <Button variant="secondary" className="min-h-9 px-2" onClick={() => setEditingId(null)} aria-label="Cancel edit"><X size={15} /></Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-semibold text-[var(--pp-ink)]">{admin.username}</td>
                        <td className="px-4 py-3 font-mono text-[var(--pp-muted)]">********</td>
                        <td className="px-4 py-3"><StatusBadge tone={admin.role === 'admin' ? 'info' : 'neutral'}>{admin.role}</StatusBadge></td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button variant="secondary" className="min-h-9 px-2" onClick={() => handleEditClick(admin)} aria-label={`Edit ${admin.username}`}><Edit2 size={15} /></Button>
                            <Button variant="danger" className="min-h-9 px-2" onClick={() => setTargetId(admin.id)} aria-label={`Delete ${admin.username}`}><Trash2 size={15} /></Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1}>Previous</Button>
        <span className="text-sm font-semibold text-[var(--pp-muted)]">Page {currentPage} of {totalPages}</span>
        <Button variant="secondary" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage === totalPages}>Next</Button>
      </div>

      <Dialog
        open={targetId !== null}
        title="Delete administrator"
        onClose={() => setTargetId(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setTargetId(null)}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </>
        }
      >
        <p className="p-4 text-sm text-[var(--pp-muted)]">This will remove the selected local administrator profile.</p>
      </Dialog>
    </Layout>
  );
};

const Input: React.FC<{
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}> = ({ value, onChange, type = 'text', placeholder }) => (
  <input
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={(event) => onChange(event.target.value)}
    className="min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none placeholder:text-[var(--pp-muted)] focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
  />
);

export default AdminProfilePage;
