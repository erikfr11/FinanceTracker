import { Calendar, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface PeriodOption {
  value: string;
  label: string;
}

interface PeriodSelectorProps {
  options: PeriodOption[];
  selected: string;
  onChange: (value: string) => void;
}

const PeriodSelector = ({ options, selected, onChange }: PeriodSelectorProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selectedLabel = options.find(o => o.value === selected)?.label ?? 'Zeitraum wählen';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 border border-dark-700 text-sm text-dark-200 hover:border-dark-600 transition-colors"
      >
        <Calendar className="h-4 w-4 text-dark-400" />
        {selectedLabel}
        <ChevronDown className={`h-4 w-4 text-dark-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-56 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl py-1 z-50 max-h-64 overflow-y-auto">
          {options.map(o => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                o.value === selected
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-dark-300 hover:text-white hover:bg-dark-800'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeriodSelector;
