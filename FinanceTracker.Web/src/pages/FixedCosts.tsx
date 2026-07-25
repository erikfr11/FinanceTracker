import { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, Repeat, AlertTriangle, RefreshCw, Edit2, Trash2, Calendar, CheckCircle2, XCircle, Play, Info } from 'lucide-react';
import {
  type FixedCostDto,
  type FixedCostCreateDto,
  type FixedCostUpdateDto,
  fetchFixedCosts,
  createFixedCost,
  updateFixedCost,
  deleteFixedCost,
  triggerFixedCostProcessing,
} from '../services/fixedCostService';
import { type CategoryDto, fetchCategories } from '../services/categoryService';
import KpiCard from '../components/dashboard/KpiCard';
import FixedCostModal from '../components/fixedCosts/FixedCostModal';

export default function FixedCosts() {
  const [fixedCosts, setFixedCosts] = useState<FixedCostDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'All' | 'Expense' | 'Income'>('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFixedCost, setEditingFixedCost] = useState<FixedCostDto | null>(null);
  const [deletingFixedCost, setDeletingFixedCost] = useState<FixedCostDto | null>(null);
  const [processing, setProcessing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fcData, catData] = await Promise.all([
        fetchFixedCosts(),
        fetchCategories(),
      ]);
      setFixedCosts(fcData);
      setCategories(catData);
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der wiederkehrenden Buchungen.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setEditingFixedCost(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (fc: FixedCostDto) => {
    setEditingFixedCost(fc);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (dto: FixedCostCreateDto | FixedCostUpdateDto) => {
    if ('id' in dto) {
      await updateFixedCost(dto as FixedCostUpdateDto);
    } else {
      await createFixedCost(dto as FixedCostCreateDto);
    }
    await loadData();
  };

  const handleDeleteFixedCost = async () => {
    if (!deletingFixedCost) return;
    try {
      await deleteFixedCost(deletingFixedCost.id);
      setDeletingFixedCost(null);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Löschen der Regel.');
    }
  };

  const handleToggleActive = async (fc: FixedCostDto) => {
    try {
      await updateFixedCost({
        id: fc.id,
        amount: fc.amount,
        dueDayOfMonth: fc.dueDayOfMonth,
        frequency: fc.frequency || 'Monthly',
        note: fc.note,
        isActive: !fc.isActive,
        categoryId: fc.categoryId,
      });
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ändern des Status.');
    }
  };

  const handleManualProcess = async () => {
    setProcessing(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const msg = await triggerFixedCostProcessing();
      setSuccessMessage(msg);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Fehler beim Ausführen des Regel-Checks.');
    } finally {
      setProcessing(false);
    }
  };

  // KPIs
  const totalFixedExpenses = useMemo(() => {
    return fixedCosts
      .filter((fc) => fc.isActive && fc.categoryType !== 'Income')
      .reduce((sum, fc) => sum + fc.amount, 0);
  }, [fixedCosts]);

  const totalFixedIncomes = useMemo(() => {
    return fixedCosts
      .filter((fc) => fc.isActive && fc.categoryType === 'Income')
      .reduce((sum, fc) => sum + fc.amount, 0);
  }, [fixedCosts]);

  const netFixedBalance = useMemo(() => {
    return totalFixedIncomes - totalFixedExpenses;
  }, [totalFixedIncomes, totalFixedExpenses]);

  // Filtered List
  const displayedFixedCosts = useMemo(() => {
    if (filterType === 'Expense') {
      return fixedCosts.filter((fc) => fc.categoryType !== 'Income');
    }
    if (filterType === 'Income') {
      return fixedCosts.filter((fc) => fc.categoryType === 'Income');
    }
    return fixedCosts;
  }, [fixedCosts, filterType]);

  const fmt = (n: number) => n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });

  const getFrequencyLabel = (freq?: string) => {
    switch (freq) {
      case 'Weekly':
        return 'Wöchentlich';
      case 'Quarterly':
        return 'Vierteljährlich';
      case 'SemiAnnually':
        return 'Halbjährlich';
      case 'Yearly':
        return 'Jährlich';
      case 'Monthly':
      default:
        return 'Monatlich';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Repeat className="h-6 w-6 text-primary-400" />
            Wiederkehrende Buchungen (Fixkosten & Einnahmen)
          </h1>
          <p className="text-sm text-dark-400 mt-1">
            Verwalte deine wiederkehrenden Fixkosten und Einnahmen (z.B. Gehalt). Fällige Buchungen werden am Fälligkeitstag automatisch verbucht.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleManualProcess}
            disabled={processing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-sm font-medium transition-colors border border-dark-700 shadow-sm"
            title="Prüft sofort ob fällige Buchungen als Transaktion angelegt werden müssen"
          >
            <Play className={`h-4 w-4 text-emerald-400 ${processing ? 'animate-spin' : ''}`} />
            Jetzt prüfen
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors shadow-lg shadow-primary-600/20"
          >
            <Plus className="h-4 w-4" />
            Neue Regel anlegen
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-primary-500/10 border border-primary-500/30 rounded-2xl text-xs text-primary-200 flex items-start gap-3">
        <Info className="h-5 w-5 text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block mb-0.5">Automatisches & Manuelles Prüfen der wiederkehrenden Buchungen</span>
          Fixkosten und fixe Einnahmen (wie Gehalt) werden automatisch 1x täglich im Hintergrund sowie bei jedem Start der Anwendung geprüft. Über <strong className="text-white">„Jetzt prüfen“</strong> kannst du den Check auch jederzeit manuell anstoßen.
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-1 text-xs bg-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/30 text-white font-medium transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Erneut versuchen
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-dark-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Fixe Einnahmen (z.B. Gehalt)"
          value={fmt(totalFixedIncomes)}
          icon={<Repeat className="h-5 w-5 text-emerald-400" />}
          color="green"
        />
        <KpiCard
          title="Monatliche Fixkosten"
          value={fmt(totalFixedExpenses)}
          icon={<Repeat className="h-5 w-5 text-red-400" />}
          color="red"
        />
        <KpiCard
          title="Monatliche Netto-Fix-Bilanz"
          value={fmt(netFixedBalance)}
          icon={<Calendar className="h-5 w-5" />}
          color={netFixedBalance >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-dark-800 pb-2">
        <button
          onClick={() => setFilterType('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'All'
              ? 'bg-primary-600 text-white shadow'
              : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          Alle ({fixedCosts.length})
        </button>
        <button
          onClick={() => setFilterType('Expense')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'Expense'
              ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow'
              : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          Fixkosten ({fixedCosts.filter((fc) => fc.categoryType !== 'Income').length})
        </button>
        <button
          onClick={() => setFilterType('Income')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            filterType === 'Income'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow'
              : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700'
          }`}
        >
          Fixe Einnahmen ({fixedCosts.filter((fc) => fc.categoryType === 'Income').length})
        </button>
      </div>

      {/* Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Eingerichtete wiederkehrende Buchungen</h3>

        {loading ? (
          <div className="p-12 text-center text-dark-400">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary-500" />
            <p className="text-sm">Lade wiederkehrende Buchungen aus dem Backend…</p>
          </div>
        ) : displayedFixedCosts.length === 0 ? (
          <div className="text-center py-12 text-dark-400">
            <Repeat className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary-400" />
            <p className="text-base font-medium text-white mb-1">Keine wiederkehrenden Buchungen vorhanden</p>
            <p className="text-xs text-dark-400 max-w-sm mx-auto mb-4">
              Lege deine wiederkehrenden Fixkosten oder Einnahmen (z. B. Gehalt, Miete) an, damit sie am Fälligkeitstag automatisch verbucht werden.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium transition-colors"
            >
              <Plus className="h-4 w-4" /> Erste Regel anlegen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-700 text-left text-dark-400 font-medium">
                  <th className="py-3 px-4">Bezeichnung</th>
                  <th className="py-3 px-4">Kategorie</th>
                  <th className="py-3 px-4">Intervall</th>
                  <th className="py-3 px-4">Fälligkeit</th>
                  <th className="py-3 px-4 text-right">Betrag</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Zuletzt verbucht</th>
                  <th className="py-3 px-4 text-right">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {displayedFixedCosts.map((fc) => {
                  const isIncome = fc.categoryType === 'Income';
                  return (
                    <tr
                      key={fc.id}
                      className="border-b border-dark-800 hover:bg-dark-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-medium text-white">
                        <div className="flex items-center gap-2">
                          <span>{fc.note || (isIncome ? 'Fixe Einnahme' : 'Fixkosten')}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isIncome
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/30 text-red-400'
                            }`}
                          >
                            {isIncome ? '💰 Einnahme' : '💸 Ausgabe'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-dark-300">
                        <span className="px-2.5 py-1 rounded-lg bg-dark-800 border border-dark-700 text-xs">
                          {fc.categoryName || 'Allgemein'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-dark-300">
                        <span className="px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-medium">
                          {getFrequencyLabel(fc.frequency)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-dark-300">
                        <span className="flex items-center gap-1.5 text-xs text-primary-400 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          Am {fc.dueDayOfMonth}. des Monats
                        </span>
                      </td>
                      <td className={`py-3.5 px-4 text-right font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isIncome ? `+${fmt(fc.amount)}` : `-${fmt(fc.amount)}`}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(fc)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            fc.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-dark-800 text-dark-400 border border-dark-700 hover:bg-dark-700'
                          }`}
                        >
                          {fc.isActive ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Aktiv
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3.5 w-3.5" /> Inaktiv
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-dark-400 font-mono">
                        {fc.lastGeneratedYearMonth ? (
                          <span className="px-2 py-0.5 rounded bg-dark-800 text-dark-300">
                            Monat {fc.lastGeneratedYearMonth}
                          </span>
                        ) : (
                          <span className="text-dark-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(fc)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                            title="Bearbeiten"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFixedCost(fc)}
                            className="p-1.5 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create & Edit */}
      <FixedCostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        editingFixedCost={editingFixedCost}
        onSubmit={handleFormSubmit}
      />

      {/* Modal: Delete Confirmation */}
      {deletingFixedCost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeletingFixedCost(null)}
          />
          <div className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Wiederkehrende Regel löschen?</h3>
            <p className="text-xs text-dark-300 mb-6">
              Möchtest du die Regel für "{deletingFixedCost.note || 'Regel'}" wirklich löschen? Bereits generierte Transaktionen bleiben erhalten.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeletingFixedCost(null)}
                className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-white text-xs font-medium transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleDeleteFixedCost}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-medium transition-colors"
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
