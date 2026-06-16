import React, { useEffect, useState } from 'react';
import { Maximize2, Radio, Video } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import MainLayout from '../components/MainLayout';
import OpenGateButton from '../components/OpenGateButton';
import StreamPlayer from '../components/StreamPlayer';
import { Button, Dialog, PageHeader, Panel, StatusBadge, Toolbar } from '../components/ui';

const streams = ['parking', 'parking2', 'license', 'license1'];
const streamTitles = ['Parking Area 1', 'Parking Area 2', 'License Check 1', 'License Check 2'];

const ParkingSpace: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('N/A');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleString());
  }, []);

  const handleVideoClick = (streamIndex: number) => {
    setSelectedStream(streamIndex);
    setShowModal(true);
  };

  const handleVideoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, streamIndex: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleVideoClick(streamIndex);
    }
  };

  return (
    <MainLayout pageTitle="Live Camera">
      <PageHeader
        title="Live Camera Feed"
        description="Monitor four connected streams and trigger gate operations from the same command surface."
        actions={<StatusBadge tone="danger" pulse>Live streams</StatusBadge>}
      />

      <Toolbar>
        <div className="flex items-center gap-2 text-sm text-[var(--pp-muted)]">
          <Radio size={16} />
          <span>Last updated: {lastUpdated}</span>
        </div>
        <OpenGateButton />
      </Toolbar>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {streams.map((stream, index) => (
          <Panel key={stream} className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--pp-line)] bg-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-[var(--pp-blue)]" />
                <h2 className="font-bold text-[var(--pp-ink)]">{streamTitles[index]}</h2>
              </div>
              <StatusBadge tone="danger" pulse>Live</StatusBadge>
            </div>

            <div
              role="button"
              tabIndex={0}
              className="group relative block aspect-video w-full overflow-hidden bg-slate-900 text-left focus:outline-none focus:ring-2 focus:ring-[var(--pp-blue)] focus:ring-offset-2"
              onClick={() => handleVideoClick(index)}
              onKeyDown={(event) => handleVideoKeyDown(event, index)}
              aria-label={`Enlarge ${streamTitles[index]}`}
            >
              <StreamPlayer
                src={`/${stream}/index.m3u8`}
                className="h-full w-full object-cover"
                muted
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-slate-950/70 px-4 py-3 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                <span className="text-sm font-semibold">Open enlarged view</span>
                <Maximize2 size={18} />
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        title={streamTitles[selectedStream]}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            <OpenGateButton />
          </>
        }
      >
        <div className="aspect-video w-full bg-slate-950">
          <StreamPlayer
            src={`/${streams[selectedStream]}/index.m3u8`}
            autoPlay
            controls
            className="h-full w-full object-contain"
          />
        </div>
      </Dialog>

      <ToastContainer />
    </MainLayout>
  );
};

export default ParkingSpace;
