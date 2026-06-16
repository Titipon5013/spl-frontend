import React, { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Cpu, Server, Video, XCircle, Zap } from 'lucide-react';
import axiosInstance from '../api/axios';
import MainLayout from '../components/MainLayout';
import StatCard from '../components/StatCard';
import SystemHealthPanel from '../components/SystemHealthPanel';
import { EmptyState, PageHeader, Panel, StatusBadge } from '../components/ui';
import type { DeviceHealth } from '../types/parking';

const SystemHealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<DeviceHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setError(null);
      const response = await axiosInstance.get('/analytics/health?lot_id=CAMT_02');
      setHealthData(response.data);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Device health data is unavailable. Check API connectivity or board heartbeat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    const intervalId = setInterval(fetchHealthData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const isHealthy = healthData?.system_status === 'Healthy';
  const boardOnline = healthData?.board?.status === 'online';
  const cameraNodes = [
    { key: 'camera_1', label: 'Parking Area 1', path: 'parking/index.m3u8' },
    { key: 'camera_2', label: 'Parking Area 2', path: 'parking2/index.m3u8' },
    { key: 'camera_3', label: 'License Check 1', path: 'license/index.m3u8' },
    { key: 'camera_4', label: 'License Check 2', path: 'license1/index.m3u8' },
  ].map((camera) => {
    const node = healthData?.[camera.key as keyof DeviceHealth] as any;
    return {
      ...camera,
      online: node?.status === 'online',
      status: node?.status || 'unknown',
    };
  });
  const activeCameras = cameraNodes.filter((camera) => camera.online).length;

  const now = new Date().toLocaleTimeString();
  const healthLogs = healthData
    ? [
        { time: now, level: 'INFO', message: `System status: ${healthData.system_status}` },
        { time: now, level: boardOnline ? 'SUCCESS' : 'WARN', message: `Orange Pi board is ${healthData.board?.status || 'unknown'}` },
        ...cameraNodes.map((camera) => ({
          time: now,
          level: camera.online ? 'SUCCESS' : 'WARN',
          message: `${camera.label} is ${camera.status}`,
        })),
        { time: now, level: 'DB', message: `Uptime score: ${healthData.uptime_percentage}%` },
      ]
    : [];

  const incidents = [
    !boardOnline && {
      tone: 'danger' as const,
      label: 'Critical fault',
      message: 'Connection to Orange Pi main node is unavailable. Parking event ingestion may be halted.',
    },
    activeCameras < 4 && boardOnline && {
      tone: 'warning' as const,
      label: 'Hardware alert',
      message: 'One or more camera streams are unreachable. Check power and network cables.',
    },
    {
      tone: 'info' as const,
      label: 'System info',
      message: 'Health status refreshes every 10 seconds while this page is open.',
    },
  ].filter(Boolean) as Array<{ tone: 'info' | 'warning' | 'danger'; label: string; message: string }>;

  return (
    <MainLayout pageTitle="System Health">
      <PageHeader
        title="System Infrastructure Health"
        description="Monitor Orange Pi, camera streams, uptime, and incident state from one operational surface."
        actions={<StatusBadge tone={isHealthy ? 'success' : 'danger'} pulse>{loading ? 'Connecting' : isHealthy ? 'Systems operational' : 'System degraded'}</StatusBadge>}
      />

      {error && <div className="mb-5"><EmptyState title="Unable to load system health" description={error} tone="warning" /></div>}

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Orange Pi Main"
          value={boardOnline ? 'Online' : 'Offline'}
          icon={<Cpu size={18} />}
          subtitle="Central processing node"
          trend={boardOnline ? 'Active' : 'Critical'}
          trendUp={boardOnline}
        />
        <StatCard
          title="Active Cameras"
          value={`${activeCameras} / 4`}
          icon={<Video size={18} />}
          subtitle="Connected camera streams"
          trend={activeCameras === 4 ? 'Stable' : 'Warning'}
          trendUp={activeCameras === 4}
        />
        <StatCard
          title="Server Uptime"
          value={`${healthData?.uptime_percentage || 0}%`}
          icon={<Server size={18} />}
          subtitle="FastAPI backend"
          trend={(healthData?.uptime_percentage || 0) > 90 ? 'Stable' : 'Check'}
          trendUp={(healthData?.uptime_percentage || 0) > 90}
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <SystemHealthPanel logs={healthLogs as any} />

          <Panel className="p-4">
            <h2 className="mb-4 text-base font-bold text-[var(--pp-ink)]">Hardware Topology</h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cameraNodes.slice(0, 2).map((camera, index) => (
                  <DeviceNodeCard key={camera.key} cameraIndex={index + 1} label={camera.label} path={camera.path} online={camera.online} status={camera.status} />
                ))}
              </div>

              <div className={`flex flex-col items-center rounded-[var(--pp-radius)] border bg-white p-5 ${boardOnline ? 'border-[var(--pp-blue)]' : 'border-[var(--pp-danger)]'}`}>
                <div className={`mb-2 rounded-[var(--pp-radius)] p-3 ${boardOnline ? 'bg-[var(--pp-blue-soft)] text-[var(--pp-blue)]' : 'bg-[var(--pp-danger-soft)] text-[var(--pp-danger)]'}`}>
                  <Zap size={30} />
                </div>
                <h3 className="text-lg font-bold text-[var(--pp-ink)]">Orange Pi 5</h3>
                <StatusBadge tone={boardOnline ? 'success' : 'danger'}>{boardOnline ? 'Transmitting' : 'Connection lost'}</StatusBadge>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cameraNodes.slice(2).map((camera, index) => (
                  <DeviceNodeCard key={camera.key} cameraIndex={index + 3} label={camera.label} path={camera.path} online={camera.online} status={camera.status} />
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <Panel className="overflow-hidden">
          <div className="flex items-center gap-2 border-b border-[var(--pp-line)] bg-white p-4">
            <AlertTriangle size={18} className="text-[var(--pp-danger)]" />
            <h2 className="font-bold text-[var(--pp-ink)]">Incident Registry</h2>
          </div>
          <div className="space-y-3 p-4">
            {incidents.map((incident) => (
              <div key={incident.label} className="rounded-[var(--pp-radius)] border border-[var(--pp-line)] p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <StatusBadge tone={incident.tone}>{incident.label}</StatusBadge>
                  <span className="text-xs font-semibold text-[var(--pp-muted)]">Live</span>
                </div>
                <p className="text-sm leading-snug text-[var(--pp-ink)]">{incident.message}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </MainLayout>
  );
};

const DeviceNodeCard: React.FC<{
  cameraIndex: number;
  label: string;
  path: string;
  online: boolean;
  status: string;
}> = ({ cameraIndex, label, path, online, status }) => (
  <div className={`rounded-[var(--pp-radius)] border p-4 ${online ? 'border-[#b8dfcb] bg-[var(--pp-success-soft)]' : 'border-[#f3b5bb] bg-[var(--pp-danger-soft)]'}`}>
    <div className="mb-2 flex items-center gap-2">
      {online ? <CheckCircle2 size={18} className="text-[var(--pp-success)]" /> : <XCircle size={18} className="text-[var(--pp-danger)]" />}
      <StatusBadge tone={online ? 'success' : 'danger'}>{status}</StatusBadge>
    </div>
    <Activity size={28} className={online ? 'text-[var(--pp-ink)]' : 'text-[var(--pp-muted)]'} />
    <p className="mt-2 text-sm font-bold text-[var(--pp-ink)]">{label}</p>
    <p className="text-xs text-[var(--pp-muted)]">Camera 0{cameraIndex}</p>
    <p className="mt-1 truncate text-xs font-mono text-[var(--pp-muted)]">{path}</p>
  </div>
);

export default SystemHealthPage;
