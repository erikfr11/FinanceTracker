import { useMemo, useState } from 'react';
import { Search, RotateCcw, Calendar, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useFilter } from '../../context/FilterContext';
import type { CategoryDto } from '../../services/categoryService';
import DatePicker from '../ui/DatePicker';
import CustomSelect from '../ui/CustomSelect';

interface AdvancedFilterBarProps {
  categories: CategoryDto[];
}

export default function AdvancedFilterBar({ categories }: AdvancedFilterBarProps) {
  const {
    periodPreset,
    setPeriodPreset,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    categoryId,
    setCategoryId,
    typeFilter,
    setTypeFilter,
    searchTerm,
    setSearchTerm,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    isDefaultFilter,
    activeFiltersCount,
    resetFilters,
  } = useFilter();

  const [expanded, setExpanded] = useState(false);

  // Generate available years list (e.g. 2022 to currentYear + 1)
  const currentYearNum = new Date().getFullYear();
  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = currentYearNum; y >= currentYearNum - 5; y--) {
      years.push({ value: y, label: `Jahr ${y}` });
    }
    return years;
  }, [currentYearNum]);

  // Generate available months list for current and past years
  const monthOptions = useMemo(() => {
    const options = [];
    const deFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
    
    // Last 24 months
    const now = new Date();
    for (let i = 0; i < 24; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = deFormatter.format(d);
      options.push({ value: val, label: label.charAt(0).toUpperCase() + label.slice(1) });
    }
    return options;
  }, []);

  const categoryOptions = useMemo(() => {
    return [
      { value: 0, label: 'Alle Kategorien' },
      ...categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    ];
  }, [categories]);

  return (
    <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 space-y-4 shadow-xl">
      {/* Primary Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Period Preset Tabs */}
        <div className="flex items-center gap-1 bg-dark-800/80 p-1 rounded-xl border border-dark-700/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setPeriodPreset('currentYear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              periodPreset === 'currentYear'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            Aktuelles Jahr ({currentYearNum})
          </button>

          <button
            type="button"
            onClick={() => setPeriodPreset('specificYear')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              periodPreset === 'specificYear'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            Ganzes Jahr
          </button>

          <button
            type="button"
            onClick={() => setPeriodPreset('specificMonth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              periodPreset === 'specificMonth'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            Einzelner Monat
          </button>

          <button
            type="button"
            onClick={() => setPeriodPreset('customRange')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              periodPreset === 'customRange'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-dark-300 hover:text-white hover:bg-dark-700/50'
            }`}
          >
            Individuell
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          {/* Fuzzy Text Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Suchen nach Beschreibung / Kategorie…"
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-dark-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle More Filters */}
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all ${
              expanded || activeFiltersCount > 0
                ? 'bg-dark-800 border-primary-500/50 text-primary-400'
                : 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {/* Reset Filters button */}
          {!isDefaultFilter && (
            <button
              type="button"
              onClick={resetFilters}
              title="Filter auf Standard (Aktuelles Jahr) zurücksetzen"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-medium transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Zurücksetzen</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Controls based on selected period preset */}
      {periodPreset === 'specificYear' && (
        <div className="pt-2 border-t border-dark-800 flex items-center gap-3">
          <span className="text-xs font-medium text-dark-300 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-primary-400" /> Jahr auswählen:
          </span>
          <div className="w-48">
            <CustomSelect<number>
              options={yearOptions}
              value={selectedYear}
              onChange={(y) => setSelectedYear(y)}
              size="sm"
            />
          </div>
        </div>
      )}

      {periodPreset === 'specificMonth' && (
        <div className="pt-2 border-t border-dark-800 flex items-center gap-3">
          <span className="text-xs font-medium text-dark-300 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-primary-400" /> Monat auswählen:
          </span>
          <div className="w-56">
            <CustomSelect<string>
              options={monthOptions}
              value={selectedMonth}
              onChange={(m) => setSelectedMonth(m)}
              size="sm"
            />
          </div>
        </div>
      )}

      {periodPreset === 'customRange' && (
        <div className="pt-2 border-t border-dark-800 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-dark-300 w-12">Von:</span>
            <DatePicker
              value={customStartDate}
              onChange={(val) => setCustomStartDate(val)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-dark-300 w-12">Bis:</span>
            <DatePicker
              value={customEndDate}
              onChange={(val) => setCustomEndDate(val)}
            />
          </div>
        </div>
      )}

      {/* Expanded Filters Section (Category, Type, Min/Max Amount) */}
      {expanded && (
        <div className="pt-3 border-t border-dark-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
          {/* Category Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-dark-400">Kategorie</label>
            <CustomSelect<number>
              options={categoryOptions}
              value={categoryId ?? 0}
              onChange={(val) => setCategoryId(val === 0 ? undefined : val)}
              size="sm"
            />
          </div>

          {/* Type Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-dark-400">Typ</label>
            <CustomSelect<'All' | 'Income' | 'Expense'>
              options={[
                { value: 'All', label: 'Alle Typen' },
                { value: 'Income', label: 'Nur Einnahmen' },
                { value: 'Expense', label: 'Nur Ausgaben' },
              ]}
              value={typeFilter}
              onChange={(val) => setTypeFilter(val)}
              size="sm"
            />
          </div>

          {/* Min Amount */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-dark-400">Min. Betrag (€)</label>
            <input
              type="number"
              step="0.01"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="z.B. 10"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          {/* Max Amount */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-dark-400">Max. Betrag (€)</label>
            <input
              type="number"
              step="0.01"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="z.B. 100"
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-xl text-xs text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>
        </div>
      )}
    </div>
  );
}
