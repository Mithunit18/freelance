import axiosInstance from '@/utils/axiosInstance';

export type CreatorPackage = {
  id?: string;
  name: string;
  price: string;
  duration: string;
  deliverables?: string[];
  popular?: boolean;
};

export type CreatorReview = {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  date?: string;
  projectType?: string;
};

export type Creator = {
  id: string;
  name?: string;
  full_name?: string;
  role?: string;
  profileImage?: string;
  profile_photo?: string;
  specialisation?: string;
  rating?: number;
  bio?: string;
  location?: {
    city?: string;
    country?: string;
  };
  city?: string;
  operating_locations?: string[];
  travel_available?: boolean;
  tags?: string[];
  style_tags?: string[];
  categories?: string[];
  verified?: boolean;
  verification_status?: string;
  experience?: string;
  years_experience?: number;
  completedProjects?: number;
  reviews?: CreatorReview[];
  portfolioImages?: string[];
  portfolio_images?: string[];
  gear?: string[];
  packages?: CreatorPackage[];
  languages?: string[];
  starting_price?: number;
  currency?: string;
  price_unit?: string;
  negotiable?: boolean;
  response_time?: string;
  availability?: string[];
};

/**
 * Get a single creator by ID
 */
export const getCreator = async (creatorId: string): Promise<Creator | null> => {
  try {
    // Decode the ID first in case it comes URL-encoded from the router
    const decodedId = decodeURIComponent(creatorId);
    const response = await axiosInstance.get(`/creators/${decodedId}`);
    // Backend returns { success: true, data: {...} }
    const creatorData = response.data?.data || response.data?.creator || null;
    console.log('Creator data fetched:', creatorData);
    return creatorData;
  } catch (error: unknown) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError?.response?.status === 404) {
      console.error('Creator not found:', creatorId);
    } else {
      console.error('Failed to get creator:', error);
    }
    return null;
  }
};

/**
 * Get creator's portfolio
 */
export const getCreatorPortfolio = async (creatorId: string) => {
  try {
    const response = await axiosInstance.get(`/creators/${creatorId}/portfolio`);
    return response.data?.portfolio || response.data || [];
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    return [];
  }
};

/**
 * Get creator's reviews
 */
export const getCreatorReviews = async (creatorId: string): Promise<CreatorReview[]> => {
  try {
    const response = await axiosInstance.get(`/creators/${creatorId}/reviews`);
    return response.data?.reviews || response.data || [];
  } catch (error) {
    console.error('Failed to get reviews:', error);
    return [];
  }
};

/**
 * Submit a project request to a creator
 */
export const requestProject = async (data: {
  creatorId: string;
  clientId: string;
  serviceType?: string;
  category?: string;
  location?: string;
  eventDate: string;
  duration?: number | string;
  styleNotes?: string;
  referenceImages?: Array<{ id: string; name: string; url: string }>;
  pinterestLink?: string;
  budget?: string;
  selectedStyles?: string[];
  message?: string;
  packageId?: string | number;
  packageName: string;
  packagePrice: string | number;
  creatorName?: string;
  creatorSpecialisation?: string;
}) => {
  try {
    // Call the correct backend endpoint
    const response = await axiosInstance.post('/projects/request', data);
    return response.data;
  } catch (error) {
    console.error('Failed to submit request:', error);
    throw error;
  }
};

/**
 * Get request details for a client
 */
export const getRequestDetails = async (clientId: string) => {
  try {
    // Decode in case it comes URL-encoded
    const decodedId = decodeURIComponent(clientId);
    const response = await axiosInstance.get(`/projects/requests/${decodedId}`);
    return response.data?.data || response.data?.requests || [];
  } catch (error) {
    console.error('Failed to get request details:', error);
    return [];
  }
};

/**
 * Get a single request by ID
 */
export const getRequest = async (requestId: string) => {
  try {
    const response = await axiosInstance.get(`/projects/request/${requestId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to get request:', error);
    return null;
  }
};

/**
 * Get all requests sent to a creator
 */
export const getCreatorRequests = async (creatorId: string) => {
  try {
    const decodedId = decodeURIComponent(creatorId);
    const response = await axiosInstance.get(`/projects/creator-requests/${decodedId}`);
    return response.data?.data || response.data?.requests || [];
  } catch (error) {
    console.error('Failed to get creator requests:', error);
    return [];
  }
};

/**
 * Update request status (respond to a project request)
 */
export const updateRequestStatus = async (requestId: string, action: 'accept' | 'decline' | 'negotiate', message?: string) => {
  try {
    const response = await axiosInstance.post(`/project-request/${requestId}/respond`, { 
      action,
      message: message || ''
    });
    return response.data;
  } catch (error) {
    console.error('Failed to update request status:', error);
    throw error;
  }
};

/**
 * Send a negotiation message
 */
export const sendNegotiationMessage = async (requestId: string, data: {
  sender: 'client' | 'creator';
  senderId: string;
  message: string;
  type?: 'text' | 'offer' | 'counter' | 'accepted';
  price?: number;
  deliverables?: string;
}) => {
  try {
    const response = await axiosInstance.post(`/projects/${requestId}/messages`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

/**
 * Get negotiation messages
 */
export const getNegotiationMessages = async (requestId: string) => {
  try {
    const response = await axiosInstance.get(`/projects/${requestId}/messages`);
    return response.data?.messages || [];
  } catch (error) {
    console.error('Failed to get messages:', error);
    return [];
  }
};

/**
 * Accept negotiation offer
 */
export const acceptOffer = async (requestId: string, senderId: string, price: number, deliverables: string) => {
  try {
    const response = await axiosInstance.post(`/projects/${requestId}/messages`, {
      sender: 'client',
      senderId,
      message: 'Offer accepted! Ready to proceed with payment.',
      type: 'accepted',
      price,
      deliverables
    });
    return response.data;
  } catch (error) {
    console.error('Failed to accept offer:', error);
    throw error;
  }
};

/**
 * Counter offer during negotiation
 */
export const counterOffer = async (requestId: string, data: {
  senderId: string;
  price: number;
  deliverables: string;
  message?: string;
}) => {
  try {
    const response = await axiosInstance.post(`/projects/${requestId}/messages`, {
      sender: 'client',
      senderId: data.senderId,
      message: data.message || 'Here is my counter offer',
      type: 'counter',
      price: data.price,
      deliverables: data.deliverables
    });
    return response.data;
  } catch (error) {
    console.error('Failed to send counter offer:', error);
    throw error;
  }
};

/**
 * Get booking details
 */
export const getBooking = async (bookingId: string) => {
  try {
    const response = await axiosInstance.get(`/bookings/${bookingId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error('Failed to get booking:', error);
    return null;
  }
};

/**
 * Get client bookings
 */
export const getClientBookings = async (clientId: string) => {
  try {
    const decodedId = decodeURIComponent(clientId);
    const response = await axiosInstance.get(`/bookings/client/${decodedId}`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Failed to get client bookings:', error);
    return [];
  }
};

/**
 * Confirm event completion
 */
export const confirmEventCompletion = async (bookingId: string, confirmed: boolean, reason?: string) => {
  try {
    const response = await axiosInstance.post(`/bookings/${bookingId}/confirm-event`, {
      confirmed,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Failed to confirm event:', error);
    throw error;
  }
};

/**
 * Submit review
 */
export const submitReview = async (data: {
  bookingId: string;
  clientId: string;
  creatorId: string;
  overallRating: number;
  aspects: Record<string, number>;
  review: string;
  recommend?: boolean;
}) => {
  try {
    const response = await axiosInstance.post('/reviews/create', data);
    return response.data;
  } catch (error) {
    console.error('Failed to submit review:', error);
    throw error;
  }
};

/**
 * Get creator reviews
 */
export const getCreatorReviewsList = async (creatorId: string) => {
  try {
    const decodedId = decodeURIComponent(creatorId);
    const response = await axiosInstance.get(`/reviews/creator/${decodedId}`);
    return response.data?.data || [];
  } catch (error) {
    console.error('Failed to get creator reviews:', error);
    return [];
  }
};

/**
 * Get payment status for a request
 * Returns payment details including status (pending, escrowed, completed)
 */
export const getPaymentStatusByRequest = async (requestId: string) => {
  try {
    const response = await axiosInstance.get(`/escrow/${requestId}/status`);
    if (response.data?.success && response.data?.payment) {
      return response.data.payment;
    }
    return null;
  } catch (error) {
    // No payment found is not an error - it just means payment hasn't been made yet
    return null;
  }
};