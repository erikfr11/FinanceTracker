import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-dark-950 text-dark-100 font-sans flex">
      <Sidebar />
      <div className="flex-1 ml-16 flex flex-col transition-all duration-300">
        <Navbar />
        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
