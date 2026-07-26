import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Landmark, ArrowLeft, Plus, LineChart as LineChartIcon, Settings2, Trash2 } from 'lucide-react';
import { 
  fetchBank, 
  fetchAccountsByBank, 
  createAccount, 
  addAccountBalance, 
  deleteAccount,
  type BankDto, 
  type AccountDto 
} from '../services/wealthService';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function BankDetails() {
  const { id } = useParams<{ id: string }>();
  const [bank, setBank] = useState<BankDto | null>(null);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('Checking');

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceDate, setBalanceDate] = useState(() => new Date().toISOString().substring(0, 10));

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (bankId: string) => {
    setLoading(true);
    try {
      const b = await fetchBank(bankId);
      const a = await fetchAccountsByBank(bankId);
      setBank(b);
      setAccounts(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newAccountName.trim()) return;
    try {
      await createAccount({ bankId: id, name: newAccountName, type: newAccountType });
      setNewAccountName('');
      setShowAddAccount(false);
      loadData(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedAccountId || !balanceAmount || !balanceDate) return;
    try {
      const amount = parseFloat(balanceAmount.replace(',', '.'));
      await addAccountBalance(selectedAccountId, { amount, date: new Date(balanceDate).toISOString() });
      setBalanceAmount('');
      setSelectedAccountId(null);
      loadData(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!id || !window.confirm('Konto wirklich löschen? Alle Historien-Daten gehen verloren.')) return;
    try {
      await deleteAccount(accountId);
      loadData(id);
    } catch (e) {
      console.error(e);
    }
  };

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const lineData = useMemo(() => {
    const dateMap = new Map<string, number>();
    accounts.forEach(a => {
      a.history.forEach(h => {
        const dateStr = h.date.substring(0, 10);
        if (!dateMap.has(dateStr)) dateMap.set(dateStr, 0);
      });
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    
    return sortedDates.map(date => {
      let total = 0;
      accounts.forEach(a => {
        const historyUpToDate = a.history.filter(h => h.date.substring(0, 10) <= date);
        if (historyUpToDate.length > 0) {
          const latest = historyUpToDate.reduce((prev, curr) => (curr.date > prev.date ? curr : prev));
          total += latest.amount;
        }
      });
      return { date, value: total };
    });
  }, [accounts]);

  const typeLabels: Record<string, string> = {
    Checking: 'Girokonto',
    Savings: 'Sparkonto',
    StockDepot: 'Aktiendepot',
    Crypto: 'Krypto-Wallet',
    Cash: 'Bargeld',
    Other: 'Sonstiges'
  };

  if (loading) {
    return <div className="text-center py-20 text-dark-400">Lade Bankdaten...</div>;
  }

  if (!bank) {
    return <div className="text-center py-20 text-red-400">Bank nicht gefunden.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/wealth" className="p-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-dark-300 hover:text-white transition-colors border border-dark-700">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Landmark className="h-6 w-6 text-primary-400" />
            {bank.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Chart */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-6">
              <LineChartIcon className="h-5 w-5 text-primary-400" />
              <h2 className="text-lg font-bold text-white">Vermögensverlauf</h2>
            </div>
            <div className="h-[300px] w-full">
              {lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickMargin={10} />
                    <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `€${(v/1000)}k`} domain={['dataMin', 'dataMax']} />
                    <Tooltip 
                      formatter={(val: number) => fmt(val)}
                      labelFormatter={(label) => `Datum: ${label}`}
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }}
                    />
                    <Line type="stepAfter" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-dark-400">
                  Noch keine Historie vorhanden.
                </div>
              )}
            </div>
          </div>

          {/* Accounts List */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-dark-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-emerald-400" /> Konten & Depots
              </h2>
              <button 
                onClick={() => setShowAddAccount(!showAddAccount)}
                className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 text-white px-3 py-1.5 rounded-xl text-sm font-semibold transition-all border border-dark-700"
              >
                <Plus className="h-4 w-4" /> Neues Konto
              </button>
            </div>

            {showAddAccount && (
              <div className="p-4 sm:p-6 border-b border-dark-800 bg-dark-950/50">
                <form onSubmit={handleAddAccount} className="flex flex-col sm:flex-row items-end gap-4">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Bezeichnung</label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Girokonto oder ETF-Depot"
                      value={newAccountName}
                      onChange={e => setNewAccountName(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    />
                  </div>
                  <div className="w-full sm:w-48">
                    <label className="block text-xs font-semibold text-dark-400 uppercase tracking-wider mb-2">Typ</label>
                    <select
                      value={newAccountType}
                      onChange={e => setNewAccountType(e.target.value)}
                      className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    >
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg">
                    Speichern
                  </button>
                </form>
              </div>
            )}

            <div className="divide-y divide-dark-800">
              {accounts.length === 0 ? (
                <div className="p-8 text-center text-dark-400 text-sm">
                  Keine Konten gefunden. Lege ein neues Konto an.
                </div>
              ) : (
                accounts.map(acc => (
                  <div key={acc.id} className="p-4 sm:p-6 hover:bg-dark-800/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{acc.name}</h3>
                        <p className="text-dark-400 text-xs font-medium bg-dark-800 border border-dark-700 px-2 py-0.5 rounded inline-block mt-1">
                          {typeLabels[acc.type] || acc.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-right flex-1 sm:flex-none">
                          <p className="text-[10px] uppercase font-bold text-dark-400 tracking-wider">Aktueller Stand</p>
                          <p className="text-xl font-bold text-emerald-400">{fmt(acc.currentBalance)}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 text-dark-500 hover:text-red-400 bg-dark-900 border border-dark-800 rounded-lg transition-colors"
                          title="Konto löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar for Action: Add Balance */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-dark-900 to-dark-950 border border-dark-800 rounded-2xl p-4 sm:p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-1">Stand eintragen</h2>
            <p className="text-xs text-dark-400 mb-6">Trage hier den aktuellen (oder historischen) Kontostand ein.</p>
            
            <form onSubmit={handleAddBalance} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2 uppercase tracking-wider">Konto wählen</label>
                <select
                  required
                  value={selectedAccountId || ''}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                  <option value="" disabled>Bitte wählen...</option>
                  {accounts.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2 uppercase tracking-wider">Datum</label>
                <input
                  type="date"
                  required
                  value={balanceDate}
                  onChange={e => setBalanceDate(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-300 mb-2 uppercase tracking-wider">Betrag (€)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={balanceAmount}
                  onChange={e => setBalanceAmount(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              <button type="submit" disabled={!selectedAccountId || accounts.length === 0} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-lg mt-2">
                <Plus className="h-4 w-4" /> Stand speichern
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
