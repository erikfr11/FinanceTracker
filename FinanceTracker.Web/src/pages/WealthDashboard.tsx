import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Landmark, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart3, ArrowRight } from 'lucide-react';
import { 
  fetchBanks, 
  fetchAllAccounts, 
  createBank, 
  type BankDto, 
  type AccountDto 
} from '../services/wealthService';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';

export default function WealthDashboard() {
  const [banks, setBanks] = useState<BankDto[]>([]);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankName, setNewBankName] = useState('');

  const [activeChart, setActiveChart] = useState<'pie' | 'line' | 'bar'>('pie');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const b = await fetchBanks();
      const a = await fetchAllAccounts();
      setBanks(b);
      setAccounts(a);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim()) return;
    try {
      await createBank({ name: newBankName });
      setNewBankName('');
      setShowAddBank(false);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const totalWealth = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  }, [accounts]);

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  // Data for PieChart (By Bank)
  const pieData = useMemo(() => {
    return banks.filter(b => b.totalBalance > 0).map(b => ({
      name: b.name,
      value: b.totalBalance
    }));
  }, [banks]);

  // Data for BarChart (By Account)
  const barData = useMemo(() => {
    return accounts.filter(a => a.currentBalance > 0).map(a => ({
      name: `${a.bankName} - ${a.name}`,
      value: a.currentBalance
    })).sort((a, b) => b.value - a.value);
  }, [accounts]);

  // Data for LineChart (History over time)
  const lineData = useMemo(() => {
    // Collect all unique dates across all accounts' history
    const dateMap = new Map<string, number>();
    accounts.forEach(a => {
      a.history.forEach(h => {
        const dateStr = h.date.substring(0, 10);
        if (!dateMap.has(dateStr)) dateMap.set(dateStr, 0);
      });
    });

    // Sort dates
    const sortedDates = Array.from(dateMap.keys()).sort();
    
    // For each date, sum the balance of each account at or before that date
    return sortedDates.map(date => {
      let total = 0;
      accounts.forEach(a => {
        // Find the latest history entry on or before this date
        const historyUpToDate = a.history.filter(h => h.date.substring(0, 10) <= date);
        if (historyUpToDate.length > 0) {
          // It's already sorted chronologically typically, but let's take the one with the max date
          const latest = historyUpToDate.reduce((prev, curr) => (curr.date > prev.date ? curr : prev));
          total += latest.amount;
        }
      });
      return { date, value: total };
    });
  }, [accounts]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

  if (loading) {
    return <div className="text-center py-20 text-dark-400">Lade Vermögensdaten...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Landmark className="h-8 w-8 text-primary-400" />
            Vermögensübersicht
          </h1>
          <p className="text-dark-300 mt-1 text-sm">
            Verwalte deine Konten, Depots und dein Gesamtvermögen.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-dark-800 p-4 rounded-2xl shadow-lg border border-dark-700">
          <div className="text-right">
            <p className="text-xs text-dark-400 font-medium uppercase tracking-wider">Gesamtvermögen</p>
            <p className="text-2xl font-bold text-emerald-400">{fmt(totalWealth)}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-white">Vermögensanalyse</h2>
          <div className="flex p-1 bg-dark-800 rounded-lg">
            <button
              onClick={() => setActiveChart('pie')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                activeChart === 'pie' ? 'bg-primary-600 text-white shadow' : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <PieChartIcon className="h-4 w-4" /> <span className="hidden sm:inline">Verteilung</span>
            </button>
            <button
              onClick={() => setActiveChart('bar')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                activeChart === 'bar' ? 'bg-primary-600 text-white shadow' : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Konten</span>
            </button>
            <button
              onClick={() => setActiveChart('line')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                activeChart === 'line' ? 'bg-primary-600 text-white shadow' : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <LineChartIcon className="h-4 w-4" /> <span className="hidden sm:inline">Historie</span>
            </button>
          </div>
        </div>

        <div className="h-[300px] sm:h-[400px] w-full">
          {activeChart === 'pie' && pieData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: number) => fmt(val)} 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'bar' && barData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#a1a1aa" fontSize={12} tickMargin={10} angle={-45} textAnchor="end" />
                <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `€${(v/1000)}k`} />
                <Tooltip 
                  cursor={{ fill: '#27272a', opacity: 0.4 }}
                  formatter={(val: number) => fmt(val)}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'line' && lineData.length > 0 && (
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
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}

          {((activeChart === 'pie' && pieData.length === 0) || 
            (activeChart === 'bar' && barData.length === 0) || 
            (activeChart === 'line' && lineData.length === 0)) && (
            <div className="h-full flex items-center justify-center text-dark-400">
              Noch nicht genügend Daten vorhanden.
            </div>
          )}
        </div>
      </div>

      {/* Banks List */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-dark-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-bold text-white">Banken & Anbieter</h2>
          
          {!showAddBank ? (
            <button 
              onClick={() => setShowAddBank(true)}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              <Plus className="h-4 w-4" /> Bank anlegen
            </button>
          ) : (
            <form onSubmit={handleAddBank} className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                autoFocus
                placeholder="Bank Name (z.B. ING)"
                value={newBankName}
                onChange={e => setNewBankName(e.target.value)}
                className="bg-dark-950 border border-dark-700 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-primary-500 flex-1"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
                Speichern
              </button>
              <button type="button" onClick={() => setShowAddBank(false)} className="bg-dark-800 hover:bg-dark-700 text-dark-300 px-3 py-2 rounded-xl text-sm font-semibold transition-all">
                Abbrechen
              </button>
            </form>
          )}
        </div>

        {banks.length === 0 ? (
          <div className="p-8 text-center text-dark-400 text-sm">
            Bisher keine Banken angelegt. Klicke auf "Bank anlegen" um zu starten.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
            {banks.map((bank) => (
              <Link 
                key={bank.id} 
                to={`/wealth/banks/${bank.id}`}
                className="block bg-dark-800 hover:bg-dark-700/80 border border-dark-700 rounded-2xl p-5 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                    {bank.name}
                  </h3>
                  <div className="bg-dark-900 px-2 py-1 rounded-lg text-xs font-semibold text-dark-300 border border-dark-700">
                    {bank.accountCount} {bank.accountCount === 1 ? 'Konto' : 'Konten'}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-dark-400 tracking-wider mb-1">Guthaben</p>
                    <p className="text-xl font-bold text-white">{fmt(bank.totalBalance)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-dark-900 border border-dark-700 flex items-center justify-center group-hover:bg-primary-500/20 group-hover:border-primary-500/30 group-hover:text-primary-400 transition-all">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
