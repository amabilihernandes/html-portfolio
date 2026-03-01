import { Book, UserBook, Category, ReadingStats } from '../types';

const STORAGE_KEYS = {
  BOOKS: 'booktracker_books',
  USER_BOOKS: 'booktracker_user_books',
  CATEGORIES: 'booktracker_categories',
  SETTINGS: 'booktracker_settings',
} as const;

class StorageService {
  // Books storage
  saveBooks(books: Book[]): void {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }

  getBooks(): Book[] {
    const books = localStorage.getItem(STORAGE_KEYS.BOOKS);
    return books ? JSON.parse(books) : [];
  }

  addBook(book: Book): void {
    const books = this.getBooks();
    if (!books.find(b => b.id === book.id)) {
      books.push(book);
      this.saveBooks(books);
    }
  }

  // User books storage
  saveUserBooks(userBooks: UserBook[]): void {
    localStorage.setItem(STORAGE_KEYS.USER_BOOKS, JSON.stringify(userBooks));
  }

  getUserBooks(): UserBook[] {
    const userBooks = localStorage.getItem(STORAGE_KEYS.USER_BOOKS);
    return userBooks ? JSON.parse(userBooks) : [];
  }

  addUserBook(userBook: UserBook): void {
    const userBooks = this.getUserBooks();
    const existingIndex = userBooks.findIndex(ub => ub.bookId === userBook.bookId);
    
    if (existingIndex >= 0) {
      userBooks[existingIndex] = userBook;
    } else {
      userBooks.push(userBook);
    }
    
    this.saveUserBooks(userBooks);
  }

  updateUserBook(userBook: UserBook): void {
    const userBooks = this.getUserBooks();
    const index = userBooks.findIndex(ub => ub.id === userBook.id);
    
    if (index >= 0) {
      userBooks[index] = userBook;
      this.saveUserBooks(userBooks);
    }
  }

  deleteUserBook(userBookId: string): void {
    const userBooks = this.getUserBooks();
    const filteredBooks = userBooks.filter(ub => ub.id !== userBookId);
    this.saveUserBooks(filteredBooks);
  }

  getUserBookByBookId(bookId: string): UserBook | undefined {
    const userBooks = this.getUserBooks();
    return userBooks.find(ub => ub.bookId === bookId);
  }

  getUserBooksByStatus(status: UserBook['status']): UserBook[] {
    const userBooks = this.getUserBooks();
    return userBooks.filter(ub => ub.status === status);
  }

  // Categories storage
  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  getCategories(): Category[] {
    const categories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return categories ? JSON.parse(categories) : [];
  }

  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.saveCategories(categories);
  }

  updateCategory(category: Category): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    
    if (index >= 0) {
      categories[index] = category;
      this.saveCategories(categories);
    }
  }

  deleteCategory(categoryId: string): void {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(c => c.id !== categoryId);
    this.saveCategories(filteredCategories);
  }

  // Reading stats
  getReadingStats(): ReadingStats {
    const userBooks = this.getUserBooks();
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const readBooks = userBooks.filter(ub => ub.status === 'read');
    const readingBooks = userBooks.filter(ub => ub.status === 'reading');
    const wantToReadBooks = userBooks.filter(ub => ub.status === 'want-to-read');
    const stoppedBooks = userBooks.filter(ub => ub.status === 'stopped');

    const booksThisYear = readBooks.filter(ub => 
      ub.dateFinished && new Date(ub.dateFinished).getFullYear() === currentYear
    ).length;

    const booksThisMonth = readBooks.filter(ub => 
      ub.dateFinished && 
      new Date(ub.dateFinished).getFullYear() === currentYear &&
      new Date(ub.dateFinished).getMonth() === currentMonth
    ).length;

    const averageRating = readBooks.length > 0 
      ? readBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0) / readBooks.length
      : 0;

    return {
      totalBooks: userBooks.length,
      readBooks: readBooks.length,
      readingBooks: readingBooks.length,
      wantToReadBooks: wantToReadBooks.length,
      stoppedBooks: stoppedBooks.length,
      averageRating: Math.round(averageRating * 10) / 10,
      booksThisYear,
      booksThisMonth,
    };
  }

  // Settings storage
  saveSettings(settings: any): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getSettings(): any {
    const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : {};
  }

  // Utility methods
  clearAllData(): void {
    const keys = Object.keys(STORAGE_KEYS) as Array<keyof typeof STORAGE_KEYS>;
    keys.forEach((key) => {
      localStorage.removeItem(STORAGE_KEYS[key]);
    });
  }

  exportData(): string {
    const data = {
      books: this.getBooks(),
      userBooks: this.getUserBooks(),
      categories: this.getCategories(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(data: string): boolean {
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.books) this.saveBooks(parsedData.books);
      if (parsedData.userBooks) this.saveUserBooks(parsedData.userBooks);
      if (parsedData.categories) this.saveCategories(parsedData.categories);
      if (parsedData.settings) this.saveSettings(parsedData.settings);
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
export default storageService; 