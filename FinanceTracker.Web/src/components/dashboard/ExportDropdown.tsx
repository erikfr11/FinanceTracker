import { Download, ChevronDown, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useFilter } from '../../context/FilterContext';
import { exportTransactions } from '../../services/transactionService';

const ExportDropdown = () => {
  const [open, setOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState<string | null>(null);
  const { apiFilter } = useFilter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExport = async (format: string) => {
    setLoadingFormat(format);
    try {
      await exportTransactions(apiFilter, format);
      setOpen(false);
    } catch (err: any) {
      alert(err.message || 'Fehler beim Exportieren.');
    } finally {
      setLoadingFormat(null);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors shadow-sm"
      >
        <Download className="h-4 w-4 text-primary-400" />
        Exportieren
        <ChevronDown className={`h-4 w-4 text-dark-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <button
            onClick={() => handleExport('csv')}
            disabled={!!loadingFormat}
            className="w-full flex items-center justify-between text-left px-4 py-2.5 text-xs text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <span>📄 CSV Export</span>
            {loadingFormat === 'csv' && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary-400" />}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={!!loadingFormat}
            className="w-full flex items-center justify-between text-left px-4 py-2.5 text-xs text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <span>📊 Excel Export (.xlsx)</span>
            {loadingFormat === 'excel' && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary-400" />}
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={!!loadingFormat}
            className="w-full flex items-center justify-between text-left px-4 py-2.5 text-xs text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <span>🔗 JSON Export</span>
            {loadingFormat === 'json' && <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary-400" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
