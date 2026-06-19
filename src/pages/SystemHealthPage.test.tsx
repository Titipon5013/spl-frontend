import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import SystemHealthPage from './SystemHealthPage';
import axiosInstance from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = axiosInstance.get as unknown as Mock;

describe('SystemHealthPage', () => {
  it('renders board status, camera count, and incident warning from health API data', async () => {
    mockGet.mockResolvedValue({
      data: {
        system_status: 'Degraded',
        uptime_percentage: 92,
        board: { status: 'online' },
        camera_1: { status: 'online' },
        camera_2: { status: 'offline' },
        camera_3: { status: 'online' },
        camera_4: { status: 'online' },
      },
    });

    render(
      <MemoryRouter initialEntries={['/system-health']}>
        <SystemHealthPage />
      </MemoryRouter>
    );

    expect(await screen.findByText('System degraded')).toBeInTheDocument();
    expect(screen.getAllByText('Online')[0]).toBeInTheDocument();
    expect(screen.getByText('3 / 4')).toBeInTheDocument();
    expect(screen.getByText('92%')).toBeInTheDocument();
    expect(screen.getByText('Hardware alert')).toBeInTheDocument();
    expect(screen.getByText('Parking Area 2 is offline')).toBeInTheDocument();
  });
});
