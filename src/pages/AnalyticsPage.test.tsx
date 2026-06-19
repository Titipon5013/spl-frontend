import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import AnalyticsPage from './AnalyticsPage';
import axiosInstance from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = axiosInstance.get as unknown as Mock;

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AnalyticsPage />
    </MemoryRouter>
  );

describe('AnalyticsPage', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'approved-admin-token');
    mockGet.mockImplementation((url: string, config?: { params?: { lot_id?: string } }) => {
      if (url === '/analytics/current?lot_id=CAMT_01') {
        return Promise.resolve({ data: { available_spaces: 20, occupied_spaces: 10, total_spaces: 30 } });
      }
      if (url === '/analytics/current?lot_id=CAMT_02') {
        return Promise.resolve({ data: { available_spaces: 10, occupied_spaces: 20, total_spaces: 30 } });
      }
      if (url.startsWith('/analytics/heatmap')) {
        return Promise.resolve({
          data: {
            spots: [
              { spot_id: 'A1', occupancy_percentage: url.includes('CAMT_02') ? 85 : 20 },
              { spot_id: 'B1', occupancy_percentage: 45 },
            ],
          },
        });
      }
      if (url.startsWith('/analytics/health')) {
        return Promise.resolve({ data: { system_status: 'Healthy', uptime_percentage: 99, board: { status: 'online' } } });
      }
      if (url === '/analytics/kpis') {
        return Promise.resolve({
          data: {
            utilization_percentage: config?.params?.lot_id === 'CAMT_02' ? 75 : 50,
            peak_occupancy: 22,
            vehicle_count: 42,
            avg_dwell_time_minutes: 18,
          },
        });
      }
      return Promise.reject(new Error(`Unhandled request: ${url}`));
    });
  });

  it('renders dashboard capacity, KPI cards, node status, and heatmap spots from API data', async () => {
    renderPage();

    expect(await screen.findByText('50.0%')).toBeInTheDocument();
    expect(screen.getByText('Vehicle Count')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Average Dwell')).toBeInTheDocument();
    expect(screen.getByText('18 min')).toBeInTheDocument();
    expect(screen.getAllByText('60')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Healthy')[0]).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A1' })).toBeInTheDocument();
  });

  it('requests lot-specific analytics when the lot filter changes', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('50.0%');
    await user.selectOptions(screen.getByLabelText('Lot filter'), 'CAMT_02');

    await waitFor(() => {
      expect(mockGet.mock.calls.some(([url]) => url === '/analytics/heatmap?lot_id=CAMT_02')).toBe(true);
    });
    await waitFor(() => {
      expect(
        mockGet.mock.calls.some(([url, config]) => url === '/analytics/kpis' && config?.params?.lot_id === 'CAMT_02')
      ).toBe(true);
    });
  });
});
