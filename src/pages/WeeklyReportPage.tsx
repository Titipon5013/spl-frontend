import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Sparkles, TrendingUp, Users } from 'lucide-react';
import axiosInstance from '../api/axios';
import ExportReportTools from '../components/ExportReportTools';
import MainLayout from '../components/MainLayout';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { EmptyState, PageHeader, Panel, StatusBadge } from '../components/ui';

const targetHours = [6, 8, 10, 12, 14, 16, 18, 20];

const WeeklyReportPage: React.FC = () => {
  const [camt01Trends, setCamt01Trends] = useState<number[]>(Array(8).fill(0));
  const [camt02Trends, setCamt02Trends] = useState<number[]>(Array(8).fill(0));
  const [peakHourInsight, setPeakHourInsight] = useState<string>('Analyzing weekly usage...');
  const [uptime, setUptime] = useState<number>(0);
  const [avgEntries, setAvgEntries] = useState<number | null>(null);
  const [avgTurnover, setAvgTurnover] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapTrendsToChart = (trendsData: any[], totalSpaces: number) =>
    targetHours.map((targetHour) => {
      const match = trendsData.find((trend: any) => {
        const hour = parseInt(trend.time_label.split(' ')[1].split(':')[0]);
        return hour === targetHour;
      });
      return match ? (match.average_occupancy / totalSpaces) * 100 : 0;
    });

  const fetchWeeklyData = async () => {
    try {
      setError(null);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [res01, res02, resHealth] = await Promise.all([
        axiosInstance.get(`/analytics/trends?lot_id=CAMT_01&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`).catch(() => ({ data: null })),
        axiosInstance.get(`/analytics/trends?lot_id=CAMT_02&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`).catch(() => ({ data: null })),
        axiosInstance.get('/analytics/health?lot_id=CAMT_01').catch(() => ({ data: null })),
      ]);

      if (res01.data?.trends) {
        setCamt01Trends(mapTrendsToChart(res01.data.trends, 34));
        if (res01.data.peak_hour) {
          const timeOnly = res01.data.peak_hour.split(' ')[1];
          setPeakHourInsight(`CAMT_01 reached peak demand at ${timeOnly}. Consider routing overflow to CAMT_02 during that period.`);
        } else {
          setPeakHourInsight('No critical peak hour was detected this week. Utilization stayed inside normal operating bounds.');
        }
      }

      if (res02.data?.trends) {
        setCamt02Trends(mapTrendsToChart(res02.data.trends, 41));
      }

      if (resHealth.data) setUptime(resHealth.data.uptime_percentage || 0);

      const kpiRes = await axiosInstance
        .get('/analytics/kpis', {
          params: {
            lot_id: 'CAMT_01',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        })
        .catch(() => ({ data: null }));

      if (kpiRes.data) {
        setAvgEntries(kpiRes.data.vehicle_count);
        setAvgTurnover(kpiRes.data.avg_dwell_time_minutes);
      }
    } catch (err) {
      console.error('Error fetching weekly data:', err);
      setError('Weekly report data is unavailable right now.');
      setPeakHourInsight('Unable to generate the weekly insight summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const avgCamt01 = camt01Trends.reduce((a, b) => a + b, 0) / (camt01Trends.filter((v) => v > 0).length || 1);
  const avgCamt02 = camt02Trends.reduce((a, b) => a + b, 0) / (camt02Trends.filter((v) => v > 0).length || 1);

  return (
    <MainLayout pageTitle="Weekly Reports">
      <PageHeader
        title="Weekly Performance Report"
        description="Seven-day utilization, peak demand, exports, and report-ready operational insight."
        actions={<ExportReportTools />}
      />

      {error && <div className="mb-5"><EmptyState title="Unable to load report" description={error} tone="warning" /></div>}

      <Panel className="mb-4 p-5">
        <div className="mb-3 flex items-center gap-2 text-[var(--pp-blue)]">
          <Sparkles size={18} />
          <h2 className="text-base font-bold text-[var(--pp-ink)]">Automated Insight Summary</h2>
        </div>
        <h3 className="text-xl font-bold leading-snug text-[var(--pp-ink)]">
          {loading ? 'Syncing with parking analytics...' : 'Campus utilization stayed inside monitored operating bounds this week.'}
        </h3>
        <p className="mt-3 max-w-4xl text-sm leading-relaxed text-[var(--pp-muted)]">
          {loading ? 'Processing weekly trend and KPI data...' : peakHourInsight}
        </p>
      </Panel>

      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel className="p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[var(--pp-ink)]">Campus Zone Utilization</h2>
            <StatusBadge tone="warning">Last 7 days</StatusBadge>
          </div>
          <ProgressBar label="CAMT_01 - Front" current={Math.round((avgCamt01 / 100) * 34)} max={34} statusLabel={avgCamt01 > 80 ? 'High' : 'Normal'} />
          <ProgressBar label="CAMT_02 - Rear" current={Math.round((avgCamt02 / 100) * 41)} max={41} statusLabel={avgCamt02 > 80 ? 'High' : 'Normal'} />
          <ProgressBar label="Science & Tech Extension" current={0} max={100} statusLabel="No data" />
        </Panel>

        <div className="grid grid-cols-1 gap-4">
          <TrendPanel title="CAMT_01 Peak Hours" values={camt01Trends} />
          <TrendPanel title="CAMT_02 Peak Hours" values={camt02Trends} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Avg. Daily Entries" value={loading ? '...' : avgEntries !== null ? `${avgEntries} cars` : 'Pending'} icon={<Users size={18} />} subtitle="Event log API" />
        <StatCard title="Average Dwell" value={loading ? '...' : avgTurnover !== null ? `${avgTurnover} min` : 'Pending'} icon={<Clock size={18} />} subtitle="Average parking duration" />
        <StatCard
          title="Hardware Uptime"
          value={loading ? '...' : `${uptime}%`}
          icon={uptime > 90 ? <TrendingUp size={18} /> : <AlertTriangle size={18} />}
          subtitle={uptime > 90 ? 'System operating normally' : 'Degraded performance detected'}
          trend={uptime > 90 ? 'Healthy' : 'Warning'}
          trendUp={uptime > 90}
        />
      </div>
    </MainLayout>
  );
};

const TrendPanel: React.FC<{ title: string; values: number[] }> = ({ title, values }) => (
  <Panel className="p-4">
    <h2 className="mb-4 text-base font-bold text-[var(--pp-ink)]">{title}</h2>
    <div className="flex h-40 items-end justify-between gap-2">
      {values.map((height, index) => (
        <div key={`${title}-${index}`} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
          <span className="text-xs font-semibold text-[var(--pp-muted)]">{Math.round(height)}%</span>
          <div
            className={`w-full rounded-t-[var(--pp-radius)] ${height > 80 ? 'bg-[var(--pp-danger)]' : height > 50 ? 'bg-[var(--pp-blue)]' : 'bg-[#b7d0eb]'}`}
            style={{ height: `${Math.max(height, 5)}%` }}
          />
          <span className="text-xs font-semibold text-[var(--pp-muted)]">{targetHours[index]}:00</span>
        </div>
      ))}
    </div>
  </Panel>
);

export default WeeklyReportPage;
