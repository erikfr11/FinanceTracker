import type { Transaction } from '../../data/dummyData';
import { getCategoryById } from '../../data/dummyData';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface TransactionTableProps {
  transactions: Transaction[];
  showType?: boolean;
}

const TransactionTable = ({ transactions, showType = true }: TransactionTableProps) => {
  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-dark-400">
        <p className="text-lg">Keine Transaktionen gefunden.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-dark-700">
            <th className="text-left py-3 px-4 text-dark-400 font-medium">Datum</th>
            <th className="text-left py-3 px-4 text-dark-400 font-medium">Kategorie</th>
            <th className="text-left py-3 px-4 text-dark-400 font-medium">Notiz</th>
            {showType && <th className="text-left py-3 px-4 text-dark-400 font-medium">Typ</th>}
            <th className="text-right py-3 px-4 text-dark-400 font-medium">Betrag</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => {
            const cat = getCategoryById(t.categoryId);
            const isIncome = cat?.type === 'Income';
            return (
              <tr key={t.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                <td className="py-3 px-4 text-dark-200">
                  {format(new Date(t.date), 'dd. MMM yyyy', { locale: de })}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                    isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {cat?.name ?? 'Unbekannt'}
                  </span>
                </td>
                <td className="py-3 px-4 text-dark-300">{t.note}</td>
                {showType && (
                  <td className="py-3 px-4 text-dark-400 text-xs">{cat?.expenseType !== 'None' ? cat?.expenseType : '—'}</td>
                )}
                <td className={`py-3 px-4 text-right font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isIncome ? '+' : '-'}{fmt(t.amount)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
