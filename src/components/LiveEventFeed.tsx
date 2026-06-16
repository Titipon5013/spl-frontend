import React from 'react';
import { Clock, LogIn, LogOut, Video } from 'lucide-react';
import { EmptyState, Panel, StatusBadge } from './ui';

interface EventProps {
  events: Array<{
    id: number;
    type?: string;
    action?: string;
    spot: string;
    plate?: string;
    time: string;
  }>;
}

const LiveEventFeed: React.FC<EventProps> = ({ events }) => {
  return (
    <Panel className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--pp-line)] p-4">
        <h3 className="font-bold text-[var(--pp-ink)]">Live Space Status</h3>
        <StatusBadge tone="danger" pulse>Live</StatusBadge>
      </div>
      <div className="divide-y divide-[var(--pp-line)]">
        {events.length === 0 ? (
          <div className="p-4">
            <EmptyState title="No live events selected" description="Select a parking spot to load recent state changes." />
          </div>
        ) : (
          events.map((event) => {
            const eventType = event.type || event.action || 'unknown';
            const isEntry = eventType === 'entry' || eventType === 'occupied';
            return (
              <div key={event.id} className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--pp-canvas)]">
                <div className={`rounded-[var(--pp-radius)] p-2 ${isEntry ? 'bg-[var(--pp-blue-soft)] text-[var(--pp-blue)]' : 'bg-[var(--pp-surface-muted)] text-[var(--pp-muted)]'}`}>
                  {isEntry ? <LogIn size={18} /> : <LogOut size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold capitalize text-[var(--pp-ink)]">
                    {eventType}: Spot {event.spot}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--pp-muted)]">
                    <Video size={12} /> Plate: {event.plate || 'Not provided'}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-[var(--pp-muted)]">
                  <Clock size={12}/> {event.time}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Panel>
  );
};

export default LiveEventFeed;
