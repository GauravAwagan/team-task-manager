import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.log("Invalid user in localStorage");
        localStorage.removeItem('user');
      }
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);

    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);

    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};