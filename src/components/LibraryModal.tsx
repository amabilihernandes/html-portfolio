import React, { useState, useEffect } from 'react';
import { X, BookOpen, Search, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import { UserBook, Book } from '../types';
import { storageService } from '../services/storage';

interface LibraryModalProps {
  onClose: () => void;
  onSearchGlobal: () => void;
}

interface UserBookWithDetails extends UserBook {
  book: Book;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({ onClose, onSearchGlobal }) => {
  const [userBooksWithDetails, setUserBooksWithDetails] = useState<UserBookWithDetails[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<UserBookWithDetails[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('title');

  useEffect(() => {
    loadUserBooks();
  }, []);

  useEffect(() => {
    filterAndSortBooks();
  }, [userBooksWithDetails, selectedStatus, searchTerm, sortBy]);

  const loadUserBooks = () => {
    const userBooks = storageService.getUserBooks();
    const books = storageService.getBooks();
    
    // Combine UserBook with Book details
    const userBooksWithDetails: UserBookWithDetails[] = userBooks
      .map(userBook => {
        const book = books.find(b => b.id === userBook.bookId);
        return book ? { ...userBook, book } : null;
      })
      .filter((item): item is UserBookWithDetails => item !== null);
    
    setUserBooksWithDetails(userBooksWithDetails);
  };

  const filterAndSortBooks = () => {
    let filtered = [...userBooksWithDetails];

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(userBook => userBook.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(userBook => 
        userBook.book.title.toLowerCase().includes(term) ||
        userBook.book.author.some(author => author.toLowerCase().includes(term))
      );
    }

    // Sort books
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.book.title.localeCompare(b.book.title);
        case 'author':
          return a.book.author[0].localeCompare(b.book.author[0]);
        case 'dateAdded':
          return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reading':
        return <Clock className="h-4 w-4" />;
      case 'read':
        return <CheckCircle className="h-4 w-4" />;
      case 'want-to-read':
        return <Star className="h-4 w-4" />;
      case 'stopped':
        return <XCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusCount = (status: string) => {
    return userBooksWithDetails.filter(userBook => userBook.status === status).length;
  };

  const statusOptions = [
    { value: 'all', label: 'All Books', count: userBooksWithDetails.length },
    { value: 'want-to-read', label: 'Want to Read', count: getStatusCount('want-to-read') },
    { value: 'reading', label: 'Currently Reading', count: getStatusCount('reading') },
    { value: 'read', label: 'Read', count: getStatusCount('read') },
    { value: 'stopped', label: 'Stopped', count: getStatusCount('stopped') },
  ];

  const handleUpdateBook = () => {
    loadUserBooks();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Browse Library</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 p-4">
              <div className="space-y-4">
                {/* Search Global Button */}
                <button
                  onClick={onSearchGlobal}
                  className="w-full btn btn-primary flex items-center justify-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search Global
                </button>

                {/* Status Filters */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Filter by Status</h3>
                  <div className="space-y-2">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedStatus(option.value)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedStatus === option.value
                            ? 'bg-primary-100 text-primary-700 border border-primary-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center">
                          {option.value !== 'all' && getStatusIcon(option.value)}
                          <span className="ml-2">{option.label}</span>
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {option.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Sort by</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="title">Title</option>
                    <option value="author">Author</option>
                    <option value="dateAdded">Date Added</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search your library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Books Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {filteredBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm || selectedStatus !== 'all' ? 'No books found' : 'No books in your library'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Start by adding some books to your library'
                      }
                    </p>
                    {!searchTerm && selectedStatus === 'all' && (
                      <button
                        onClick={onSearchGlobal}
                        className="btn btn-primary"
                      >
                        Add Your First Book
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBooks.map((userBookWithDetails) => (
                      <UserBookCard
                        key={userBookWithDetails.id}
                        userBook={userBookWithDetails}
                        onUpdate={handleUpdateBook}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// UserBookCard component for displaying user books with status
interface UserBookCardProps {
  userBook: UserBookWithDetails;
  onUpdate: () => void;
}

const UserBookCard: React.FC<UserBookCardProps> = ({ userBook, onUpdate }) => {
  const { book } = userBook;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reading':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-green-100 text-green-800';
      case 'want-to-read':
        return 'bg-yellow-100 text-yellow-800';
      case 'stopped':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reading':
        return 'Reading';
      case 'read':
        return 'Read';
      case 'want-to-read':
        return 'Want to Read';
      case 'stopped':
        return 'Stopped';
      default:
        return status;
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex space-x-4">
        {/* Book Cover */}
        <div className="flex-shrink-0">
          {book.thumbnail ? (
            <img
              src={book.thumbnail}
              alt={book.title}
              className="w-16 h-20 object-cover rounded shadow-sm"
            />
          ) : (
            <div className="w-16 h-20 bg-gray-200 rounded shadow-sm flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">
            {book.title}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {book.author.join(', ')}
          </p>
          
          {/* Status Badge */}
          <div className="mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(userBook.status)}`}>
              {getStatusLabel(userBook.status)}
            </span>
          </div>

          {/* User Rating */}
          {userBook.rating && (
            <div className="flex items-center mt-2">
              <div className="flex items-center text-xs text-gray-600">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                {userBook.rating}/5
              </div>
            </div>
          )}

          {/* Progress */}
          {userBook.progress && userBook.status === 'reading' && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${userBook.progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{userBook.progress}% read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 