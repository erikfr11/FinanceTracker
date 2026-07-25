import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { TransactionFilter } from '../services/transactionService';

export type PeriodPreset = 'currentYear' | 'specificYear' | 'specificMonth' | 'customRange';

interface FilterContextType {
  periodPreset: PeriodPreset;
  setPeriodPreset: (preset: PeriodPreset) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: string; // 'YYYY-MM'
  setSelectedMonth: (month: string) => void;
  customStartDate: string; // 'YYYY-MM-DD'
  setCustomStartDate: (date: string) => void;
  customEndDate: string; // 'YYYY-MM-DD'
  setCustomEndDate: (date: string) => void;
  categoryId: number | undefined;
  setCategoryId: (id: number | undefined) => void;
  typeFilter: 'All' | 'Income' | 'Expense';
  setTypeFilter: (type: 'All' | 'Income' | 'Expense') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  minAmount: string;
  setMinAmount: (val: string) => void;
  maxAmount: string;
  setMaxAmount: (val: string) => void;
  apiFilter: TransactionFilter;
  isDefaultFilter: boolean;
  activeFiltersCount: number;
  resetFilters: () => void;
}

const currentYearNum = new Date().getFullYear();
const currentMonthStr = `${currentYearNum}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider = ({ children }: { children: ReactNode }) => {
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('currentYear');
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNum);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [customStartDate, setCustomStartDate] = useState<string>(`${currentYearNum}-01-01`);
  const [customEndDate, setCustomEndDate] = useState<string>(`${currentYearNum}-12-31`);
  
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const apiFilter = useMemo<TransactionFilter>(() => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (periodPreset === 'currentYear') {
      startDate = `${currentYearNum}-01-01`;
      endDate = `${currentYearNum}-12-31`;
    } else if (periodPreset === 'specificYear') {
      startDate = `${selectedYear}-01-01`;
      endDate = `${selectedYear}-12-31`;
    } else if (periodPreset === 'specificMonth') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const lastDay = new Date(y, m, 0).getDate();
      startDate = `${selectedMonth}-01`;
      endDate = `${selectedMonth}-${String(lastDay).padStart(2, '0')}`;
    } else if (periodPreset === 'customRange') {
      startDate = customStartDate || undefined;
      endDate = customEndDate || undefined;
    }

    const minVal = minAmount !== '' && !isNaN(parseFloat(minAmount)) ? parseFloat(minAmount) : undefined;
    const maxVal = maxAmount !== '' && !isNaN(parseFloat(maxAmount)) ? parseFloat(maxAmount) : undefined;

    return {
      startDate,
      endDate,
      categoryId,
      type: typeFilter !== 'All' ? typeFilter : undefined,
      searchTerm: searchTerm.trim() || undefined,
      minAmount: minVal,
      maxAmount: maxVal,
    };
  }, [
    periodPreset,
    selectedYear,
    selectedMonth,
    customStartDate,
    customEndDate,
    categoryId,
    typeFilter,
    searchTerm,
    minAmount,
    maxAmount,
  ]);

  const isDefaultFilter = useMemo(() => {
    return (
      periodPreset === 'currentYear' &&
      categoryId === undefined &&
      typeFilter === 'All' &&
      searchTerm.trim() === '' &&
      minAmount === '' &&
      maxAmount === ''
    );
  }, [periodPreset, categoryId, typeFilter, searchTerm, minAmount, maxAmount]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (periodPreset !== 'currentYear') count++;
    if (categoryId !== undefined) count++;
    if (typeFilter !== 'All') count++;
    if (searchTerm.trim() !== '') count++;
    if (minAmount !== '') count++;
    if (maxAmount !== '') count++;
    return count;
  }, [periodPreset, categoryId, typeFilter, searchTerm, minAmount, maxAmount]);

  const resetFilters = () => {
    setPeriodPreset('currentYear');
    setSelectedYear(currentYearNum);
    setSelectedMonth(currentMonthStr);
    setCustomStartDate(`${currentYearNum}-01-01`);
    setCustomEndDate(`${currentYearNum}-12-31`);
    setCategoryId(undefined);
    setTypeFilter('All');
    setSearchTerm('');
    setMinAmount('');
    setMaxAmount('');
  };

  return (
    <FilterContext.Provider
      value={{
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
        apiFilter,
        isDefaultFilter,
        activeFiltersCount,
        resetFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
};
