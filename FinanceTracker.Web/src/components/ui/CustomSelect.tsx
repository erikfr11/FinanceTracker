import { useState, useRef, useEffect, type ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption<T extends string | number = string | number> {
  value: T;
  label: string;
  sublabel?: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T extends string | number = string | number> {
  options: CustomSelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function CustomSelect<T extends string | number = string | number>({
  options,
  value,
  onChange,
  placeholder = 'Wählen…',
  disabled = false,
  className = '',
  icon,
  size = 'md',
}: CustomSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const paddingClass =
    size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-4 py-3 text-sm' : 'px-3.5 py-2.5 text-sm';

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-xl ${paddingClass} text-left text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-dark-400 flex-shrink-0">{icon}</span>}
          {selectedOption?.icon && <span className="flex-shrink-0">{selectedOption.icon}</span>}
          <div className="truncate">
            <span className="block truncate font-medium">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.sublabel && (
              <span className="block text-[11px] text-dark-400 truncate font-normal">
                {selectedOption.sublabel}
              </span>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-dark-400 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-primary-400' : ''
          }`}
        />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl py-1.5 z-[120] max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.length === 0 ? (
            <div className="px-4 py-2.5 text-xs text-dark-400 text-center">
              Keine Optionen verfügbar
            </div>
          ) : (
            options.map((o) => {
              const isSelected = o.value === value;
              return (
                <button
                  type="button"
                  key={String(o.value)}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-primary-500/10 text-primary-400 font-medium'
                      : 'text-dark-200 hover:bg-dark-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {o.icon && <span className="flex-shrink-0">{o.icon}</span>}
                    <div className="truncate">
                      <div className="font-medium truncate">{o.label}</div>
                      {o.sublabel && (
                        <div className="text-[11px] text-dark-400 font-normal truncate">
                          {o.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary-400 flex-shrink-0 ml-2" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
