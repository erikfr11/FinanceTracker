import { useState, useEffect } from 'react';
import { Palette, RefreshCw, Check, AlertTriangle, Sun, Moon, Sparkles, RotateCcw, Undo2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { type ThemeSettingsDto, defaultThemeSettings } from '../services/themeService';

export default function ThemeSettingsPage() {
  const { themeSettings, updateThemeSettings, resetThemeSettings, applyPreviewTheme, isDark } = useTheme();

  // Current form input state
  const [form, setForm] = useState<ThemeSettingsDto>(themeSettings);
  // Last saved state from backend
  const [savedForm, setSavedForm] = useState<ThemeSettingsDto>(themeSettings);

  const [activeTab, setActiveTab] = useState<'dark' | 'light' | 'accents'>('dark');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setForm(themeSettings);
    setSavedForm(themeSettings);
  }, [themeSettings]);

  const handleChange = (key: keyof ThemeSettingsDto, value: string) => {
    const updated = { ...form, [key]: value };
    setForm(updated);
    applyPreviewTheme(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateThemeSettings(form);
      setSavedForm(form);
      setSuccessMsg('Das neue Farbschema wurde erfolgreich in der Datenbank gespeichert!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Fehler beim Speichern der Farben.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await resetThemeSettings();
      setForm(defaultThemeSettings);
      setSavedForm(defaultThemeSettings);
      setSuccessMsg('Das Farbschema wurde auf die Standardwerte zurückgesetzt.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Fehler beim Zurücksetzen der Farben.');
    } finally {
      setLoading(false);
    }
  };

  const handleSingleReset = (key: keyof ThemeSettingsDto) => {
    const isUnsaved = form[key].toLowerCase() !== savedForm[key].toLowerCase();
    // Revert to saved value if unsaved, otherwise revert to factory default
    const targetValue = isUnsaved ? savedForm[key] : defaultThemeSettings[key];
    handleChange(key, targetValue);
  };

  const renderColorInput = (label: string, description: string, key: keyof ThemeSettingsDto) => {
    const isUnsaved = form[key].toLowerCase() !== savedForm[key].toLowerCase();
    const isDifferentFromDefault = form[key].toLowerCase() !== defaultThemeSettings[key].toLowerCase();

    return (
      <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-dark-800/60 border border-dark-700/60 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-white block">{label}</label>
            {isUnsaved && (
              <span className="text-[10px] bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded font-mono">
                nicht gespeichert
              </span>
            )}
            {!isUnsaved && isDifferentFromDefault && (
              <span className="text-[10px] bg-primary-500/10 text-primary-400 px-1.5 py-0.5 rounded font-mono">
                angepasst
              </span>
            )}
          </div>
          <span className="text-[11px] text-dark-400 block mt-0.5">{description}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="color"
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-9 h-9 rounded-lg border border-dark-600 bg-transparent cursor-pointer p-0.5"
          />
          <input
            type="text"
            value={form[key]}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-24 px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {(isUnsaved || isDifferentFromDefault) && (
            <button
              type="button"
              onClick={() => handleSingleReset(key)}
              title={
                isUnsaved
                  ? `Änderung verwerfen (zurück zu gespeichertem Wert ${savedForm[key]})`
                  : `Auf Werkseinstellung (${defaultThemeSettings[key]}) zurücksetzen`
              }
              className="p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-700 transition-colors flex items-center justify-center"
            >
              {isUnsaved ? <Undo2 className="h-4 w-4 text-yellow-400" /> : <RotateCcw className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Palette className="h-6 w-6 text-primary-400" />
            Farbschema anpassen (Admin)
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            Gestalte die Anwendungsoberfläche für Dark und Light Mode. Änderungen werden live angewendet und in der Datenbank gespeichert.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetAll}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 border border-dark-700 hover:bg-dark-700 text-dark-300 hover:text-white text-xs font-medium transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Auf Standard zurücksetzen
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors shadow-lg shadow-primary-600/20"
          >
            <Check className="h-4 w-4" /> Farben speichern
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-2">
          <Sparkles className="h-5 w-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-dark-900 border border-dark-800 p-1.5 rounded-2xl gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('dark')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'dark'
              ? 'bg-dark-800 text-white shadow border border-dark-700'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Moon className="h-4 w-4 text-primary-400" />
          Dark Mode Farben
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('light')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'light'
              ? 'bg-dark-800 text-white shadow border border-dark-700'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Sun className="h-4 w-4 text-yellow-400" />
          Light Mode Farben
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('accents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'accents'
              ? 'bg-dark-800 text-white shadow border border-dark-700'
              : 'text-dark-400 hover:text-white'
          }`}
        >
          <Sparkles className="h-4 w-4 text-emerald-400" />
          Akzent- & Statusfarben
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Color controls */}
        <div className="lg:col-span-2 space-y-3 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
          {activeTab === 'dark' && (
            <>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Moon className="h-4 w-4 text-primary-400" /> Dark Mode Palette
              </h3>
              {renderColorInput('Seiten-Hintergrund', 'Haupt-Hintergrund im dunklen Modus', 'darkPageBg')}
              {renderColorInput('Karten-Hintergrund', 'Hintergrund für Boxen und Tabellen', 'darkCardBg')}
              {renderColorInput('Flächen & Hover-Hintergrund', 'Sekundäre Flächen, Modals und Hover-Effekte', 'darkSurfaceBg')}
              {renderColorInput('Rahmen & Linien', 'Bordüren und Trennlinien', 'darkBorderColor')}
              {renderColorInput('Haupttext / Überschriften', 'Sehr heller Text für Titel und Werte', 'darkTextPrimary')}
              {renderColorInput('Sekundärtext', 'Standard-Lesetext in Tabellen', 'darkTextSecondary')}
              {renderColorInput('Abschwächter Text', 'Subtiler Text für Beschreibungen', 'darkTextMuted')}
            </>
          )}

          {activeTab === 'light' && (
            <>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-400" /> Light Mode Palette
              </h3>
              {renderColorInput('Seiten-Hintergrund', 'Haupt-Hintergrund im hellen Modus', 'lightPageBg')}
              {renderColorInput('Karten-Hintergrund', 'Hintergrund für Boxen und Tabellen', 'lightCardBg')}
              {renderColorInput('Flächen & Hover-Hintergrund', 'Sekundäre Flächen, Modals und Hover-Effekte', 'lightSurfaceBg')}
              {renderColorInput('Rahmen & Linien', 'Bordüren und Trennlinien', 'lightBorderColor')}
              {renderColorInput('Haupttext / Überschriften', 'Dunkler Text für Titel und Werte', 'lightTextPrimary')}
              {renderColorInput('Sekundärtext', 'Standard-Lesetext in Tabellen', 'lightTextSecondary')}
              {renderColorInput('Abschwächter Text', 'Subtiler Text für Beschreibungen', 'lightTextMuted')}
            </>
          )}

          {activeTab === 'accents' && (
            <>
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" /> Akzentfarben (Beide Modi)
              </h3>
              {renderColorInput('Haupt-Akzentfarbe (Primary)', 'Farbe für Primär-Buttons, aktives Menü & Highlights', 'primaryColor')}
              {renderColorInput('Einnahmen-Farbe (Income)', 'Farbe für Einnahme-Beträge und positive Trends', 'incomeColor')}
              {renderColorInput('Ausgaben-Farbe (Expense)', 'Farbe für Ausgabe-Beträge und Warnungen', 'expenseColor')}
            </>
          )}
        </div>

        {/* Live Preview Card */}
        <div className="bg-dark-900 border border-dark-800 p-6 rounded-2xl flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Live-Vorschau ({isDark ? 'Dark' : 'Light'})
            </h3>
            <span className="text-[10px] bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-full font-medium">
              Echtzeit
            </span>
          </div>

          <div className="border border-dark-700 rounded-xl p-4 bg-dark-800/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-white">Beispielkarte</div>
                <div className="text-xs text-dark-400">Aktuelles Farbschema</div>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                +1.250,00 €
              </span>
            </div>

            <p className="text-xs text-dark-300">
              Dies ist eine Beispielbeschreibung, die die Schriftfarben für Fließtext demonstriert.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                className="w-full py-2 px-3 bg-primary-600 text-white rounded-lg text-xs font-medium shadow"
              >
                Primär-Button
              </button>
              <button
                type="button"
                className="w-full py-2 px-3 bg-dark-800 border border-dark-700 text-dark-200 rounded-lg text-xs font-medium"
              >
                Sekundär
              </button>
            </div>
          </div>

          <div className="p-3 bg-dark-800 border border-dark-700 rounded-xl space-y-1 text-xs">
            <div className="text-white font-semibold">Hinweis:</div>
            <div className="text-dark-400 text-[11px]">
              Klicke oben rechts auf das Sonnen/Mond-Icon in der Leiste, um sofort zwischen Light- und Dark-Mode Vorschau zu wechseln.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
