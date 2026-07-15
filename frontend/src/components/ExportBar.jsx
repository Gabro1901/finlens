// ExportBar functionality is now integrated into CommandBar.jsx
// This file is kept for backward compatibility but is no longer used directly.
// See CommandBar.jsx for the new integrated export buttons.

import { FileDown, Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function ExportBar({ markdown, ticker }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const response = await fetch(`http://${window.location.hostname}:8000/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown_content: markdown, ticker: ticker || 'Report' })
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FinLens_${ticker || 'Report'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!markdown) return null;

  return (
    <div className="flex justify-end gap-2 mb-4">
      <button
        onClick={() => handleExport('markdown')}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all duration-200"
      >
        <FileDown className="w-3.5 h-3.5" />
        MD
      </button>
      <button
        onClick={() => handleExport('pdf')}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-500/50 rounded-lg shadow-sm transition-all duration-200"
      >
        {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        PDF
      </button>
    </div>
  );
}
