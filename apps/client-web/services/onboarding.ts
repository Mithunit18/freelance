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

export interface BankDetailsPayload {
  account_holder_name: string;
  account_number: string;
  confirm_account_number: string;
  ifsc_code: string;
  bank_name?: string;
  branch_name?: string;
}

export interface IFSCValidationResponse {
  valid: boolean;
  bank_name?: string;
  branch_name?: string;
  address?: string;
  city?: string;
  state?: string;
  message: string;
}

export interface BankDetailsStatus {
  has_bank_details: boolean;
  verification_status: string;
  bank_details?: {
    account_holder_name: string;
    account_number_masked: string;
    account_number_last4: string;
    ifsc_code: string;
    bank_name: string;
    branch_name: string;
    verified_at?: string;
  };
}

export const bankDetailsService = {
  /**
   * Validate IFSC code and get bank/branch details
   */
  validateIFSC: async (ifscCode: string): Promise<IFSCValidationResponse> => {
    const response = await axiosInstance.post(`/api/creator/bank/validate-ifsc?ifsc_code=${ifscCode}`);
    return response.data;
  },

  /**
   * Submit bank details for validation and storage
   */
  submit: async (data: BankDetailsPayload) => {
    const response = await axiosInstance.post('/api/creator/bank/submit', data);
    return response.data;
  },

  /**
   * Get current bank details status
   */
  getStatus: async (): Promise<BankDetailsStatus> => {
    const response = await axiosInstance.get('/api/creator/bank/status');
    return response.data;
  },
};
