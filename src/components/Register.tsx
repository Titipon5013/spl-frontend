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
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[var(--pp-line)] bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-[var(--pp-radius)] bg-[var(--pp-blue-deep)] p-2">
            <Landmark className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-gray-900 leading-none">ParkPilot</h1>
            <p className="mt-0.5 text-xs font-medium text-[var(--pp-muted)]">Public Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm font-bold text-[var(--pp-muted)] transition-colors hover:text-[var(--pp-blue)]">
            Home
          </Link>
          <Link to="/login" className="rounded-[var(--pp-radius)] bg-[var(--pp-blue-soft)] px-4 py-2 text-sm font-bold text-[var(--pp-blue-deep)] transition-colors hover:bg-[#d9e9f8]">
            Admin Login
          </Link>
        </div>
      </nav>

      {/* Main Form Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        
        <div className="w-full max-w-4xl overflow-hidden rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white">
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
                  <div className="relative rounded-[var(--pp-radius)]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      required
                      className="block w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white py-3 pl-10 pr-3 text-gray-900 placeholder:text-[var(--pp-muted)] transition-colors focus:border-[var(--pp-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)]/20 sm:text-sm"
                      placeholder="e.g. user@student.cmu.ac.th"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <div className="relative rounded-[var(--pp-radius)]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white py-3 pl-10 pr-3 text-gray-900 placeholder:text-[var(--pp-muted)] transition-colors focus:border-[var(--pp-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)]/20 sm:text-sm"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                {/* License Plate Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">License Plate Number</label>
                  <div className="relative rounded-[var(--pp-radius)]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Car className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      required
                      className="block w-full rounded-[var(--pp-radius)] border border-[var(--pp-line)] bg-white py-3 pl-10 pr-3 text-gray-900 placeholder:text-[var(--pp-muted)] transition-colors focus:border-[var(--pp-blue)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)]/20 uppercase sm:text-sm"
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
                  className={`flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-[var(--pp-radius)] border-2 border-dashed transition-all ${
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
                  className="flex w-full items-center justify-center rounded-[var(--pp-radius)] border border-transparent bg-[var(--pp-blue)] px-4 py-4 text-sm font-bold text-white transition-colors hover:bg-[var(--pp-blue-deep)] focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)] focus:ring-offset-2"
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
