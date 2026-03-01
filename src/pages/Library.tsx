import React, { useState, useEffect } from 'react';
import { Filter, Search, SortAsc, BookOpen } from 'lucide-react';
import { Book, UserBook, SearchFilters } from '../types';
import { storageService } from '../services/storage';
import { formatAuthors, getStatusColor, getStatusLabel, sortBooks, filterBooksBySearch } from '../utils';
import { BookCard } from '../components/BookCard';

export const Library: React.FC = () => {
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Array<Book & { userBook: UserBook }>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'date'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadLibraryData();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [userBooks, books, searchTerm, filters, sortBy, sortOrder]);

  const loadLibraryData = () => {
    const userBooksData = storageService.getUserBooks();
    const booksData = storageService.getBooks();
    
    setUserBooks(userBooksData);
    setBooks(booksData);
  };

  const applyFiltersAndSort = () => {
    // Combine books with user book data
    const combinedBooks = userBooks.map(userBook => {
      const book = books.find(b => b.id === userBook.bookId);
      return book ? { ...book, userBook } : null;
    }).filter(Boolean) as Array<Book & { userBook: UserBook }>;

    // Apply search filter
    let filtered = searchTerm 
      ? filterBooksBySearch(combinedBooks, searchTerm)
      : combinedBooks;

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(item => item.userBook.status === filters.status);
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(item => 
        item.userBook.userCategories.includes(filters.category!)
      );
    }

    // Apply author filter
    if (filters.author) {
      filtered = filtered.filter(item =>
        item.author.some(author => 
          author.toLowerCase().includes(filters.author!.toLowerCase())
        )
      );
    }

    // Apply rating filter
    if (filters.rating) {
      filtered = filtered.filter(item => 
        (item.userBook.rating || 0) >= filters.rating!
      );
    }

    // Apply sorting
    const sorted = sortBooks(filtered, sortBy, sortOrder);
    setFilteredBooks(sorted);
  };

  const handleStatusChange = (userBookId: string, newStatus: UserBook['status']) => {
    const updatedUserBooks = userBooks.map(ub => 
      ub.id === userBookId ? { ...ub, status: newStatus } : ub
    );
    setUserBooks(updatedUserBooks);
    
    // Update in storage
    const userBook = updatedUserBooks.find(ub => ub.id === userBookId);
    if (userBook) {
      storageService.updateUserBook(userBook);
    }
  };

  const handleDeleteBook = (userBookId: string) => {
    if (window.confirm('Are you sure you want to remove this book from your library?')) {
      storageService.deleteUserBook(userBookId);
      setUserBooks(prev => prev.filter(ub => ub.id !== userBookId));
    }
  };

  const getStatusCounts = () => {
    const counts = {
      'want-to-read': 0,
      'reading': 0,
      'read': 0,
      'stopped': 0,
    };
    
    userBooks.forEach(ub => {
      counts[ub.status]++;
    });
    
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Library</h1>
        <p className="text-gray-600">Manage your reading collection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="card text-center">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 bg-${getStatusColor(status)}-100`}>
              <BookOpen className={`h-4 w-4 text-${getStatusColor(status)}-600`} />
            </div>
            <p className="text-lg font-semibold text-gray-900">{count}</p>
            <p className="text-sm text-gray-500">{getStatusLabel(status)}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your library..."
              className="input pl-10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="select"
          >
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
            <option value="author-asc">Author A-Z</option>
            <option value="author-desc">Author Z-A</option>
            <option value="date-asc">Date Added (Oldest)</option>
            <option value="date-desc">Date Added (Newest)</option>
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    status: e.target.value as UserBook['status'] || undefined 
                  }))}
                  className="select"
                >
                  <option value="">All Statuses</option>
                  <option value="want-to-read">Want to Read</option>
                  <option value="reading">Reading</option>
                  <option value="read">Read</option>
                  <option value="stopped">Stopped</option>
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  value={filters.author || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    author: e.target.value || undefined 
                  }))}
                  placeholder="Filter by author..."
                  className="input"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    rating: e.target.value ? Number(e.target.value) : undefined 
                  }))}
                  className="select"
                >
                  <option value="">Any Rating</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setFilters({})}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Books ({filteredBooks.length})
          </h2>
        </div>

        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((item) => (
              <BookCard
                key={item.userBook.id}
                book={item}
                className="relative"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || Object.keys(filters).length > 0 
                ? 'No books match your filters' 
                : 'No books in your library'
              }
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters.'
                : 'Start by adding some books to your library.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 