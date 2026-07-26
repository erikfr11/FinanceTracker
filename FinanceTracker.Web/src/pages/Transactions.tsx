import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Tag, AlertTriangle, RefreshCw, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';
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
import AdvancedFilterBar from '../components/filters/AdvancedFilterBar';
import ImportModal from '../components/transactions/ImportModal';

export default function Transactions() {
  const { user } = useAuth();
  const { apiFilter } = useFilter();

  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionDto | null>(null);

  // Filters & Views
  const [viewMode, setViewMode] = useState<'all' | 'split'>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [txData, catData] = await Promise.all([
        fetchTransactions(apiFilter),
        fetchCategories(),
      ]);
      setTransactions(txData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Daten aus dem Backend.');
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

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

  const [expenseSubtypeFilter, setExpenseSubtypeFilter] = useState<'all' | 'fixed' | 'variable'>('all');

  const incomes = useMemo(() => {
    return transactions.filter(t => t.categoryType === 'Income');
  }, [transactions]);

  const expenses = useMemo(() => {
    return transactions.filter(t => t.categoryType === 'Expense');
  }, [transactions]);

  const filteredExpenses = useMemo(() => {
    if (expenseSubtypeFilter === 'fixed') {
      return expenses.filter((t: TransactionDto) => t.categoryExpenseType === 'Fixed');
    }
    if (expenseSubtypeFilter === 'variable') {
      return expenses.filter((t: TransactionDto) => t.categoryExpenseType === 'Variable' || !t.categoryExpenseType);
    }
    return expenses;
  }, [expenses, expenseSubtypeFilter]);

  const incomeSum = useMemo(() => {
    return incomes.reduce((s: number, t: TransactionDto) => s + t.amount, 0);
  }, [incomes]);

  const expenseSum = useMemo(() => {
    return expenses.reduce((s: number, t: TransactionDto) => s + t.amount, 0);
  }, [expenses]);

  const filteredExpenseSum = useMemo(() => {
    return filteredExpenses.reduce((s: number, t: TransactionDto) => s + t.amount, 0);
  }, [filteredExpenses]);

  const netBalance = incomeSum - expenseSum;

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaktionen</h1>
          <p className="text-sm text-dark-400 mt-1">Verwalte deine Einnahmen und Ausgaben.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-sm font-medium transition-colors border border-dark-700 shadow-sm"
          >
            <Upload className="h-4 w-4 text-emerald-400" />
            Importieren
          </button>
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

      {/* Advanced Filter Bar */}
      <AdvancedFilterBar categories={categories} />

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

      {/* View Mode Toolbar */}
      <div className="flex bg-dark-900 border border-dark-800 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            viewMode === 'all' ? 'bg-dark-700 text-white shadow' : 'text-dark-300 hover:text-white'
          }`}
        >
          Gemeinsame Liste ({transactions.length})
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            viewMode === 'split' ? 'bg-dark-700 text-white shadow' : 'text-dark-300 hover:text-white'
          }`}
        >
          Nach Typ getrennt ({incomes.length} / {expenses.length})
        </button>
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
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4">
            {/* Total Summary Banner for Gemeinsame Liste */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-dark-800 text-xs">
              <span className="font-semibold text-white">Gesamtsummen Übersicht:</span>
              <div className="flex items-center gap-2 flex-wrap font-mono">
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 font-bold">
                  💰 Einnahmen: +{fmt(incomeSum)}
                </div>
                <div className="bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-xl text-red-400 font-bold">
                  💸 Ausgaben: -{fmt(expenseSum)}
                </div>
                <div className={`px-3 py-1.5 rounded-xl font-bold border ${netBalance >= 0 ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  ⚖️ Bilanz: {fmt(netBalance)}
                </div>
              </div>
            </div>

            <TransactionTable
              transactions={transactions}
              onEdit={handleOpenEditModal}
              onDelete={tx => setDeletingTransaction(tx)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-800">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  Einnahmen ({incomes.length})
                </h3>
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                  Summe: +{fmt(incomeSum)}
                </span>
              </div>
              <TransactionTable
                transactions={incomes}
                showType={false}
                onEdit={handleOpenEditModal}
                onDelete={tx => setDeletingTransaction(tx)}
              />
            </div>
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dark-800">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Ausgaben ({filteredExpenses.length})
                  </h3>
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                    Summe: -{fmt(filteredExpenseSum)}
                  </span>
                </div>

                {/* Filter for Expenses: Alle, Fixkosten, Flexibel */}
                <div className="flex items-center bg-dark-800 border border-dark-700/80 p-1 rounded-xl gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setExpenseSubtypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      expenseSubtypeFilter === 'all'
                        ? 'bg-dark-700 text-white shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    Alle
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseSubtypeFilter('fixed')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      expenseSubtypeFilter === 'fixed'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    📌 Fix
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpenseSubtypeFilter('variable')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      expenseSubtypeFilter === 'variable'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    🛒 Flexibel
                  </button>
                </div>
              </div>
              <TransactionTable
                transactions={filteredExpenses}
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

      {/* Import Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
