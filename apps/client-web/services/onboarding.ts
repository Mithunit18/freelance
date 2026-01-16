import axiosInstance from '@/utils/axiosInstance';

export const onboardingService = {
  getStatus: async () => {
    const response = await axiosInstance.get('/api/creator/onboarding/status');
    return response.data;
  },

  start: async () => {
    const response = await axiosInstance.post('/api/creator/onboarding/start');
    return response.data;
  },

  complete: async () => {
    const response = await axiosInstance.post('/api/creator/onboarding/complete');
    return response.data;
  },
};

export const portfolioService = {
  setup: async (data: any) => {
    const response = await axiosInstance.post('/api/creator/portfolio/setup', data);
    return response.data;
  },

  get: async () => {
    const response = await axiosInstance.get('/api/creator/portfolio/get');
    return response.data;
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    console.log("initiated");
    const response = await axiosInstance.post('/api/creator/portfolio/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const pricingService = {
  setup: async (data: any) => {
    const response = await axiosInstance.post('/api/creator/pricing/setup', data);
    return response.data;
  },

  get: async () => {
    const response = await axiosInstance.get('/api/creator/pricing/get');
    return response.data;
  },
};

export const detailsService = {
  setup: async (data: any) => {
    const response = await axiosInstance.post('/api/creator/details/setup', data);
    return response.data;
  },

  get: async () => {
    const response = await axiosInstance.get('/api/creator/details/get');
    return response.data;
  },
};

export const verificationService = {
  submit: async (data: any) => {
    const response = await axiosInstance.post('/api/creator/verification/submit', data);
    return response.data;
  },

  getStatus: async () => {
    const response = await axiosInstance.get('/api/creator/verification/status');
    return response.data;
  },

  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    console.log("initiated");
    const response = await axiosInstance.post('/api/creator/verification/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
