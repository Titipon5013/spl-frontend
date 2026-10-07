import React, { useEffect, useState } from 'react';
import { AlertTriangle, DoorClosed, DoorOpen, RefreshCw } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import axiosInstance from '../api/axios';
import MainLayout from '../components/MainLayout';
import { Button, EmptyState, MetricTile, PageHeader, Panel, StatusBadge, Toolbar } from '../components/ui';

interface HourlyGateCounts {
  hour: number;
  open_count: number;
  close_count: number;
}

interface GateCounts {
  date: string;
  timezone: string;
  gate_id: string | null;
  open_count: number;
  close_count: number;
  count_difference: number;
  possible_missing_events: boolean;
  hourly: HourlyGateCounts[];
}

const getBangkokDate = () => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};

const hourLabel = (hour: number) => `${String(hour).padStart(2, '0')}:00`;

const GateCountsPage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState(getBangkokDate);
  const [gateFilter, setGateFilter] = useState('CAMT_EXIT_01');
  const [counts, setCounts] = useState<GateCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchCounts = async (quiet = false) => {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      try {
        setError(null);
        const response = await axiosInstance.get('/analytics/gate/counts', {
          params: {
            day: selectedDay,
            ...(gateFilter ? { gate_id: gateFilter } : {}),
          },
        });
        if (!active) return;
        setCounts(response.data);
        setLastSync(new Date().toLocaleTimeString());
      } catch (requestError) {
        console.error('Unable to load gate counts:', requestError);
        if (active) setError('Gate event counts are unavailable. Check the backend connection and gate event database.');
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    void fetchCounts();
    const intervalId = window.setInterval(() => void fetchCounts(true), 30000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [selectedDay, gateFilter, refreshVersion]);

  const hourly = (counts?.hourly ?? []).map((row) => ({
    ...row,
    label: hourLabel(row.hour),
  }));

  const chartHasEvents = hourly.some((row) => row.open_count > 0 || row.close_count > 0);
  const mismatch = Boolean(counts?.possible_missing_events);
  const oneUnpairedEvent = counts?.count_difference === 1;

  return (
    <MainLayout pageTitle="Gate Counts">
      <PageHeader
        title="Gate Opening Activity"
        description="Daily relay open and close events received from Camera 3. Counts come from the persisted event log."
        actions={counts && (
          <StatusBadge tone={mismatch ? 'danger' : oneUnpairedEvent ? 'warning' : 'success'} pulse>
            {mismatch ? 'Possible missing events' : oneUnpairedEvent ? 'One event unpaired' : 'Event log in sync'}
          </StatusBadge>
        )}
      />

      <Toolbar>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-48 flex-col gap-1 text-sm font-semibold text-[var(--pp-ink)]">
            <span>Report date</span>
            <input
              aria-label="Report date"
              type="date"
              value={selectedDay}
              onChange={(event) => setSelectedDay(event.target.value)}
              className="min-h-10 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 text-sm font-medium outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
            />
          </label>
          <label className="flex min-w-52 flex-col gap-1 text-sm font-semibold text-[var(--pp-ink)]">
            <span>Gate</span>
            <select
              aria-label="Gate"
              value={gateFilter}
              onChange={(event) => setGateFilter(event.target.value)}
              className="min-h-10 rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white px-3 text-sm font-medium outline-none focus:border-[var(--pp-blue)] focus:ring-2 focus:ring-[var(--pp-blue)]/20"
            >
              <option value="">All gates</option>
              <option value="CAMT_EXIT_01">CAMT Exit 01</option>
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-[var(--pp-muted)]">
            Asia/Bangkok · refreshes every 30s{lastSync ? ` · updated ${lastSync}` : ''}
          </span>
          <Button
            variant="secondary"
            loading={refreshing}
            onClick={() => {
              setRefreshing(true);
              setRefreshVersion((version) => version + 1);
            }}
          >
            <RefreshCw size={16} /> Refresh
          </Button>
        </div>
      </Toolbar>

      {error && <div className="mb-5"><EmptyState title="Unable to load gate counts" description={error} tone="warning" /></div>}

      {mismatch && counts && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-[var(--pp-radius)] border border-[#f3b5bb] bg-[var(--pp-danger-soft)] p-4 text-[var(--pp-danger)]">
          <AlertTriangle size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-bold">Open and close totals differ by {counts.count_difference}</p>
            <p className="mt-1 text-sm">More than one unpaired event may indicate a message was lost. Check the MQTT connection and gate event log.</p>
          </div>
        </div>
      )}

      {!mismatch && counts?.count_difference === 1 && (
        <div className="mb-5 rounded-[var(--pp-radius)] border border-[#f0d48b] bg-[var(--pp-warning-soft)] px-4 py-3 text-sm text-[var(--pp-warning)]">
          Open and close totals differ by one. The gate may still be completing its current cycle.
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricTile
          label="Open events"
          value={loading ? '…' : counts?.open_count ?? 0}
          icon={<DoorOpen size={18} />}
          meta="Relay commands to open the gate"
          tone="info"
        />
        <MetricTile
          label="Close events"
          value={loading ? '…' : counts?.close_count ?? 0}
          icon={<DoorClosed size={18} />}
          meta="Gate close events received"
          tone="success"
        />
        <MetricTile
          label="Unpaired events"
          value={loading ? '…' : counts?.count_difference ?? 0}
          icon={<AlertTriangle size={18} />}
          meta="Difference between open and close totals"
          tone={mismatch ? 'danger' : counts?.count_difference === 1 ? 'warning' : 'neutral'}
        />
      </div>

      <Panel className="p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--pp-ink)]">Events by hour</h2>
            <p className="mt-1 text-sm text-[var(--pp-muted)]">Open and close messages grouped by Bangkok local time.</p>
          </div>
          <span className="text-xs font-medium text-[var(--pp-muted)]">{counts?.date ?? selectedDay}</span>
        </div>

        {loading && !counts ? (
          <div className="flex h-72 items-center justify-center text-sm text-[var(--pp-muted)]" role="status">Loading gate events…</div>
        ) : !error && !chartHasEvents ? (
          <EmptyState title="No gate events for this date" description="Events will appear after the gate controller publishes to test/gate." />
        ) : (
          <div className="h-72 w-full" role="img" aria-label="Hourly gate open and close events bar chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--pp-line)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} interval={2} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="open_count" name="Open" fill="var(--pp-blue)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="close_count" name="Close" fill="var(--pp-success)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>
    </MainLayout>
  );
};

export default GateCountsPage;
