import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';

// ── Types ───────────────────────────────────────────────────────────

export interface DummyUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  darkMode: boolean;
}

export interface Category {
  id: number;
  name: string;
  type: 'Income' | 'Expense';
  expenseType: 'None' | 'Fixed' | 'Variable';
}

export interface Transaction {
  id: string;
  amount: number;
  date: string; // ISO date string
  note: string;
  categoryId: number;
  userId: string;
}

export interface MonthBalance {
  month: string; // "2026-01", "2026-02"
  label: string; // "Januar 2026"
  income: number;
  expense: number;
  balance: number;
}

export interface YearBalance {
  year: number;
  income: number;
  expense: number;
  balance: number;
}

// ── Static Data ─────────────────────────────────────────────────────

export const dummyUser: DummyUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@beispiel.de',
  darkMode: true,
};

export const dummyCategories: Category[] = [
  { id: 1, name: 'Gehalt', type: 'Income', expenseType: 'None' },
  { id: 2, name: 'Freiberuflich', type: 'Income', expenseType: 'None' },
  { id: 3, name: 'Investitionen', type: 'Income', expenseType: 'None' },
  { id: 4, name: 'Miete', type: 'Expense', expenseType: 'Fixed' },
  { id: 5, name: 'Versicherungen', type: 'Expense', expenseType: 'Fixed' },
  { id: 6, name: 'Abonnements', type: 'Expense', expenseType: 'Fixed' },
  { id: 7, name: 'Lebensmittel', type: 'Expense', expenseType: 'Variable' },
  { id: 8, name: 'Transport', type: 'Expense', expenseType: 'Variable' },
  { id: 9, name: 'Unterhaltung', type: 'Expense', expenseType: 'Variable' },
  { id: 10, name: 'Sonstiges', type: 'Expense', expenseType: 'Variable' },
];

const uid = dummyUser.id;

export const dummyTransactions: Transaction[] = [
  // Mai 2026
  { id: 't01', amount: 3500, date: '2026-05-01', note: 'Monatsgehalt', categoryId: 1, userId: uid },
  { id: 't02', amount: 950, date: '2026-05-01', note: 'Warmmiete', categoryId: 4, userId: uid },
  { id: 't03', amount: 89.90, date: '2026-05-02', note: 'Krankenversicherung', categoryId: 5, userId: uid },
  { id: 't04', amount: 14.99, date: '2026-05-03', note: 'Netflix', categoryId: 6, userId: uid },
  { id: 't05', amount: 9.99, date: '2026-05-03', note: 'Spotify', categoryId: 6, userId: uid },
  { id: 't06', amount: 67.42, date: '2026-05-05', note: 'Wocheneinkauf REWE', categoryId: 7, userId: uid },
  { id: 't07', amount: 45.00, date: '2026-05-08', note: 'Tanken', categoryId: 8, userId: uid },
  { id: 't08', amount: 32.50, date: '2026-05-10', note: 'Kino + Popcorn', categoryId: 9, userId: uid },
  { id: 't09', amount: 500, date: '2026-05-12', note: 'Freelance-Projekt', categoryId: 2, userId: uid },
  { id: 't10', amount: 82.15, date: '2026-05-14', note: 'Wocheneinkauf Edeka', categoryId: 7, userId: uid },
  { id: 't11', amount: 25.00, date: '2026-05-18', note: 'Bücher', categoryId: 10, userId: uid },
  { id: 't12', amount: 55.00, date: '2026-05-22', note: 'Restaurantbesuch', categoryId: 9, userId: uid },
  { id: 't13', amount: 150, date: '2026-05-25', note: 'Dividende', categoryId: 3, userId: uid },
  // April 2026
  { id: 't14', amount: 3500, date: '2026-04-01', note: 'Monatsgehalt', categoryId: 1, userId: uid },
  { id: 't15', amount: 950, date: '2026-04-01', note: 'Warmmiete', categoryId: 4, userId: uid },
  { id: 't16', amount: 89.90, date: '2026-04-02', note: 'Krankenversicherung', categoryId: 5, userId: uid },
  { id: 't17', amount: 14.99, date: '2026-04-03', note: 'Netflix', categoryId: 6, userId: uid },
  { id: 't18', amount: 9.99, date: '2026-04-03', note: 'Spotify', categoryId: 6, userId: uid },
  { id: 't19', amount: 92.30, date: '2026-04-06', note: 'Großeinkauf Aldi', categoryId: 7, userId: uid },
  { id: 't20', amount: 38.00, date: '2026-04-10', note: 'Tanken', categoryId: 8, userId: uid },
  { id: 't21', amount: 120, date: '2026-04-15', note: 'Freelance-Projekt', categoryId: 2, userId: uid },
  { id: 't22', amount: 45.00, date: '2026-04-20', note: 'Konzertticket', categoryId: 9, userId: uid },
  // März 2026
  { id: 't23', amount: 3500, date: '2026-03-01', note: 'Monatsgehalt', categoryId: 1, userId: uid },
  { id: 't24', amount: 950, date: '2026-03-01', note: 'Warmmiete', categoryId: 4, userId: uid },
  { id: 't25', amount: 89.90, date: '2026-03-02', note: 'Krankenversicherung', categoryId: 5, userId: uid },
  { id: 't26', amount: 24.98, date: '2026-03-03', note: 'Netflix + Spotify', categoryId: 6, userId: uid },
  { id: 't27', amount: 110.00, date: '2026-03-08', note: 'Wocheneinkäufe', categoryId: 7, userId: uid },
  { id: 't28', amount: 200, date: '2026-03-20', note: 'Geburtstagsgeschenk', categoryId: 10, userId: uid },
  { id: 't29', amount: 75, date: '2026-03-25', note: 'Dividende', categoryId: 3, userId: uid },
  // Februar 2026
  { id: 't30', amount: 3500, date: '2026-02-01', note: 'Monatsgehalt', categoryId: 1, userId: uid },
  { id: 't31', amount: 950, date: '2026-02-01', note: 'Warmmiete', categoryId: 4, userId: uid },
  { id: 't32', amount: 89.90, date: '2026-02-02', note: 'Krankenversicherung', categoryId: 5, userId: uid },
  { id: 't33', amount: 24.98, date: '2026-02-03', note: 'Netflix + Spotify', categoryId: 6, userId: uid },
  { id: 't34', amount: 350, date: '2026-02-15', note: 'Winterjacke', categoryId: 10, userId: uid },
  // Januar 2026
  { id: 't35', amount: 3500, date: '2026-01-01', note: 'Monatsgehalt', categoryId: 1, userId: uid },
  { id: 't36', amount: 950, date: '2026-01-01', note: 'Warmmiete', categoryId: 4, userId: uid },
  { id: 't37', amount: 89.90, date: '2026-01-02', note: 'Krankenversicherung', categoryId: 5, userId: uid },
  { id: 't38', amount: 24.98, date: '2026-01-03', note: 'Netflix + Spotify', categoryId: 6, userId: uid },
  { id: 't39', amount: 250, date: '2026-01-10', note: 'Freelance-Projekt', categoryId: 2, userId: uid },
  { id: 't40', amount: 60.00, date: '2026-01-20', note: 'Tanken', categoryId: 8, userId: uid },
];

// ── Helper Functions ────────────────────────────────────────────────

export function getCategoryById(id: number): Category | undefined {
  return dummyCategories.find(c => c.id === id);
}

export function getTransactionsByPeriod(startDate: string, endDate: string): Transaction[] {
  return dummyTransactions.filter(t => t.date >= startDate && t.date <= endDate);
}

export function getTransactionsByMonth(year: number, month: number): Transaction[] {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  const startStr = format(start, 'yyyy-MM-dd');
  const endStr = format(end, 'yyyy-MM-dd');
  return getTransactionsByPeriod(startStr, endStr);
}

export function getIncomeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(t => {
    const cat = getCategoryById(t.categoryId);
    return cat?.type === 'Income';
  });
}

export function getExpenseTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(t => {
    const cat = getCategoryById(t.categoryId);
    return cat?.type === 'Expense';
  });
}

export function sumTransactions(transactions: Transaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

export function getBalanceByMonth(year: number): MonthBalance[] {
  const balances: MonthBalance[] = [];
  for (let m = 1; m <= 12; m++) {
    const txs = getTransactionsByMonth(year, m);
    if (txs.length === 0) continue;
    const income = sumTransactions(getIncomeTransactions(txs));
    const expense = sumTransactions(getExpenseTransactions(txs));
    const d = new Date(year, m - 1);
    balances.push({
      month: format(d, 'yyyy-MM'),
      label: format(d, 'MMMM yyyy', { locale: de }),
      income,
      expense,
      balance: income - expense,
    });
  }
  return balances;
}

export function getBalanceByYear(): YearBalance[] {
  const years = new Set(dummyTransactions.map(t => parseInt(t.date.substring(0, 4))));
  return Array.from(years).sort().map(year => {
    const txs = dummyTransactions.filter(t => t.date.startsWith(String(year)));
    const income = sumTransactions(getIncomeTransactions(txs));
    const expense = sumTransactions(getExpenseTransactions(txs));
    return { year, income, expense, balance: income - expense };
  });
}

export function getExpensesByCategory(transactions: Transaction[]): { name: string; value: number }[] {
  const expTxs = getExpenseTransactions(transactions);
  const map = new Map<string, number>();
  expTxs.forEach(t => {
    const cat = getCategoryById(t.categoryId);
    const name = cat?.name ?? 'Unbekannt';
    map.set(name, (map.get(name) ?? 0) + t.amount);
  });
  return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
}

export function getAvailableMonths(): { value: string; label: string }[] {
  const months = new Set(dummyTransactions.map(t => t.date.substring(0, 7)));
  return Array.from(months).sort().reverse().map(m => {
    const d = new Date(m + '-01');
    return { value: m, label: format(d, 'MMMM yyyy', { locale: de }) };
  });
}
