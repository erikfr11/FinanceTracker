import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password);
    navigate('/');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mobile Logo Fallback */}
      <div className="flex lg:hidden justify-center items-center gap-2 mb-8 text-blue-900 dark:text-white">
        <Wallet className="h-8 w-8 text-emerald-500" />
        <span className="text-2xl font-bold tracking-tight">FinanceTracker</span>
      </div>

      <div className="mb-10 text-center lg:text-left">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Willkommen zurück</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Bitte logge dich in dein Konto ein, um fortzufahren.
        </p>
      </div>

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
          className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 mt-6"
        >
          Anmelden
          <ArrowRight className="h-4 w-4" />
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
