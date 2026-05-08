
import FeatureCard from '../components/FeatureCard';

const Home: React.FC = () => {
  return (
    <main className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="bg-dark-950">
        <div className="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
            Manage deine Finanzen mit <span className="text-transparent bg-clip-text bg-gradient-to-r to-accent-400 from-primary-400">Leichtigkeit</span>
          </h1>
          <p className="mb-8 text-lg font-normal text-dark-400 lg:text-xl sm:px-16 xl:px-48">
            Behalte den Überblick über deine Einnahmen und Ausgaben, analysiere Fixkosten und erstelle intelligente Budgets. Alles an einem sicheren Ort.
          </p>
          <div className="flex flex-col mb-8 lg:mb-16 space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
            <a href="#" className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:ring-primary-900 transition-colors">
              Jetzt starten
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </a>
            <a href="#" className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg border border-dark-700 hover:bg-dark-800 focus:ring-4 focus:ring-dark-800 transition-colors">
              <svg className="mr-2 -ml-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path></svg>
              Demo ansehen
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-dark-950">
        <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
          <div className="max-w-screen-md mb-8 lg:mb-16">
            <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-white">Entwickelt für volle Kontrolle</h2>
            <p className="text-dark-400 sm:text-xl">Unsere Tools helfen dir dabei, dein finanzielles Leben zu organisieren, Einsparpotenziale zu erkennen und deine Ziele schneller zu erreichen.</p>
          </div>
          <div className="grid space-y-8 md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
            <FeatureCard 
              title="Einnahmen/Ausgaben Tracker"
              description="Erfasse jede Transaktion mühelos. Kategorisiere deine Umsätze und behalte in Echtzeit den Überblick über deinen Cashflow."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
            />
            <FeatureCard 
              title="Fixkosten-Analyse"
              description="Automatische Erkennung deiner wiederkehrenden Ausgaben. Verpasse nie wieder eine Kündigungsfrist und identifiziere teure Abos sofort."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>}
            />
            <FeatureCard 
              title="Intelligentes Budgeting"
              description="Setze dir finanzielle Ziele pro Kategorie. Erhalte Benachrichtigungen, wenn du dich deinen Limits näherst und spare effektiv."
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>}
            />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
