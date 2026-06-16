import React from 'react';

interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  statusLabel?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max, statusLabel }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  let colorClass = 'bg-[var(--pp-success)]';
  if (percentage > 85) colorClass = 'bg-[var(--pp-danger)]';
  else if (percentage > 60) colorClass = 'bg-[var(--pp-warning)]';

  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-semibold text-[var(--pp-ink)]">{label}</span>
        {statusLabel && (
          <span className="rounded-[var(--pp-radius)] bg-[var(--pp-surface-muted)] px-2 py-1 text-xs font-semibold text-[var(--pp-muted)]">
            {statusLabel}
          </span>
        )}
      </div>
      <p className="mb-2 text-sm text-[var(--pp-muted)]">{max} spaces total</p>
      <div className="mb-2 h-2 w-full rounded-[var(--pp-radius)] bg-[var(--pp-surface-muted)]">
        <div className={`${colorClass} h-2 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="flex justify-between text-xs font-semibold text-[var(--pp-muted)]">
        <span>{current} occupied</span>
        <span>{max - current} available</span>
      </div>
    </div>
  );
};

export default ProgressBar;
