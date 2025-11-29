import api from '@/utils/axiosInstance';

export interface UserResponse {
  name: string;
  message: string;
}

export const userService = {
  async getCurrentUser(): Promise<UserResponse> {
    const response = await api.get<UserResponse>('/api/users/me');
    return response.data;
  },

  async getUserById(userId: number) {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },
};