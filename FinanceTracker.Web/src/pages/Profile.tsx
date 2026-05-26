import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Moon, Check } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Profil-Update API Call
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white">Mein Profil</h1>
        <p className="text-sm text-dark-400 mt-1">Verwalte deine persönlichen Daten und Einstellungen.</p>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-dark-800">
          <h2 className="text-lg font-semibold text-white mb-4">Persönliche Informationen</h2>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-300">Vorname</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-dark-300">Nachname</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-dark-300">E-Mail Adresse</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors"
              >
                {saved ? <Check className="h-4 w-4" /> : null}
                {saved ? 'Gespeichert' : 'Speichern'}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 border-b border-dark-800">
          <h2 className="text-lg font-semibold text-white mb-4">Erscheinungsbild</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white flex items-center gap-2">
                <Moon className="h-4 w-4 text-dark-400" /> Dark Mode
              </p>
              <p className="text-sm text-dark-400">Passe das Farbschema an deine Präferenz an.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={isDark} onChange={toggleTheme} />
              <div className="w-11 h-6 bg-dark-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-red-500 mb-4">Gefahrenzone</h2>
          <p className="text-sm text-dark-400 mb-4">Hier kannst du dein Passwort ändern oder dein Konto unwiderruflich löschen.</p>
          <div className="flex gap-4">
            <button className="px-4 py-2 border border-dark-700 text-white rounded-lg text-sm hover:bg-dark-800 transition-colors">
              Passwort ändern
            </button>
            <button className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors">
              Konto löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
