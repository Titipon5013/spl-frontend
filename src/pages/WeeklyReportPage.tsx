import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import StatCard from '../components/StatCard';
import ProgressBar from '../components/ProgressBar';
import ExportReportTools from '../components/ExportReportTools';
import { Users, Clock, TrendingUp, Sparkles, AlertTriangle } from 'lucide-react';
import axiosInstance from '../api/axios';

const WeeklyReportPage: React.FC = () => {
  const [camt01Trends, setCamt01Trends] = useState<number[]>([0,0,0,0,0,0,0,0]);
  const [camt02Trends, setCamt02Trends] = useState<number[]>([0,0,0,0,0,0,0,0]);
  const [peakHourInsight, setPeakHourInsight] = useState<string>("กำลังวิเคราะห์ข้อมูล...");
  
  // ✅ เพิ่ม State สำหรับ Bottom Stats
  const [uptime, setUptime] = useState<number>(0);
  const [avgEntries, setAvgEntries] = useState<number | null>(null); 
  const [avgTurnover, setAvgTurnover] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);

  const mapTrendsToChart = (trendsData: any[], totalSpaces: number) => {
    const targetHours = [6, 8, 10, 12, 14, 16, 18, 20];
    const heights = targetHours.map(targetHour => {
      const match = trendsData.find((t: any) => {
        const hour = parseInt(t.time_label.split(" ")[1].split(":")[0]);
        return hour === targetHour;
      });
      if (match) return (match.average_occupancy / totalSpaces) * 100;
      return 0;
    });
    return heights;
  };

  const fetchWeeklyData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const url01 = `/analytics/trends?lot_id=CAMT_01&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
      const url02 = `/analytics/trends?lot_id=CAMT_02&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`;
      const urlHealth = `/analytics/health?lot_id=CAMT_01`;

      // ✅ ยิง API พ่วงเส้น Health เข้าไปด้วยเพื่อดึง Uptime
      const [res01, res02, resHealth] = await Promise.all([
        axiosInstance.get(url01).catch(() => ({ data: null })),
        axiosInstance.get(url02).catch(() => ({ data: null })),
        axiosInstance.get(urlHealth).catch(() => ({ data: null }))
      ]);
      
      // จัดการข้อมูล CAMT_01
      if (res01.data?.trends) {
        setCamt01Trends(mapTrendsToChart(res01.data.trends, 34)); 
        if (res01.data.peak_hour) {
            const timeOnly = res01.data.peak_hour.split(" ")[1];
            setPeakHourInsight(`ลานจอด CAMT_01 ประสบปัญหาความหนาแน่นสูงสุดเวลา ${timeOnly} น. แนะนำให้แจ้งเตือนผู้ใช้งานผ่าน Chatbot ให้ไปจอดโซนด้านหลัง (CAMT_02) ในช่วงเวลาดังกล่าว`);
        } else {
            setPeakHourInsight("ไม่พบจุดหนาแน่นวิกฤต (Peak Hour) ในรอบสัปดาห์ที่ผ่านมา ระบบทำงานได้อย่างมีประสิทธิภาพ");
        }
      }

      // จัดการข้อมูล CAMT_02
      if (res02.data?.trends) {
        setCamt02Trends(mapTrendsToChart(res02.data.trends, 41)); 
      }

      // ✅ จัดการข้อมูล System Health สำหรับการ์ด Uptime
      if (resHealth.data) {
        setUptime(resHealth.data.uptime_percentage || 0);
      }

      // 💡 พื้นที่สำหรับดึงข้อมูล Avg Entries และ Turnover ในอนาคต
      // const summaryRes = await axiosInstance.get('/analytics/weekly-summary');
      // setAvgEntries(summaryRes.data.avg_entries);
      // setAvgTurnover(summaryRes.data.avg_turnover);

    } catch (error) {
      console.error("Error fetching weekly data:", error);
      setPeakHourInsight("ไม่สามารถดึงข้อมูลสรุปผลรายสัปดาห์ได้ในขณะนี้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const chartHeights = camt01Trends;
  const weekendHeights = camt02Trends; 

  const avgCamt01 = chartHeights.reduce((a, b) => a + b, 0) / (chartHeights.filter(v => v > 0).length || 1);
  const avgCamt02 = weekendHeights.reduce((a, b) => a + b, 0) / (weekendHeights.filter(v => v > 0).length || 1);

  return (
    <MainLayout pageTitle="Weekly Reports">
      <div className="space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Weekly Performance Report</h2>
            <p className="text-sm text-gray-500 mt-1">Academic Period: Last 7 Days</p>
          </div>
          <ExportReportTools />
        </div>

        {/* Automated Insight Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-2 mb-4 text-blue-900">
            <Sparkles size={20} fill="currentColor" />
            <h3 className="text-xs font-bold uppercase tracking-widest">Automated Insight Summary</h3>
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {loading ? "Syncing with Edge AI nodes..." : "Campus utilization remained within optimal institutional bounds this week."}
          </h4>
          <p className="text-gray-500 leading-relaxed max-w-4xl">
            {loading ? "กำลังประมวลผลข้อมูล AI Insight..." : peakHourInsight}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Campus Zone Utilization (Weekly Avg)</h3>
              <span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded uppercase">Official Data</span>
            </div>
            
            <div className="space-y-6 flex-1 justify-center flex flex-col">
              <ProgressBar label="CAMT_01 (Front - Student)" current={Math.round((avgCamt01/100)*34)} max={34} statusLabel={avgCamt01 > 80 ? "HIGH" : "NORMAL"} />
              <ProgressBar label="CAMT_02 (Rear - Staff/Student)" current={Math.round((avgCamt02/100)*41)} max={41} statusLabel={avgCamt02 > 80 ? "HIGH" : "NORMAL"} />
              <ProgressBar label="Science & Tech Extension" current={0} max={100} statusLabel="NO DATA" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CAMT_01 Peak Hours (Avg)</h3>
              <div className="flex items-end justify-between h-40 gap-2 px-1 mt-4">
                {chartHeights.map((h, i) => (
                  <div key={`c1-${i}`} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-pointer">
                    <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(h)}%
                    </span>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-700 ${
                        h > 80 ? 'bg-blue-900' : h > 50 ? 'bg-blue-500' : 'bg-blue-200'
                      } group-hover:opacity-80`} 
                      style={{ height: `${Math.max(h, 5)}%` }} 
                    ></div>
                    <span className="text-[10px] text-gray-400 font-bold">{6 + (i * 2)}:00</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CAMT_02 Peak Hours (Avg)</h3>
              <div className="flex items-end justify-between h-40 gap-2 px-1 mt-4">
                {weekendHeights.map((h, i) => (
                  <div key={`c2-${i}`} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group cursor-pointer">
                    <span className="text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(h)}%
                    </span>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-700 ${
                        h > 80 ? 'bg-blue-900' : h > 50 ? 'bg-blue-500' : 'bg-gray-200'
                      } group-hover:opacity-80`} 
                      style={{ height: `${Math.max(h, 5)}%` }}
                    ></div>
                    <span className="text-[10px] text-gray-400 font-bold">{6 + (i * 2)}:00</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ✅ อัปเดต Bottom Stats Grid ให้เชื่อมกับตัวแปร State */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="Avg. Daily Entries" 
              value={loading ? "..." : (avgEntries !== null ? `${avgEntries} Cars` : "Pending Data")} 
              icon={<Users size={20} />} 
              subtitle="Waiting for Event Logs API"
            />
            <StatCard 
              title="Average Turn" 
              value={loading ? "..." : (avgTurnover !== null ? `${avgTurnover} hrs` : "Pending Data")} 
              icon={<Clock size={20} />} 
              subtitle="Waiting for Event Logs API"
            />
            <StatCard 
              title="Hardware Uptime" 
              value={loading ? "..." : `${uptime}%`} 
              icon={uptime > 90 ? <TrendingUp size={20} /> : <AlertTriangle size={20} />} 
              subtitle={uptime > 90 ? "System operating normally" : "Degraded performance detected"}
              trend={uptime > 90 ? "HEALTHY" : "WARNING"}
              trendUp={uptime > 90}
            />
        </div>

      </div>
    </MainLayout>
  );
};

export default WeeklyReportPage;