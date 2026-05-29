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
  const cam1Online = healthData?.camera_1?.status === "online";
  const cam2Online = healthData?.camera_2?.status === "online";
  const activeCameras = (cam1Online ? 1 : 0) + (cam2Online ? 1 : 0);

  // Mock ข้อมูล Log สำหรับหน้าจอ Terminal สีดำ
  const mockLogs = [
    { time: '11:50:01', level: 'INFO', message: 'Handshake established with MQTT Broker (localhost:1883)' },
    { time: '11:50:05', level: 'SUCCESS', message: 'Subscribed to topic: test/parking' },
    { time: '11:51:12', level: 'MSG', message: 'Payload received on test/parking: {"available_spaces": 39, "occupied_spaces": 2}' },
    { time: '11:51:12', level: 'DB', message: 'INSERT INTO parking_snapshots SUCCESS (0.0007s)' },
    { time: '11:52:16', level: 'WARN', message: 'Latency spike detected on Camera 1 subnet (85ms).' },
    { time: '11:53:20', level: 'DB', message: 'Heartbeat updated for orange_pi_main' }
  ];

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
            value={`${activeCameras} / 2`} 
            icon={<Video size={18} />} 
            subtitle="YOLOv8 Vision Nodes" 
            trend={activeCameras === 2 ? "Stable" : "Warning"}
            trendUp={activeCameras === 2}
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
            <SystemHealthPanel logs={mockLogs as any} />

            {/* --- 🌟 Topology View: จำลองฮาร์ดแวร์จริง 1 บอร์ด 2 กล้อง --- */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative">
              <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider absolute top-4 left-4">Hardware Topology</h3>
              
              <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-12 mt-8">
                
                {/* กล้องตัวซ้าย (Camera 1) */}
                <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${cam1Online ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50 opacity-70'}`}>
                  {cam1Online ? <CheckCircle2 size={20} className="text-emerald-500 mb-2" /> : <XCircle size={20} className="text-red-500 mb-2" />}
                  <Video size={32} className={cam1Online ? 'text-gray-800' : 'text-gray-400'} />
                  <p className="font-bold mt-2 text-sm">Camera 01</p>
                  <p className="text-xs text-gray-500 font-mono">192.168.1.10</p>
                </div>

                {/* เส้นเชื่อมโยง (ซ้าย) */}
                <div className="hidden md:flex flex-1 h-1 bg-gray-200 relative">
                  <div className={`absolute top-0 left-0 h-full w-full ${cam1Online ? 'bg-emerald-400 animate-pulse' : 'bg-red-300'}`}></div>
                </div>

                {/* ตัวกระจายสัญญาณกลาง (Orange Pi) */}
                <div className={`flex flex-col items-center p-6 rounded-2xl shadow-md border-2 z-10 bg-white ${boardOnline ? 'border-blue-500' : 'border-red-500'}`}>
                  <div className={`p-3 rounded-full mb-2 ${boardOnline ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                    <Zap size={32} />
                  </div>
                  <h3 className="font-extrabold text-lg text-gray-900">Orange Pi 5</h3>
                  <p className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full mt-2">EDGE AI NODE</p>
                  <p className="text-xs text-gray-400 font-mono mt-2">{loading ? "..." : (boardOnline ? "Transmitting..." : "Connection Lost")}</p>
                </div>

                {/* เส้นเชื่อมโยง (ขวา) */}
                <div className="hidden md:flex flex-1 h-1 bg-gray-200 relative">
                  <div className={`absolute top-0 left-0 h-full w-full ${cam2Online ? 'bg-emerald-400 animate-pulse' : 'bg-red-300'}`}></div>
                </div>

                {/* กล้องตัวขวา (Camera 2) */}
                <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${cam2Online ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50 opacity-70'}`}>
                  {cam2Online ? <CheckCircle2 size={20} className="text-emerald-500 mb-2" /> : <XCircle size={20} className="text-red-500 mb-2" />}
                  <Video size={32} className={cam2Online ? 'text-gray-800' : 'text-gray-400'} />
                  <p className="font-bold mt-2 text-sm">Camera 02</p>
                  <p className="text-xs text-gray-500 font-mono">192.168.1.11</p>
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

              {(!cam1Online || !cam2Online) && boardOnline && (
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