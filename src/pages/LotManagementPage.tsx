import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import SpatialHeatmap from '../components/SpatialHeatmap';
import LiveEventFeed from '../components/LiveEventFeed';
import { Maximize2, MapPin, X } from 'lucide-react';
import axiosInstance from '../api/axios';

const LotManagementPage: React.FC = () => {
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [camt01Data, setCamt01Data] = useState<any>(null);
  const [camt02Data, setCamt02Data] = useState<any>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [slotHistory, setSlotHistory] = useState<any[]>([]);
  const [lotFilter, setLotFilter] = useState('CAMT_02');

  const fetchParkingData = async () => {
    try {
      const [res01, res02, resHeatmap] = await Promise.all([
        axiosInstance.get('/analytics/current?lot_id=CAMT_01'),
        axiosInstance.get('/analytics/current?lot_id=CAMT_02'),
        axiosInstance.get(`/analytics/heatmap?lot_id=${lotFilter}`),
      ]);

      setCamt01Data(res01.data);
      setCamt02Data(res02.data);

      if (resHeatmap.data?.spots) {
        const mappedSpots = resHeatmap.data.spots.map((spot: any) => ({
          id: spot.spot_id,
          status: spot.occupancy_percentage > 50 ? 'occupied' : 'available',
          heatRate: spot.occupancy_percentage,
        }));
        setParkingSpots(mappedSpots);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
          id: event.event_id,
          spot: event.spot_id,
          action: event.state,
          time: new Date(event.timestamp).toLocaleTimeString(),
        }))
      );
    } catch (error) {
      console.error('Error fetching slot history:', error);
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

  return (
    <MainLayout pageTitle="Lot Management">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Spatial Lot View</h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time individual space monitoring. Click a slot to view event history.
          </p>
        </div>
        <select
          value={lotFilter}
          onChange={(e) => setLotFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold"
        >
          <option value="CAMT_01">CAMT_01 (Front)</option>
          <option value="CAMT_02">CAMT_02 (Rear)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div className="flex items-center gap-2">
              <MapPin
                size={18}
                className={loading ? 'text-gray-400' : 'text-emerald-500 animate-pulse'}
              />
              <h3 className="font-bold text-gray-800">{lotFilter}</h3>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Maximize2 size={18} />
            </button>
          </div>

          <div onClick={(e) => {
            const target = e.target as HTMLElement;
            const spotEl = target.closest('[data-spot-id]');
            if (spotEl) {
              handleSpotSelect(spotEl.getAttribute('data-spot-id') || '');
            }
          }}>
            <SpatialHeatmap spots={parkingSpots} mode="occupancy" />
          </div>

          <div className="p-4 bg-white border-t border-gray-100 flex flex-wrap gap-2">
            {parkingSpots.map((spot) => (
              <button
                key={spot.id}
                data-spot-id={spot.id}
                onClick={() => handleSpotSelect(spot.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                  selectedSpot === spot.id
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                {spot.id}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Zone Intelligence</h3>
            <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">CAMT_02 (Rear)</span>
                <span className="text-xs font-bold bg-emerald-200 text-emerald-800 px-2 py-1 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {loading ? '...' : camt02Data?.total_spaces || 0} Spaces Total
              </p>
            </div>
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">CAMT_01 (Front)</span>
                <span className="text-xs font-bold bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                  LIVE
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {loading ? '...' : camt01Data?.total_spaces || 0} Spaces Total
              </p>
            </div>
          </div>

          {selectedSpot && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Slot {selectedSpot} History
                </h3>
                <button onClick={() => setSelectedSpot(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {slotHistory.length === 0 ? (
                  <p className="text-sm text-gray-500">No events recorded for this slot.</p>
                ) : (
                  slotHistory.map((event) => (
                    <div
                      key={event.event_id}
                      className="flex justify-between text-sm border-b border-gray-100 py-2"
                    >
                      <span className="font-bold capitalize">{event.state}</span>
                      <span className="text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <LiveEventFeed events={liveEvents} />
        </div>
      </div>
    </MainLayout>
  );
};

export default LotManagementPage;
