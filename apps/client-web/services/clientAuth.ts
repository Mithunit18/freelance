import axiosInstance from '@/utils/axiosInstance';

/**
 * Verify the current user session
 * Returns user data if authenticated, null otherwise
 */
export const verifySession = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data?.user || response.data;
  } catch (error) {
    console.error('Session verification failed:', error);
    return null;
  }
};

/**
 * Get current user details
 */
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data?.user || response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

/**
 * Logout current user
 */
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout failed:', error);
    throw error;
  }
};
