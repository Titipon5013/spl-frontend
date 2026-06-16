import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import axiosInstance from '../api/axios';
import { Button } from './ui';
import type { ReportExportFormat } from '../types/parking';

interface ExportReportToolsProps {
  lotId?: string;
  days?: number;
}

const ExportReportTools: React.FC<ExportReportToolsProps> = ({
  lotId = 'CAMT_01',
  days = 7,
}) => {
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);

  const downloadExport = async (format: ReportExportFormat) => {
    try {
      setExporting(format);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const response = await axiosInstance.get('/analytics/export', {
        params: {
          lot_id: lotId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          export_format: format,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `parkpilot-${lotId}-${startDate.toISOString().slice(0, 10)}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please ensure you are logged in as an approved admin.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => downloadExport('csv')}
        disabled={exporting !== null}
        loading={exporting === 'csv'}
      >
        <FileDown size={16} /> CSV
      </Button>
      <Button
        onClick={() => downloadExport('pdf')}
        disabled={exporting !== null}
        loading={exporting === 'pdf'}
      >
        <FileDown size={16} /> PDF
      </Button>
    </div>
  );
};

export default ExportReportTools;
