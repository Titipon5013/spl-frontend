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
          'flex h-16 w-12 items-center justify-center rounded-[var(--pp-radius)] border text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)] focus:ring-offset-2 md:h-20 md:w-14',
          getColorClasses(spot),
          selected && 'ring-2 ring-[var(--pp-blue)] ring-offset-2'
        )}
      >
        {spot.id}
      </button>
    );
  };

  return (
    <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center overflow-auto bg-[var(--pp-canvas)] p-4 md:p-6">
      <div className="relative w-full max-w-4xl rounded-[var(--pp-radius)] border border-slate-600 bg-slate-800 p-4 md:p-6">
        <div className="absolute bottom-6 left-1/2 top-6 w-14 -translate-x-1/2 rounded-[var(--pp-radius)] bg-slate-700">
          <div className="mx-auto h-full w-px border-l-2 border-dashed border-yellow-400/80" />
        </div>

        <div className="relative z-10 flex justify-between gap-16">
          <div className="space-y-6">
            {['A', 'C'].map(rowLabel => (
              <div key={rowLabel} className="flex flex-col gap-2">
                <div className="mb-1 font-semibold text-slate-300">Zone {rowLabel}</div>
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {getRow(rowLabel).map(renderSpot)}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {['B', 'D'].map(rowLabel => (
              <div key={rowLabel} className="flex flex-col gap-2">
                <div className="mb-1 text-right font-semibold text-slate-300">Zone {rowLabel}</div>
                <div className="grid grid-cols-5 gap-2 md:gap-3">
                  {getRow(rowLabel).map(renderSpot)}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 border-t border-slate-600 pt-4 text-center text-sm font-bold text-yellow-300">
          Entrance / Exit
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
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
