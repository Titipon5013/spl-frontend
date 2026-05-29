import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import SpatialHeatmap from '../components/SpatialHeatmap';
import LiveEventFeed from '../components/LiveEventFeed';
import { Maximize2, MapPin } from 'lucide-react';
import axiosInstance from '../api/axios';

const LotManagementPage: React.FC = () => {
  // State สำหรับเก็บข้อมูลช่องจอดและ API
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [camt01Data, setCamt01Data] = useState<any>(null); // ✅ เพิ่ม State สำหรับ CAMT_01
  const [camt02Data, setCamt02Data] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]); // ✅ เตรียม State สำหรับ Live Events
  const [loading, setLoading] = useState(true);

  // ฟังก์ชันยิง API
  const fetchParkingData = async () => {
    try {
      // ✅ ยิง API 3 เส้นพร้อมกัน (CAMT_01, CAMT_02, และ Heatmap สำหรับช่องจอด CAMT_02)
      const [res01, res02, resHeatmap] = await Promise.all([
        axiosInstance.get('/analytics/current?lot_id=CAMT_01'),
        axiosInstance.get('/analytics/current?lot_id=CAMT_02'),
        axiosInstance.get('/analytics/heatmap?lot_id=CAMT_02')
      ]);

      setCamt01Data(res01.data);
      setCamt02Data(res02.data);

      // ✅ นำข้อมูล Heatmap มา Map ใส่ช่องจอด (Adaptation)
      if (resHeatmap.data && resHeatmap.data.spots) {
        const mappedSpots = resHeatmap.data.spots.map((spot: any) => ({
          id: spot.spot_id,
          // ประยุกต์ใช้ occupancy_percentage มาเป็นสถานะชั่วคราว
          status: spot.occupancy_percentage > 50 ? 'occupied' : 'available' 
        }));
        setParkingSpots(mappedSpots);
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(fetchParkingData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <MainLayout pageTitle="Lot Management">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Spatial Lot View</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time individual space monitoring for CAMT Main Lot.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors">
            Data Grid View
          </button>
          <button className="bg-blue-900 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-800 transition-colors">
            Spatial View
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* --- ซ้าย: แผนที่ช่องจอด --- */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <MapPin size={18} className={loading ? "text-gray-400" : "text-emerald-500 animate-pulse"} />
              <h3 className="font-bold text-gray-800">CAMT_02 (Rear Parking)</h3>
            </div>
            <button className="text-gray-400 hover:text-gray-600"><Maximize2 size={18} /></button>
          </div>
          
          <SpatialHeatmap spots={parkingSpots} mode="occupancy" />

          <div className="p-4 bg-white border-t border-gray-100 flex justify-center gap-8">
             <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
               <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-500"></div> 
               Available ({loading ? "..." : camt02Data?.available_spaces || 0})
             </div>
             <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
               <div className="w-4 h-4 rounded bg-slate-800 border border-slate-900"></div> 
               Occupied ({loading ? "..." : camt02Data?.occupied_spaces || 0})
             </div>
          </div>
        </div>

        {/* --- ขวา: ข้อมูลสรุปโซน & Live Feed --- */}
        <div className="space-y-6">
          
          {/* Zone Intelligence */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Zone Intelligence</h3>
            
            {/* โซน CAMT_02 (Rear) */}
            <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">CAMT_02 (Rear)</span>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{loading ? "..." : camt02Data?.total_spaces || 0} Spaces Total</p>
              <div className="w-full bg-emerald-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${camt02Data?.occupacy_rate || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>{loading ? "..." : camt02Data?.occupied_spaces || 0} Occupied</span>
                <span>{loading ? "..." : camt02Data?.available_spaces || 0} Available</span>
              </div>
            </div>
            
            {/* โซน CAMT_01 (Front) */}
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">CAMT_01 (Front)</span>
                <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">LIVE</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{loading ? "..." : camt01Data?.total_spaces || 0} Spaces Total</p>
              <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${camt01Data?.occupacy_rate || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>{loading ? "..." : camt01Data?.occupied_spaces || 0} Occupied</span>
                <span>{loading ? "..." : camt01Data?.available_spaces || 0} Available</span>
              </div>
            </div>
          </div>

          <LiveEventFeed events={liveEvents} />

        </div>
      </div>
    </MainLayout>
  );
};

export default LotManagementPage;