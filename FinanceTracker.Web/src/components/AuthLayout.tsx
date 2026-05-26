import { Outlet, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
      
      {/* Linke Seite: Branding & Visuals (nur ab lg Screens sichtbar) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-blue-900 to-emerald-800 p-12 text-white relative overflow-hidden">
        
        {/* Dekorativer verschwommener Kreis im Hintergrund */}
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-30"></div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-16 cursor-pointer">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
              <Wallet className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold tracking-wide">FinanceTracker</span>
          </Link>
          
          <h1 className="text-5xl font-extrabold leading-tight mb-6">
            Besserer Überblick. <br/>
            <span className="text-emerald-400">Bessere Entscheidungen.</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-md">
            Behalte deine Einnahmen und Ausgaben zentral im Blick, analysiere deine Fixkosten und baue effektiv Budgetpläne auf.
          </p>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © {new Date().getFullYear()} FinanceTracker. All rights reserved.
        </div>
      </div>

      {/* Rechte Seite: Content / Formular */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

    </div>
  );
};
