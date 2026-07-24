import { useState } from 'react';
import { X, Plus, Edit2, Trash2, AlertTriangle, Check, Tag } from 'lucide-react';
import {
  type CategoryDto,
  type CategoryCreateDto,
  type CategoryUpdateDto,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';
import CustomSelect from '../ui/CustomSelect';

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryDto[];
  onRefresh: () => void;
  isAdmin: boolean;
}

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onRefresh,
  isAdmin,
}: CategoryManagementModalProps) {
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'Income' | 'Expense'>('Expense');
  const [expenseType, setExpenseType] = useState<'None' | 'Fixed' | 'Variable'>('Variable');
  const [isSystemCategory, setIsSystemCategory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Delete confirmation state
  const [deletingCategory, setDeletingCategory] = useState<CategoryDto | null>(null);

  if (!isOpen) return null;

  const startCreate = () => {
    setEditingCategory(null);
    setName('');
    setType('Expense');
    setExpenseType('Variable');
    setIsSystemCategory(isAdmin);
    setError(null);
    setIsCreating(true);
  };

  const startEdit = (cat: CategoryDto) => {
    setIsCreating(false);
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type === 'Income' ? 'Income' : 'Expense');
    setExpenseType(
      cat.expenseType === 'Fixed' ? 'Fixed' : cat.expenseType === 'Variable' ? 'Variable' : 'None'
    );
    setIsSystemCategory(cat.isSystemCategory);
    setError(null);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const finalExpenseType = type === 'Income' ? 'None' : expenseType;

      if (isCreating) {
        const dto: CategoryCreateDto = {
          name: name.trim(),
          type,
          expenseType: finalExpenseType,
          isSystemCategory,
        };
        await createCategory(dto);
      } else if (editingCategory) {
        const dto: CategoryUpdateDto = {
          id: editingCategory.id,
          name: name.trim(),
          type,
          expenseType: finalExpenseType,
          isSystemCategory,
        };
        await updateCategory(dto);
      }

      await onRefresh();
      cancelForm();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Kategorie.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: CategoryDto) => {
    setError(null);
    setLoading(true);
    try {
      await deleteCategory(cat.id);
      setDeletingCategory(null);
      await onRefresh();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen der Kategorie.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none text-sm';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-dark-800">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Kategorien verwalten</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Action bar */}
          {!isCreating && !editingCategory && isAdmin && (
            <div className="flex justify-end">
              <button
                onClick={startCreate}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors"
              >
                <Plus className="h-4 w-4" /> Neue Kategorie
              </button>
            </div>
          )}

          {/* Form for Create / Edit */}
          {(isCreating || editingCategory) && (
            <form onSubmit={handleSave} className="bg-dark-800/80 border border-dark-700 p-4 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {isCreating ? 'Neue Kategorie anlegen' : `Kategorie "${editingCategory?.name}" bearbeiten`}
                </h3>
                <button
                  type="button"
                  onClick={cancelForm}
                  className="text-xs text-dark-400 hover:text-white"
                >
                  Abbrechen
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-dark-300">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="z.B. Einkäufe, Gehalt..."
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-dark-300">Typ</label>
                  <CustomSelect<'Expense' | 'Income'>
                    options={[
                      { value: 'Expense', label: 'Ausgabe' },
                      { value: 'Income', label: 'Einnahme' },
                    ]}
                    value={type}
                    onChange={(newType) => {
                      setType(newType);
                      if (newType === 'Income') {
                        setExpenseType('None');
                      } else if (expenseType === 'None') {
                        setExpenseType('Variable');
                      }
                    }}
                    size="sm"
                  />
                </div>

                {type === 'Expense' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-300">Ausgabetyp</label>
                    <CustomSelect<'Variable' | 'Fixed'>
                      options={[
                        { value: 'Variable', label: 'Variabel', sublabel: 'Einkäufe, Hobbys' },
                        { value: 'Fixed', label: 'Fixkosten', sublabel: 'Miete, Abos' },
                      ]}
                      value={expenseType as 'Variable' | 'Fixed'}
                      onChange={(val) => setExpenseType(val)}
                      size="sm"
                    />
                  </div>
                )}

                {isAdmin && (
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isSystemCat"
                      checked={isSystemCategory}
                      onChange={(e) => setIsSystemCategory(e.target.checked)}
                      className="w-4 h-4 rounded bg-dark-800 border-dark-700 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isSystemCat" className="text-xs font-medium text-dark-300">
                      System-Kategorie (für alle Nutzer sichtbar)
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 rounded-lg text-dark-300 hover:bg-dark-700 text-xs font-medium transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors"
                >
                  <Check className="h-3.5 w-3.5" /> Speichern
                </button>
              </div>
            </form>
          )}

          {/* List of categories */}
          <div className="overflow-x-auto border border-dark-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-dark-800/50 text-dark-400 border-b border-dark-800 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Typ</th>
                  <th className="py-2.5 px-3">Ausgabetyp</th>
                  <th className="py-2.5 px-3">Sichtbarkeit</th>
                  {isAdmin && <th className="py-2.5 px-3 text-right">Aktionen</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-800 text-dark-200">
                {categories.map((cat) => {
                  const isIncome = cat.type === 'Income';
                  const isSonstiges = cat.name.toLowerCase() === 'sonstiges';

                  return (
                    <tr key={cat.id} className="hover:bg-dark-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white flex items-center gap-1.5">
                        {cat.name}
                        {isSonstiges && (
                          <span className="text-[10px] bg-dark-700 text-dark-300 px-1.5 py-0.5 rounded">
                            Standard
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium ${
                            isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}
                        >
                          {isIncome ? 'Einnahme' : 'Ausgabe'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-dark-300">
                        {isIncome ? '—' : cat.expenseType === 'Fixed' ? 'Fixkosten' : 'Variabel'}
                      </td>
                      <td className="py-2.5 px-3 text-dark-400">
                        {cat.isSystemCategory ? 'System (Alle)' : 'Persönlich'}
                      </td>
                      {isAdmin && (
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEdit(cat)}
                              title="Bearbeiten"
                              className="p-1 rounded text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {!isSonstiges && (
                              <button
                                onClick={() => setDeletingCategory(cat)}
                                title="Löschen"
                                className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete confirmation modal overlay */}
        {deletingCategory && (
          <div className="absolute inset-0 z-[110] bg-dark-900/95 backdrop-blur-sm rounded-2xl p-6 flex flex-col justify-center items-center text-center animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Kategorie "{deletingCategory.name}" löschen?
            </h3>
            <p className="text-xs text-dark-300 max-w-md mb-6">
              Alle Transaktionen, die derzeit dieser Kategorie zugeordnet sind, werden automatisch der Standard-Kategorie <strong className="text-white">"Sonstiges"</strong> zugewiesen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDelete(deletingCategory)}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
              >
                Löschen & Reorganisieren
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
