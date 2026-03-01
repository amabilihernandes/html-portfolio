import React, { useState, useCallback } from 'react';
import { X, Search as SearchIcon, Plus, BookOpen } from 'lucide-react';
import { Book, UserBook } from '../types';
import { apiService } from '../services/api';
import { storageService } from '../services/storage';
import { generateId, debounce } from '../utils';
import { BookCard } from './BookCard';
import { AddBookModal } from './AddBookModal';

interface SearchModalProps {
  onClose: () => void;
  onBookAdded: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  onClose,
  onBookAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const results = await apiService.debouncedSearch(query, 20);
        setSearchResults(results);
      } catch (err) {
        setError('Failed to search books. Please try again.');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setShowAddModal(true);
  };

  const handleAddBook = (status: UserBook['status'], categories: string[] = []) => {
    if (!selectedBook) return;

    // Add book to storage if not already there
    storageService.addBook(selectedBook);

    // Create user book entry
    const userBook: UserBook = {
      id: generateId(),
      bookId: selectedBook.id,
      status,
      userCategories: categories,
      dateAdded: new Date(),
      priority: status === 'want-to-read' ? Date.now() : undefined,
    };

    // Add to user books
    storageService.addUserBook(userBook);

    // Close modal and reset
    setShowAddModal(false);
    setSelectedBook(null);
    onBookAdded();
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSelectedBook(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Search and Add Book</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by title, author, or ISBN..."
                className="input pl-10"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">
                  Search Results ({searchResults.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {searchResults.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onAdd={() => handleBookSelect(book)}
                      showAddButton={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!loading && searchQuery && searchResults.length === 0 && !error && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">No books found</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Try searching with different keywords or check your spelling.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !searchQuery && (
              <div className="text-center py-12">
                <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h4 className="mt-2 text-sm font-medium text-gray-900">Start searching</h4>
                <p className="mt-1 text-sm text-gray-500">
                  Enter a book title, author, or ISBN to find books.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="btn btn-secondary w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Add Book Modal */}
      {showAddModal && selectedBook && (
        <AddBookModal
          book={selectedBook}
          onAdd={handleAddBook}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}; 