import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import SpatialHeatmap from '../components/SpatialHeatmap'; 
import { TrendingUp, Car, Activity, AlertTriangle } from 'lucide-react'; // เพิ่ม AlertTriangle มาเผื่อระบบมีปัญหา

interface ParkingData {
  available_spaces: number;
  total_spaces: number;
  occupied_spaces: number;
  occupacy_rate: number;
}

// 💡 เพิ่ม Interface สำหรับรับข้อมูล Health
interface SystemHealth {
  system_status: string; // "Healthy" | "Degraded" | "Critical"
  uptime_percentage: number;
}

const AnalyticsPage: React.FC = () => {
  const [camt01Data, setCamt01Data] = useState<ParkingData | null>(null);
  const [camt02Data, setCamt02Data] = useState<ParkingData | null>(null);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null); // State ใหม่
  const [loading, setLoading] = useState(true);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);

  const fetchAllParkingData = async () => {
    try {
      // 💡 ดึง API พร้อมกัน 4 เส้นเลย (รวม Heatmap และ Health)
      const [res01, res02, resHeatmap, resHealth] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/analytics/current?lot_id=CAMT_01'),
        fetch('http://127.0.0.1:8000/api/analytics/current?lot_id=CAMT_02'),
        fetch('http://127.0.0.1:8000/api/analytics/heatmap?lot_id=CAMT_01'),
        fetch('http://127.0.0.1:8000/api/analytics/health?lot_id=CAMT_01')
      ]);

      // 1. จัดการข้อมูล Current Status (เหมือนเดิม)
      if (res01.ok) setCamt01Data(await res01.json());
      if (res02.ok) setCamt02Data(await res02.json());

      // 2. จัดการข้อมูล System Health (ของใหม่)
      if (resHealth.ok) {
        const health = await resHealth.json();
        setHealthData(health);
      }

      // 3. จัดการข้อมูล Heatmap (แทนที่ Mockup)
      if (resHeatmap.ok) {
        const heatmapJson = await resHeatmap.json();
        // แปลงข้อมูลจาก Backend ให้ตรงกับ Format ที่ Component SpatialHeatmap ต้องการ
        const formattedSpots = heatmapJson.spots.map((spot: any) => ({
          id: spot.spot_id,
          status: 'available', // หรือจะใส่ logic เช็คสถานะปัจจุบันก็ได้
          heatRate: spot.occupancy_percentage // โยนเปอร์เซ็นต์ความหนาแน่นเข้าไปตรงๆ
        }));
        setParkingSpots(formattedSpots);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllParkingData();
    const intervalId = setInterval(fetchAllParkingData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const globalTotalSpaces = (camt01Data?.total_spaces || 0) + (camt02Data?.total_spaces || 0);
  const globalOccupiedSpaces = (camt01Data?.occupied_spaces || 0) + (camt02Data?.occupied_spaces || 0);
  const globalOccupancyRate = globalTotalSpaces > 0 ? (globalOccupiedSpaces / globalTotalSpaces) * 100 : 0;

  // 💡 กำหนดสีและสถานะของการ์ด NODE STATUS ตามข้อมูล Health จริง
  const isHealthy = healthData?.system_status === "Healthy";
  const nodeStatusText = loading ? "Connecting" : (healthData?.system_status || "Offline");

  return (
    <MainLayout pageTitle="Analytics">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-xs font-bold text-gray-400 tracking-wider mb-2 uppercase">Real-Time Capacity</p>
            <div className="flex items-end justify-between">
              <h2 className="text-5xl font-extrabold text-gray-900">
                {loading ? "..." : `${globalOccupancyRate.toFixed(1)}%`}
              </h2>
              <div className={`flex items-center px-2 py-1 rounded text-sm font-bold ${globalOccupancyRate > 80 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                <TrendingUp size={16} className="mr-1" /> 
                {globalOccupancyRate > 80 ? "HIGH" : "NORMAL"}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 italic">
              Live feed active. Auto-updating every 5 seconds.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Segment Analysis</h3>
            <div className="space-y-2">
              <ProgressBar 
                label="CAMT_01 (Front)" 
                current={loading ? 0 : (camt01Data?.occupied_spaces || 0)} 
                max={loading ? 1 : (camt01Data?.total_spaces || 1)} 
                statusLabel="LIVE API" 
              />
              <hr className="my-4 border-gray-100" />
              <ProgressBar 
                label="CAMT_02 (Back)" 
                current={loading ? 0 : (camt02Data?.occupied_spaces || 0)} 
                max={loading ? 1 : (camt02Data?.total_spaces || 1)} 
                statusLabel="LIVE API" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <StatCard 
               title="TOTAL SPACES" 
               value={loading ? "..." : globalTotalSpaces} 
               icon={<Car size={20} />} 
             />
             {/* 💡 อัปเดตการ์ด NODE STATUS ให้ใช้ข้อมูลจริง */}
             <StatCard 
               title="NODE STATUS" 
               value={nodeStatusText} 
               icon={isHealthy ? <Activity size={20} /> : <AlertTriangle size={20} className="text-amber-500" />} 
               trend={loading ? "WAIT" : (isHealthy ? "ACTIVE" : "CHECK")}
               trendUp={isHealthy}
             />
          </div>
        </div>

        {/* --- คอลัมน์ขวา: แสดง SpatialHeatmap แบบของจริง --- */}
        <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Spatial Density Heatmap</h3>
              <p className="text-sm text-gray-500">ACTIVE MONITORING: CAMT CMU</p>
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