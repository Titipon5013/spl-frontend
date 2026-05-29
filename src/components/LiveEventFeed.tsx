import React from 'react';
// แก้ไข Import ตรงนี้ เปลี่ยนเป็น LogIn และ LogOut
import { LogIn, LogOut, Video, Clock } from 'lucide-react';

interface EventProps {
  events: Array<{
    id: number;
    type: string;
    spot: string;
    plate: string;
    time: string;
  }>;
}

const LiveEventFeed: React.FC<EventProps> = ({ events }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
        <h3 className="font-bold text-gray-800">Live Space Status</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {events.map(event => (
          <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <div className={`p-2 rounded-lg ${event.type === 'entry' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
              {/* แก้ไขการเรียกใช้ Icon ตรงนี้ */}
              {event.type === 'entry' ? <LogIn size={18} /> : <LogOut size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">
                {event.type === 'entry' ? 'Entry' : 'Exit'}: Spot {event.spot}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                <Video size={12} /> Plate: {event.plate}
              </p>
            </div>
            <div className="text-xs text-gray-400 font-medium flex items-center gap-1">
              <Clock size={12}/> {event.time}
            </div>
          </div>
        ))}
      </div>
      <button className="w-full py-3 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
        VIEW ALL EVENTS
      </button>
    </div>
  );
};

export default LiveEventFeed;