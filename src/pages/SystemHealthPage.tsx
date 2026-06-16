import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import StatCard from '../components/StatCard';
import SystemHealthPanel from '../components/SystemHealthPanel';
import { Server, Video, Wifi, Terminal, AlertTriangle, Cpu, Activity, Zap, CheckCircle2, XCircle } from 'lucide-react';
import axiosInstance from '../api/axios';

const SystemHealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลสถานะอุปกรณ์จาก API
  const fetchHealthData = async () => {
    try {
      const response = await axiosInstance.get('/analytics/health?lot_id=CAMT_02');
      setHealthData(response.data);
    } catch (error) {
      console.error("Error fetching health data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const intervalId = setInterval(fetchHealthData, 10000); // อัปเดตทุก 10 วินาที
    return () => clearInterval(intervalId);
  }, []);

  // ตัวแปรเช็คสถานะเพื่อปรับสี UI
  const isHealthy = healthData?.system_status === "Healthy";
  const boardOnline = healthData?.board?.status === "online";
  const cameraNodes = [
    { key: 'camera_1', label: 'Parking Area 1', ip: 'parking/index.m3u8' },
    { key: 'camera_2', label: 'Parking Area 2', ip: 'parking2/index.m3u8' },
    { key: 'camera_3', label: 'License Check 1', ip: 'license/index.m3u8' },
    { key: 'camera_4', label: 'License Check 2', ip: 'license1/index.m3u8' },
  ].map((camera) => ({
    ...camera,
    online: healthData?.[camera.key]?.status === "online",
    status: healthData?.[camera.key]?.status || "unknown",
  }));
  const activeCameras = cameraNodes.filter((camera) => camera.online).length;

  const buildHealthLogs = () => {
    if (!healthData) return [];
    const now = new Date().toLocaleTimeString();
    return [
      { time: now, level: 'INFO', message: `System status: ${healthData.system_status}` },
      { time: now, level: healthData.board?.status === 'online' ? 'SUCCESS' : 'WARN', message: `Orange Pi board is ${healthData.board?.status || 'unknown'}` },
      ...cameraNodes.map((camera) => ({
        time: now,
        level: camera.online ? 'SUCCESS' : 'WARN',
        message: `${camera.label} is ${camera.status}`,
      })),
      { time: now, level: 'DB', message: `Uptime score: ${healthData.uptime_percentage}%` },
    ];
  };

  const healthLogs = buildHealthLogs();

  return (
    <MainLayout pageTitle="System Health">
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-gray-800">System Infrastructure Health</h2>
            <p className="text-sm text-gray-500 mt-1">
              Real-time monitoring of Edge AI (Orange Pi) and Camera nodes.
            </p>
          </div>
          <div className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 ${isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            {loading ? "CONNECTING..." : (isHealthy ? "SYSTEMS OPERATIONAL" : "SYSTEM DEGRADED")}
          </div>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Orange Pi Main" 
            value={boardOnline ? "Online" : "Offline"} 
            icon={<Cpu size={18} />} 
            subtitle="Central Processing Node" 
            trend={boardOnline ? "Active" : "Critical"}
            trendUp={boardOnline}
          />
          <StatCard 
            title="Active Cameras" 
            value={`${activeCameras} / 4`} 
            icon={<Video size={18} />} 
            subtitle="Connected Camera Streams" 
            trend={activeCameras === 4 ? "Stable" : "Warning"}
            trendUp={activeCameras === 4}
          />
          <StatCard 
            title="Server Uptime" 
            value={`${healthData?.uptime_percentage || 99.8}%`} 
            icon={<Server size={18} />} 
            subtitle="FastAPI Backend" 
            trend="Stable"
            trendUp={true}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* Terminal Window */}
            <SystemHealthPanel logs={healthLogs as any} />

            {/* Hardware topology for the four connected camera streams. */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
              <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider absolute top-4 left-4">Hardware Topology</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-6 items-center mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cameraNodes.slice(0, 2).map((camera, index) => (
                    <div key={camera.key} className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${camera.online ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50 opacity-70'}`}>
                      {camera.online ? <CheckCircle2 size={20} className="text-emerald-500 mb-2" /> : <XCircle size={20} className="text-red-500 mb-2" />}
                      <Video size={32} className={camera.online ? 'text-gray-800' : 'text-gray-400'} />
                      <p className="font-bold mt-2 text-sm">{camera.label}</p>
                      <p className="text-xs text-gray-500 font-mono">Camera 0{index + 1}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">{camera.ip}</p>
                    </div>
                  ))}
                </div>

                <div className={`flex flex-col items-center p-6 rounded-2xl shadow-md border-2 z-10 bg-white ${boardOnline ? 'border-blue-500' : 'border-red-500'}`}>
                  <div className={`p-3 rounded-full mb-2 ${boardOnline ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    <Zap size={32} />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900">Orange Pi 5</h3>
                  <p className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2">EDGE AI NODE</p>
                  <p className="text-xs text-gray-400 font-mono mt-2">{loading ? "..." : (boardOnline ? "Transmitting..." : "Connection Lost")}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cameraNodes.slice(2).map((camera, index) => (
                    <div key={camera.key} className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${camera.online ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50 opacity-70'}`}>
                      {camera.online ? <CheckCircle2 size={20} className="text-emerald-500 mb-2" /> : <XCircle size={20} className="text-red-500 mb-2" />}
                      <Video size={32} className={camera.online ? 'text-gray-800' : 'text-gray-400'} />
                      <p className="font-bold mt-2 text-sm">{camera.label}</p>
                      <p className="text-xs text-gray-500 font-mono">Camera 0{index + 3}</p>
                      <p className="text-[10px] text-gray-400 font-mono mt-1">{camera.ip}</p>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>

          {/* Right: Incident Registry */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-gray-800">Incident Registry</h3>
            </div>
            
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {!boardOnline && (
                <div className="border-l-4 border-red-500 pl-3 py-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">CRITICAL FAULT</span>
                    <span className="text-xs text-gray-400 font-mono">Live</span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-tight">Connection to Orange Pi Main Node lost. System halted.</p>
                </div>
              )}

              {activeCameras < 4 && boardOnline && (
                <div className="border-l-4 border-yellow-500 pl-3 py-1">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">HARDWARE ALERT</span>
                    <span className="text-xs text-gray-400 font-mono">Live</span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium leading-tight">One or more camera nodes are unreachable. Please check power/network cables.</p>
                </div>
              )}

              <div className="border-l-4 border-blue-500 pl-3 py-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">SYSTEM INFO</span>
                  <span className="text-xs text-gray-400 font-mono">09:00:00</span>
                </div>
                <p className="text-sm text-gray-800 font-medium leading-tight">Scheduled DB maintenance completed for parking_snapshots.</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100">
              <button className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg text-sm hover:bg-gray-800 transition-colors">
                VIEW FULL REGISTRY ARCHIVE
              </button>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default SystemHealthPage;
