import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Camera, 
  Car, 
  Clock, 
  Gauge, 
  Loader2, 
  ParkingCircle, 
  RefreshCcw, 
  ScanEye, 
  X 
} from 'lucide-react';
import axiosInstance from '../api/axios';
import ExportReportTools from '../components/ExportReportTools';
import MainLayout from '../components/MainLayout';
import ProgressBar from '../components/ProgressBar';
import SpatialHeatmap from '../components/SpatialHeatmap';
import StatCard from '../components/StatCard';
import { EmptyState, PageHeader, Panel, SelectField, StatusBadge, Toolbar } from '../components/ui';
import type { DeviceHealth, KpiSummary, ParkingLotId, ParkingSnapshot, ParkingSpot } from '../types/parking';

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
  const [lotFilter, setLotFilter] = useState<ParkingLotId>('CAMT_02');
  const [lastSync, setLastSync] = useState<string>('Not synced');

  // State สำหรับจัดการ Live Model Snapshot Modal
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);

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

      if (!resCurrent.data && !resHeatmap.data && !resHealth.data && !resKpis.data) {
        setError('Dashboard data is temporarily unavailable. Check API connectivity and administrator access.');
      }

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

  // ฟังก์ชันดึงภาพ Snapshot จาก AI โมเดล
  const handleFetchSnapshot = async (endpoint: string, title: string) => {
    setModalTitle(title);
    setShowModal(true);
    setLoadingImage(true);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }

    try {
      const response = await axiosInstance.get(endpoint, {
        responseType: 'blob',
      });
      const imageUrl = URL.createObjectURL(response.data);
      setImageSrc(imageUrl);
    } catch (err) {
      console.error(`Error fetching inference image from ${endpoint}:`, err);
    } finally {
      setLoadingImage(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (imageSrc) {
      URL.revokeObjectURL(imageSrc);
      setImageSrc(null);
    }
  };

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

          {/* Panel: Lot Segments */}
          <Panel className="p-4">
            <h2 className="mb-4 text-base font-bold text-[var(--pp-ink)]">Lot Segments</h2>
            <ProgressBar
              label="Live Camera Feed (AI Zone)"
              current={loading ? 0 : parkingData?.occupied_spaces || 0}
              max={loading ? 1 : parkingData?.total_spaces || 1}
              statusLabel="Live API"
            />
          </Panel>

          {/* Panel: Live Model Inference Snapshots (อยู่ใต้ Lot Segments) */}
          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--pp-ink)]">AI Vision Feeds</h2>
              <StatusBadge tone="info">Live Snapshot</StatusBadge>
            </div>
            <p className="mb-4 text-xs text-[var(--pp-muted)]">
              Click to view inference frames and detected slot boundaries from on-site nodes.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => handleFetchSnapshot('/parking/inference', 'Camera 01 Inference (Main Entrance)')}
                className="group flex w-full items-center justify-between rounded-lg border border-[var(--pp-line)] bg-[var(--pp-surface-subtle,rgba(0,0,0,0.02))] p-3 text-left transition hover:border-[var(--pp-primary,#2563eb)] hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--pp-primary-soft,#eff6ff)] text-[var(--pp-primary,#2563eb)] transition group-hover:bg-[var(--pp-primary,#2563eb)] group-hover:text-white">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--pp-ink)]">Camera 01 (CAMT 01)</p>
                    <p className="text-xs text-[var(--pp-muted)]">View live AI bounding boxes</p>
                  </div>
                </div>
                <ScanEye size={16} className="text-[var(--pp-muted)] transition group-hover:text-[var(--pp-primary,#2563eb)]" />
              </button>

              <button
                type="button"
                onClick={() => handleFetchSnapshot('/parking/inference2', 'Camera 02 Inference (Secondary Lot)')}
                className="group flex w-full items-center justify-between rounded-lg border border-[var(--pp-line)] bg-[var(--pp-surface-subtle,rgba(0,0,0,0.02))] p-3 text-left transition hover:border-[var(--pp-primary,#2563eb)] hover:bg-white hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--pp-primary-soft,#eff6ff)] text-[var(--pp-primary,#2563eb)] transition group-hover:bg-[var(--pp-primary,#2563eb)] group-hover:text-white">
                    <Camera size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--pp-ink)]">Camera 02 (CAMT 02)</p>
                    <p className="text-xs text-[var(--pp-muted)]">View live AI bounding boxes</p>
                  </div>
                </div>
                <ScanEye size={16} className="text-[var(--pp-muted)] transition group-hover:text-[var(--pp-primary,#2563eb)]" />
              </button>
            </div>
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

      {/* Tailwind Native Modal สำหรับแสดงผล Snapshot จาก AI */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-[var(--pp-line)] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--pp-line)] px-6 py-4">
              <div className="flex items-center gap-2">
                <ScanEye size={18} className="text-[var(--pp-primary,#2563eb)]" />
                <h3 className="text-base font-bold text-[var(--pp-ink)]">{modalTitle}</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg p-1.5 text-[var(--pp-muted)] transition hover:bg-gray-100 hover:text-[var(--pp-ink)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex min-h-[340px] items-center justify-center bg-slate-950 p-4">
              {loadingImage ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                  <span className="text-xs font-medium">Fetching inference snapshot from camera...</span>
                </div>
              ) : imageSrc ? (
                <img
                  src={imageSrc}
                  alt="Inference Detection"
                  className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain shadow-md"
                />
              ) : (
                <p className="text-sm text-slate-500">No snapshot frame available at this moment.</p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--pp-line)] bg-gray-50/50 px-6 py-3.5">
              <span className="text-xs text-[var(--pp-muted)]">Real-time object detection inference feed</span>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-lg border border-[var(--pp-line)] bg-white px-4 py-2 text-xs font-semibold text-[var(--pp-ink)] shadow-sm transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AnalyticsPage;