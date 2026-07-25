import { useState } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, FileSpreadsheet, Code } from 'lucide-react';
import { importTransactions, downloadTemplate, type TransactionImportResultDto } from '../../services/transactionService';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
  const [format, setFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionImportResultDto | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setResult(null);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    setError(null);
    try {
      await downloadTemplate(format);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Herunterladen der Vorlage.');
    } finally {
      setDownloading(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Bitte wähle eine Datei zum Importieren aus.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await importTransactions(file, format);
      setResult(res);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Importieren der Datei.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary-400" />
            Transaktionen importieren
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm">
              <div className="flex items-center gap-2 font-bold mb-1">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                Import abgeschlossen
              </div>
              <p className="text-xs text-emerald-200 mt-1">{result.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-dark-800 border border-dark-700 rounded-xl">
                <span className="text-dark-400 block">Neu importiert</span>
                <span className="text-lg font-bold text-emerald-400">{result.importedCount}</span>
              </div>
              <div className="p-3 bg-dark-800 border border-dark-700 rounded-xl">
                <span className="text-dark-400 block">Duplikate übersprungen</span>
                <span className="text-lg font-bold text-amber-400">{result.skippedDuplicatesCount}</span>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="p-3 bg-dark-800 border border-dark-700 rounded-xl max-h-32 overflow-y-auto text-xs text-red-400 space-y-1">
                <span className="font-semibold block mb-1">Warnungen / Fehler:</span>
                {result.errors.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-dark-800 hover:bg-dark-700 text-white font-medium rounded-xl transition-colors text-xs"
              >
                Weitere Datei importieren
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-colors text-xs"
              >
                Fertig
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleImport} className="space-y-5">
            {/* Format Picker */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-300">Dateiformat auswählen</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('csv')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    format === 'csv'
                      ? 'bg-primary-600/20 border-primary-500 text-primary-400 shadow'
                      : 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white'
                  }`}
                >
                  <FileText className="h-4 w-4" /> CSV
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('excel')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    format === 'excel'
                      ? 'bg-primary-600/20 border-primary-500 text-primary-400 shadow'
                      : 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="h-4 w-4" /> Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('json')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                    format === 'json'
                      ? 'bg-primary-600/20 border-primary-500 text-primary-400 shadow'
                      : 'bg-dark-800 border-dark-700 text-dark-300 hover:text-white'
                  }`}
                >
                  <Code className="h-4 w-4" /> JSON
                </button>
              </div>
            </div>

            {/* Template Download Button */}
            <div className="p-3.5 bg-dark-800/80 border border-dark-700/80 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-white block">Beispiel-Vorlage herunterladen</span>
                <span className="text-[11px] text-dark-400 block">
                  Vorbereitetes Schema für {format.toUpperCase()} (Spalte <strong className="text-dark-300">Id</strong> ist optional)
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={downloading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-white text-xs font-medium rounded-lg transition-colors border border-dark-600 shadow-sm"
              >
                <Download className={`h-3.5 w-3.5 ${downloading ? 'animate-bounce' : ''}`} />
                Vorlage ({format === 'excel' ? '.xlsx' : `.${format}`})
              </button>
            </div>

            {/* File Dropzone / Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-dark-300">Datei hochladen</label>
              <div className="border-2 border-dashed border-dark-700 hover:border-primary-500/50 rounded-2xl p-6 text-center transition-colors bg-dark-800/50">
                <input
                  type="file"
                  id="file-upload"
                  accept={format === 'csv' ? '.csv' : format === 'excel' ? '.xlsx' : '.json'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                  <Upload className="h-8 w-8 mx-auto text-primary-400 opacity-80" />
                  {file ? (
                    <div className="text-xs text-emerald-400 font-semibold">{file.name}</div>
                  ) : (
                    <div>
                      <span className="text-xs text-white font-medium block">
                        Klicke zum Auswählen der {format.toUpperCase()}-Datei
                      </span>
                      <span className="text-[11px] text-dark-400 block mt-0.5">
                        Spalten: Date, Amount, CategoryName, Note (Id optional)
                      </span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors text-sm shadow-lg shadow-primary-600/20"
            >
              {loading ? 'Importiere Datensätze…' : 'Transaktionen jetzt importieren'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
