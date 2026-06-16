import React from 'react';
import { MetricTile, StatusBadge } from './ui';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, subtitle, trend, trendUp }) => {
  return (
    <MetricTile
      label={title}
      value={value}
      icon={icon}
      tone={trendUp === undefined ? 'info' : trendUp ? 'success' : 'danger'}
      meta={
        <div className="flex flex-wrap items-center gap-2">
          {subtitle && <span>{subtitle}</span>}
          {trend && <StatusBadge tone={trendUp ? 'success' : 'danger'}>{trend}</StatusBadge>}
        </div>
      }
    />
  );
};

export default StatCard;
