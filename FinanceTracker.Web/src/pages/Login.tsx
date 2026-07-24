import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Wallet, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ein unerwarteter Fehler ist aufgetreten.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mobile Logo Fallback */}
      <div className="flex lg:hidden justify-center items-center gap-2 mb-8 text-blue-900 dark:text-white">
        <Wallet className="h-8 w-8 text-emerald-500" />
        <span className="text-2xl font-bold tracking-tight">FinanceTracker</span>
      </div>

      <div className="mb-8 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Willkommen zurück</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Bitte logge dich in dein Konto ein, um fortzufahren.
        </p>
      </div>

      {/* Admin Credentials Helper Badge */}
      <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between">
        <div className="text-xs text-emerald-800 dark:text-emerald-300">
          <span className="font-semibold block text-sm mb-0.5">Admin-Zugang (Development):</span>
          <code>admin@local</code>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail('admin@local');
            setPassword('Password123!');
            setError(null);
          }}
          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Ausfüllen
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">E-Mail</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="deine.email@beispiel.de"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Passwort</label>
            <a href="#" className="text-sm font-medium text-emerald-600 hover:text-emerald-500">
              Passwort vergessen?
            </a>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 mt-6 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Anmelden...
            </>
          ) : (
            <>
              Anmelden
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
        Noch keinen Account?{' '}
        <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors">
          Jetzt registrieren
        </Link>
      </p>
    </div>
  );
}
