import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { dummyCategories } from '../../data/dummyData';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tx: { amount: number; date: string; note: string; categoryId: number }) => void;
}

const NewTransactionModal = ({ isOpen, onClose, onAdd }: NewTransactionModalProps) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [note, setNote] = useState('');
  const [categoryId, setCategoryId] = useState(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ amount: parseFloat(amount), date, note, categoryId });
    setAmount('');
    setNote('');
    onClose();
  };

  const inputClass = 'w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Neue Transaktion</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-300">Betrag (€)</label>
            <input type="number" step="0.01" min="0.01" required value={amount} onChange={e => setAmount(e.target.value)} className={inputClass} placeholder="0,00" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-300">Kategorie</label>
            <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} className={inputClass}>
              {dummyCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type === 'Income' ? 'Einnahme' : 'Ausgabe'})</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-300">Datum</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-300">Notiz</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className={inputClass} placeholder="Beschreibung…" />
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors mt-2">
            <Plus className="h-4 w-4" /> Transaktion hinzufügen
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTransactionModal;
