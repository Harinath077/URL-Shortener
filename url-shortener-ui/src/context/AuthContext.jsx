import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // JWT is in an HttpOnly cookie — the frontend never reads it.
  // Only the username is kept in localStorage to persist the "logged in" UI state
  // across page refreshes without an extra round-trip to the backend.
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_info')) || null; }
    catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    // The server sets the HttpOnly jwt cookie in the Set-Cookie header.
    // We only store the username locally so the UI knows who is logged in.
    const userObj = { username };
    localStorage.setItem('user_info', JSON.stringify(userObj));
    setUser(userObj);
    return res.data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      // Tell the backend to clear the HttpOnly jwt cookie.
      // The browser cannot delete an HttpOnly cookie itself.
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — still clear local state so the UI transitions to logged-out.
    }
    localStorage.removeItem('user_info');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

