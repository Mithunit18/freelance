import axiosInstance from '@/utils/axiosInstance';

export type Creator = {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  specialisation?: string;
  bio?: string;
  profileImage?: string;
  profile_photo?: string;
  location?: {
    city?: string;
    country?: string;
  };
  city?: string;
  operating_locations?: string[];
  travel_available?: boolean;
  categories?: string[];
  tags?: string[];
  style_tags?: string[];
  years_experience?: number;
  experience?: string;
  languages?: string[];
  gear?: string[];
  starting_price?: number;
  price_unit?: string;
  currency?: string;
  negotiable?: boolean;
  price?: string;
  portfolioImages?: string[];
  portfolio_images?: string[];
  rating?: number;
  reviews?: number;
  verified?: boolean;
  verification_status?: string;
  profile_live?: boolean;
};

/**
 * Fetch all creators (photographers/videographers)
 */
export const fetchCreators = async (): Promise<Creator[]> => {
  try {
    const response = await axiosInstance.get('/creators');
    return response.data?.creators || response.data || [];
  } catch (error) {
    console.error('Failed to fetch creators:', error);
    return [];
  }
};

/**
 * Fetch creators with filters
 */
export const fetchCreatorsWithFilters = async (filters: {
  category?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  styles?: string[];
}): Promise<Creator[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.location) params.append('location', filters.location);
    if (filters.priceMin) params.append('price_min', filters.priceMin.toString());
    if (filters.priceMax) params.append('price_max', filters.priceMax.toString());
    if (filters.rating) params.append('rating', filters.rating.toString());
    if (filters.styles?.length) params.append('styles', filters.styles.join(','));

    const response = await axiosInstance.get(`/creators?${params.toString()}`);
    return response.data?.creators || response.data || [];
  } catch (error) {
    console.error('Failed to fetch filtered creators:', error);
    return [];
  }
};

/**
 * AI-matched creators based on wizard preferences
 */
export const fetchMatchedCreators = async (preferences: {
  serviceType: string;
  category: string;
  location: string;
  budget: string;
  styles: string[];
}): Promise<Creator[]> => {
  try {
    const response = await axiosInstance.post('/creators/match', preferences);
    return response.data?.creators || response.data || [];
  } catch (error) {
    console.error('Failed to fetch matched creators:', error);
    return [];
  }
};
