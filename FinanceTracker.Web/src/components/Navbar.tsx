import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, ArrowLeftRight, User, Settings, LogOut, Sun, Moon, Wallet, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `block py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'text-primary-400 bg-primary-500/10'
        : 'text-dark-300 hover:text-white hover:bg-dark-800'
    }`;

  // ── Eingeloggte Navbar ────────────────────────────────────────────
  if (isAuthenticated) {
    return (
      <nav className="fixed w-full z-50 top-0 border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Wallet className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceTracker</span>
          </Link>

          {/* Haupt-Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </span>
            </Link>
            <Link to="/transactions" className={navLinkClass('/transactions')}>
              <span className="flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4" />
                Transaktionen
              </span>
            </Link>
          </div>

          {/* Rechte Seite: Theme Toggle + Profil-Dropdown */}
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl py-1.5 px-3 hover:bg-dark-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm text-dark-200 font-medium">
                  {user?.firstName}
                </span>
                <ChevronDown className={`h-4 w-4 text-dark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-dark-900 border border-dark-700 shadow-2xl py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-dark-700">
                    <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-dark-400">{user?.email}</p>
                  </div>
                  <Link to="/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                    <User className="h-4 w-4" /> Profil
                  </Link>
                  <Link to="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                    <Settings className="h-4 w-4" /> Einstellungen
                  </Link>
                  <div className="border-t border-dark-700 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800 transition-colors">
                      <LogOut className="h-4 w-4" /> Abmelden
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ── Ausgeloggte Navbar ────────────────────────────────────────────
  return (
    <nav className="fixed w-full z-50 top-0 border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Wallet className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FinanceTracker</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-dark-300 hover:text-white transition-colors">Features</a>
          <a href="#preise" className="text-sm text-dark-300 hover:text-white transition-colors">Preise</a>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Link to="/login" className="text-sm text-dark-300 hover:text-white font-medium px-4 py-2 rounded-lg transition-colors">
            Login
          </Link>
          <Link to="/register" className="text-sm text-white bg-primary-600 hover:bg-primary-700 font-medium px-4 py-2 rounded-lg transition-colors">
            Registrieren
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
