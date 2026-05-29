import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shield, 
  Video, 
  IdCard, 
  BookOpen, 
  UserCheck, 
  LogOut, 
  Landmark,
  X,
  Activity,    
  BarChart,
  Map // <-- เพิ่มไอคอน Map สำหรับ Lot Management
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    // 👇 เพิ่ม Lot Management เข้ามาตรงนี้ 👇
    { name: 'Lot Management', icon: <Map size={20} />, path: '/lot-management' },
    { name: 'Live Camera', icon: <Video size={20} />, path: '/parking-space' },
    { name: 'System Health', icon: <Activity size={20} />, path: '/system-health' },
    { name: 'Weekly Reports', icon: <BarChart size={20} />, path: '/reports' },
    { name: 'Licence Plate', icon: <IdCard size={20} />, path: '/licence-plate' },
    { name: 'Entry Records', icon: <BookOpen size={20} />, path: '/entry-records' },
    { name: 'Auth Requests', icon: <UserCheck size={20} />, path: '/auth-requests' },
    { name: 'Admin Profile', icon: <Shield size={20} />, path: '/admin-profile' },
  ];

  return (
    <>
      {/* Overlay สำหรับตอนเปิดบนมือถือ */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* แถบ Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col justify-between z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        <div>
          {/* Logo & หัว Sidebar */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-900 p-2 rounded-lg">
                <Landmark className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-gray-900 leading-tight">ParkPilot</h1>
                <p className="text-xs text-gray-500 font-medium">CAMT EXCELLENCE</p>
              </div>
            </div>
            {/* ปุ่มปิดบนมือถือ */}
            <button className="md:hidden text-gray-500 hover:text-red-500" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>
          </div>

          {/* เมนูนำทาง (Nav Links) */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} 
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ปุ่ม Logout ด้านล่างสุด */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;