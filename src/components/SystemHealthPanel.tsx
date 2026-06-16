import React from 'react';

interface Log {
  time: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'MSG' | 'DB';
  message: string;
}

const SystemHealthPanel: React.FC<{ logs: Log[] }> = ({ logs }) => {
  const getLogColor = (level: string) => {
    switch (level) {
      case 'WARN': return 'text-yellow-400';
      case 'ERROR': return 'text-red-500';
      case 'MSG': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-[var(--pp-radius)] border border-slate-700 bg-[#1e1e1e]">
      <div className="flex items-center gap-2 bg-[#323233] px-4 py-2">
        <div className="flex gap-1.5">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <span className="ml-4 text-xs font-mono text-gray-400">parkpilot_telemetry.sh - root@camt-broker</span>
      </div>
      <div className="h-64 space-y-2 overflow-y-auto p-4 font-mono text-xs">
        {logs.map((log, index) => (
          <p key={index} className={getLogColor(log.level)}>
            <span className="text-gray-500">[{log.time}] {log.level}:</span> {log.message}
          </p>
        ))}
        <p className="text-green-400 animate-pulse">_</p>
      </div>
    </div>
  );
};

export default SystemHealthPanel;
