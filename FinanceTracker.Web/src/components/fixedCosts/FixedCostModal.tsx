import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Edit2 } from 'lucide-react';
import type { CategoryDto } from '../../services/categoryService';
import type { FixedCostDto, FixedCostCreateDto, FixedCostUpdateDto, FixedCostFrequency } from '../../services/fixedCostService';
import CustomSelect from '../ui/CustomSelect';
import DatePicker from '../ui/DatePicker';

interface FixedCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDto[];
  editingFixedCost?: FixedCostDto | null;
  onSubmit: (dto: FixedCostCreateDto | FixedCostUpdateDto) => Promise<void>;
}

const parseIsoDate = (dateStr: string) => {
  if (!dateStr) return new Date(NaN);
  const cleanStr = dateStr.substring(0, 10);
  const parts = cleanStr.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    return new Date(y, m, d);
  }
  return new Date(dateStr);
};

const frequencySubtextMap: Record<FixedCostFrequency, string> = {
  Weekly: 'Automatische Buchung wöchentlich ausführen',
  Monthly: 'Automatische Buchung monatlich ausführen',
  Quarterly: 'Automatische Buchung alle 3 Monate (quartalsweise) ausführen',
  SemiAnnually: 'Automatische Buchung alle 6 Monate (halbjährlich) ausführen',
  Yearly: 'Automatische Buchung 1x pro Jahr (jährlich) ausführen',
};

export default function FixedCostModal({
  isOpen,
  onClose,
  categories,
  editingFixedCost,
  onSubmit,
}: FixedCostModalProps) {
  const [bookingType, setBookingType] = useState<'Expense' | 'Income'>('Expense');
  const [amount, setAmount] = useState('');
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(1);
  const [frequency, setFrequency] = useState<FixedCostFrequency>('Monthly');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Start Date & End Date state
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter categories based on selected bookingType
  const filteredCategories = useMemo(() => {
    if (bookingType === 'Income') {
      return categories.filter((c) => c.type === 'Income');
    }
    const fixedOnly = categories.filter((c) => c.type === 'Expense' && c.expenseType === 'Fixed');
    return fixedOnly.length > 0 ? fixedOnly : categories.filter((c) => c.type === 'Expense');
  }, [categories, bookingType]);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (editingFixedCost) {
      const cat = categories.find((c) => c.id === editingFixedCost.categoryId);
      const isIncome = cat?.type === 'Income' || editingFixedCost.categoryType === 'Income';
      setBookingType(isIncome ? 'Income' : 'Expense');

      setAmount(editingFixedCost.amount.toString());
      setDueDayOfMonth(editingFixedCost.dueDayOfMonth || 1);
      setFrequency(editingFixedCost.frequency || 'Monthly');
      setNote(editingFixedCost.note || '');
      setCategoryId(editingFixedCost.categoryId);
      setIsActive(editingFixedCost.isActive);

      let initialStart = new Date().toISOString().substring(0, 10);
      if (editingFixedCost.startDate) {
        const d = new Date(editingFixedCost.startDate);
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2000) {
          initialStart = editingFixedCost.startDate.substring(0, 10);
        }
      }
      setStartDate(initialStart);

      let initialHasEnd = false;
      let initialEnd = '';
      if (editingFixedCost.endDate) {
        const d = new Date(editingFixedCost.endDate);
        if (!isNaN(d.getTime()) && d.getFullYear() >= 2000) {
          initialHasEnd = true;
          initialEnd = editingFixedCost.endDate.substring(0, 10);
        }
      }
      setHasEndDate(initialHasEnd);
      setEndDate(initialEnd);
    } else {
      setAmount('');
      setDueDayOfMonth(1);
      setFrequency('Monthly');
      setNote('');
      setIsActive(true);
      setStartDate(new Date().toISOString().substring(0, 10));
      setHasEndDate(false);
      setEndDate('');
    }
  }, [isOpen, editingFixedCost, categories]);

  // Update selected category when bookingType or filteredCategories change
  useEffect(() => {
    if (!isOpen) return;
    const currentValid = filteredCategories.some((c) => c.id === categoryId);
    if (!currentValid && filteredCategories.length > 0) {
      setCategoryId(filteredCategories[0].id);
    }
  }, [filteredCategories, categoryId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Bitte einen gültigen Betrag größer als 0 € eingeben.');
      return;
    }

    if (!categoryId) {
      setError('Bitte wähle eine gültige Kategorie aus.');
      return;
    }

    // Minimum allowed start date: 1st of current month
    const now = new Date();
    const minAllowedStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const selectedStart = parseIsoDate(startDate);

    if (!startDate || isNaN(selectedStart.getTime()) || selectedStart < minAllowedStartDate) {
      setError('Das erste Ausführungsdatum darf nicht in vergangenen Monaten liegen (frühestens 1. des aktuellen Monats).');
      return;
    }

    if (hasEndDate) {
      if (!endDate) {
        setError('Bitte ein gültiges letztes Ausführungsdatum (Enddatum) angeben.');
        return;
      }
      const selectedEnd = parseIsoDate(endDate);
      if (isNaN(selectedEnd.getTime()) || selectedEnd < selectedStart) {
        setError('Das letzte Ausführungsdatum darf nicht vor dem ersten Ausführungsdatum liegen.');
        return;
      }
    }

    const finalEndDate = hasEndDate && endDate ? endDate : null;

    setLoading(true);
    try {
      if (editingFixedCost) {
        await onSubmit({
          id: editingFixedCost.id,
          amount: parsedAmount,
          dueDayOfMonth: Math.min(Math.max(dueDayOfMonth, 1), 31),
          frequency,
          note: note.trim(),
          isActive,
          categoryId,
          startDate,
          endDate: finalEndDate,
        } as FixedCostUpdateDto);
      } else {
        await onSubmit({
          amount: parsedAmount,
          dueDayOfMonth: Math.min(Math.max(dueDayOfMonth, 1), 31),
          frequency,
          note: note.trim(),
          isActive,
          categoryId,
          startDate,
          endDate: finalEndDate,
        } as FixedCostCreateDto);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Fixkosten-Regel.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editingFixedCost ? (
              <>
                <Edit2 className="h-5 w-5 text-primary-400" />
                Fixkosten bearbeiten
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary-400" />
                Neue Fixkosten-Regel
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle: Expense vs Income */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Buchungstyp</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBookingType('Expense')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  bookingType === 'Expense'
                    ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow'
                    : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-white'
                }`}
              >
                💸 Fixe Ausgabe (Fixkosten)
              </button>
              <button
                type="button"
                onClick={() => setBookingType('Income')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  bookingType === 'Income'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow'
                    : 'bg-dark-800 border-dark-700 text-dark-400 hover:text-white'
                }`}
              >
                💰 Fixe Einnahme (z.B. Gehalt)
              </button>
            </div>
          </div>

          {/* Note / Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Bezeichnung / Notiz</label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              placeholder={bookingType === 'Income' ? 'z.B. Monatsgehalt, Nebenjob...' : 'z.B. Miete, Netflix, Internet...'}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Betrag (€)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputClass}
              placeholder="0,00"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">
              {bookingType === 'Income' ? 'Einnahmen-Kategorie' : 'Fixkosten-Kategorie'}
            </label>
            <CustomSelect<number>
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: c.type === 'Income' ? 'Einnahme' : 'Fixkosten',
              }))}
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
            />
          </div>

          {/* Frequency / Intervall */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Häufigkeit / Intervall</label>
            <CustomSelect<FixedCostFrequency>
              options={[
                { value: 'Weekly', label: 'Wöchentlich (Einmal pro Woche)' },
                { value: 'Monthly', label: 'Monatlich (Einmal pro Monat)' },
                { value: 'Quarterly', label: 'Vierteljährlich (Alle 3 Monate)' },
                { value: 'SemiAnnually', label: 'Halbjährlich (Alle 6 Monate)' },
                { value: 'Yearly', label: 'Jährlich (Einmal pro Jahr)' },
              ]}
              value={frequency}
              onChange={(val) => setFrequency(val)}
            />
          </div>

          {/* Due Day of Month */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300 flex items-center justify-between">
              <span>Fälligkeitstag</span>
              <span className="text-primary-400 font-semibold">{dueDayOfMonth}. des Monats</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="31"
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <input
                type="number"
                min="1"
                max="31"
                value={dueDayOfMonth}
                onChange={(e) => setDueDayOfMonth(parseInt(e.target.value, 10) || 1)}
                className="w-16 px-2 py-1.5 bg-dark-800 border border-dark-700 rounded-lg text-white text-center text-xs outline-none"
              />
            </div>
          </div>

          {/* Erstes Ausführungsdatum (Pflichtfeld) */}
          <div className="space-y-2 pt-2 border-t border-dark-800">
            <label className="text-xs font-medium text-dark-300 flex items-center justify-between">
              <span>
                Erstes Ausführungsdatum <span className="text-red-400 font-bold">*</span>
              </span>
              <span className="text-[10px] text-dark-400 font-normal">Frühestens 1. des aktuellen Monats</span>
            </label>
            <DatePicker
              value={startDate}
              minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
              onChange={(val) => setStartDate(val)}
            />
          </div>

          {/* Letztes Ausführungsdatum (Optional / Default Unendlich) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300 block">Laufzeit / Letztes Ausführungsdatum</label>
            <div className="grid grid-cols-2 gap-2 bg-dark-800 p-1 rounded-xl border border-dark-700">
              <button
                type="button"
                onClick={() => setHasEndDate(false)}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  !hasEndDate
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                ♾️ Unendlich
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasEndDate(true);
                  if (!endDate) {
                    const nextYear = new Date();
                    nextYear.setFullYear(nextYear.getFullYear() + 1);
                    setEndDate(nextYear.toISOString().substring(0, 10));
                  }
                }}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  hasEndDate
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                📅 Enddatum festlegen
              </button>
            </div>

            {hasEndDate && (
              <div className="pt-2 animate-in fade-in duration-150">
                <DatePicker
                  value={endDate}
                  minDate={new Date(startDate)}
                  onChange={(val) => setEndDate(val)}
                />
              </div>
            )}
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-dark-800/80 border border-dark-700 rounded-xl">
            <div>
              <span className="text-xs font-medium text-white block">Regel aktiv</span>
              <span className="text-[11px] text-dark-400 block">
                {frequencySubtextMap[frequency]}
              </span>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded bg-dark-900 border-dark-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors mt-2 text-sm shadow-lg shadow-primary-600/20"
          >
            {editingFixedCost ? (
              <>
                <Edit2 className="h-4 w-4" /> Regel speichern
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Fixkosten hinzufügen
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
