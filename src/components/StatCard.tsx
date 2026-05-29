import React from 'react';

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
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-blue-900">
          {icon}
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded ${trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
        {subtitle && <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default StatCard;