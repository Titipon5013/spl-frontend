import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AnalyticsPage from './pages/AnalyticsPage';
import LotManagementPage from './pages/LotManagementPage';
import SystemHealthPage from './pages/SystemHealthPage';
import WeeklyReportPage from './pages/WeeklyReportPage';
import ParkingSpace from './pages/ParkingSpace'; 

import Homepage from './pages/Home';
import Login from './pages/Login';
import AdminProfile from './pages/AdminProfilePage';
import LicencePlate from './pages/LicencePlate';
import PlateRequestsPage from './pages/PlateRequestsPage';
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
      <Route path="/" element={<Homepage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        
        <Route path="/dashboard" element={<AnalyticsPage />} />
        
        <Route path="/lot-management" element={<LotManagementPage />} />
        <Route path="/parking-space" element={<ParkingSpace />} />
        
        <Route path="/system-health" element={<SystemHealthPage />} />
        <Route path="/reports" element={<WeeklyReportPage />} />

        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/add-admin" element={<AddAdminProfile />} />
        <Route path="/licence-plate" element={<LicencePlate />} />
        <Route path="/plate-requests" element={<PlateRequestsPage />} />
        <Route path="/entry-records" element={<EntryRecordsPage />} />
        <Route path="/auth-requests" element={<AuthRequests />} />
        <Route path="/add-licence" element={<AddLicencePlate />} />
        
      </Route>

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