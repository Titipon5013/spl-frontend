import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Search, Bell, Settings, Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, pageTitle = "Dashboard" }) => {
  // State สำหรับควบคุมการเปิด/ปิด Sidebar บนจอมือถือ
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#F8F9FA] min-h-screen font-sans">
      
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* พื้นที่ Content หลัก */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          
          {/* ซ้าย: Hamburger Menu (เฉพาะมือถือ) + ชื่อหน้า */}
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-600 hover:text-blue-900 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800">{pageTitle}</h2>
          </div>
          
          {/* ขวา: เครื่องมือต่างๆ และ Profile */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Search Bar (ซ่อนบนมือถือจอเล็กสุด) */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none w-48 md:w-64 text-sm"
              />
            </div>
            
            <button className="text-gray-500 hover:text-blue-600 transition-colors hidden sm:block"><Bell size={20} /></button>
            <button className="text-gray-500 hover:text-blue-600 transition-colors hidden sm:block"><Settings size={20} /></button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-none">Admin Portal</p>
                <p className="text-xs text-emerald-600 font-bold mt-1 mt-1">• Online</p>
              </div>
              <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
                AD
              </div>
            </div>
          </div>

        </header>

        {/* เนื้อหาของแต่ละหน้าจะมาแสดงตรงนี้ */}
        <main className="p-4 md:p-8 flex-1">
          {children}
        </main>

      </div>
    </div>
  );
};

export default MainLayout;