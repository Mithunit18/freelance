/**
 * Format a date string or Date object to a readable format
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'Not specified';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return 'Not specified';
    }
    
    return dateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Not specified';
  }
};

/**
 * Format a date to ISO string for API calls
 */
export const toISODate = (date: string | Date | null | undefined): string | null => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return null;
    return dateObj.toISOString();
  } catch {
    return null;
  }
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number | string, currency: string = 'INR'): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(num);
};

/**
 * Format time ago
 */
export const timeAgo = (date: string | Date | number): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};
