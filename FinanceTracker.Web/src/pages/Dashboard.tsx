import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Plus,
  Wallet,
  TrendingUp,
  TrendingDown,
  Receipt,
  RefreshCw,
  AlertTriangle,
  BarChart3,
  LineChart as LineChartIcon,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFilter } from '../context/FilterContext';
import {
  type TransactionDto,
  type TransactionCreateDto,
  fetchTransactions,
  createTransaction,
} from '../services/transactionService';
import { type CategoryDto, fetchCategories } from '../services/categoryService';
import KpiCard from '../components/dashboard/KpiCard';
import ExportDropdown from '../components/dashboard/ExportDropdown';
import NewTransactionModal from '../components/transactions/NewTransactionModal';
import AdvancedFilterBar from '../components/filters/AdvancedFilterBar';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisTextColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
    borderRadius: '12px',
    color: isDark ? '#e2e8f0' : '#0f172a',
  };

  const { apiFilter } = useFilter();
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(currentTime);
  }, [currentTime]);

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(currentTime);
  }, [currentTime]);

  // Chart type toggle: 'bar' (Income vs Expense) or 'line' (Net Balance trend)
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

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
      setError(err.message || 'Fehler beim Laden der Finanzdaten.');
    } finally {
      setLoading(false);
    }
  }, [apiFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const incomeTotal = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const expenseTotal = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = incomeTotal - expenseTotal;
  const txCount = transactions.length;

  // Bar chart data for 12 months
  const barData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      name: monthNames[i],
      Einnahmen: 0,
      Ausgaben: 0,
    }));

    transactions.forEach((t) => {
      if (t.date) {
        const monthIdx = parseInt(t.date.substring(5, 7), 10) - 1;
        if (monthIdx >= 0 && monthIdx < 12) {
          if (t.categoryType === 'Income') {
            monthlyStats[monthIdx].Einnahmen += t.amount;
          } else {
            monthlyStats[monthIdx].Ausgaben += t.amount;
          }
        }
      }
    });

    return monthlyStats;
  }, [transactions]);

  // Line chart data & dynamic SVG gradient offset for positive (green) vs negative (red)
  const { lineData, gradientOffset } = useMemo(() => {
    const data = barData.map((item) => ({
      ...item,
      Bilanz: item.Einnahmen - item.Ausgaben,
    }));

    const values = data.map((d) => d.Bilanz);
    const minVal = Math.min(...values, 0);
    const maxVal = Math.max(...values, 0);

    let offset = 0.5;
    if (maxVal <= 0) {
      offset = 0;
    } else if (minVal >= 0) {
      offset = 1;
    } else {
      offset = maxVal / (maxVal - minVal);
    }

    return { lineData: data, gradientOffset: offset };
  }, [barData]);

  // Pie chart data for expenses by category
  const pieData = useMemo(() => {
    const catMap = new Map<string, number>();

    transactions
      .filter((t) => t.categoryType === 'Expense')
      .forEach((t) => {
        const catName = t.categoryName || 'Sonstiges';
        catMap.set(catName, (catMap.get(catName) || 0) + t.amount);
      });

    return Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Monthly balance summary table
  const monthBalances = useMemo(() => {
    const monthFormatter = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' });
    const keys = Array.from(
      new Set(
        transactions
          .filter((t) => t.date)
          .map((t) => t.date.substring(0, 7))
      )
    ).sort((a, b) => b.localeCompare(a));

    return keys.map((key) => {
      const [y, m] = key.split('-').map(Number);
      const label = monthFormatter.format(new Date(y, m - 1, 1));
      const txs = transactions.filter((t) => t.date && t.date.substring(0, 7) === key);
      const inc = txs.filter((t) => t.categoryType === 'Income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter((t) => t.categoryType === 'Expense').reduce((s, t) => s + t.amount, 0);
      return {
        month: key,
        label,
        income: inc,
        expense: exp,
        balance: inc - exp,
      };
    });
  }, [transactions]);

  const handleCreateTransaction = async (dto: TransactionCreateDto) => {
    await createTransaction(dto);
    await loadData();
  };

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hallo, {user?.firstName}! 👋</h1>
          <p className="text-sm text-dark-400 mt-1">Hier ist dein aktueller Finanzüberblick.</p>
        </div>

        {/* Live Date & Time Badge */}
        <div className="flex items-center gap-2.5 bg-dark-800/90 border border-dark-700/80 px-4 py-2 rounded-xl text-xs shadow-inner self-start lg:self-auto">
          <div className="flex items-center gap-1.5 text-dark-200 font-medium border-r border-dark-700/80 pr-3">
            <Calendar className="h-3.5 w-3.5 text-primary-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold pl-1">
            <Clock className="h-3.5 w-3.5 animate-pulse" />
            <span>{formattedTime} Uhr</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ExportDropdown />
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus className="h-4 w-4" />
            Neue Transaktion
          </button>
        </div>
      </div>

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

      {loading ? (
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-12 text-center text-dark-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-500" />
          <p className="text-sm">Lade Daten aus dem Backend…</p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Einnahmen" value={fmt(incomeTotal)} icon={<TrendingUp className="h-5 w-5" />} color="green" />
            <KpiCard title="Ausgaben" value={fmt(expenseTotal)} icon={<TrendingDown className="h-5 w-5" />} color="red" />
            <KpiCard title="Bilanz" value={fmt(balance)} icon={<Wallet className="h-5 w-5" />} color={balance >= 0 ? 'blue' : 'red'} />
            <KpiCard title="Transaktionen" value={String(txCount)} icon={<Receipt className="h-5 w-5" />} color="yellow" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Toggleable Main Chart (Bar Chart vs. Net Balance Line Chart) */}
            <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {chartType === 'bar' ? 'Einnahmen vs. Ausgaben' : 'Monatsbilanz-Verlauf'}
                  </h3>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {chartType === 'bar'
                      ? 'Monatlicher Vergleich aller Einnahmen und Ausgaben'
                      : 'Nettobilanz pro Monat (Grün = Positiv, Rot = Negativ)'}
                  </p>
                </div>

                {/* Chart Mode Toggle Buttons */}
                <div className="flex items-center bg-dark-800 border border-dark-700/80 p-1 rounded-xl gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartType('bar')}
                    title="Balkendiagramm (Einnahmen vs. Ausgaben)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      chartType === 'bar'
                        ? 'bg-primary-600 text-white shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    <BarChart3 className="h-3.5 w-3.5" />
                    <span>Balken</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartType('line')}
                    title="Liniendiagramm (Monatsbilanz)"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      chartType === 'line'
                        ? 'bg-primary-600 text-white shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    <LineChartIcon className="h-3.5 w-3.5" />
                    <span>Bilanz-Linie</span>
                  </button>
                </div>
              </div>

              {chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: axisTextColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: axisTextColor, fontSize: 12 }} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => fmt(value)}
                    />
                    <Bar dataKey="Einnahmen" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Ausgaben" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <defs>
                      <linearGradient id="balanceLineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset={`${gradientOffset * 100}%`} stopColor="#10b981" />
                        <stop offset={`${gradientOffset * 100}%`} stopColor="#ef4444" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: axisTextColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: axisTextColor, fontSize: 12 }} />
                    <ReferenceLine y={0} stroke={axisTextColor} strokeDasharray="3 3" />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => [fmt(value), 'Monatsbilanz']}
                    />
                    <Line
                      type="monotone"
                      dataKey="Bilanz"
                      stroke="url(#balanceLineGradient)"
                      strokeWidth={3}
                      dot={(props: any) => {
                        const { cx, cy, payload, index } = props;
                        const isPos = payload && payload.Bilanz >= 0;
                        return (
                          <circle
                            key={`dot-${index}`}
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill={isPos ? '#10b981' : '#ef4444'}
                            stroke={isDark ? '#0f172a' : '#ffffff'}
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Ausgaben nach Kategorie</h3>
              {pieData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-dark-400 text-xs">
                  Keine Ausgaben in diesem Monat.
                </div>
              ) : (
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
                      contentStyle={tooltipStyle}
                      formatter={(value: number) => fmt(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bilanzen-Übersicht */}
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Monatsbilanzen</h3>
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
                  {monthBalances.map((b) => (
                    <tr
                      key={b.month}
                      className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-white font-medium">{b.label}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{fmt(b.income)}</td>
                      <td className="py-3 px-4 text-right text-red-400">{fmt(b.expense)}</td>
                      <td className={`py-3 px-4 text-right font-semibold ${b.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {fmt(b.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <NewTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSubmit={async (dto) => {
          await handleCreateTransaction(dto as TransactionCreateDto);
        }}
      />
    </div>
  );
}
