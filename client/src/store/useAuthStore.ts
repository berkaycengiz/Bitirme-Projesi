import { create } from 'zustand';
import api from '../services/api';

interface AuthState {
  token: string | null;
  role: string | null;
  username: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Read initial values from localStorage with protection against corrupt values
  const savedToken = localStorage.getItem('token');
  const parsedToken = (savedToken && savedToken !== 'undefined' && savedToken !== 'null') ? savedToken : null;

  const savedRole = localStorage.getItem('role');
  const parsedRole = (savedRole && savedRole !== 'undefined' && savedRole !== 'null') ? savedRole.toLowerCase() : null;

  const savedUsername = localStorage.getItem('username');
  const parsedUsername = (savedUsername && savedUsername !== 'undefined' && savedUsername !== 'null') ? savedUsername : null;

  return {
    token: parsedToken,
    role: parsedRole,
    username: parsedUsername,
    isAuthenticated: !!parsedToken,

    login: async (username, password) => {
      try {
        const response = await api.post('/api/auth/login', { username, password });
        const data = response.data;

        if (data.isSuccess && data.token) {
          const lowerRole = data.role.toLowerCase();
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', lowerRole);
          localStorage.setItem('username', username);

          set({
            token: data.token,
            role: lowerRole,
            username: username,
            isAuthenticated: true,
          });

          return { success: true, message: data.message || 'Giriş başarılı.' };
        } else {
          return { success: false, message: data.message || 'Giriş başarısız.' };
        }
      } catch (error: any) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || 'Sunucu ile bağlantı kurulamadı.';
        return { success: false, message: errorMessage };
      }
    },

    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      set({
        token: null,
        role: null,
        username: null,
        isAuthenticated: false,
      });
    },
  };
});
