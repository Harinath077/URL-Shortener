import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user_info')) || null; }
    catch { return null; }
  });

  const login = useCallback(async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, username: uname } = res.data;
    localStorage.setItem('jwt_token', token);
    const userObj = { username: uname };
    localStorage.setItem('user_info', JSON.stringify(userObj));
    setUser(userObj);
    return res.data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
