import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [role, setRole] = useState('VIEWER');
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check saved token on load
    const savedToken = localStorage.getItem('resolve_token');
    if (savedToken) {
      setToken(savedToken);
      fetchMe(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (authToken) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setOrganization(data.organization);
        setRole(data.role);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Auth fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = (authToken, userData, orgData, userRole) => {
    localStorage.setItem('resolve_token', authToken);
    setToken(authToken);
    setUser(userData);
    setOrganization(orgData);
    setRole(userRole || 'OWNER');
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('resolve_token');
    setToken(null);
    setUser(null);
    setOrganization(null);
    setRole('VIEWER');
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        role,
        token,
        loading,
        login,
        logout,
        fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
