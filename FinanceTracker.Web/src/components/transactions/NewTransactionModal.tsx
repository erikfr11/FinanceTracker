import { useState, useEffect, useMemo } from 'react';
import { X, Plus, Edit2 } from 'lucide-react';
import type { CategoryDto } from '../../services/categoryService';
import type { TransactionDto, TransactionCreateDto, TransactionUpdateDto } from '../../services/transactionService';
import CustomSelect from '../ui/CustomSelect';
import DatePicker from '../ui/DatePicker';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDto[];
  editingTransaction?: TransactionDto | null;
  onSubmit: (dto: TransactionCreateDto | TransactionUpdateDto) => Promise<void>;
}

export default function NewTransactionModal({
  isOpen,
  onClose,
  categories,
  editingTransaction,
  onSubmit,
}: NewTransactionModalProps) {
  // Form fields
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [expenseSubtype, setExpenseSubtype] = useState<'Variable' | 'Fixed'>('Variable');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find "Sonstiges" category ID default
  const sonstigesCategory = useMemo(() => {
    return categories.find(c => c.name.toLowerCase() === 'sonstiges') ?? categories[0];
  }, [categories]);

  // Available categories filtered by selected type/expenseType
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      if (type === 'Income') {
        return c.type === 'Income';
      }
      // Expense
      if (c.type !== 'Expense') return false;
      if (expenseSubtype === 'Fixed') {
        return c.expenseType === 'Fixed';
      }
      return c.expenseType === 'Variable' || c.name.toLowerCase() === 'sonstiges';
    });
  }, [categories, type, expenseSubtype]);

  // Reset or initialize form state whenever modal opens or editingTransaction changes
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (editingTransaction) {
      // Edit mode
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date ? editingTransaction.date.substring(0, 10) : new Date().toISOString().substring(0, 10));
      setNote(editingTransaction.note || '');
      setCategoryId(editingTransaction.categoryId);

      const cat = categories.find(c => c.id === editingTransaction.categoryId);
      if (cat) {
        setType(cat.type === 'Income' ? 'Income' : 'Expense');
        if (cat.expenseType === 'Fixed') {
          setExpenseSubtype('Fixed');
        } else {
          setExpenseSubtype('Variable');
        }
      } else {
        setType(editingTransaction.categoryType === 'Income' ? 'Income' : 'Expense');
        setExpenseSubtype(editingTransaction.categoryExpenseType === 'Fixed' ? 'Fixed' : 'Variable');
      }
    } else {
      // Create mode defaults: Expense, Variable, "Sonstiges" category
      setAmount('');
      setDate(new Date().toISOString().substring(0, 10));
      setNote('');
      setType('Expense');
      setExpenseSubtype('Variable');
      
      const defaultCat = sonstigesCategory?.id ?? (categories.length > 0 ? categories[0].id : 0);
      setCategoryId(defaultCat);
    }
  }, [isOpen, editingTransaction, categories, sonstigesCategory]);

  // Update selected category if current categoryId is not in filtered categories list
  useEffect(() => {
    if (!isOpen) return;
    if (filteredCategories.length > 0 && !filteredCategories.some(c => c.id === categoryId)) {
      const fallback = filteredCategories.find(c => c.name.toLowerCase() === 'sonstiges') ?? filteredCategories[0];
      if (fallback) {
        setCategoryId(fallback.id);
      }
    }
  }, [type, expenseSubtype, filteredCategories, categoryId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Bitte einen gültigen Betrag größer als 0 € eingeben.');
      return;
    }

    const finalCategoryId = categoryId || sonstigesCategory?.id || categories[0]?.id;
    if (!finalCategoryId) {
      setError('Bitte wähle eine gültige Kategorie aus.');
      return;
    }

    setLoading(true);
    try {
      if (editingTransaction) {
        await onSubmit({
          id: editingTransaction.id,
          amount: parsedAmount,
          date,
          note: note.trim(),
          categoryId: finalCategoryId,
        } as TransactionUpdateDto);
      } else {
        await onSubmit({
          amount: parsedAmount,
          date,
          note: note.trim(),
          categoryId: finalCategoryId,
        } as TransactionCreateDto);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Transaktion.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {editingTransaction ? (
              <>
                <Edit2 className="h-5 w-5 text-primary-400" />
                Transaktion bearbeiten
              </>
            ) : (
              <>
                <Plus className="h-5 w-5 text-primary-400" />
                Neue Transaktion
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
          {/* Typ Selection: Einnahme vs Ausgabe */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Typ</label>
            <div className="grid grid-cols-2 gap-2 bg-dark-800 p-1 rounded-xl border border-dark-700">
              <button
                type="button"
                onClick={() => setType('Expense')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  type === 'Expense'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Ausgabe
              </button>
              <button
                type="button"
                onClick={() => setType('Income')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  type === 'Income'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                Einnahme
              </button>
            </div>
          </div>

          {/* Subtype Selection if Expense */}
          {type === 'Expense' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-300">Ausgabetyp</label>
              <CustomSelect<'Variable' | 'Fixed'>
                options={[
                  { value: 'Variable', label: 'Variabel', sublabel: 'Einkäufe, Shopping, Hobbys' },
                  { value: 'Fixed', label: 'Fixkosten', sublabel: 'Miete, Abos, Versicherungen' },
                ]}
                value={expenseSubtype}
                onChange={(val) => setExpenseSubtype(val)}
              />
            </div>
          )}

          {/* Category Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Kategorie</label>
            <CustomSelect<number>
              options={filteredCategories.map((c) => ({
                value: c.id,
                label: c.name,
                sublabel: c.name.toLowerCase() === 'sonstiges' ? 'Standard' : undefined,
              }))}
              value={categoryId}
              onChange={(val) => setCategoryId(val)}
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

          {/* Date */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Datum</label>
            <DatePicker
              value={date}
              onChange={(val) => setDate(val)}
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-dark-300">Notiz / Beschreibung</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
              placeholder="z.B. Supermarkt Einkauf, Gehalt Juli…"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors mt-2 text-sm"
          >
            {editingTransaction ? (
              <>
                <Edit2 className="h-4 w-4" /> Transaktion speichern
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Transaktion hinzufügen
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
