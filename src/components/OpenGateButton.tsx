import React, { useState } from 'react';
import axiosInstance from '../api/axios';
import { toast } from 'react-toastify';
import { DoorOpen } from 'lucide-react';
import { Button } from './ui';

const OpenGateButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleOpenGate = async () => {
    setLoading(true);
    try {
      toast.info('Opening gate...', {
        position: 'top-right',
        autoClose: 1500,
      });

      const response = await axiosInstance.get('/parking/open');

      toast.success(response.data.status || 'Gate opened successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error: any) {
      console.error('Failed to open gate:', error);

      toast.error(
        error.response?.data?.detail || 'Failed to open gate. Please try again.',
        {
          position: 'top-right',
          autoClose: 4000,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleOpenGate}
      loading={loading}
      className="min-w-36"
    >
      <DoorOpen size={16} />
      {loading ? 'Opening gate' : 'Open Gate'}
    </Button>
  );
};

export default OpenGateButton;
