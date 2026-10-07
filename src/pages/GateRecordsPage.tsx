import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Calendar, Clock3, DoorOpen, RefreshCw, TrendingUp } from 'lucide-react';
import axiosInstance from '../api/axios';
import Layout from '../components/Layout';
import { EmptyState, MetricTile, PageHeader, Panel, StatusBadge } from '../components/ui';

interface GateCounts {
  open_count: number;
  close_count: number;
  count_gap: number;
  has_missing_message: boolean;
}

interface HourCount extends GateCounts {
  hour: string;
}

interface WeeklySummary {
  open_count: number;
  close_count: number;
  peak_hours?: {
    total?: { hour: string; count: number } | null;
  };
};

const GateRecordsPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [daily, setDaily] = useState<GateCounts | null>(null);
  const [hourly, setHourly] = useState<HourCount[]>([]);
  const [weekly, setWeekly] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = selectedDate ? { date: selectedDate } : {};
      const [dailyResponse, hourlyResponse, weeklyResponse] = await Promise.all([
        axiosInstance.get<GateCounts>('/gate/counts/daily', { params }),
        axiosInstance.get<{ hours: HourCount[] }>('/gate/counts/hourly', { params }),
        axiosInstance.get<WeeklySummary>('/gate/counts/weekly'),
      ]);
      setDaily(dailyResponse.data);
      setHourly(hourlyResponse.data.hours || []);
      setWeekly(weeklyResponse.data);
    } catch (requestError) {
      console.error('Error fetching gate records:', requestError);
      setError('Gate records are unavailable right now. Check API connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate, startTime, endTime]);

  const filteredHours = useMemo(() => {
    const startHour = startTime ? Number(startTime.slice(0, 2)) : 0;
    const endHourValue = endTime ? Number(endTime.slice(0, 2)) : 23;
    const endHour = endTime && endTime.slice(3) === '00' ? endHourValue - 1 : endHourValue;
    return hourly.filter((item) => {
      const hour = Number(item.hour.slice(0, 2));
      return hour >= startHour && hour <= endHour;
    });
  }, [hourly, startTime, endTime]);

  const filteredCounts = useMemo(
    () => filteredHours.reduce(
      (totals, item) => ({
        open_count: totals.open_count + item.open_count,
        close_count: totals.close_count + item.close_count,
      }),
      { open_count: 0, close_count: 0 },
    ),
    [filteredHours],
  );
  return (
    <Layout pageTitle="Gate Records">
      <PageHeader
        title="Gate Records"
        description="Review gate open and close counts for a selected date and time range."
        actions={
          <button type="button" onClick={fetchData} className="inline-flex min-h-10 items-center gap-2 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3.5 py-2 text-sm font-semibold text-[var(--pp-ink)] hover:bg-[var(--pp-surface-muted)]">
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />

      <Panel className="mb-5 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
          <DateField label="Date" value={selectedDate} onChange={setSelectedDate} />
          <TimeField label="From" value={startTime} onChange={setStartTime} />
          <TimeField label="To" value={endTime} onChange={setEndTime} />
        </div>
      </Panel>

      {error && <div className="mb-5"><EmptyState title="Unable to load gate records" description={error} tone="warning" /></div>}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile label="Today's Opens" value={loading ? '...' : filteredCounts.open_count} icon={<DoorOpen size={18} />} tone="success" meta="Selected date and time range" />
        <MetricTile label="Today's Closes" value={loading ? '...' : filteredCounts.close_count} icon={<Activity size={18} />} tone="info" meta="Selected date and time range" />
        <MetricTile label="Total Events" value={loading ? '...' : filteredCounts.open_count + filteredCounts.close_count} icon={<Calendar size={18} />} tone="neutral" meta="Selected date and time range" />
        <MetricTile label="Weekly Gate Count" value={loading ? '...' : weekly ? weekly.open_count + weekly.close_count : '—'} icon={<DoorOpen size={18} />} tone="info" meta={weekly ? `${weekly.open_count} opens · ${weekly.close_count} closes` : 'Monday-Sunday'} />
        <MetricTile label="Gate Peak Hour" value={loading ? '...' : weekly?.peak_hours?.total?.hour || '—'} icon={<TrendingUp size={18} />} tone="warning" meta={weekly?.peak_hours?.total ? `${weekly.peak_hours.total.count} events this week` : 'No gate events recorded'} />
      </div>

      {daily?.has_missing_message && (
        <div className="mt-4"><StatusBadge tone="warning">Count gap detected between open and close events.</StatusBadge></div>
      )}
    </Layout>
  );
};

const DateField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block text-sm font-semibold text-[var(--pp-ink)]">
    <span className="flex items-center gap-2"><Calendar size={15} /> {label}</span>
    <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20" />
  </label>
);

const TimeField: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block text-sm font-semibold text-[var(--pp-ink)]">
    <span className="flex items-center gap-2"><Clock3 size={15} /> {label}</span>
    <input type="time" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block min-h-10 w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20" />
  </label>
);

export default GateRecordsPage;
