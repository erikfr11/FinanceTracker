import { useState, useEffect } from 'react';
import { fetchAllUsers, type AdminUserListItem } from '../services/userService';
import { Users as UsersIcon, ShieldCheck, UserCheck, Search, Calendar, Clock, Crown, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Users() {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Fehler beim Laden der Benutzerübersicht');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Noch nie';
    try {
      return format(new Date(dateStr), 'dd.MM.yyyy, HH:mm', { locale: de });
    } catch {
      return dateStr;
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (roleFilter === 'admin') return matchesSearch && u.isAdmin;
    if (roleFilter === 'user') return matchesSearch && !u.isAdmin;
    return matchesSearch;
  });

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.isAdmin).length;
  const totalPremium = users.filter((u) => u.isPremiumUser).length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>Admin-Bereich</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Nutzerübersicht</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Verwalte alle registrierten Benutzer der Anwendung, deren Rollen und Aktivitäten.
          </p>
        </div>
        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Aktualisieren
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <UsersIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Gesamte Benutzer</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalUsers}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Administratoren</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalAdmins}</p>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Premium Mitglieder</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalPremium}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nach Name oder E-Mail suchen..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-slate-900 dark:text-white"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              roleFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Alle ({totalUsers})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              roleFilter === 'admin'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Admins ({totalAdmins})
          </button>
          <button
            onClick={() => setRoleFilter('user')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              roleFilter === 'user'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Benutzer ({totalUsers - totalAdmins})
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
          <p className="text-sm">Nutzerdaten werden geladen...</p>
        </div>
      ) : (
        /* Users Table */
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700/60">
                <tr>
                  <th className="px-6 py-4">Benutzer</th>
                  <th className="px-6 py-4">E-Mail</th>
                  <th className="px-6 py-4">Registriert am</th>
                  <th className="px-6 py-4">Letzter Login</th>
                  <th className="px-6 py-4">Rolle</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                      Keine Benutzer gefunden.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {u.firstName ? u.firstName.charAt(0) : u.email.charAt(0).toUpperCase()}
                            {u.lastName ? u.lastName.charAt(0) : ''}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">
                              {u.fullName || u.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-slate-400 md:hidden">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(u.createdAtUtc)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{formatDate(u.lastLoginAtUtc)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            <UserCheck className="h-3.5 w-3.5" />
                            Benutzer
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        {u.isPremiumUser ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Crown className="h-3.5 w-3.5" />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-400 border border-slate-200 dark:border-slate-700">
                            Standard
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
