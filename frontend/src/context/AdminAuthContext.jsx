import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminMe, adminLogin, adminLogout } from '../api/client.js';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    adminMe()
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  const login = useCallback(async (password) => {
    await adminLogin(password);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await adminLogout();
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, checking, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
