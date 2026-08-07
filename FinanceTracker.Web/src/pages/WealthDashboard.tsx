import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Landmark, PieChart as PieChartIcon, LineChart as LineChartIcon, BarChart3, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { 
  fetchBanks, 
  fetchAllAccounts, 
  createBank, 
  reorderBanks,
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

  const [activeChart, setActiveChart] = useState<'pie' | 'pieTypes' | 'line' | 'bar'>('pie');
  const [showTotal, setShowTotal] = useState(true);

  const typeLabels: Record<string, string> = {
    Checking: 'Girokonto',
    Savings: 'Sparkonto',
    StockDepot: 'Aktiendepot',
    Crypto: 'Krypto-Wallet',
    Cash: 'Bargeld',
    Other: 'Sonstiges'
  };

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

  const handleMoveBank = async (e: React.MouseEvent, index: number, direction: 'up' | 'down') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === banks.length - 1) return;

    const newBanks = [...banks];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the elements
    const temp = newBanks[index];
    newBanks[index] = newBanks[swapIndex];
    newBanks[swapIndex] = temp;

    // Update their sortOrder locally
    newBanks.forEach((b, i) => {
      b.sortOrder = i;
    });

    setBanks(newBanks);

    try {
      await reorderBanks(newBanks.map(b => ({ id: b.id, sortOrder: b.sortOrder })));
    } catch (err) {
      console.error('Failed to reorder banks', err);
      // Fallback reload if failed
      loadData();
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
      const dataPoint: any = { date };
      
      banks.forEach(b => dataPoint[b.id] = 0);

      accounts.forEach(a => {
        // Find the latest history entry on or before this date
        const historyUpToDate = a.history.filter(h => h.date.substring(0, 10) <= date);
        if (historyUpToDate.length > 0) {
          // It's already sorted chronologically typically, but let's take the one with the max date
          const latest = historyUpToDate.reduce((prev, curr) => (curr.date > prev.date ? curr : prev));
          total += latest.amount;
          if (dataPoint[a.bankId] !== undefined) {
            dataPoint[a.bankId] += latest.amount;
          }
        }
      });
      dataPoint.total = total;
      return dataPoint;
    });
  }, [accounts, banks]);

  // Data for PieChart (By Account Type)
  const pieTypeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    accounts.filter(a => a.currentBalance > 0).forEach(a => {
      typeMap.set(a.type, (typeMap.get(a.type) || 0) + a.currentBalance);
    });
    
    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: typeLabels[type] || type,
      value
    })).sort((a, b) => b.value - a.value);
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
              <PieChartIcon className="h-4 w-4" /> <span className="hidden sm:inline">Banken</span>
            </button>
            <button
              onClick={() => setActiveChart('pieTypes')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${
                activeChart === 'pieTypes' ? 'bg-primary-600 text-white shadow' : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <PieChartIcon className="h-4 w-4" /> <span className="hidden sm:inline">Typen</span>
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
          {activeChart === 'line' && (
            <label className="text-sm font-medium text-dark-300 flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
              <input 
                type="checkbox" 
                checked={showTotal}
                onChange={(e) => setShowTotal(e.target.checked)}
                className="rounded border-dark-600 text-primary-500 focus:ring-primary-500 focus:ring-offset-dark-900 bg-dark-900 w-4 h-4"
              />
              Gesamt zeigen
            </label>
          )}
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

          {activeChart === 'pieTypes' && pieTypeData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieTypeData} cx="50%" cy="50%" innerRadius={80} outerRadius={140} paddingAngle={2} dataKey="value" stroke="none">
                  {pieTypeData.map((_, index) => (
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

          {activeChart === 'line' && lineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: 20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} tickMargin={10} />
                <YAxis stroke="#a1a1aa" fontSize={12} tickFormatter={(v) => `€${(v/1000)}k`} domain={[0, 'auto']} />
                <Tooltip 
                  formatter={(val: number) => fmt(val)}
                  labelFormatter={(label) => `Datum: ${label}`}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                {showTotal && <Line type="stepAfter" name="Gesamt" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />}
                {banks.map((bank, index) => (
                  <Line key={bank.id} type="stepAfter" name={bank.name} dataKey={bank.id} stroke={COLORS[(index + 1) % COLORS.length]} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {((activeChart === 'pie' && pieData.length === 0) || 
            (activeChart === 'pieTypes' && pieTypeData.length === 0) || 
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
            {banks.map((bank, index) => (
              <Link 
                key={bank.id} 
                to={`/wealth/banks/${bank.id}`}
                className="block bg-dark-800 hover:bg-dark-700/80 border border-dark-700 rounded-2xl p-5 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                    {bank.name}
                  </h3>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="bg-dark-900 px-2 py-1 rounded-lg text-xs font-semibold text-dark-300 border border-dark-700">
                      {bank.accountCount} {bank.accountCount === 1 ? 'Konto' : 'Konten'}
                    </div>
                    <div className="flex items-center bg-dark-900 border border-dark-700 rounded-lg overflow-hidden">
                      <button
                        onClick={(e) => handleMoveBank(e, index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleMoveBank(e, index, 'down')}
                        disabled={index === banks.length - 1}
                        className="p-1 text-dark-400 hover:text-white hover:bg-dark-700 border-l border-dark-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
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
