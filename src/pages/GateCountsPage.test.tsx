import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import GateCountsPage from './GateCountsPage';
import axiosInstance from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = axiosInstance.get as unknown as Mock;

vi.stubGlobal('ResizeObserver', class {
  observe() {}
  unobserve() {}
  disconnect() {}
});

const countsResponse = {
  date: '2026-10-07',
  timezone: 'Asia/Bangkok',
  gate_id: 'CAMT_EXIT_01',
  open_count: 57,
  close_count: 54,
  count_difference: 3,
  possible_missing_events: true,
  hourly: Array.from({ length: 24 }, (_, hour) => ({
    hour,
    open_count: hour === 12 ? 3 : 0,
    close_count: hour === 12 ? 1 : 0,
  })),
};

describe('GateCountsPage', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockGet.mockResolvedValue({ data: countsResponse });
  });

  it('loads persisted gate totals and warns when more than one event is unpaired', async () => {
    render(
      <MemoryRouter initialEntries={['/gate-counts']}>
        <GateCountsPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('Open and close totals differ by 3')).toBeInTheDocument();
    expect(screen.getByText('57')).toBeInTheDocument();
    expect(screen.getByText('54')).toBeInTheDocument();
    expect(screen.getByText('Events by hour')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Hourly gate open and close events bar chart' })).toBeInTheDocument();
  });

  it('requests the selected date and gate from the dashboard API', async () => {
    render(
      <MemoryRouter initialEntries={['/gate-counts']}>
        <GateCountsPage />
      </MemoryRouter>
    );

    await screen.findByText('57');
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/analytics/gate/counts', {
        params: expect.objectContaining({
          day: expect.any(String),
          gate_id: 'CAMT_EXIT_01',
        }),
      });
    });
  });
});
