import React from 'react';

interface Spot {
  id: string;
  status: 'available' | 'occupied';
  heatRate?: number; // ใส่ ? เพราะบางโหมดอาจจะไม่มีค่านี้
}

interface SpatialHeatmapProps {
  spots: Spot[];
  mode?: 'occupancy' | 'heatmap'; // ✅ เพิ่มสวิตช์เลือกโหมด (ค่าเริ่มต้นคือ occupancy)
}

const SpatialHeatmap: React.FC<SpatialHeatmapProps> = ({ spots, mode = 'occupancy' }) => {
  const getRow = (rowLetter: string) => spots.filter(s => s.id.startsWith(rowLetter));

  // ✅ ฟังก์ชันคำนวณสีที่ฉลาดขึ้น แยกตามโหมด
  const getColorClasses = (spot: Spot) => {
    if (mode === 'heatmap') {
      // โหมด Heatmap (Analytics)
      const heat = spot.heatRate || 0;
      if (heat >= 80) return 'bg-red-500/90 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.6)]';
      if (heat >= 40) return 'bg-yellow-400/90 border-yellow-300 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
      return 'bg-emerald-500/80 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    } else {
      // โหมด Occupancy (Lot Management) โชว์แค่ว่าง/ไม่ว่าง
      return spot.status === 'available'
        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
        : 'bg-slate-900 border-slate-700 text-slate-600';
    }
  };

  return (
    <div className="p-6 bg-gray-100 flex-1 overflow-auto min-h-[400px] flex flex-col items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-3xl shadow-inner w-full max-w-4xl relative">
        <div className="absolute top-0 bottom-0 left-1/2 w-16 -ml-8 bg-gray-700 flex flex-col justify-center items-center overflow-hidden">
           <div className="h-full border-l-4 border-dashed border-yellow-500 opacity-50"></div>
        </div>

        <div className="flex justify-between relative z-10">
          <div className="space-y-8">
            {['A', 'C'].map(rowLabel => (
              <div key={rowLabel} className="flex flex-col gap-2">
                 <div className="text-gray-400 font-bold mb-1">Zone {rowLabel}</div>
                 <div className="grid grid-cols-5 gap-3">
                    {getRow(rowLabel).map(spot => (
                      <div
                        key={spot.id}
                        className={`w-14 h-24 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${getColorClasses(spot)}`}
                      >
                        {spot.id}
                      </div>
                    ))}
                 </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            {['B', 'D'].map(rowLabel => (
              <div key={rowLabel} className="flex flex-col gap-2">
                 <div className="text-gray-400 font-bold mb-1 text-right">Zone {rowLabel}</div>
                 <div className="grid grid-cols-5 gap-3">
                    {getRow(rowLabel).map(spot => (
                      <div
                        key={spot.id}
                        className={`w-14 h-24 rounded-lg border-2 flex items-center justify-center font-bold text-sm transition-all duration-500 ${getColorClasses(spot)}`}
                      >
                        {spot.id}
                      </div>
                    ))}
                 </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-10 text-center text-yellow-500 font-bold tracking-[0.5em] border-t-4 border-gray-600 pt-6">
           ENTRANCE / EXIT
        </div>
      </div>

      {/* ✅ โชว์คำอธิบายสี (Legend) เฉพาะโหมด Heatmap เท่านั้น */}
      {mode === 'heatmap' && (
        <div className="mt-6 flex gap-6 bg-white px-6 py-3 rounded-full shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <div className="w-4 h-4 rounded bg-red-500"></div> High Demand (80-100%)
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <div className="w-4 h-4 rounded bg-yellow-400"></div> Moderate (40-79%)
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
            <div className="w-4 h-4 rounded bg-emerald-500"></div> Low Demand (0-39%)
          </div>
        </div>
      )}
    </div>
  );
};

export default SpatialHeatmap;