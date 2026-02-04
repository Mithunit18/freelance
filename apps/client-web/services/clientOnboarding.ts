import axiosInstance from '@/utils/axiosInstance';

export interface ClientOnboardingData {
  full_name: string;
  phone_number: string;
  gender: string;
  date_of_birth: string;
  profile_photo?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  occupation: string;
  company_name?: string;
  preferred_categories?: string[];
}

export interface ClientOnboardingResponse {
  full_name?: string;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
  profile_photo?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  occupation?: string;
  company_name?: string;
  preferred_categories?: string[];
  onboarding_completed?: boolean;
}

export const clientOnboardingService = {
  /**
   * Submit client onboarding data
   */
  submit: async (data: ClientOnboardingData) => {
    const response = await axiosInstance.post('/api/client/onboarding/submit', data);
    return response.data;
  },

  /**
   * Get existing client onboarding data
   */
  get: async (): Promise<ClientOnboardingResponse | null> => {
    try {
      const response = await axiosInstance.get('/api/client/onboarding/get');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if client has completed onboarding
   */
  checkStatus: async (): Promise<{ completed: boolean }> => {
    try {
      const response = await axiosInstance.get('/api/client/onboarding/status');
      return response.data;
    } catch (error) {
      return { completed: false };
    }
  },

  /**
   * Update client profile data
   */
  update: async (data: Partial<ClientOnboardingData>) => {
    const response = await axiosInstance.put('/api/client/onboarding/update', data);
    return response.data;
  },

  /**
   * Upload profile photo to Cloudinary
   */
  uploadProfilePhoto: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/api/client/onboarding/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },
};
