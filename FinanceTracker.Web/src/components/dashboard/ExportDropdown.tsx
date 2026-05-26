import { Download, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const ExportDropdown = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleExport = (format: string) => {
    // TODO: Später durch echten Export ersetzen
    alert(`Export als ${format} wird vorbereitet…`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-4 w-4 text-dark-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl py-1 z-50">
          <button onClick={() => handleExport('CSV')} className="w-full text-left px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
            📄 CSV Export
          </button>
          <button onClick={() => handleExport('Excel')} className="w-full text-left px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
            📊 Excel Export
          </button>
          <button onClick={() => handleExport('JSON')} className="w-full text-left px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
            🔗 JSON Export
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
