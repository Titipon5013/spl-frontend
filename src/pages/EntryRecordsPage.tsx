import React, { useEffect, useState } from 'react';
import { Calendar, Image as ImageIcon, Search } from 'lucide-react';
import axiosInstance from '../api/axios';
import Layout from '../components/Layout';
import { Button, EmptyState, PageHeader, Panel } from '../components/ui';

interface EntryRecord {
  id: number;
  plate_number: string;
  plate_image_url: string;
  timestamp: string;
}

const EntryRecordsPage: React.FC = () => {
  const [entryRecords, setEntryRecords] = useState<EntryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchEntryRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const res = await axiosInstance.get('/entry-records', { params });
      setEntryRecords(res.data);
    } catch (err) {
      console.error(err);
      setError('Unable to load entry records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntryRecords();
  }, [currentPage]);

  const handleFilter = () => {
    setCurrentPage(1);
    fetchEntryRecords();
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = entryRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(entryRecords.length / itemsPerPage));

  return (
    <Layout pageTitle="Entry Records">
      <PageHeader
        title="Entry Records"
        description="Review captured vehicle entry events, timestamps, and plate images."
      />

      <Panel className="mb-4 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <DateField label="Start Date" value={startDate} onChange={setStartDate} />
          <DateField label="End Date" value={endDate} onChange={setEndDate} />
          <Button onClick={handleFilter}><Search size={16} /> Filter</Button>
        </div>
      </Panel>

      {error && <div className="mb-4"><EmptyState title="Unable to load records" description={error} tone="warning" /></div>}

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--pp-line)] bg-[var(--pp-canvas)] text-[var(--pp-muted)]">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Plate Number</th>
                <th className="px-4 py-3 font-semibold">Plate Image</th>
                <th className="px-4 py-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--pp-line)]">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center font-medium text-[var(--pp-muted)]">Loading entry records...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8"><EmptyState title="No entry records found" description="Try another date range or wait for camera events." /></td></tr>
              ) : (
                currentItems.map((record, index) => (
                  <tr key={record.id} className="bg-white hover:bg-[var(--pp-canvas)]">
                    <td className="px-4 py-3 text-[var(--pp-muted)]">{indexOfFirstItem + index + 1}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[var(--pp-ink)]">{record.plate_number}</td>
                    <td className="px-4 py-3">
                      {record.plate_image_url ? (
                        <img src={record.plate_image_url} alt={`Plate ${record.plate_number}`} className="h-12 w-24 rounded-[var(--pp-radius)] object-cover" />
                      ) : (
                        <span className="inline-flex h-12 w-24 items-center justify-center gap-1 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-[var(--pp-canvas)] text-xs font-semibold text-[var(--pp-muted)]">
                          <ImageIcon size={14} /> No image
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--pp-muted)]">{new Date(record.timestamp).toLocaleString()}</td>
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
    </Layout>
  );
};

const DateField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block text-sm font-semibold text-[var(--pp-ink)]">
    <span className="flex items-center gap-2"><Calendar size={15} /> {label}</span>
    <input
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
    />
  </label>
);

export default EntryRecordsPage;
