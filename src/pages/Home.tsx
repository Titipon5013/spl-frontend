import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CarFront, CheckCircle2, Clock, Landmark, XCircle } from 'lucide-react';
import axiosInstance from '../api/axios';
import { Button, MetricTile, Panel, StatusBadge } from '../components/ui';

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
      setLastUpdated('Sync failed');
    }
  };

  useEffect(() => {
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 5000);
    return () => clearInterval(interval);
  }, []);

  const occupiedSpaces = snapshot ? snapshot.total_spaces - snapshot.available_spaces : 0;

  return (
    <div className="min-h-screen bg-[var(--pp-canvas)] font-sans text-[var(--pp-ink)]">
      <nav className="sticky top-0 z-50 border-b border-[var(--pp-line)] bg-white px-4 py-3 md:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-[var(--pp-radius)] bg-[var(--pp-blue-deep)] p-2 text-white">
              <Landmark size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">ParkPilot</h1>
              <p className="mt-1 text-xs font-medium text-[var(--pp-muted)]">Public Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-[var(--pp-radius)] px-3 py-2 text-sm font-semibold text-[var(--pp-blue)] hover:bg-[var(--pp-blue-soft)]">
              Home
            </Link>
            <Link to="/login" className="rounded-[var(--pp-radius)] bg-[var(--pp-blue)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--pp-blue-deep)]">
              Admin Login
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex max-w-6xl flex-1 flex-col px-4 py-10 md:px-6">
        <div className="mb-8 max-w-3xl">
          <StatusBadge tone={lastUpdated === 'Sync failed' ? 'warning' : 'success'} pulse>Live status</StatusBadge>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--pp-ink)] md:text-4xl">CAMT Smart Parking</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--pp-muted)]">
            Check current CAMT_01 availability before arrival and register a license plate for automated parking access.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <MetricTile label="Available" value={snapshot ? snapshot.available_spaces : '-'} icon={<CheckCircle2 size={18} />} tone="success" />
          <MetricTile label="Occupied" value={snapshot ? occupiedSpaces : '-'} icon={<XCircle size={18} />} tone="danger" />
          <MetricTile label="Total Spaces" value={snapshot ? snapshot.total_spaces : '-'} icon={<CarFront size={18} />} tone="info" />
        </div>

        <Panel className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-[var(--pp-muted)]">
            <Clock size={16} />
            <span>Last sync: {lastUpdated}</span>
          </div>
          <Button onClick={() => navigate('/register')}>
            Register License Plate
            <ArrowRight size={16} />
          </Button>
        </Panel>
      </main>
    </div>
  );
};

export default Home;
