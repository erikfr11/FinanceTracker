import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { FilterProvider } from './context/FilterContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthLayout } from './components/AuthLayout';
import AppLayout from './components/AppLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import FixedCosts from './pages/FixedCosts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Users from './pages/Users';
import WealthDashboard from './pages/WealthDashboard';
import BankDetails from './pages/BankDetails';

import ThemeSettingsPage from './pages/ThemeSettingsPage';

// Helper component um Eingeloggte von der LandingPage fernzuhalten
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <FilterProvider>
            <Routes>
              
              {/* Public Landing Page */}
              <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />

              {/* Auth Routes im AuthLayout */}
              <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Protected Routes im AppLayout */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/fixed-costs" element={<FixedCosts />} />
                  <Route path="/wealth" element={<WealthDashboard />} />
                  <Route path="/wealth/banks/:id" element={<BankDetails />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/theme" element={<ThemeSettingsPage />} />
                </Route>
              </Route>

            </Routes>
          </FilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
