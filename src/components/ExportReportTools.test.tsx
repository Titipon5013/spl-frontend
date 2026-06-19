import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, type Mock } from 'vitest';
import ExportReportTools from './ExportReportTools';
import axiosInstance from '../api/axios';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = axiosInstance.get as unknown as Mock;

describe('ExportReportTools', () => {
  it('downloads CSV and PDF analytics exports for the selected lot', async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn(() => 'blob:parkpilot-report');
    const revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    Object.defineProperty(window, 'URL', {
      writable: true,
      value: { createObjectURL, revokeObjectURL },
    });

    mockGet.mockResolvedValue({ data: 'report-data' });

    render(<ExportReportTools lotId="CAMT_02" />);

    await user.click(screen.getByRole('button', { name: /CSV/ }));
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        '/analytics/export',
        expect.objectContaining({
          params: expect.objectContaining({
            lot_id: 'CAMT_02',
            export_format: 'csv',
          }),
          responseType: 'blob',
        })
      );
    });

    await user.click(screen.getByRole('button', { name: /PDF/ }));
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith(
        '/analytics/export',
        expect.objectContaining({
          params: expect.objectContaining({
            lot_id: 'CAMT_02',
            export_format: 'pdf',
          }),
          responseType: 'blob',
        })
      );
    });

    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:parkpilot-report');
    expect(click).toHaveBeenCalledTimes(2);
  });
});
