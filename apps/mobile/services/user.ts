import api from '../utils/axiosInstance';

export interface UserResponse {
  name: string;
  message: string;
}

export const userService = {
  async getCurrentUser(): Promise<UserResponse> {
    try {
      console.log('Fetching current user...');
      const response = await api.get<UserResponse>('/api/users/me');
      console.log('User data received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
      });
      throw error;
    }
  },

  async getUserById(userId: number) {
    try {
      const response = await api.get(`/api/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user by ID:', error.message);
      throw error;
    }
  },
};