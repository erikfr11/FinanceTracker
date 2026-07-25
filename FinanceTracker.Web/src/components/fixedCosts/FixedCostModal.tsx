import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Edit2, Calendar } from 'lucide-react';
import type { CategoryDto } from '../../services/categoryService';
import type { FixedCostDto, FixedCostCreateDto, FixedCostUpdateDto, FixedCostFrequency } from '../../services/fixedCostService';
import CustomSelect from '../ui/CustomSelect';

interface FixedCostModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDto[];
  editingFixedCost?: FixedCostDto | null;
  onSubmit: (dto: FixedCostCreateDto | FixedCostUpdateDto) => Promise<void>;
}

export default function FixedCostModal({
  isOpen,
  onClose,
  categories,
  editingFixedCost,
  onSubmit,
}: FixedCostModalProps) {
  const [amount, setAmount] = useState('');
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(1);
  const [frequency, setFrequency] = useState<FixedCostFrequency>('Monthly');
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strictly filter to Fixed Expense categories
  const fixedCategories = useMemo(() => {
    const fixedOnly = categories.filter((c) => c.type === 'Expense' && c.expenseType === 'Fixed');
    return fixedOnly.length > 0 ? fixedOnly : categories.filter((c) => c.type === 'Expense');
  }, [categories]);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (editingFixedCost) {
      setAmount(editingFixedCost.amount.toString());
      setDueDayOfMonth(editingFixedCost.dueDayOfMonth || 1);
      setFrequency(editingFixedCost.frequency || 'Monthly');
      setNote(editingFixedCost.note || '');
      setCategoryId(editingFixedCost.categoryId);
      setIsActive(editingFixedCost.isActive);
    } else {
      setAmount('');
      setDueDayOfMonth(1);
      setFrequency('Monthly');
      setNote('');
      setIsActive(true);

      const defaultCat = fixedCategories.find((c) => c.expenseType === 'Fixed')?.id ?? fixedCategories[0]?.id ?? 0;
      setCategoryId(defaultCat);
    }
  }, [isOpen, editingFixedCost, fixedCategories]);

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
        } as FixedCostUpdateDto);
      } else {
        await onSubmit({
          amount: parsedAmount,
          dueDayOfMonth: Math.min(Math.max(dueDayOfMonth, 1), 31),
          frequency,
          note: note.trim(),
          isActive,
          categoryId,
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
          {/* Note / Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Bezeichnung / Notiz</label>
            <input
              type="text"
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              placeholder="z.B. Miete, Netflix Abo, Internet..."
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

          {/* Category Dropdown (Fixkosten Only) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Fixkosten-Kategorie</label>
            <CustomSelect<number>
              options={fixedCategories.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: 'Fixkosten',
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
            <p className="text-[11px] text-dark-400 flex items-center gap-1 mt-1">
              <Calendar className="h-3 w-3 text-primary-400" />
              Standard ist der 1. Tag des Monats.
            </p>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center justify-between p-3 bg-dark-800/80 border border-dark-700 rounded-xl">
            <div>
              <span className="text-xs font-medium text-white block">Regel aktiv</span>
              <span className="text-[11px] text-dark-400 block">
                Automatische Buchung monatlich ausführen
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
