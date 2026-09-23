import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PlateRequestTable from './PlateRequestTable';
import axiosInstance from '../api/axios';
import type { LicensePlateRequest } from '../types/parking';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));

const mockedAxios = axiosInstance as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
};

const requests: LicensePlateRequest[] = [
  { id: 1, plate_number: 'ABC-123', plate_image_url: 'url1', status: 'pending', username: 'Test User', user_email: 'test@example.com' },
  { id: 2, plate_number: 'XYZ-789', plate_image_url: 'url2', status: 'approved', username: 'Another User', user_email: 'another@example.com' },
];

describe('PlateRequestTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: requests, headers: { 'x-total-count': '2' } });
    mockedAxios.put.mockResolvedValue({ data: {} });
  });

  it('renders requests and offers approve for pending rows', async () => {
    render(<PlateRequestTable />);

    expect(await screen.findByText('ABC-123')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revoke' })).toBeInTheDocument();
  });

  it('approves a pending request', async () => {
    const user = userEvent.setup();
    render(<PlateRequestTable />);

    await user.click(await screen.findByRole('button', { name: 'Approve' }));

    await waitFor(() =>
      expect(mockedAxios.put).toHaveBeenCalledWith('/requests/1', { status: 'approved' })
    );
  });

  it('rejects a pending request through the confirm dialog', async () => {
    const user = userEvent.setup();
    render(<PlateRequestTable />);

    await user.click(await screen.findByRole('button', { name: 'Reject' }));
    await user.click(await screen.findByRole('button', { name: 'Reject request' }));

    await waitFor(() =>
      expect(mockedAxios.put).toHaveBeenCalledWith('/requests/1', { status: 'rejected' })
    );
  });
});
