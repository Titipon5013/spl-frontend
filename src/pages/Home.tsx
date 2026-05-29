import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Landmark, CheckCircle2, XCircle, CarFront, ArrowRight, Clock } from 'lucide-react';

interface ParkingSnapshot {
  available_spaces: number;
  total_spaces: number;
}

const Home: React.FC = () => {
  const [snapshot, setSnapshot] = useState<ParkingSnapshot | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('Connecting...');
  const navigate = useNavigate();

  const fetchSnapshot = async () => {
    try {
      const response = await axiosInstance.get('/analytics/current?lot_id=CAMT_01');
      setSnapshot(response.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching parking snapshot:', error);
      setLastUpdated('Sync Failed');
    }
  };

  useEffect(() => {
    // โหลดครั้งแรก
    fetchSnapshot();
    // ตั้งเวลาให้โหลดใหม่ทุกๆ 5 วินาที (เพื่อให้หน้าแรกรู้สึกเป็น Live Feed)
    const interval = setInterval(fetchSnapshot, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const occupiedSpaces = snapshot ? snapshot.total_spaces - snapshot.available_spaces : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Navbar สไตล์ ParkPilot */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-900 p-2 rounded-lg">
            <Landmark className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-gray-900 leading-none">ParkPilot</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Public Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors">
            Home
          </Link>
          <Link to="/login" className="text-sm font-bold bg-blue-50 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-8">
        
        {/* Header Section */}
        <div className="text-center mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-4">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            LIVE STATUS
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            CAMT Smart Parking
          </h2>
          <p className="text-lg text-gray-500">
            Real-time availability monitoring for CAMT_01 Main Lot. Check spaces before you arrive.
          </p>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mb-12">
          
          {/* Available Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Available</h4>
              <span className="text-6xl font-black text-gray-900">
                {snapshot ? snapshot.available_spaces : '-'}
              </span>
            </div>
          </div>

          {/* Occupied Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 text-red-600">
                <XCircle size={32} />
              </div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Occupied</h4>
              <span className="text-6xl font-black text-gray-900">
                {snapshot ? occupiedSpaces : '-'}
              </span>
            </div>
          </div>

          {/* Total Slots Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-500"></div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                <CarFront size={32} />
              </div>
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Total Slots</h4>
              <span className="text-6xl font-black text-gray-900">
                {snapshot ? snapshot.total_spaces : '-'}
              </span>
            </div>
          </div>

        </div>

        {/* Call to Action & Footer */}
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={handleRegisterClick}
            className="group bg-gray-900 hover:bg-blue-900 text-white text-lg font-bold py-4 px-8 rounded-2xl shadow-lg transition-all flex items-center gap-3"
          >
            Register License Plate
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mt-4">
            <Clock size={16} />
            <span>Last sync: {lastUpdated}</span>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;