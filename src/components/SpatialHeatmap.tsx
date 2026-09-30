import React from 'react';
import type { ParkingSpot } from '../types/parking';
import { StatusBadge, cx } from './ui';

interface SpatialHeatmapProps {
  spots: ParkingSpot[];
  mode?: 'occupancy' | 'heatmap';
  selectedSpot?: string | null;
  onSelectSpot?: (spotId: string) => void;
}

const SpatialHeatmap: React.FC<SpatialHeatmapProps> = ({
  spots,
  mode = 'occupancy',
  selectedSpot,
  onSelectSpot,
}) => {
  const getRow = (rowLetter: string) => spots.filter(s => s.id.startsWith(rowLetter));

  const getColorClasses = (spot: ParkingSpot) => {
    if (mode === 'heatmap') {
      const heat = spot.heatRate || 0;
      if (heat >= 80) return 'border-[var(--pp-danger)] bg-[var(--pp-danger)] text-white';
      if (heat >= 40) return 'border-[var(--pp-warning)] bg-[var(--pp-warning-soft)] text-[var(--pp-warning)]';
      return 'border-[var(--pp-success)] bg-[var(--pp-success-soft)] text-[var(--pp-success)]';
    }

    if (spot.status === 'offline') return 'border-slate-500 bg-slate-700 text-slate-300';
    return spot.status === 'available'
      ? 'border-[var(--pp-success)] bg-[var(--pp-success-soft)] text-[var(--pp-success)]'
      : 'border-[var(--pp-danger)] bg-[var(--pp-danger)] text-white';
  };

  const renderSpot = (spot: ParkingSpot) => {
    const selected = selectedSpot === spot.id;
    return (
      <button
        key={spot.id}
        type="button"
        data-spot-id={spot.id}
        onClick={() => onSelectSpot?.(spot.id)}
        className={cx(
          // ปรับสเกลให้เนียนขึ้นทั้ง มือถือ แท็บเล็ต และคอมพิวเตอร์
          'flex h-12 w-9 sm:h-14 sm:w-11 md:h-16 md:w-12 lg:h-20 lg:w-14 items-center justify-center rounded-[var(--pp-radius)] border text-[10px] sm:text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)] focus:ring-offset-2',
          getColorClasses(spot),
          selected && 'ring-2 ring-[var(--pp-blue)] ring-offset-2'
        )}
      >
        {spot.id}
      </button>
    );
  };

  return (
    <div className="flex w-full flex-col bg-[var(--pp-canvas)] py-4">
      <div className="w-full px-4 md:px-6">
        {/* ลบ min-w และ overflow-x-auto ทิ้ง เพื่อให้หดตามจอมือถือได้เต็มที่ */}
        <div className="relative mx-auto w-full max-w-4xl rounded-[var(--pp-radius)] border border-slate-600 bg-slate-800 p-4 md:p-6 md:pb-20">
          
          {/* เส้นถนนแนวตั้ง (แสดงเฉพาะบน Desktop: md ขึ้นไป) */}
          <div className="hidden md:block absolute bottom-12 left-1/2 top-6 w-14 -translate-x-1/2 rounded-[var(--pp-radius)] bg-slate-700 z-0">
            <div className="mx-auto h-full w-px border-l-2 border-dashed border-yellow-400/80" />
          </div>

          {/* Wrapper หลัก: บนมือถือเรียงแนวตั้ง (flex-col) บนคอมเรียงแนวนอน (md:flex-row) */}
          <div className="relative z-10 flex flex-col md:flex-row justify-center md:justify-between items-center md:items-start gap-6 md:gap-16">
            
            {/* โซนซ้าย (Zone A, C) */}
            <div className="space-y-6 w-full flex flex-col items-center md:items-start">
              {['A', 'C'].map(rowLabel => (
                <div key={rowLabel} className="flex flex-col gap-2">
                  <div className="mb-1 font-semibold text-slate-300 text-center md:text-left">Zone {rowLabel}</div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
                    {getRow(rowLabel).map(renderSpot)}
                  </div>
                </div>
              ))}
            </div>

            {/* เส้นถนนแนวนอน (แสดงเฉพาะบนมือถือ: ซ่อนตอนเป็น md) */}
            <div className="w-full h-10 md:hidden rounded-[var(--pp-radius)] bg-slate-700 flex items-center px-4 z-0">
              <div className="w-full h-px border-t-2 border-dashed border-yellow-400/80" />
            </div>

            {/* โซนขวา (Zone B, D) */}
            <div className="space-y-6 w-full flex flex-col items-center md:items-end">
              {['B', 'D'].map(rowLabel => (
                <div key={rowLabel} className="flex flex-col gap-2">
                  <div className="mb-1 font-semibold text-slate-300 text-center md:text-right">Zone {rowLabel}</div>
                  <div className="grid grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
                    {getRow(rowLabel).map(renderSpot)}
                  </div>
                </div>
              ))}
            </div>

          </div>
          
          <div className="mt-8 md:absolute md:bottom-4 md:left-0 md:right-0 md:mt-0 border-t border-slate-600 md:border-none pt-4 md:pt-0 text-center text-sm font-bold text-yellow-300">
            Entrance / Exit
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2 px-4">
        {mode === 'heatmap' ? (
          <>
            <StatusBadge tone="danger">High demand 80-100%</StatusBadge>
            <StatusBadge tone="warning">Moderate 40-79%</StatusBadge>
            <StatusBadge tone="success">Low 0-39%</StatusBadge>
          </>
        ) : (
          <>
            <StatusBadge tone="success">Available</StatusBadge>
            <StatusBadge tone="danger">Occupied</StatusBadge>
            <StatusBadge tone="neutral">Offline</StatusBadge>
          </>
        )}
      </div>
    </div>
  );
};

export default SpatialHeatmap;