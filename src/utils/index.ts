import { format, formatDistanceToNow } from 'date-fns';

// Generate unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

// Format relative date (e.g., "2 days ago")
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// Format book title for display
export const formatBookTitle = (title: string, maxLength: number = 50): string => {
  return truncateText(title, maxLength);
};

// Format author names
export const formatAuthors = (authors: string[]): string => {
  if (!authors || authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  return `${authors[0]} et al.`;
};

// Get status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'read':
      return 'success';
    case 'reading':
      return 'primary';
    case 'want-to-read':
      return 'warning';
    case 'stopped':
      return 'danger';
    default:
      return 'gray';
  }
};

// Get status label
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'read':
      return 'Read';
    case 'reading':
      return 'Reading';
    case 'want-to-read':
      return 'Want to Read';
    case 'stopped':
      return 'Stopped';
    default:
      return 'Unknown';
  }
};

// Calculate reading progress percentage
export const calculateProgress = (currentPage: number, totalPages: number): number => {
  if (!totalPages || totalPages <= 0) return 0;
  return Math.min(Math.max((currentPage / totalPages) * 100, 0), 100);
};

// Format page count
export const formatPageCount = (pageCount?: number): string => {
  if (!pageCount) return 'Unknown pages';
  return `${pageCount} page${pageCount === 1 ? '' : 's'}`;
};

// Format rating
export const formatRating = (rating?: number): string => {
  if (!rating) return 'No rating';
  return `${rating.toFixed(1)}/5`;
};

// Get star rating display
export const getStarRating = (rating?: number): string => {
  if (!rating) return '☆☆☆☆☆';
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '☆';
  stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  
  return stars;
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Sort books by various criteria
export const sortBooks = <T extends { title: string; author: string[]; publishedDate?: string }>(
  books: T[],
  sortBy: 'title' | 'author' | 'date' | 'rating' = 'title',
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  const sortedBooks = [...books];
  
  sortedBooks.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'author':
        comparison = (a.author[0] || '').localeCompare(b.author[0] || '');
        break;
      case 'date':
        const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
        const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
        comparison = dateA - dateB;
        break;
      case 'rating':
        // This would need to be implemented based on your rating system
        comparison = 0;
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sortedBooks;
};

// Filter books by search term
export const filterBooksBySearch = <T extends { title: string; author: string[]; description?: string }>(
  books: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return books;
  
  const term = searchTerm.toLowerCase();
  return books.filter(book => 
    book.title.toLowerCase().includes(term) ||
    book.author.some(author => author.toLowerCase().includes(term)) ||
    (book.description && book.description.toLowerCase().includes(term))
  );
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get random color for categories
export const getRandomColor = (): string => {
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 