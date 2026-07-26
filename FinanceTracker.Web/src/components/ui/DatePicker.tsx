import { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format, parseISO, isValid, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

interface DatePickerProps {
  value: string; // ISO date string 'YYYY-MM-DD'
  onChange: (value: string) => void;
  minDate?: Date;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function DatePicker({
  value,
  onChange,
  minDate,
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date
  const selectedDate = useMemo(() => {
    if (!value) return new Date();
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : new Date();
  }, [value]);

  // View state for month/year navigation inside calendar
  const [viewDate, setViewDate] = useState<Date>(selectedDate);

  // Sync viewDate when modal opens or value changes
  useEffect(() => {
    if (value) {
      const parsed = parseISO(value);
      if (isValid(parsed)) setViewDate(parsed);
    }
  }, [value, open]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate calendar days for the current view date
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [viewDate]);

  const handleSelectDay = (day: Date) => {
    const formatted = format(day, 'yyyy-MM-dd');
    onChange(formatted);
    setOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate((prev) => addMonths(prev, 1));
  };

  const handleToday = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date();
    setViewDate(today);
    onChange(format(today, 'yyyy-MM-dd'));
    setOpen(false);
  };

  const weekDayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className={`relative w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 bg-dark-800 border border-dark-700 hover:border-dark-600 rounded-xl px-3.5 py-2.5 text-sm text-left text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon className="h-4 w-4 text-primary-400 flex-shrink-0" />
          <span className="font-medium truncate">
            {format(selectedDate, 'dd. MMMM yyyy', { locale: de })}
          </span>
        </div>
        <span className="text-[11px] text-dark-400 bg-dark-700/60 px-2 py-0.5 rounded-md font-mono">
          {format(selectedDate, 'dd.MM.yyyy')}
        </span>
      </button>

      {/* Calendar Popover */}
      {open && !disabled && (
        <div className="absolute left-0 sm:left-auto right-0 bottom-full mb-2 w-72 rounded-2xl bg-dark-900 border border-dark-700 shadow-2xl p-4 z-[130] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-dark-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
              title="Vorheriger Monat"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-white capitalize">
              {format(viewDate, 'MMMM yyyy', { locale: de })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
              title="Nächster Monat"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {weekDayLabels.map((d) => (
              <span key={d} className="text-[11px] font-medium text-dark-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((day, idx) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, viewDate);
              const isToday = isSameDay(day, new Date());
              const isDisabledDay = minDate ? day < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : false;

              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isDisabledDay}
                  onClick={() => !isDisabledDay && handleSelectDay(day)}
                  className={`h-8 w-8 mx-auto flex items-center justify-center text-xs rounded-xl transition-all font-medium ${
                    isDisabledDay
                      ? 'opacity-30 cursor-not-allowed text-dark-600'
                      : isSelected
                      ? 'bg-primary-600 text-white font-bold shadow-md shadow-primary-600/30'
                      : isToday
                      ? 'border border-primary-500/50 text-primary-400 hover:bg-primary-500/10'
                      : isCurrentMonth
                      ? 'text-dark-200 hover:bg-dark-800 hover:text-white'
                      : 'text-dark-600 hover:bg-dark-800/40 hover:text-dark-400'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-dark-800">
            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] font-medium text-primary-400 hover:text-primary-300 transition-colors px-2 py-1 rounded-lg hover:bg-primary-500/10"
            >
              Heute auswählen
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
