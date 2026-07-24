import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Tag, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  type TransactionDto,
  type TransactionCreateDto,
  type TransactionUpdateDto,
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transactionService';
import { type CategoryDto, fetchCategories } from '../services/categoryService';
import TransactionTable from '../components/transactions/TransactionTable';
import NewTransactionModal from '../components/transactions/NewTransactionModal';
import CategoryManagementModal from '../components/categories/CategoryManagementModal';
import ExportDropdown from '../components/dashboard/ExportDropdown';
import CustomSelect from '../components/ui/CustomSelect';

export default function Transactions() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionDto | null>(null);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'all' | 'split'>('all');
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txData, catData] = await Promise.all([
        fetchTransactions(),
        fetchCategories(),
      ]);
      setTransactions(txData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Daten aus dem Backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx: TransactionDto) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (dto: TransactionCreateDto | TransactionUpdateDto) => {
    if ('id' in dto) {
      await updateTransaction(dto as TransactionUpdateDto);
    } else {
      await createTransaction(dto as TransactionCreateDto);
    }
    await loadData();
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;
    try {
      await deleteTransaction(deletingTransaction.id);
      setDeletingTransaction(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen der Transaktion.');
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType === 'All') return true;
      return t.categoryType === filterType;
    });
  }, [transactions, filterType]);

  const incomes = useMemo(() => {
    return filteredTransactions.filter(t => t.categoryType === 'Income');
  }, [filteredTransactions]);

  const expenses = useMemo(() => {
    return filteredTransactions.filter(t => t.categoryType === 'Expense');
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaktionen</h1>
          <p className="text-sm text-dark-400 mt-1">Verwalte deine Einnahmen und Ausgaben.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown />
          {user?.isAdmin && (
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-sm font-medium transition-colors border border-dark-700"
            >
              <Tag className="h-4 w-4 text-primary-400" />
              Kategorien verwalten
            </button>
          )}
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neue Transaktion
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30 text-white font-medium transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Erneut versuchen
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-dark-900 border border-dark-800 p-4 rounded-2xl">
        <div className="flex bg-dark-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'all' ? 'bg-dark-700 text-white shadow' : 'text-dark-300 hover:text-white'
            }`}
          >
            Gemeinsame Liste
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'split' ? 'bg-dark-700 text-white shadow' : 'text-dark-300 hover:text-white'
            }`}
          >
            Nach Typ getrennt
          </button>
        </div>

        {viewMode === 'all' && (
          <div className="w-48">
            <CustomSelect<'All' | 'Income' | 'Expense'>
              options={[
                { value: 'All', label: 'Alle Typen' },
                { value: 'Income', label: 'Nur Einnahmen' },
                { value: 'Expense', label: 'Nur Ausgaben' },
              ]}
              value={filterType}
              onChange={(val) => setFilterType(val)}
              size="sm"
            />
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-12 text-center text-dark-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-500" />
          <p className="text-sm">Lade Transaktionen aus dem Backend…</p>
        </div>
      ) : (
        /* List Area */
        viewMode === 'all' ? (
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <TransactionTable
              transactions={filteredTransactions}
              onEdit={handleOpenEditModal}
              onDelete={tx => setDeletingTransaction(tx)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Einnahmen
              </h3>
              <TransactionTable
                transactions={incomes}
                showType={false}
                onEdit={handleOpenEditModal}
                onDelete={tx => setDeletingTransaction(tx)}
              />
            </div>
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Ausgaben
              </h3>
              <TransactionTable
                transactions={expenses}
                showType={false}
                onEdit={handleOpenEditModal}
                onDelete={tx => setDeletingTransaction(tx)}
              />
            </div>
          </div>
        )
      )}

      {/* Transaction Modal (Create & Edit) */}
      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        editingTransaction={editingTransaction}
        onSubmit={handleFormSubmit}
      />

      {/* Category Management Modal for Admins */}
      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onRefresh={loadData}
        isAdmin={!!user?.isAdmin}
      />

      {/* Delete Transaction Confirmation Modal */}
      {deletingTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletingTransaction(null)}
          />
          <div className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Transaktion löschen?</h3>
            <p className="text-xs text-dark-300 mb-6">
              Möchtest du diese Transaktion wirklich unwiderruflich löschen?
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingTransaction(null)}
                className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteTransaction}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
