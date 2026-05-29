import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap'; // เหลือไว้แค่ Modal กับ Button
import OpenGateButton from '../components/OpenGateButton';
import StreamPlayer from '../components/StreamPlayer';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from '../components/Layout';

const streams = ['parking', 'parking2', 'license', 'license1'];
const streamTitles = ['Parking Area 1', 'Parking Area 2', 'License Check 1', 'License Check 2'];

const ParkingSpace: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('N/A');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const handleVideoClick = (streamIndex: number) => {
    setSelectedStream(streamIndex);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleOpenGate = () => {
    toast.success('Gate is opening...', {
      position: 'top-right',
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
    });
  };

  return (
    <Layout>
      <div className="p-6 min-h-screen bg-gray-50">
        
        {/* Header Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <h2 className="text-2xl font-bold text-gray-800">Live Camera Feed</h2>
          </div>
          <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            Last updated: <span className="text-gray-800">{lastUpdated}</span>
          </div>
        </div>

        {/* 2x2 Grid using Tailwind */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {streams.map((stream, index) => (
            <div 
              key={stream} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-300"
              onClick={() => handleVideoClick(index)}
            >
              {/* Card Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-700">{streamTitles[index]}</h3>
                <span className="flex items-center gap-1.5 bg-red-50 text-red-600 px-2.5 py-1 rounded-md text-xs font-bold border border-red-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>

              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900 w-full overflow-hidden">
                <StreamPlayer
                  src={`/${stream}/index.m3u8`}
                  className="w-full h-full object-cover"
                  muted
                />
                
                {/* Hover Overlay (มาแทนที่การเขียน <style> แบบเก่า) */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/90 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    Click to enlarge
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Global Controls */}
        <div className="flex justify-center mt-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 inline-block">
             <OpenGateButton />
          </div>
        </div>

        {/* Modal for enlarged video (เก็บโครง Bootstrap ไว้ แต่ปรับสีนิดหน่อย) */}
        <Modal show={showModal} onHide={handleCloseModal} size="xl" centered backdrop="static">
          <Modal.Header closeButton className="border-b border-gray-100 bg-gray-50">
            <Modal.Title className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              {streamTitles[selectedStream]}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-900 p-0">
            <div className="w-full aspect-video flex justify-center items-center">
              <StreamPlayer
                src={`/${streams[selectedStream]}/index.m3u8`}
                autoPlay
                controls
                className="w-full h-full object-contain"
              />
            </div>
          </Modal.Body>
          <Modal.Footer className="bg-gray-50 border-t border-gray-100">
            <Button 
              variant="light" 
              onClick={handleCloseModal} 
              className="font-medium text-gray-600 bg-white border border-gray-300 hover:bg-gray-100"
            >
              Close
            </Button>
            <OpenGateButton />
          </Modal.Footer>
        </Modal>

        <ToastContainer />
      </div>
    </Layout>
  );
};

export default ParkingSpace;