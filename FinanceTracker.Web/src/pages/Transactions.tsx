import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { dummyTransactions, dummyCategories, type Transaction } from '../data/dummyData';
import TransactionTable from '../components/transactions/TransactionTable';
import NewTransactionModal from '../components/transactions/NewTransactionModal';
import ExportDropdown from '../components/dashboard/ExportDropdown';

export default function Transactions() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'split'>('all');
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  
  // Im echten Leben kämen diese Daten aus dem API-State oder React Query
  const [transactions, setTransactions] = useState<Transaction[]>(dummyTransactions);

  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'userId'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `t${Date.now()}`,
      userId: 'mock-user-id',
    };
    setTransactions(prev => [tx, ...prev]);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterType === 'All') return true;
      const cat = dummyCategories.find(c => c.id === t.categoryId);
      return cat?.type === filterType;
    });
  }, [transactions, filterType]);

  const incomes = filteredTransactions.filter(t => {
    const cat = dummyCategories.find(c => c.id === t.categoryId);
    return cat?.type === 'Income';
  });

  const expenses = filteredTransactions.filter(t => {
    const cat = dummyCategories.find(c => c.id === t.categoryId);
    return cat?.type === 'Expense';
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaktionen</h1>
          <p className="text-sm text-dark-400 mt-1">Verwalte deine Einnahmen und Ausgaben.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExportDropdown />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Neue Transaktion
          </button>
        </div>
      </div>

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
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="bg-dark-800 border border-dark-700 text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block px-3 py-2 outline-none"
          >
            <option value="All">Alle Typen</option>
            <option value="Income">Nur Einnahmen</option>
            <option value="Expense">Nur Ausgaben</option>
          </select>
        )}
      </div>

      {/* List Area */}
      {viewMode === 'all' ? (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <TransactionTable transactions={filteredTransactions} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              Einnahmen
            </h3>
            <TransactionTable transactions={incomes} showType={false} />
          </div>
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              Ausgaben
            </h3>
            <TransactionTable transactions={expenses} showType={false} />
          </div>
        </div>
      )}

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />
    </div>
  );
}
