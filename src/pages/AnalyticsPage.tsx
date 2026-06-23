import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Car, Clock, Gauge, ParkingCircle, RefreshCcw } from 'lucide-react';
import axiosInstance from '../api/axios';
import ExportReportTools from '../components/ExportReportTools';
import MainLayout from '../components/MainLayout';
import ProgressBar from '../components/ProgressBar';
import SpatialHeatmap from '../components/SpatialHeatmap';
import StatCard from '../components/StatCard';
import { EmptyState, PageHeader, Panel, SelectField, StatusBadge, Toolbar } from '../components/ui';
import type { DeviceHealth, KpiSummary, ParkingLotId, ParkingSnapshot, ParkingSpot } from '../types/parking';

// 🛑 ซ่อน CAMT_01 ไว้ก่อน จนกว่าในอนาคตคุณจะรัน AI ครบทั้ง 2 มุม
const lotOptions: Array<{ value: ParkingLotId; label: string }> = [
  { value: 'CAMT_02', label: 'CAMT Parking Lot (Live Camera)' },
];

const AnalyticsPage: React.FC = () => {
  const [parkingData, setParkingData] = useState<ParkingSnapshot | null>(null);
  const [healthData, setHealthData] = useState<DeviceHealth | null>(null);
  const [kpiData, setKpiData] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  // 🛑 บังคับให้โหลดข้อมูล CAMT_02 เป็นหลัก
  const [lotFilter, setLotFilter] = useState<ParkingLotId>('CAMT_02');
  const [lastSync, setLastSync] = useState<string>('Not synced');

  const fetchAllParkingData = async () => {
    try {
      setError(null);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [resCurrent, resHeatmap, resHealth, resKpis] = await Promise.all([
        axiosInstance.get(`/analytics/current?lot_id=${lotFilter}`).catch(() => ({ data: null })),
        axiosInstance.get(`/analytics/heatmap?lot_id=${lotFilter}`).catch(() => ({ data: null })),
        axiosInstance.get(`/analytics/health?lot_id=${lotFilter}`).catch(() => ({ data: null })),
        axiosInstance.get('/analytics/kpis', {
          params: {
            lot_id: lotFilter,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        }).catch(() => ({ data: null })),
      ]);

      if (resCurrent.data) setParkingData(resCurrent.data);
      if (resHealth.data) setHealthData(resHealth.data);
      if (resKpis.data) setKpiData(resKpis.data);
      setLastSync(new Date().toLocaleTimeString());

      const spots = resHeatmap.data?.spots || [];
      setParkingSpots(
        spots.map((spot: any) => ({
          id: spot.spot_id,
          status: spot.occupancy_percentage > 50 ? 'occupied' : 'available',
          heatRate: spot.occupancy_percentage || 0,
        }))
      );
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Dashboard data is temporarily unavailable. Check API connectivity and administrator access.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllParkingData();
    const intervalId = setInterval(fetchAllParkingData, 5000);
    return () => clearInterval(intervalId);
  }, [lotFilter]);

  // 🛑 ให้ Global Stat อิงจากข้อมูลชุดเดียวเลย
  const globalTotalSpaces = parkingData?.total_spaces || 0;
  const globalOccupiedSpaces = parkingData?.occupied_spaces || 0;
  const globalAvailableSpaces = parkingData?.available_spaces || 0;
  const globalOccupancyRate = globalTotalSpaces > 0 ? (globalOccupiedSpaces / globalTotalSpaces) * 100 : 0;
  
  const isHealthy = healthData?.system_status?.toLowerCase() === 'healthy';
  const occupancyTone = globalOccupancyRate > 85 ? 'danger' : globalOccupancyRate > 60 ? 'warning' : 'success';

  return (
    <MainLayout pageTitle="Dashboard">
      <PageHeader
        title="Parking Operations Overview"
        description="Live capacity, KPI movement, heatmap intensity, and system state for CAMT parking operations."
        actions={<StatusBadge tone={isHealthy ? 'success' : 'warning'} pulse>{loading ? 'Connecting' : isHealthy ? 'Operational' : 'Degraded'}</StatusBadge>}
      />

      <Toolbar>
        <SelectField
          label="Lot filter"
          value={lotFilter}
          onChange={(value) => setLotFilter(value as ParkingLotId)}
          options={lotOptions}
        />
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--pp-muted)]">
            <RefreshCcw size={16} />
            <span>Refresh 5s · Last sync {lastSync}</span>
          </div>
          <ExportReportTools lotId={lotFilter} />
        </div>
      </Toolbar>

      {error && <div className="mb-5"><EmptyState title="Unable to load live data" description={error} tone="warning" /></div>}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[360px_1fr]">
        <div className="space-y-4">
          <Panel className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[var(--pp-muted)]">Current occupancy</p>
                <p className="mt-2 text-4xl font-bold leading-none text-[var(--pp-ink)]">
                  {loading ? '...' : `${globalOccupancyRate.toFixed(1)}%`}
                </p>
              </div>
              <StatusBadge tone={occupancyTone}>{globalOccupancyRate > 85 ? 'High' : globalOccupancyRate > 60 ? 'Busy' : 'Normal'}</StatusBadge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="font-semibold text-[var(--pp-muted)]">Available</p>
                <p className="mt-1 text-lg font-bold text-[var(--pp-success)]">{loading ? '...' : globalAvailableSpaces}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--pp-muted)]">Occupied</p>
                <p className="mt-1 text-lg font-bold text-[var(--pp-danger)]">{loading ? '...' : globalOccupiedSpaces}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--pp-muted)]">Total</p>
                <p className="mt-1 text-lg font-bold text-[var(--pp-ink)]">{loading ? '...' : globalTotalSpaces}</p>
              </div>
            </div>
          </Panel>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <StatCard title="Vehicle Count" value={loading ? '...' : kpiData?.vehicle_count ?? 0} icon={<Car size={18} />} subtitle="Selected lot, last 7 days" />
            <StatCard title="Average Dwell" value={loading ? '...' : `${kpiData?.avg_dwell_time_minutes ?? 0} min`} icon={<Clock size={18} />} subtitle="Average parking duration" />
            <StatCard title="Total Spaces" value={loading ? '...' : globalTotalSpaces} icon={<ParkingCircle size={18} />} subtitle="Live monitored spots" />
            <StatCard
              title="Node Status"
              value={loading ? '...' : healthData?.system_status || 'Offline'}
              icon={isHealthy ? <Activity size={18} /> : <AlertTriangle size={18} />}
              subtitle="Orange Pi and camera heartbeat"
              trend={isHealthy ? 'Healthy' : 'Check'}
              trendUp={isHealthy}
            />
          </div>

          <Panel className="p-4">
            <h2 className="mb-4 text-base font-bold text-[var(--pp-ink)]">Lot Segments</h2>
            <ProgressBar
              label="Live Camera Feed (AI Zone)"
              current={loading ? 0 : parkingData?.occupied_spaces || 0}
              max={loading ? 1 : parkingData?.total_spaces || 1}
              statusLabel="Live API"
            />
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--pp-line)] bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--pp-ink)]">Spatial Density Heatmap</h2>
              <p className="text-sm text-[var(--pp-muted)]">Operational approximation for {lotFilter}</p>
            </div>
            <StatusBadge tone="info"><Gauge size={14} /> Heatmap mode</StatusBadge>
          </div>
          {parkingSpots.length > 0 ? (
            <SpatialHeatmap spots={parkingSpots} mode="heatmap" />
          ) : (
            <div className="p-4">
              <EmptyState title="No heatmap spots yet" description="The dashboard will render slot intensity after the analytics API returns spot data." />
            </div>
          )}
        </Panel>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;