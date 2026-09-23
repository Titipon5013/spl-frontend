import React, { useCallback, useEffect, useState } from 'react';
import { Check, Clock, Filter, Image as ImageIcon, Mail, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import axiosInstance from '../api/axios';
import { Button, Dialog, EmptyState, PageHeader, Panel, SelectField, StatusBadge } from './ui';
import type { LicensePlateRequest, PlateRequestStatus } from '../types/parking';

const statusOptions = [
  { value: 'all', label: 'All requests' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const statusTone: Record<PlateRequestStatus, 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

const statusLabel: Record<PlateRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const PlateRequestTable: React.FC = () => {
  const [requests, setRequests] = useState<LicensePlateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [pendingReject, setPendingReject] = useState<LicensePlateRequest | null>(null);
  const itemsPerPage = 10;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', itemsPerPage.toString());

      const res = await axiosInstance.get(`/requests?${params.toString()}`);
      const rows: LicensePlateRequest[] = res.data;
      setRequests(rows);
      const headerTotal = Number(res.headers['x-total-count']);
      setTotal(Number.isFinite(headerTotal) ? headerTotal : rows.length);
    } catch (err) {
      console.error('Error fetching plate requests:', err);
      setError('Plate registration requests are unavailable. Confirm administrator token and API connectivity.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleStatusUpdate = async (id: number, newStatus: PlateRequestStatus) => {
    try {
      setUpdatingId(id);
      await axiosInstance.put(`/requests/${id}`, { status: newStatus });
      setRequests((prev) => prev.map((req) => (req.id === id ? { ...req, status: newStatus } : req)));
      toast.success(newStatus === 'approved' ? 'Plate request approved.' : 'Plate request rejected.');
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Unable to update plate request. Please try again.');
    } finally {
      setUpdatingId(null);
      setPendingReject(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));

  return (
    <>
      <PageHeader
        title="Plate Registration Requests"
        description="Review vehicles registered from the public portal and approve or reject access."
        actions={<StatusBadge tone="info">{total} total</StatusBadge>}
      />

      <div className="mb-4 flex flex-col gap-3 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white p-3 sm:flex-row sm:items-end sm:justify-between">
        <SelectField label="Request status" value={statusFilter} onChange={handleFilterChange} options={statusOptions} />
        <div className="flex items-center gap-2 text-sm text-[var(--pp-muted)]">
          <Filter size={16} />
          <span>Approving a request registers the plate for automated parking access.</span>
        </div>
      </div>

      {error && <div className="mb-5"><EmptyState title="Unable to load plate requests" description={error} tone="warning" /></div>}

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="border-b border-[var(--pp-line)] bg-[var(--pp-canvas)] text-[var(--pp-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">Plate</th>
                <th className="px-4 py-3 font-semibold">Requester</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pp-line)]">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center font-medium text-[var(--pp-muted)]">Loading plate requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8">
                    <EmptyState title="No plate requests found" description="Try another request status filter." />
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="bg-white hover:bg-[var(--pp-canvas)]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {req.plate_image_url ? (
                          <img src={req.plate_image_url} alt={`Plate ${req.plate_number}`} className="h-12 w-24 rounded-[var(--pp-radius)] object-cover" />
                        ) : (
                          <span className="inline-flex h-12 w-24 items-center justify-center rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-[var(--pp-canvas)] text-xs font-semibold text-[var(--pp-muted)]">
                            <ImageIcon size={14} /> No image
                          </span>
                        )}
                        <span className="font-mono font-semibold text-[var(--pp-ink)]">{req.plate_number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[var(--pp-ink)]">{req.username}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--pp-muted)]">
                        <Mail size={12} /> {req.user_email}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={statusTone[req.status]}>
                        {req.status === 'pending' ? <Clock size={14} /> : req.status === 'approved' ? <Check size={14} /> : <X size={14} />}
                        {' '}{statusLabel[req.status]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {req.status === 'pending' ? (
                          <>
                            <Button variant="secondary" loading={updatingId === req.id} onClick={() => handleStatusUpdate(req.id, 'approved')}>
                              <Check size={16} /> Approve
                            </Button>
                            <Button variant="danger" loading={updatingId === req.id} onClick={() => setPendingReject(req)}>
                              <X size={16} /> Reject
                            </Button>
                          </>
                        ) : req.status === 'approved' ? (
                          <Button variant="danger" loading={updatingId === req.id} onClick={() => setPendingReject(req)}>
                            <X size={16} /> Revoke
                          </Button>
                        ) : (
                          <Button variant="secondary" loading={updatingId === req.id} onClick={() => handleStatusUpdate(req.id, 'approved')}>
                            <Check size={16} /> Re-approve
                          </Button>
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

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span className="text-sm font-semibold text-[var(--pp-muted)]">Page {page} of {totalPages}</span>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>

      <Dialog
        open={Boolean(pendingReject)}
        title={pendingReject?.status === 'approved' ? 'Revoke plate access' : 'Reject plate request'}
        onClose={() => setPendingReject(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPendingReject(null)}>Cancel</Button>
            {pendingReject && (
              <Button variant="danger" loading={updatingId === pendingReject.id} onClick={() => handleStatusUpdate(pendingReject.id, 'rejected')}>
                {pendingReject.status === 'approved' ? 'Revoke access' : 'Reject request'}
              </Button>
            )}
          </>
        }
      >
        <div className="p-4">
          <p className="text-sm text-[var(--pp-muted)]">
            Rejecting <strong className="text-[var(--pp-ink)]">{pendingReject?.plate_number}</strong> will deny parking access for{' '}
            <strong className="text-[var(--pp-ink)]">{pendingReject?.username}</strong>. If this plate was already approved, its access is revoked.
          </p>
        </div>
      </Dialog>

      <ToastContainer position="bottom-right" />
    </>
  );
};

export default PlateRequestTable;
