import React, { useState } from 'react';
import { FileDown } from 'lucide-react';
import axiosInstance from '../api/axios';

interface ExportReportToolsProps {
  lotId?: string;
  days?: number;
}

const ExportReportTools: React.FC<ExportReportToolsProps> = ({
  lotId = 'CAMT_01',
  days = 7,
}) => {
  const [exporting, setExporting] = useState<string | null>(null);

  const downloadExport = async (format: 'csv' | 'pdf') => {
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
    <div className="flex gap-3">
      <button
        onClick={() => downloadExport('csv')}
        disabled={exporting !== null}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        <FileDown size={18} /> {exporting === 'csv' ? 'Exporting...' : 'Export to CSV'}
      </button>
      <button
        onClick={() => downloadExport('pdf')}
        disabled={exporting !== null}
        className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-all shadow-sm disabled:opacity-50"
      >
        <FileDown size={18} /> {exporting === 'pdf' ? 'Exporting...' : 'Export to PDF'}
      </button>
    </div>
  );
};

export default ExportReportTools;
