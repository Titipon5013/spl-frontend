import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { Landmark, Mail, User, Car, UploadCloud, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      toast.error('Please upload a photo of your license plate.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('plate_number', plateNumber);
    formData.append('photo', photo);

    try {
      const response = await axiosInstance.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);
      toast.success('Successfully registered! Awaiting admin approval.');
      // รีเซ็ตฟอร์มหลังจากลงทะเบียนเสร็จ (Optional)
      setEmail('');
      setName('');
      setPlateNumber('');
      setPhoto(null);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Navbar สไตล์ ParkPilot (เหมือนหน้า Home) */}
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
          <Link to="/" className="text-sm font-bold text-gray-500 hover:text-blue-900 transition-colors">
            Home
          </Link>
          <Link to="/login" className="text-sm font-bold bg-blue-50 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Main Form Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* Left Column: Form Inputs */}
            <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Vehicle Registration</h2>
                <p className="text-sm text-gray-500">
                  Register your vehicle to gain automated access to the CAMT Smart Parking facilities.
                </p>
              </div>

              <form id="register-form" onSubmit={handleSubmit} className="space-y-5">
                
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors sm:text-sm"
                      placeholder="e.g. user@student.cmu.ac.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors sm:text-sm"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* License Plate Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">License Plate Number</label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Car className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors uppercase sm:text-sm"
                      placeholder="e.g. กข 1234"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                    />
                  </div>
                </div>

              </form>
            </div>

            {/* Right Column: Photo Upload & Submit */}
            <div className="p-8 lg:p-12 bg-gray-50/50 flex flex-col justify-between">
              
              <div className="flex-1 mb-8">
                <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Photo</label>
                <p className="text-xs text-gray-500 mb-4">Please upload a clear image of your license plate.</p>
                
                <label 
                  htmlFor="photo" 
                  className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                    photo ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {photo ? (
                    <div className="text-center text-emerald-600 px-4">
                      <CheckCircle2 size={40} className="mx-auto mb-2" />
                      <p className="font-bold text-sm truncate max-w-[200px]">{photo.name}</p>
                      <p className="text-xs mt-1 text-emerald-500">Ready to upload</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 px-4">
                      <UploadCloud size={40} className="mx-auto mb-2" />
                      <p className="font-medium text-sm text-gray-600">Click to upload photo</p>
                      <p className="text-xs mt-1">JPG or PNG format</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  form="register-form"
                  className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-900 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 transition-all transform active:scale-[0.98]"
                >
                  Submit Registration
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  By registering, you agree to our parking terms and conditions.
                </p>
              </div>

            </div>
          </div>
        </div>

      </main>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Register;