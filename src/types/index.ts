export interface Book {
  id: string;
  title: string;
  author: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  thumbnail?: string;
  isbn?: string;
  pageCount?: number;
  categories?: string[];
  googleBooksId?: string;
  averageRating?: number;
  ratingsCount?: number;
}

export interface UserBook {
  id: string;
  bookId: string;
  status: 'read' | 'reading' | 'want-to-read' | 'stopped';
  userCategories: string[];
  priority?: number;
  dateAdded: Date;
  dateStarted?: Date;
  dateFinished?: Date;
  rating?: number;
  notes?: string;
  progress?: number; // percentage read
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  description?: string;
  createdAt: Date;
}

export interface GoogleBooksResponse {
  items?: GoogleBookItem[];
  totalItems: number;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
  };
}

export interface ReadingStats {
  totalBooks: number;
  readBooks: number;
  readingBooks: number;
  wantToReadBooks: number;
  stoppedBooks: number;
  averageRating: number;
  booksThisYear: number;
  booksThisMonth: number;
}

export interface SearchFilters {
  status?: UserBook['status'];
  category?: string;
  author?: string;
  rating?: number;
}

export interface RecommendationCriteria {
  basedOnAuthor?: boolean;
  basedOnGenre?: boolean;
  basedOnRating?: boolean;
  includePopular?: boolean;
} 