import React, { useEffect, useState } from 'react';
import { AlertTriangle, Clock, Sparkles, TrendingUp, Users } from 'lucide-react';
import axiosInstance from '../api/axios';
import ExportReportTools from '../components/ExportReportTools';
import MainLayout from '../components/MainLayout';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { EmptyState, PageHeader, Panel, StatusBadge } from '../components/ui';

const targetHours = [6, 8, 10, 12, 14, 16, 18, 20];
const TOTAL_SPACES = 34; // อิงตามพิกัด 34 ช่องจอดจริงที่เราเซ็ตไว้ใน AI

const WeeklyReportPage: React.FC = () => {
  const [trends, setTrends] = useState<number[]>(Array(8).fill(0));
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

      // ดึงข้อมูล Trends, Health และ KPIs สำหรับ CAMT_02 ที่เดียว
      const [resTrends, resHealth, kpiRes] = await Promise.all([
        axiosInstance.get(`/analytics/trends?lot_id=CAMT_02&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`).catch(() => ({ data: null })),
        axiosInstance.get('/analytics/health?lot_id=CAMT_02').catch(() => ({ data: null })),
        axiosInstance.get('/analytics/kpis', {
          params: {
            lot_id: 'CAMT_02',
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        }).catch(() => ({ data: null }))
      ]);

      if (resTrends.data?.trends) {
        setTrends(mapTrendsToChart(resTrends.data.trends, TOTAL_SPACES));
        if (resTrends.data.peak_hour) {
          const timeOnly = resTrends.data.peak_hour.split(' ')[1];
          setPeakHourInsight(`Live Camera Zone (CAMT_02) reached peak demand at ${timeOnly} this week. Utilization is tracked accurately for the ${TOTAL_SPACES} monitored spots.`);
        } else {
          setPeakHourInsight('No critical peak hour was detected this week. Utilization stayed inside normal operating bounds.');
        }
      }

      if (resHealth.data) setUptime(resHealth.data.uptime_percentage || 0);

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

  // คำนวณค่าเฉลี่ยความหนาแน่นเพื่อแสดงใน Progress Bar
  const avgOccupancy = trends.reduce((a, b) => a + b, 0) / (trends.filter((v) => v > 0).length || 1);

  return (
    <MainLayout pageTitle="Weekly Reports">
      <PageHeader
        title="Weekly Performance Report"
        description="Seven-day utilization, peak demand, exports, and report-ready operational insight."
        actions={<ExportReportTools lotId="CAMT_02" />} // ส่ง Lot ไปเผื่อ Export ด้วย
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
            <h2 className="text-base font-bold text-[var(--pp-ink)]">Zone Utilization (Average)</h2>
            <StatusBadge tone="warning">Last 7 days</StatusBadge>
          </div>
          {/* แสดงแค่ CAMT_02 ตามความจริง */}
          <ProgressBar 
            label="Live Camera Zone (CAMT_02)" 
            current={Math.round((avgOccupancy / 100) * TOTAL_SPACES)} 
            max={TOTAL_SPACES} 
            statusLabel={avgOccupancy > 80 ? 'High' : 'Normal'} 
          />
        </Panel>

        <div className="grid grid-cols-1 gap-4">
          {/* แสดง Trend Panel เดียว */}
          <TrendPanel title="Live Camera Peak Hours" values={trends} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Avg. Weekly Entries" value={loading ? '...' : avgEntries !== null ? `${avgEntries} cars` : 'Pending'} icon={<Users size={18} />} subtitle="Event log API" />
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