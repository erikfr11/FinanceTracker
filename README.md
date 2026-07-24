# FinanceTracker

Dieses Projekt besteht aus zwei Hauptkomponenten:
- **FinanceTracker.Api**: Backend (.NET Web API)
- **FinanceTracker.Web**: Frontend (React + Vite + TypeScript)

---

## Schnellstart per App-Icon (macOS)

Auf deinem **Schreibtisch (Desktop)** befindet sich die App **`Finance Tracker.app`**.

1. **Starten:** Doppelklick auf **`Finance Tracker.app`**.
   - Startet API (`dotnet watch`) und Frontend (`vite`) parallel mit **Hot Reload**.
   - Öffnet automatisch nach 3 Sekunden `http://localhost:5173` im Browser.
2. **Beenden:** Einfach das Terminal-Fenster schließen (oder `Strg + C` drücken).

---

## Voraussetzungen

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) & `npm`

---

## Manueller Start über das Terminal

### 1. Über die Start-Datei
```bash
./start.command
```

### 2. Oder einzeln in zwei Terminals

**Backend (API mit Auto-Reload):**
```bash
cd FinanceTracker.Api
dotnet watch
```

**Frontend (Web mit Live-Reload):**
```bash
cd FinanceTracker.Web
npm install   # Nur beim ersten Mal
npm run dev
```
