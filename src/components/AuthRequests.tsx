import React, { useEffect, useState } from 'react';
import { Check, Clock, Filter, Mail, ShieldAlert, ShieldCheck, UserX, X } from 'lucide-react';
import axiosInstance from '../api/axios';
import MainLayout from './MainLayout';
import { Button, Dialog, EmptyState, PageHeader, Panel, SelectField, StatusBadge } from './ui';
import type { AdminAccessRequest, ApprovalStatus } from '../types/parking';

const statusOptions = [
  { value: 'all', label: 'All personnel' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved', label: 'Active admins' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revoked', label: 'Revoked' },
];

const statusTone: Record<ApprovalStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'neutral',
  revoked: 'danger',
};

const AuthRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdminAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pendingRevoke, setPendingRevoke] = useState<AdminAccessRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setError(null);
      setLoading(true);
      const response = await axiosInstance.get('/admin-access/requests');
      setRequests(
        response.data.map((admin: any) => ({
          id: admin.id,
          name: admin.name || 'Unknown User',
          email: admin.email,
          avatar:
            admin.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || admin.email)}&background=164675&color=fff`,
          status: admin.status || 'pending',
          requestDate: admin.created_at
            ? new Date(admin.created_at).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'N/A',
        }))
      );
    } catch (err) {
      console.error('Error fetching admin requests:', err);
      setError('Access requests are unavailable. Confirm administrator token and API connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: number, newStatus: ApprovalStatus, name: string) => {
    try {
      setUpdatingId(id);
      await axiosInstance.put(`/admin-access/requests/${id}`, { status: newStatus });
      setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
      if (newStatus === 'approved') {
        window.alert(`Access granted for ${name}. Dashboard access, LINE QR delivery, and weekly report subscription were triggered.`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      window.alert('Unable to update access status. Please try again.');
    } finally {
      setUpdatingId(null);
      setPendingRevoke(null);
    }
  };

  const filteredRequests = requests.filter((req) => (statusFilter === 'all' ? true : req.status === statusFilter));

  return (
    <MainLayout pageTitle="Access Requests">
      <PageHeader
        title="Admin Onboarding & Access"
        description="Review Google OAuth sign-ups, approve administrators, and revoke access when needed."
        actions={<StatusBadge tone="info">{filteredRequests.length} shown</StatusBadge>}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white p-3 sm:flex-row sm:items-end sm:justify-between">
        <SelectField label="Approval status" value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
        <div className="flex items-center gap-2 text-sm text-[var(--pp-muted)]">
          <Filter size={16} />
          <span>Manual approval controls administrator dashboard and LINE chatbot access.</span>
        </div>
      </div>

      {error && <div className="mb-5"><EmptyState title="Unable to load access requests" description={error} tone="warning" /></div>}

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--pp-line)] bg-[var(--pp-canvas)] text-[var(--pp-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">User Identity</th>
                <th className="px-4 py-3 font-semibold">Request Date</th>
                <th className="px-4 py-3 font-semibold">Approval Status</th>
                <th className="px-4 py-3 text-right font-semibold">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pp-line)]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center font-medium text-[var(--pp-muted)]">Loading identities...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <EmptyState title="No access records found" description="Try another approval status filter." />
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="bg-white hover:bg-[var(--pp-canvas)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={req.avatar} alt="" className="h-10 w-10 rounded-[var(--pp-radius)]" />
                        <div className="min-w-0">
                          <p className="font-bold text-[var(--pp-ink)]">{req.name}</p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-[var(--pp-muted)]">
                            <Mail size={12} /> {req.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--pp-muted)]">
                      <span className="flex items-center gap-2"><Clock size={14} /> {req.requestDate}</span>
                    </td>
                    <td className="px-4 py-3">
                      <AccessStatus status={req.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              variant="secondary"
                              loading={updatingId === req.id}
                              onClick={() => handleStatusUpdate(req.id, 'approved', req.name)}
                            >
                              <Check size={16} /> Approve
                            </Button>
                            <Button
                              variant="danger"
                              loading={updatingId === req.id}
                              onClick={() => handleStatusUpdate(req.id, 'rejected', req.name)}
                            >
                              <X size={16} /> Reject
                            </Button>
                          </>
                        )}
                        {req.status === 'approved' && (
                          <Button variant="danger" loading={updatingId === req.id} onClick={() => setPendingRevoke(req)}>
                            <UserX size={16} /> Revoke
                          </Button>
                        )}
                        {(req.status === 'rejected' || req.status === 'revoked') && (
                          <span className="text-xs font-semibold text-[var(--pp-muted)]">No active access</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Dialog
        open={Boolean(pendingRevoke)}
        title="Revoke administrator access"
        onClose={() => setPendingRevoke(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingRevoke(null)}>Cancel</Button>
            {pendingRevoke && (
              <Button variant="danger" loading={updatingId === pendingRevoke.id} onClick={() => handleStatusUpdate(pendingRevoke.id, 'revoked', pendingRevoke.name)}>
                Revoke access
              </Button>
            )}
          </>
        }
      >
        <div className="p-4">
          <p className="text-sm text-[var(--pp-muted)]">
            Revoking access for <strong className="text-[var(--pp-ink)]">{pendingRevoke?.name}</strong> will block protected dashboard access and LINE chatbot permissions for this administrator.
          </p>
        </div>
      </Dialog>
    </MainLayout>
  );
};

const AccessStatus: React.FC<{ status: ApprovalStatus }> = ({ status }) => {
  const icon = {
    pending: <ShieldAlert size={14} />,
    approved: <ShieldCheck size={14} />,
    rejected: <X size={14} />,
    revoked: <UserX size={14} />,
  }[status];

  const label = {
    pending: 'Pending',
    approved: 'Active access',
    rejected: 'Rejected',
    revoked: 'Revoked',
  }[status];

  return <StatusBadge tone={statusTone[status]}>{icon} {label}</StatusBadge>;
};

export default AuthRequests;
