import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import WeeklyReportPage from './WeeklyReportPage';
import axiosInstance from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = axiosInstance.get as unknown as Mock;

describe('WeeklyReportPage', () => {
  beforeEach(() => {
    mockGet.mockImplementation((url: string) => {
      if (url.startsWith('/analytics/trends?lot_id=CAMT_01')) {
        return Promise.resolve({
          data: {
            trends: [
              { time_label: '2026-06-12 08:00', average_occupancy: 17 },
              { time_label: '2026-06-12 10:00', average_occupancy: 10 },
            ],
            peak_hour: '2026-06-12 08:00',
          },
        });
      }
      if (url.startsWith('/analytics/trends?lot_id=CAMT_02')) {
        return Promise.resolve({
          data: {
            trends: [
              { time_label: '2026-06-12 08:00', average_occupancy: 20 },
              { time_label: '2026-06-12 10:00', average_occupancy: 30 },
            ],
            peak_hour: '2026-06-12 10:00',
          },
        });
      }
      if (url.startsWith('/analytics/health')) {
        return Promise.resolve({ data: { uptime_percentage: 97 } });
      }
      if (url === '/analytics/kpis') {
        return Promise.resolve({
          data: {
            utilization_percentage: 50,
            peak_occupancy: 20,
            vehicle_count: 12,
            avg_dwell_time_minutes: 18,
          },
        });
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });
  });

  it('renders weekly trends, KPI summary, and uptime from API data', async () => {
    render(
      <MemoryRouter initialEntries={['/reports']}>
        <WeeklyReportPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/CAMT_01 reached peak demand at 08:00/)).toBeInTheDocument();
    expect(screen.getByText('12 cars')).toBeInTheDocument();
    expect(screen.getByText('18 min')).toBeInTheDocument();
    expect(screen.getByText('97%')).toBeInTheDocument();
    expect(screen.getByText('CAMT_01 Peak Hours')).toBeInTheDocument();
    expect(screen.getByText('CAMT_02 Peak Hours')).toBeInTheDocument();
  });
});
