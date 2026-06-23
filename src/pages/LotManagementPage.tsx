import React, { useEffect, useState } from 'react';
import { Clock, MapPin, RefreshCcw, X } from 'lucide-react';
import axiosInstance from '../api/axios';
import LiveEventFeed from '../components/LiveEventFeed';
import MainLayout from '../components/MainLayout';
import SpatialHeatmap from '../components/SpatialHeatmap';
import { Button, EmptyState, PageHeader, Panel, SelectField, StatusBadge, Toolbar } from '../components/ui';
import type { ParkingLotId, ParkingSnapshot, ParkingSpot } from '../types/parking';

const lotOptions: Array<{ value: ParkingLotId; label: string }> = [
  { value: 'CAMT_02', label: 'CAMT Parking Lot (Live Camera)' },
];

const LotManagementPage: React.FC = () => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [parkingData, setParkingData] = useState<ParkingSnapshot | null>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [slotHistory, setSlotHistory] = useState<any[]>([]);
  const [lotFilter, setLotFilter] = useState<ParkingLotId>('CAMT_02');
  const [lastSync, setLastSync] = useState<string>('Not synced');

  const fetchParkingData = async () => {
    try {
      setError(null);
      
      const [resCurrent, resHeatmap] = await Promise.all([
        axiosInstance.get(`/analytics/current?lot_id=${lotFilter}`).catch(() => ({ data: null })),
        axiosInstance.get(`/analytics/heatmap?lot_id=${lotFilter}`).catch(() => ({ data: null })),
      ]);

      if (resCurrent.data) setParkingData(resCurrent.data);
      setLastSync(new Date().toLocaleTimeString());

      const liveSpots = resCurrent.data?.spots || []; 
      const heatmapSpots = resHeatmap.data?.spots || []; 

      // ดึงสถานะ Live (Occupied/Available) มาใช้เป็นหลัก
      const mergedSpots = heatmapSpots.map((heatSpot: any) => {
        const liveSpot = liveSpots.find((s: any) => s.spot_id === heatSpot.spot_id);
        return {
          id: heatSpot.spot_id,
          status: liveSpot?.is_occupied ? 'occupied' : 'available',
          heatRate: heatSpot.occupancy_percentage || 0,
        };
      });

      if (mergedSpots.length > 0) {
        setParkingSpots(mergedSpots);
      } else if (liveSpots.length > 0) {
        setParkingSpots(liveSpots.map((spot: any) => ({
          id: spot.spot_id,
          status: spot.is_occupied ? 'occupied' : 'available',
          heatRate: spot.is_occupied ? 100 : 0, 
        })));
      }

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Lot data is unavailable. The map will recover when the analytics API responds.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotHistory = async (spotId: string) => {
    try {
      const response = await axiosInstance.get(`/analytics/slots/${spotId}/events`, {
        params: { lot_id: lotFilter },
      });
      setSlotHistory(response.data);
      setLiveEvents(
        response.data.slice(0, 5).map((event: any) => ({
          id: event.id || event.event_id,
          spot: event.spot_id,
          action: event.is_occupied ? 'occupied' : 'available',
          time: new Date(event.timestamp).toLocaleTimeString(),
        }))
      );
    } catch (err) {
      console.error('Error fetching slot history:', err);
      setSlotHistory([]);
    }
  };

  const handleSpotSelect = (spotId: string) => {
    setSelectedSpot(spotId);
    fetchSlotHistory(spotId);
  };

  useEffect(() => {
    fetchParkingData();
    const intervalId = setInterval(fetchParkingData, 5000);
    return () => clearInterval(intervalId);
  }, [lotFilter]);

  const occupied = parkingData?.occupied_spaces || 0;
  const total = parkingData?.total_spaces || 0;
  const available = parkingData?.available_spaces || 0;

  return (
    <MainLayout pageTitle="Lot Management">
      <PageHeader
        title="Spatial Lot Operations"
        description="Monitor individual parking spots, inspect recent state changes, and keep the map aligned with live occupancy."
        actions={<StatusBadge tone={error ? 'warning' : 'success'} pulse>{error ? 'Degraded' : 'Live'}</StatusBadge>}
      />

      <Toolbar>
        <SelectField
          label="Parking lot"
          value={lotFilter}
          onChange={(value) => {
            setLotFilter(value as ParkingLotId);
            setSelectedSpot(null);
            setSlotHistory([]);
          }}
          options={lotOptions}
        />
        <div className="flex items-center gap-2 text-sm text-[var(--pp-muted)]">
          <RefreshCcw size={16} />
          <span>Refresh 5s · Last sync {lastSync}</span>
        </div>
      </Toolbar>

      {error && <div className="mb-5"><EmptyState title="Lot data is temporarily unavailable" description={error} tone="warning" /></div>}

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_360px]">
        <Panel className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--pp-line)] bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={18} className={loading ? 'text-[var(--pp-muted)]' : 'text-[var(--pp-success)]'} />
              <div>
                <h2 className="text-base font-bold text-[var(--pp-ink)]">{lotFilter} Live Status</h2>
                <p className="text-sm text-[var(--pp-muted)]">Real-time visual layout indicating available and occupied spots.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="success">{available} available</StatusBadge>
              <StatusBadge tone="danger">{occupied} occupied</StatusBadge>
              <StatusBadge tone="neutral">{total} total</StatusBadge>
            </div>
          </div>

          {parkingSpots.length > 0 ? (
            <SpatialHeatmap
              spots={parkingSpots}
              mode="live" // 🔥 เปลี่ยนจาก 'heatmap' เป็น 'live' เพื่อแสดง มืด/สว่าง
              selectedSpot={selectedSpot}
              onSelectSpot={handleSpotSelect}
            />
          ) : (
            <div className="p-4">
              <EmptyState title="No parking spot data" description="Spot controls will appear when the live endpoint returns spot-level occupancy." />
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4">
            <h2 className="mb-3 text-base font-bold text-[var(--pp-ink)]">Zone Intelligence</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-[var(--pp-radius)] border border-[var(--pp-line)] p-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--pp-ink)]">Live Camera Zone</span>
                  <StatusBadge tone="info">Active</StatusBadge>
                </div>
                <p className="mt-2 text-sm text-[var(--pp-muted)]">{parkingData?.total_spaces || 0} spaces total being monitored by AI</p>
              </div>
            </div>
          </Panel>

          <Panel className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--pp-ink)]">{selectedSpot ? `Spot ${selectedSpot} History` : 'Spot History'}</h2>
              {selectedSpot && (
                <Button variant="ghost" className="min-h-8 px-2" onClick={() => setSelectedSpot(null)} aria-label="Clear selected spot">
                  <X size={16} />
                </Button>
              )}
            </div>
            {!selectedSpot ? (
              <EmptyState title="Select a parking spot" description="Click a spot on the map to inspect recent occupancy events." />
            ) : slotHistory.length === 0 ? (
              <EmptyState title="No events recorded" description="This spot has no returned event history for the selected lot." />
            ) : (
              <div className="max-h-72 space-y-2 overflow-y-auto">
                {slotHistory.map((event: any, index: number) => (
                  <div key={event.id || index} className="flex items-center justify-between gap-3 border-b border-[var(--pp-line)] py-2 text-sm last:border-b-0">
                    <span className={`font-semibold capitalize ${event.is_occupied ? 'text-red-500' : 'text-green-500'}`}>
                      {event.is_occupied ? 'Occupied' : 'Available'}
                    </span>
                    <span className="flex items-center gap-1 text-[var(--pp-muted)]">
                      <Clock size={14} />
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <LiveEventFeed events={liveEvents} />
        </div>
      </div>
    </MainLayout>
  );
};

export default LotManagementPage;