import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Plus, Wallet, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getTransactionsByMonth,
  getIncomeTransactions,
  getExpenseTransactions,
  sumTransactions,
  getExpensesByCategory,
  getBalanceByMonth,
  getAvailableMonths,
} from '../data/dummyData';
import KpiCard from '../components/dashboard/KpiCard';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import ExportDropdown from '../components/dashboard/ExportDropdown';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const months = useMemo(() => getAvailableMonths(), []);
  const [selectedMonth, setSelectedMonth] = useState(months[0]?.value ?? '2026-05');

  const [year, month] = selectedMonth.split('-').map(Number);

  const transactions = useMemo(() => getTransactionsByMonth(year, month), [year, month]);
  const incomeTotal = useMemo(() => sumTransactions(getIncomeTransactions(transactions)), [transactions]);
  const expenseTotal = useMemo(() => sumTransactions(getExpenseTransactions(transactions)), [transactions]);
  const balance = incomeTotal - expenseTotal;
  const txCount = transactions.length;

  // Chart data
  const barData = useMemo(() => {
    const monthBalances = getBalanceByMonth(year);
    return monthBalances.map(b => ({
      name: b.label.split(' ')[0]?.substring(0, 3) ?? b.month,
      Einnahmen: b.income,
      Ausgaben: b.expense,
    }));
  }, [year]);

  const pieData = useMemo(() => getExpensesByCategory(transactions), [transactions]);

  const monthBalances = useMemo(() => getBalanceByMonth(year), [year]);

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hallo, {user?.firstName}! 👋</h1>
          <p className="text-sm text-dark-400 mt-1">Hier ist dein aktueller Finanzüberblick.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <PeriodSelector options={months} selected={selectedMonth} onChange={setSelectedMonth} />
          <ExportDropdown />
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors">
            <Plus className="h-4 w-4" />
            Neue Transaktion
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Einnahmen" value={fmt(incomeTotal)} icon={<TrendingUp className="h-5 w-5" />} color="green" trend="up" trendLabel="+12%" />
        <KpiCard title="Ausgaben" value={fmt(expenseTotal)} icon={<TrendingDown className="h-5 w-5" />} color="red" trend="down" trendLabel="-5%" />
        <KpiCard title="Bilanz" value={fmt(balance)} icon={<Wallet className="h-5 w-5" />} color={balance >= 0 ? 'blue' : 'red'} />
        <KpiCard title="Transaktionen" value={String(txCount)} icon={<Receipt className="h-5 w-5" />} color="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Einnahmen vs. Ausgaben ({year})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#e2e8f0' }}
                formatter={(value: number) => fmt(value)}
              />
              <Bar dataKey="Einnahmen" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Ausgaben" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Ausgaben nach Kategorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                nameKey="name"
                paddingAngle={3}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#e2e8f0' }}
                formatter={(value: number) => fmt(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bilanzen-Übersicht */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Monatsbilanzen {year}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-dark-400 font-medium">Monat</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Einnahmen</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Ausgaben</th>
                <th className="text-right py-3 px-4 text-dark-400 font-medium">Bilanz</th>
              </tr>
            </thead>
            <tbody>
              {monthBalances.map(b => (
                <tr key={b.month} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors cursor-pointer" onClick={() => setSelectedMonth(b.month)}>
                  <td className="py-3 px-4 text-white font-medium">{b.label}</td>
                  <td className="py-3 px-4 text-right text-emerald-400">{fmt(b.income)}</td>
                  <td className="py-3 px-4 text-right text-red-400">{fmt(b.expense)}</td>
                  <td className={`py-3 px-4 text-right font-semibold ${b.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(b.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
