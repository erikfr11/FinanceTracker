

const Navbar: React.FC = () => {
  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between p-4">
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
          {/* Platzhalter für Logo */}
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
          <span className="self-center text-2xl font-bold whitespace-nowrap text-white">FinanceTracker</span>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-4 rtl:space-x-reverse">
          <button type="button" className="text-dark-300 hover:text-white font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors">
            Login
          </button>
          <button type="button" className="text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-800 font-medium rounded-lg text-sm px-4 py-2 text-center transition-colors">
            Registrieren
          </button>
        </div>
        <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-sticky">
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-dark-800 rounded-lg bg-dark-900 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
            <li>
              <a href="#" className="block py-2 px-3 text-white bg-primary-700 rounded md:bg-transparent md:text-primary-500 md:p-0" aria-current="page">Dashboard</a>
            </li>
            <li>
              <a href="#" className="block py-2 px-3 text-dark-300 rounded hover:bg-dark-800 md:hover:bg-transparent md:hover:text-primary-400 md:p-0 transition-colors">Features</a>
            </li>
            <li>
              <a href="#" className="block py-2 px-3 text-dark-300 rounded hover:bg-dark-800 md:hover:bg-transparent md:hover:text-primary-400 md:p-0 transition-colors">Preise</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
