import axiosInstance from '@/utils/axiosInstance';

export const Auth = {
  signup: async (data: { name: string; email: string; password: string; role:string}) => {
    const response = await axiosInstance.post('/api/auth/signup', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await axiosInstance.post('/api/auth/login', data);
    return response.data;
  },

  me: async () => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      const response = await axiosInstance.post('/api/auth/logout');
      // Clear any client-side auth data if stored
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
      }
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local storage even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        sessionStorage.removeItem('admin_token');
      }
      throw error;
    }
  },
};
