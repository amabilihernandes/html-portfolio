import { Book, GoogleBooksResponse, GoogleBookItem } from '../types';

const GOOGLE_BOOKS_API_BASE = 'https://www.googleapis.com/books/v1';

class ApiService {
  private async fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private transformGoogleBookToBook(googleBook: GoogleBookItem): Book {
    const volumeInfo = googleBook.volumeInfo;
    
    return {
      id: googleBook.id,
      title: volumeInfo.title,
      author: volumeInfo.authors || ['Unknown Author'],
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description,
      thumbnail: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
      isbn: volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
            volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories,
      googleBooksId: googleBook.id,
      averageRating: volumeInfo.averageRating,
      ratingsCount: volumeInfo.ratingsCount,
    };
  }

  async searchBooks(query: string, maxResults: number = 20): Promise<Book[]> {
    try {
      const url = `${GOOGLE_BOOKS_API_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GoogleBooksResponse = await response.json();
      
      if (!data.items) {
        return [];
      }
      
      return data.items.map(item => this.transformGoogleBookToBook(item));
    } catch (error) {
      console.error('Error searching books:', error);
      throw new Error('Failed to search books. Please try again.');
    }
  }

  async getBookById(bookId: string): Promise<Book | null> {
    try {
      const url = `${GOOGLE_BOOKS_API_BASE}/volumes/${bookId}`;
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: GoogleBookItem = await response.json();
      return this.transformGoogleBookToBook(data);
    } catch (error) {
      console.error('Error fetching book by ID:', error);
      throw new Error('Failed to fetch book details. Please try again.');
    }
  }

  async searchBooksByAuthor(author: string, maxResults: number = 20): Promise<Book[]> {
    return this.searchBooks(`inauthor:"${author}"`, maxResults);
  }

  async searchBooksByTitle(title: string, maxResults: number = 20): Promise<Book[]> {
    return this.searchBooks(`intitle:"${title}"`, maxResults);
  }

  async searchBooksByPublisher(publisher: string, maxResults: number = 20): Promise<Book[]> {
    return this.searchBooks(`inpublisher:"${publisher}"`, maxResults);
  }

  async searchBooksBySubject(subject: string, maxResults: number = 20): Promise<Book[]> {
    return this.searchBooks(`subject:"${subject}"`, maxResults);
  }

  async getPopularBooks(subject?: string, maxResults: number = 20): Promise<Book[]> {
    const query = subject ? `subject:"${subject}"` : 'bestseller';
    return this.searchBooks(query, maxResults);
  }

  async getNewReleases(maxResults: number = 20): Promise<Book[]> {
    const currentYear = new Date().getFullYear();
    return this.searchBooks(`published:${currentYear}`, maxResults);
  }

  // Debounced search function for better UX
  private searchTimeout: number | null = null;
  
  async debouncedSearch(query: string, maxResults: number = 20): Promise<Book[]> {
    return new Promise((resolve, reject) => {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      this.searchTimeout = window.setTimeout(async () => {
        try {
          const results = await this.searchBooks(query, maxResults);
          resolve(results);
        } catch (error) {
          reject(error);
        }
      }, 300); // 300ms delay
    });
  }
}

export const apiService = new ApiService();
export default apiService; 