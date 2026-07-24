import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Edit2, Trash2 } from 'lucide-react';
import type { TransactionDto } from '../../services/transactionService';

interface TransactionTableProps {
  transactions: TransactionDto[];
  showType?: boolean;
  onEdit?: (transaction: TransactionDto) => void;
  onDelete?: (transaction: TransactionDto) => void;
}

const TransactionTable = ({
  transactions,
  showType = true,
  onEdit,
  onDelete,
}: TransactionTableProps) => {
  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-dark-400">
        <p className="text-sm">Keine Transaktionen gefunden.</p>
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
            {showType && <th className="text-left py-3 px-4 text-dark-400 font-medium">Ausgabetyp</th>}
            <th className="text-right py-3 px-4 text-dark-400 font-medium">Betrag</th>
            {(onEdit || onDelete) && <th className="text-right py-3 px-4 text-dark-400 font-medium">Aktionen</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const isIncome = t.categoryType === 'Income';
            let parsedDate = new Date(t.date);
            if (isNaN(parsedDate.getTime())) {
              parsedDate = new Date();
            }

            // German expense type label
            let expenseLabel = '—';
            if (t.categoryExpenseType === 'Fixed') {
              expenseLabel = 'Fixkosten';
            } else if (t.categoryExpenseType === 'Variable') {
              expenseLabel = 'Variabel';
            }

            return (
              <tr key={t.id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                <td className="py-3 px-4 text-dark-200">
                  {format(parsedDate, 'dd. MMM yyyy', { locale: de })}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                      isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {t.categoryName || 'Sonstiges'}
                  </span>
                </td>
                <td className="py-3 px-4 text-dark-300">{t.note || '—'}</td>
                {showType && (
                  <td className="py-3 px-4 text-dark-400 text-xs">{expenseLabel}</td>
                )}
                <td className={`py-3 px-4 text-right font-semibold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isIncome ? '+' : '-'}{fmt(t.amount)}
                </td>
                {(onEdit || onDelete) && (
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(t)}
                          title="Bearbeiten"
                          className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(t)}
                          title="Löschen"
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
};

export default TransactionTable;
