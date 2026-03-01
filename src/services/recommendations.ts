import { Book, UserBook, RecommendationCriteria } from '../types';
import { storageService } from './storage';
import { apiService } from './api';

class RecommendationService {
  async getRecommendations(criteria: RecommendationCriteria = {}): Promise<Book[]> {
    const userBooks = storageService.getUserBooks();
    const readBooks = userBooks.filter(ub => ub.status === 'read');
    const wantToReadBooks = userBooks.filter(ub => ub.status === 'want-to-read');
    
    const recommendations: Book[] = [];
    
    // Get all books from storage to avoid duplicates
    const existingBooks = storageService.getBooks();
    
    // Author-based recommendations
    if (criteria.basedOnAuthor && readBooks.length > 0) {
      const authorRecommendations = await this.getAuthorBasedRecommendations(readBooks, existingBooks);
      recommendations.push(...authorRecommendations);
    }
    
    // Genre-based recommendations
    if (criteria.basedOnGenre && readBooks.length > 0) {
      const genreRecommendations = await this.getGenreBasedRecommendations(readBooks, existingBooks);
      recommendations.push(...genreRecommendations);
    }
    
    // Rating-based recommendations
    if (criteria.basedOnRating && readBooks.length > 0) {
      const ratingRecommendations = await this.getRatingBasedRecommendations(readBooks, existingBooks);
      recommendations.push(...ratingRecommendations);
    }
    
    // Popular books recommendations
    if (criteria.includePopular) {
      const popularRecommendations = await this.getPopularRecommendations(existingBooks);
      recommendations.push(...popularRecommendations);
    }
    
    // Remove duplicates and limit results
    const uniqueRecommendations = this.removeDuplicates(recommendations);
    return uniqueRecommendations.slice(0, 20);
  }

  async getNextToRead(): Promise<Book[]> {
    const userBooks = storageService.getUserBooks();
    const wantToReadBooks = userBooks
      .filter(ub => ub.status === 'want-to-read')
      .sort((a, b) => (a.priority || 999) - (b.priority || 999));
    
    const books = storageService.getBooks();
    const nextBooks: Book[] = [];
    
    for (const userBook of wantToReadBooks.slice(0, 5)) {
      const book = books.find(b => b.id === userBook.bookId);
      if (book) {
        nextBooks.push(book);
      }
    }
    
    return nextBooks;
  }

  async getSimilarBooks(bookId: string): Promise<Book[]> {
    const books = storageService.getBooks();
    const targetBook = books.find(b => b.id === bookId);
    
    if (!targetBook) {
      return [];
    }
    
    const similarBooks: Book[] = [];
    
    // Find books by same author
    if (targetBook.author.length > 0) {
      try {
        const authorBooks = await apiService.searchBooksByAuthor(targetBook.author[0], 10);
        similarBooks.push(...authorBooks.filter(b => b.id !== bookId));
      } catch (error) {
        console.error('Error fetching author books:', error);
      }
    }
    
    // Find books in same categories
    if (targetBook.categories && targetBook.categories.length > 0) {
      for (const category of targetBook.categories.slice(0, 2)) {
        try {
          const categoryBooks = await apiService.searchBooksBySubject(category, 5);
          similarBooks.push(...categoryBooks.filter(b => b.id !== bookId));
        } catch (error) {
          console.error('Error fetching category books:', error);
        }
      }
    }
    
    // Remove duplicates and limit results
    const uniqueSimilarBooks = this.removeDuplicates(similarBooks);
    return uniqueSimilarBooks.slice(0, 10);
  }

  private async getAuthorBasedRecommendations(readBooks: UserBook[], existingBooks: Book[]): Promise<Book[]> {
    const recommendations: Book[] = [];
    const books = storageService.getBooks();
    
    // Get unique authors from read books
    const authors = new Set<string>();
    readBooks.forEach(userBook => {
      const book = books.find(b => b.id === userBook.bookId);
      if (book && book.author.length > 0) {
        authors.add(book.author[0]);
      }
    });
    
    // Get new books by these authors
    for (const author of Array.from(authors).slice(0, 3)) {
      try {
        const authorBooks = await apiService.searchBooksByAuthor(author, 5);
        const newBooks = authorBooks.filter(book => 
          !existingBooks.find(eb => eb.id === book.id) &&
          !readBooks.find(rb => rb.bookId === book.id)
        );
        recommendations.push(...newBooks);
      } catch (error) {
        console.error('Error fetching author recommendations:', error);
      }
    }
    
    return recommendations;
  }

  private async getGenreBasedRecommendations(readBooks: UserBook[], existingBooks: Book[]): Promise<Book[]> {
    const recommendations: Book[] = [];
    const books = storageService.getBooks();
    
    // Get categories from read books
    const categories = new Set<string>();
    readBooks.forEach(userBook => {
      const book = books.find(b => b.id === userBook.bookId);
      if (book && book.categories) {
        book.categories.forEach(category => categories.add(category));
      }
    });
    
    // Get books in these categories
    for (const category of Array.from(categories).slice(0, 3)) {
      try {
        const categoryBooks = await apiService.searchBooksBySubject(category, 5);
        const newBooks = categoryBooks.filter(book => 
          !existingBooks.find(eb => eb.id === book.id) &&
          !readBooks.find(rb => rb.bookId === book.id)
        );
        recommendations.push(...newBooks);
      } catch (error) {
        console.error('Error fetching category recommendations:', error);
      }
    }
    
    return recommendations;
  }

  private async getRatingBasedRecommendations(readBooks: UserBook[], existingBooks: Book[]): Promise<Book[]> {
    const recommendations: Book[] = [];
    const books = storageService.getBooks();
    
    // Get highly rated books (4+ stars)
    const highlyRatedBooks = readBooks.filter(ub => (ub.rating || 0) >= 4);
    
    if (highlyRatedBooks.length === 0) {
      return recommendations;
    }
    
    // Get categories from highly rated books
    const categories = new Set<string>();
    highlyRatedBooks.forEach(userBook => {
      const book = books.find(b => b.id === userBook.bookId);
      if (book && book.categories) {
        book.categories.forEach(category => categories.add(category));
      }
    });
    
    // Get highly rated books in these categories
    for (const category of Array.from(categories).slice(0, 2)) {
      try {
        const categoryBooks = await apiService.searchBooksBySubject(category, 10);
        const highlyRatedNewBooks = categoryBooks.filter(book => 
          !existingBooks.find(eb => eb.id === book.id) &&
          !readBooks.find(rb => rb.bookId === book.id) &&
          (book.averageRating || 0) >= 4
        );
        recommendations.push(...highlyRatedNewBooks);
      } catch (error) {
        console.error('Error fetching rating-based recommendations:', error);
      }
    }
    
    return recommendations;
  }

  private async getPopularRecommendations(existingBooks: Book[]): Promise<Book[]> {
    const recommendations: Book[] = [];
    
    try {
      const popularBooks = await apiService.getPopularBooks(undefined, 10);
      const newBooks = popularBooks.filter(book => 
        !existingBooks.find(eb => eb.id === book.id)
      );
      recommendations.push(...newBooks);
    } catch (error) {
      console.error('Error fetching popular recommendations:', error);
    }
    
    return recommendations;
  }

  private removeDuplicates(books: Book[]): Book[] {
    const seen = new Set<string>();
    return books.filter(book => {
      if (seen.has(book.id)) {
        return false;
      }
      seen.add(book.id);
      return true;
    });
  }

  // Suggest next book when finishing current
  async suggestNextBook(): Promise<Book | null> {
    const nextBooks = await this.getNextToRead();
    return nextBooks.length > 0 ? nextBooks[0] : null;
  }

  // Get trending books in user's preferred categories
  async getTrendingBooks(): Promise<Book[]> {
    const userBooks = storageService.getUserBooks();
    const books = storageService.getBooks();
    
    // Get user's preferred categories
    const categories = new Set<string>();
    userBooks.forEach(userBook => {
      const book = books.find(b => b.id === userBook.bookId);
      if (book && book.categories) {
        book.categories.forEach(category => categories.add(category));
      }
    });
    
    const trendingBooks: Book[] = [];
    
    for (const category of Array.from(categories).slice(0, 2)) {
      try {
        const categoryBooks = await apiService.getPopularBooks(category, 5);
        trendingBooks.push(...categoryBooks);
      } catch (error) {
        console.error('Error fetching trending books:', error);
      }
    }
    
    return this.removeDuplicates(trendingBooks).slice(0, 10);
  }
}

export const recommendationService = new RecommendationService();
export default recommendationService; 