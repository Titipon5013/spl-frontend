import React from 'react';
import { FileDown } from 'lucide-react';

const ExportReportTools: React.FC = () => {
  return (
    <div className="flex gap-3">
      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
        <FileDown size={18} /> Export to CSV
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-all shadow-sm">
        <FileDown size={18} /> Export to PDF
      </button>
    </div>
  );
};

export default ExportReportTools;