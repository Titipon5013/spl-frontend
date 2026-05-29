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
    <div className="bg-[#1e1e1e] rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#323233] px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400 font-mono ml-4">parkpilot_telemetry.sh — root@camt-broker</span>
      </div>
      <div className="p-4 font-mono text-xs space-y-2 h-64 overflow-y-auto">
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