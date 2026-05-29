import React from 'react';

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  statusLabel?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max, statusLabel }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  // กำหนดสีตามความหนาแน่น
  let colorClass = 'bg-emerald-500';
  if (percentage > 85) colorClass = 'bg-red-500';
  else if (percentage > 60) colorClass = 'bg-yellow-500';

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-900">{label}</span>
        {statusLabel && (
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {statusLabel}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">{max} Spaces Total</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="flex justify-between text-xs font-bold text-gray-500">
        <span>{current} Occupied</span>
        <span>{max - current} Available</span>
      </div>
    </div>
  );
};

export default ProgressBar;