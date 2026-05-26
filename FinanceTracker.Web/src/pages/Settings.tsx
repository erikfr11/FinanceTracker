import { Bell, DownloadCloud, Shield } from 'lucide-react';

export default function Settings() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
        <p className="text-sm text-dark-400 mt-1">Konfiguriere FinanceTracker nach deinen Bedürfnissen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Features / Abo Block (Versteckte Landing Page Info) */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-400 flex items-center justify-center mb-4">
            <Shield className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Dein Plan: Free</h3>
          <p className="text-sm text-dark-400 mb-4">Du nutzt aktuell den kostenlosen Basis-Plan mit unbegrenzten Transaktionen aber limitierten Budgets.</p>
          <button className="text-sm font-medium text-accent-400 hover:text-accent-300">
            Preise & Features ansehen →
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-4">
            <Bell className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Benachrichtigungen</h3>
          <p className="text-sm text-dark-400 mb-4">Lege fest wann und wie du über Budget-Limits informiert werden möchtest.</p>
          <button className="text-sm px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-colors">
            Konfigurieren
          </button>
        </div>

        {/* Export Data */}
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 md:col-span-2">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <DownloadCloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Daten-Export & Backup</h3>
              <p className="text-sm text-dark-400 mb-4">Lade ein komplettes Backup deines Accounts inklusive aller Transaktionen, Kategorien und Einstellungen als ZIP-Archiv herunter.</p>
              <button className="text-sm px-4 py-2 border border-dark-700 hover:bg-dark-800 text-white rounded-lg transition-colors">
                Gesamtes Backup anfordern
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
