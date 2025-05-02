import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import PrivateRoute from './components/auth/PrivateRoute';
import DarkModeToggle from './components/common/DarkModeToggle';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div>
      <AuthProvider>
        <div className={`min-h-screen transition-colors ${darkMode ? 'bg-neutral-900 text-white' : 'bg-background text-foreground'}`}>
          {/* Hide global toggle on dashboard */}
          {location.pathname !== '/dashboard' && (
            <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          )}
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </div>
  );
}

export default App;
