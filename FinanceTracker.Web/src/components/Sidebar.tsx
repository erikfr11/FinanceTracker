import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Repeat, 
  Landmark, 
  User, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  ShieldCheck, 
  Palette 
} from 'lucide-react';

const Sidebar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ path, icon: Icon, label, className = '' }: { path: string, icon: any, label: string, className?: string }) => (
    <Link
      to={path}
      title={label}
      className={`flex items-center px-3 py-2.5 mx-2 my-[2px] rounded-xl transition-colors ${
        isActive(path)
          ? 'bg-primary-500/10 text-primary-400'
          : 'text-dark-300 hover:text-white hover:bg-dark-800 ' + className
      }`}
    >
      <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <span className={`text-sm font-medium whitespace-nowrap ml-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        {label}
      </span>
    </Link>
  );

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 bg-dark-950 border-r border-dark-800 overflow-hidden ${isOpen ? 'w-64 shadow-2xl' : 'w-16'}`}>
      
      <div className="flex items-center h-[65px] px-3 border-b border-dark-800">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-dark-300 hover:text-white hover:bg-dark-800 rounded-lg transition-colors flex-shrink-0"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-hide">
        <div className={`mb-2 px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <p className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Hauptmenü</p>
        </div>
        
        <NavItem path="/dashboard" icon={LayoutDashboard} label="Dashboard" />
        <NavItem path="/transactions" icon={ArrowLeftRight} label="Transaktionen" />
        <NavItem path="/fixed-costs" icon={Repeat} label="Fixkosten" />
        <NavItem path="/wealth" icon={Landmark} label="Vermögen" />

        {/* Admin Section */}
        {user?.isAdmin && (
          <>
            <div className={`mt-8 mb-2 px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <p className="text-[10px] uppercase font-bold text-primary-600 tracking-wider">Admin</p>
            </div>
            <NavItem path="/admin/users" icon={ShieldCheck} label="Nutzerübersicht" className="!text-primary-400" />
            <NavItem path="/admin/theme" icon={Palette} label="Design & Farben" className="!text-primary-400" />
          </>
        )}
      </div>

      {/* Settings & User */}
      <div className="py-2 border-t border-dark-800 bg-dark-900/50">
        <div className={`mb-2 px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <p className="text-[10px] uppercase font-bold text-dark-500 tracking-wider">Einstellungen</p>
        </div>

        <button 
          onClick={toggleTheme}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
          className="flex w-[calc(100%-16px)] items-center px-3 py-2.5 mx-2 my-[2px] rounded-xl text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </div>
          <span className={`text-sm font-medium whitespace-nowrap ml-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        <NavItem path="/profile" icon={User} label="Mein Profil" />
        <NavItem path="/settings" icon={Settings} label="Einstellungen" />

        <button 
          onClick={handleLogout}
          title="Logout"
          className="flex w-[calc(100%-16px)] items-center px-3 py-2.5 mx-2 my-[2px] mt-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 transition-colors"
        >
          <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
            <LogOut className="h-5 w-5" />
          </div>
          <span className={`text-sm font-medium whitespace-nowrap ml-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            Abmelden
          </span>
        </button>

        <div className={`mt-4 mb-2 flex items-center gap-3 px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 hidden'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
