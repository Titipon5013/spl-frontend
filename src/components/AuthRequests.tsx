import React, { useEffect, useState } from 'react';
import MainLayout from '../components/MainLayout';
import { Check, X, Filter, Mail, ShieldAlert, ShieldCheck, UserX, Clock } from 'lucide-react';
import axiosInstance from '../api/axios'; // ✅ Import axiosInstance

interface AdminRequest {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  requestDate: string;
}

const AuthRequests: React.FC = () => {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ฟังก์ชันดึงข้อมูล Admin จากฐานข้อมูล
  const fetchRequests = async () => {
    try {
      setLoading(true);
      // ปรับ URL ให้ตรงกับ Endpoint ของ FastAPI (เช่น /admin หรือ /auth/users)
      const response = await axiosInstance.get('/admin-access/requests');
      const data = response.data;

      const formattedData = data.map((admin: any) => ({
        id: admin.id,
        name: admin.name || 'Unknown User',
        email: admin.email,
        avatar:
          admin.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || admin.email)}&background=0D8ABC&color=fff`,
        status: admin.status || 'pending',
        requestDate: admin.created_at
          ? new Date(admin.created_at).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : 'N/A',
      }));

      setRequests(formattedData);
    } catch (error) {
      console.error("Error fetching admin requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // ฟังก์ชันจัดการสิทธิ์ (Approve, Reject, Revoke) ยิงเข้า DB
  const handleStatusUpdate = async (id: number, newStatus: 'approved' | 'rejected' | 'revoked', name: string) => {
    
    // ดักการกดยกเลิกสิทธิ์
    if (newStatus === 'revoked') {
      const confirmRevoke = window.confirm(`⚠️ WARNING: Are you sure you want to REVOKE access for ${name}?\n\nThis will immediately invalidate their active dashboard sessions and LINE chatbot permissions.`);
      if (!confirmRevoke) return;
    }

    try {
      //  ส่งคำสั่งเปลี่ยน Status ไปที่ Backend
      //  ปรับ URL ให้ตรงกับ Endpoint การอัปเดตข้อมูล Admin (อ้างอิงจาก AdminUpdate schema)
      await axiosInstance.put(`/admin-access/requests/${id}`, { status: newStatus });

      // แจ้งเตือนการทำงานอัตโนมัติตาม Feature 5
      if (newStatus === 'approved') {
        alert(`✅ Access Granted for ${name}!\n\nAutomated Actions Triggered:\n1. Dashboard access enabled.\n2. Sent LINE Chatbot QR Code to email.\n3. Subscribed to Weekly Performance Reports.`);
      }

      // อัปเดต UI หน้าเว็บหลังจาก API ทำงานสำเร็จ
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id ? { ...req, status: newStatus } : req
        )
      );

    } catch (error) {
      console.error("Error updating status:", error);
      alert("❌ เกิดข้อผิดพลาดในการอัปเดตสิทธิ์ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const filteredRequests = requests.filter(req => 
    statusFilter === 'all' ? true : req.status === statusFilter
  );

  return (
    <MainLayout pageTitle="Access Management">
      <div className="space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Admin Onboarding & Access</h2>
            <p className="text-sm text-gray-500 mt-1">Review Google OAuth sign-ups and manage active sessions.</p>
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Personnel</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Active Admins</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-bold">User Identity</th>
                  <th className="px-6 py-4 font-bold">Request Date</th>
                  <th className="px-6 py-4 font-bold">System Status</th>
                  <th className="px-6 py-4 font-bold text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                      Loading identities...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      
                      {/* User Profile */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={req.avatar} alt="Avatar" className="w-10 h-10 rounded-full shadow-sm" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{req.name}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail size={12} className="text-gray-400"/> {req.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Request Date */}
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} className="text-gray-400" />
                          {req.requestDate}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        {req.status === 'pending' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><ShieldAlert size={12}/> Pending</span>}
                        {req.status === 'approved' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><ShieldCheck size={12}/> Active Access</span>}
                        {req.status === 'rejected' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Rejected</span>}
                        {req.status === 'revoked' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><UserX size={12}/> Revoked</span>}
                      </td>

                      {/* Control Actions */}
                      <td className="px-6 py-4 text-right">
                        {/* Pending Controls */}
                        {req.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleStatusUpdate(req.id, 'approved', req.name)}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-500 hover:text-white rounded-lg transition-colors border border-emerald-200 hover:border-transparent flex items-center gap-1"
                            >
                              <Check size={16} /> Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(req.id, 'rejected', req.name)}
                              className="px-3 py-1.5 bg-red-50 text-red-600 font-bold hover:bg-red-500 hover:text-white rounded-lg transition-colors border border-red-200 hover:border-transparent flex items-center gap-1"
                            >
                              <X size={16} /> Reject
                            </button>
                          </div>
                        )}

                        {/* Active Controls (Revocation) */}
                        {req.status === 'approved' && (
                          <button
                            onClick={() => handleStatusUpdate(req.id, 'revoked', req.name)}
                            className="px-3 py-1.5 bg-red-50 text-red-700 font-bold hover:bg-red-600 hover:text-white rounded-lg transition-colors border border-red-200 hover:border-transparent flex items-center gap-1 ml-auto"
                          >
                            <UserX size={16} /> Revoke Access
                          </button>
                        )}

                        {/* Processed States */}
                        {(req.status === 'rejected' || req.status === 'revoked') && (
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                            Access Denied
                          </span>
                        )}
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default AuthRequests;