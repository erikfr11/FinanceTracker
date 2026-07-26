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
  Legend,
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
  PieChart as PieChartIcon,
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
import NewTransactionModal from '../components/transactions/NewTransactionModal';
import AdvancedFilterBar from '../components/filters/AdvancedFilterBar';

export default function Dashboard() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const axisTextColor = isDark ? '#94a3b8' : '#64748b';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    border: isDark ? '1px solid #1e293b' : '1px solid #e2e8f0',
    borderRadius: '12px',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
  };
  const itemStyle = {
    color: isDark ? '#f8fafc' : '#0f172a',
  };
  const labelStyle = {
    color: isDark ? '#f8fafc' : '#0f172a',
  };

  const {
    periodPreset,
    selectedYear,
    selectedMonth,
    customStartDate,
    customEndDate,
    apiFilter,
  } = useFilter();

  const timeframeLabel = useMemo(() => {
    if (periodPreset === 'currentYear') {
      return `Aktuelles Jahr (${selectedYear})`;
    }
    if (periodPreset === 'specificYear') {
      return `Jahr ${selectedYear}`;
    }
    if (periodPreset === 'specificMonth') {
      const [y, m] = selectedMonth.split('-').map(Number);
      const mName = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date(y, m - 1, 1));
      return mName;
    }
    if (periodPreset === 'customRange') {
      if (customStartDate && customEndDate) {
        const d1 = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(customStartDate));
        const d2 = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(customEndDate));
        return `${d1} – ${d2}`;
      }
      return 'Individueller Zeitraum';
    }
    return '';
  }, [periodPreset, selectedYear, selectedMonth, customStartDate, customEndDate]);

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
  // Pie chart category toggle: 'Expense' (default) vs 'Income'
  const [pieCategoryType, setPieCategoryType] = useState<'Expense' | 'Income'>('Expense');

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

  const fixedExpensesTotal = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'Expense' && t.categoryExpenseType === 'Fixed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const variableExpensesTotal = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'Expense' && t.categoryExpenseType !== 'Fixed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const balance = incomeTotal - expenseTotal;
  const txCount = transactions.length;

  // Dynamic chart data (bar & line) matching selected timeframe filter
  const barData = useMemo(() => {
    if (transactions.length === 0) return [];

    let start = apiFilter.startDate ? new Date(apiFilter.startDate) : null;
    let end = apiFilter.endDate ? new Date(apiFilter.endDate) : null;

    if (!start || !end) {
      const dates = transactions.map((t) => new Date(t.date)).filter((d) => !isNaN(d.getTime()));
      if (dates.length > 0) {
        if (!start) start = new Date(Math.min(...dates.map((d) => d.getTime())));
        if (!end) end = new Date(Math.max(...dates.map((d) => d.getTime())));
      }
    }

    const diffDays = start && end ? Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 365;

    // Daily buckets if selected timeframe is <= 35 days (e.g. single month or custom range like 10. Jun - 03. Jul)
    if (diffDays <= 35 && start && end) {
      const dayMap = new Map<string, { name: string; Einnahmen: number; Ausgaben: number; AusgabenFix: number; AusgabenVar: number }>();
      const curr = new Date(start);
      const isSingleMonth = periodPreset === 'specificMonth';

      while (curr <= end) {
        const isoKey = curr.toISOString().substring(0, 10);
        const name = isSingleMonth
          ? String(curr.getDate())
          : new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short' }).format(curr);

        dayMap.set(isoKey, { name, Einnahmen: 0, Ausgaben: 0, AusgabenFix: 0, AusgabenVar: 0 });
        curr.setDate(curr.getDate() + 1);
      }

      transactions.forEach((t) => {
        if (t.date) {
          const key = t.date.substring(0, 10);
          if (dayMap.has(key)) {
            const item = dayMap.get(key)!;
            if (t.categoryType === 'Income') {
              item.Einnahmen += t.amount;
            } else {
              item.Ausgaben += t.amount;
              if (t.categoryExpenseType === 'Fixed') {
                item.AusgabenFix += t.amount;
              } else {
                item.AusgabenVar += t.amount;
              }
            }
          }
        }
      });

      return Array.from(dayMap.values());
    }

    // Monthly buckets for longer timeframes
    const monthMap = new Map<string, { name: string; Einnahmen: number; Ausgaben: number; AusgabenFix: number; AusgabenVar: number }>();

    if (start && end) {
      const curr = new Date(start.getFullYear(), start.getMonth(), 1);
      const last = new Date(end.getFullYear(), end.getMonth(), 1);
      while (curr <= last) {
        const key = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}`;
        const name = new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' }).format(curr);
        monthMap.set(key, { name, Einnahmen: 0, Ausgaben: 0, AusgabenFix: 0, AusgabenVar: 0 });
        curr.setMonth(curr.getMonth() + 1);
      }
    }

    transactions.forEach((t) => {
      if (t.date) {
        const key = t.date.substring(0, 7);
        if (!monthMap.has(key)) {
          const d = new Date(t.date);
          const name = !isNaN(d.getTime())
            ? new Intl.DateTimeFormat('de-DE', { month: 'short', year: '2-digit' }).format(d)
            : key;
          monthMap.set(key, { name, Einnahmen: 0, Ausgaben: 0, AusgabenFix: 0, AusgabenVar: 0 });
        }
        const item = monthMap.get(key)!;
        if (t.categoryType === 'Income') {
          item.Einnahmen += t.amount;
        } else {
          item.Ausgaben += t.amount;
          if (t.categoryExpenseType === 'Fixed') {
            item.AusgabenFix += t.amount;
          } else {
            item.AusgabenVar += t.amount;
          }
        }
      }
    });

    return Array.from(monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map((entry) => entry[1]);
  }, [transactions, apiFilter, periodPreset]);

  // Line chart data & dynamic SVG gradient offset for accumulated running balance over time
  const { lineData, gradientOffset } = useMemo(() => {
    let runningBalance = 0;
    const data = barData.map((item) => {
      const netPeriod = item.Einnahmen - item.Ausgaben;
      runningBalance += netPeriod;
      return {
        ...item,
        PeriodenBilanz: netPeriod,
        Bilanz: runningBalance,
      };
    });

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

  // Pie chart data for expenses or income by category
  const pieData = useMemo(() => {
    const catMap = new Map<string, number>();

    transactions
      .filter((t) => t.categoryType === pieCategoryType)
      .forEach((t) => {
        const catName = t.categoryName || 'Sonstiges';
        catMap.set(catName, (catMap.get(catName) || 0) + t.amount);
      });

    return Array.from(catMap.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions, pieCategoryType]);

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

          {/* Expense Subtype Breakdown Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-dark-900 border border-dark-800 rounded-2xl px-5 py-3 text-xs shadow-lg">
            <div className="flex items-center gap-2 text-dark-300 font-medium">
              <Receipt className="h-4 w-4 text-primary-400" />
              <span>Ausgaben-Aufschlüsselung ({timeframeLabel}):</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-dark-800/80 border border-dark-700/80 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-dark-300 font-medium">📌 Fixkosten:</span>
                <span className="font-bold text-red-400">{fmt(fixedExpensesTotal)}</span>
              </div>
              <div className="flex items-center gap-2 bg-dark-800/80 border border-dark-700/80 px-3 py-1.5 rounded-xl">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="text-dark-300 font-medium">🛒 Flexible Ausgaben:</span>
                <span className="font-bold text-red-300">{fmt(variableExpensesTotal)}</span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Toggleable Main Chart (Bar Chart vs. Net Balance Line Chart) */}
            <div className="lg:col-span-2 bg-dark-900 border border-dark-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">
                      {chartType === 'bar' ? 'Einnahmen vs. Ausgaben' : 'Akkumulierter Bilanzverlauf'}
                    </h3>
                    {timeframeLabel && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-dark-800 border border-dark-700 text-xs text-primary-400 font-semibold">
                        {timeframeLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {chartType === 'bar'
                      ? 'Vergleich aller Einnahmen und Ausgaben (Fixkosten & Flexible Ausgaben rot gestapelt)'
                      : 'Kumulierter Nettobilanz-Verlauf im Zeitverlauf (Grün = Positiv, Rot = Negativ)'}
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
                    title="Akkumuliertes Liniendiagramm (Bilanz-Verlauf)"
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

              {barData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-dark-400 text-sm py-12">
                  <BarChart3 className="h-10 w-10 opacity-30 text-primary-400 mb-2" />
                  <span className="font-medium text-white">Keine Transaktionen im ausgewählten Zeitraum</span>
                  <span className="text-xs text-dark-400 mt-1">Passe den Filter an oder lege neue Transaktionen an.</span>
                </div>
              ) : chartType === 'bar' ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis dataKey="name" tick={{ fill: axisTextColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: axisTextColor, fontSize: 12 }} />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload, label }) => {
                        if (!active || !payload || !payload.length) return null;
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 bg-dark-900 border border-dark-700 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
                            <p className="font-bold text-white border-b border-dark-700 pb-1">{label}</p>
                            <div className="flex items-center justify-between text-emerald-400 font-medium">
                              <span>💰 Einnahmen:</span>
                              <span>{fmt(d.Einnahmen)}</span>
                            </div>
                            <div className="flex items-center justify-between text-red-400 font-semibold pt-1 border-t border-dark-800">
                              <span>💸 Gesamtausgaben:</span>
                              <span>{fmt(d.Ausgaben)}</span>
                            </div>
                            <div className="pl-2 space-y-1 text-[11px] text-dark-300">
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                                  Davon Fixkosten:
                                </span>
                                <span className="text-white font-mono">{fmt(d.AusgabenFix)}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                                  Davon Flexibel:
                                </span>
                                <span className="text-white font-mono">{fmt(d.AusgabenVar)}</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Bar
                      dataKey="Einnahmen"
                      name="Einnahmen"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      activeBar={{ fillOpacity: 0.85, stroke: isDark ? '#ffffff' : '#0f172a', strokeWidth: 1.5 }}
                    />
                    <Bar
                      dataKey="AusgabenFix"
                      name="Fixkosten"
                      stackId="ausgaben"
                      fill="#dc2626"
                      activeBar={{ fillOpacity: 0.85, stroke: isDark ? '#ffffff' : '#0f172a', strokeWidth: 1.5 }}
                    />
                    <Bar
                      dataKey="AusgabenVar"
                      name="Flexible Ausgaben"
                      stackId="ausgaben"
                      fill="#f87171"
                      radius={[6, 6, 0, 0]}
                      activeBar={{ fillOpacity: 0.85, stroke: isDark ? '#ffffff' : '#0f172a', strokeWidth: 1.5 }}
                    />
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
                      cursor={false}
                      contentStyle={tooltipStyle}
                      itemStyle={itemStyle}
                      labelStyle={labelStyle}
                      formatter={(value: number) => [fmt(value), 'Akkumulierte Bilanz']}
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
                            r={4}
                            fill={isPos ? '#10b981' : '#ef4444'}
                            stroke={isDark ? '#0f172a' : '#ffffff'}
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie Chart (Expenses vs Incomes by Category) */}
            <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {pieCategoryType === 'Expense' ? 'Ausgaben nach Kategorie' : 'Einnahmen nach Kategorie'}
                  </h3>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {pieCategoryType === 'Expense'
                      ? 'Prozentuale Verteilung aller Ausgaben'
                      : 'Prozentuale Verteilung aller Einnahmen'}
                  </p>
                </div>

                {/* Expense vs Income Toggle Buttons */}
                <div className="flex items-center bg-dark-800 border border-dark-700/80 p-1 rounded-xl gap-1 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPieCategoryType('Expense')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pieCategoryType === 'Expense'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    Ausgaben
                  </button>
                  <button
                    type="button"
                    onClick={() => setPieCategoryType('Income')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      pieCategoryType === 'Income'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow'
                        : 'text-dark-400 hover:text-white'
                    }`}
                  >
                    Einnahmen
                  </button>
                </div>
              </div>

              {pieData.length === 0 ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-dark-400 text-xs text-center py-12">
                  <PieChartIcon className="h-10 w-10 opacity-30 text-primary-400 mb-2" />
                  <span className="font-medium text-white">
                    Keine {pieCategoryType === 'Expense' ? 'Ausgaben' : 'Einnahmen'} im ausgewählten Zeitraum
                  </span>
                  <span className="text-[11px] text-dark-400 mt-1">
                    Wähle einen anderen Zeitraum oder lege neue Transaktionen an.
                  </span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="42%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      nameKey="name"
                      paddingAngle={3}
                      labelLine={false}
                      label={({ percent }) => (percent >= 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                    >
                      {pieData.map((_, i) => {
                        const colors = pieCategoryType === 'Expense'
                          ? ['#ef4444', '#f97316', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#64748b']
                          : ['#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#84cc16', '#059669', '#047857', '#14b8a6'];
                        return <Cell key={i} fill={colors[i % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      itemStyle={itemStyle}
                      labelStyle={labelStyle}
                      formatter={(value: number) => fmt(value)}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', color: axisTextColor, paddingTop: '12px' }}
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
