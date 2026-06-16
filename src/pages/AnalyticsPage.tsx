import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import SpatialHeatmap from '../components/SpatialHeatmap';
import ExportReportTools from '../components/ExportReportTools';
import { TrendingUp, Car, Activity, AlertTriangle, Clock } from 'lucide-react';
import axiosInstance from '../api/axios';

interface ParkingData {
  available_spaces: number;
  total_spaces: number;
  occupied_spaces: number;
  occupacy_rate: number;
}

interface SystemHealth {
  system_status: string;
  uptime_percentage: number;
}

interface KpiData {
  utilization_percentage: number;
  peak_occupancy: number;
  vehicle_count: number;
  avg_dwell_time_minutes: number;
}

const AnalyticsPage: React.FC = () => {
  const [camt01Data, setCamt01Data] = useState<ParkingData | null>(null);
  const [camt02Data, setCamt02Data] = useState<ParkingData | null>(null);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [lotFilter, setLotFilter] = useState('CAMT_01');

  const fetchAllParkingData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const [res01, res02, resHeatmap, resHealth, resKpis] = await Promise.all([
        axiosInstance.get('/analytics/current?lot_id=CAMT_01'),
        axiosInstance.get('/analytics/current?lot_id=CAMT_02'),
        axiosInstance.get(`/analytics/heatmap?lot_id=${lotFilter}`),
        axiosInstance.get('/analytics/health?lot_id=CAMT_01'),
        axiosInstance.get('/analytics/kpis', {
          params: {
            lot_id: lotFilter,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          },
        }),
      ]);

      setCamt01Data(res01.data);
      setCamt02Data(res02.data);
      setHealthData(resHealth.data);
      setKpiData(resKpis.data);

      if (resHeatmap.data?.spots) {
        const formattedSpots = resHeatmap.data.spots.map((spot: any) => ({
          id: spot.spot_id,
          status: spot.occupancy_percentage > 50 ? 'occupied' : 'available',
          heatRate: spot.occupancy_percentage,
        }));
        setParkingSpots(formattedSpots);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllParkingData();
    const intervalId = setInterval(fetchAllParkingData, 5000);
    return () => clearInterval(intervalId);
  }, [lotFilter]);

  const globalTotalSpaces =
    (camt01Data?.total_spaces || 0) + (camt02Data?.total_spaces || 0);
  const globalOccupiedSpaces =
    (camt01Data?.occupied_spaces || 0) + (camt02Data?.occupied_spaces || 0);
  const globalOccupancyRate =
    globalTotalSpaces > 0 ? (globalOccupiedSpaces / globalTotalSpaces) * 100 : 0;

  const isHealthy = healthData?.system_status === 'Healthy';
  const nodeStatusText = loading ? 'Connecting' : healthData?.system_status || 'Offline';

  return (
    <MainLayout pageTitle="Analytics">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-gray-600">Lot filter:</label>
          <select
            value={lotFilter}
            onChange={(e) => setLotFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
          >
            <option value="CAMT_01">CAMT_01 (Front)</option>
            <option value="CAMT_02">CAMT_02 (Rear)</option>
          </select>
        </div>
        <ExportReportTools lotId={lotFilter} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase">
              Real-Time Capacity
            </p>
            <div className="flex items-end justify-between">
              <h2 className="text-5xl font-extrabold text-gray-900">
                {loading ? '...' : `${globalOccupancyRate.toFixed(1)}%`}
              </h2>
              <div
                className={`flex items-center px-2 py-1 rounded text-sm font-bold ${
                  globalOccupancyRate > 80
                    ? 'text-red-600 bg-red-50'
                    : 'text-emerald-600 bg-emerald-50'
                }`}
              >
                <TrendingUp size={16} className="mr-1" />
                {globalOccupancyRate > 80 ? 'HIGH' : 'NORMAL'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="VEHICLE COUNT"
              value={loading ? '...' : kpiData?.vehicle_count ?? 0}
              icon={<Car size={20} />}
            />
            <StatCard
              title="AVG DWELL"
              value={loading ? '...' : `${kpiData?.avg_dwell_time_minutes ?? 0} min`}
              icon={<Clock size={20} />}
            />
            <StatCard
              title="TOTAL SPACES"
              value={loading ? '...' : globalTotalSpaces}
              icon={<Car size={20} />}
            />
            <StatCard
              title="NODE STATUS"
              value={nodeStatusText}
              icon={
                isHealthy ? (
                  <Activity size={20} />
                ) : (
                  <AlertTriangle size={20} className="text-amber-500" />
                )
              }
              trend={loading ? 'WAIT' : isHealthy ? 'ACTIVE' : 'CHECK'}
              trendUp={isHealthy}
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Segment Analysis</h3>
            <div className="space-y-2">
              <ProgressBar
                label="CAMT_01 (Front)"
                current={loading ? 0 : camt01Data?.occupied_spaces || 0}
                max={loading ? 1 : camt01Data?.total_spaces || 1}
                statusLabel="LIVE API"
              />
              <hr className="my-4 border-gray-100" />
              <ProgressBar
                label="CAMT_02 (Back)"
                current={loading ? 0 : camt02Data?.occupied_spaces || 0}
                max={loading ? 1 : camt02Data?.total_spaces || 1}
                statusLabel="LIVE API"
              />
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Spatial Density Heatmap</h3>
              <p className="text-sm text-gray-500">ACTIVE MONITORING: {lotFilter}</p>
            </div>
            <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
              LIVE DATA STREAM
            </div>
          </div>
          <SpatialHeatmap spots={parkingSpots} mode="heatmap" />
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
