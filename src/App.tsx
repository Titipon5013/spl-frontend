import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Import หน้าใหม่ (Tailwind Prototypes) ---
import AnalyticsPage from './pages/AnalyticsPage';
import LotManagementPage from './pages/LotManagementPage';
import SystemHealthPage from './pages/SystemHealthPage';
import WeeklyReportPage from './pages/WeeklyReportPage';
// ✅ Import หน้ากล้อง Live Camera กลับเข้ามา
import ParkingSpace from './pages/ParkingSpace'; 

// --- Import หน้าเดิมของคุณ ---
import Homepage from './pages/Home';
import Login from './pages/Login';
import AdminProfile from './pages/AdminProfilePage';
import LicencePlate from './pages/LicencePlate';
import EntryRecordsPage from './pages/EntryRecordsPage';
import Register from './components/Register';
import AddAdminProfile from './components/AddAdminProfile';
import AuthRequests from './components/AuthRequests';
import AddLicencePlate from './components/AddLicencePlate';
import ProtectedRoute from './components/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* --- Public Routes (หน้าเว็บทั่วไป/ล็อกอิน) --- */}
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* --- Protected Routes (ต้อง Login ก่อนถึงจะเห็น) --- */}
      <Route element={<ProtectedRoute />}>
        
        <Route path="/dashboard" element={<AnalyticsPage />} />
        
        {/* 🚀 แยกหน้า Lot Management และ Live Camera ออกจากกันตาม Sidebar แล้ว! */}
        <Route path="/lot-management" element={<LotManagementPage />} />
        <Route path="/parking-space" element={<ParkingSpace />} />
        
        <Route path="/system-health" element={<SystemHealthPage />} />
        <Route path="/reports" element={<WeeklyReportPage />} />

        {/* 📁 หน้าจอเดิมของคุณ (รอการอัปเกรด UI ในอนาคต) */}
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/add-admin" element={<AddAdminProfile />} />
        <Route path="/licence-plate" element={<LicencePlate />} />
        <Route path="/entry-records" element={<EntryRecordsPage />} />
        <Route path="/auth-requests" element={<AuthRequests />} />
        <Route path="/add-licence" element={<AddLicencePlate />} />
        
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

const App: React.FC = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;