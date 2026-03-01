import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  Search
} from 'lucide-react';
import { ReadingStats, Book } from '../types';
import { storageService } from '../services/storage';
import { recommendationService } from '../services/recommendations';
import { formatDate, getStatusColor, getStatusLabel } from '../utils';
import { SearchModal } from '../components/SearchModal';
import { LibraryModal } from '../components/LibraryModal';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ReadingStats>({
    totalBooks: 0,
    readBooks: 0,
    readingBooks: 0,
    wantToReadBooks: 0,
    stoppedBooks: 0,
    averageRating: 0,
    booksThisYear: 0,
    booksThisMonth: 0,
  });
  const [nextBooks, setNextBooks] = useState<Book[]>([]);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLibraryModal, setShowLibraryModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load reading statistics
      const readingStats = storageService.getReadingStats();
      setStats(readingStats);
      
      // Load next books to read
      const nextToRead = await recommendationService.getNextToRead();
      setNextBooks(nextToRead);
      
      // Load recommendations
      const recs = await recommendationService.getRecommendations({
        basedOnAuthor: true,
        basedOnGenre: true,
        includePopular: true,
      });
      setRecommendations(recs);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAdded = () => {
    // Reload dashboard data when a book is added
    loadDashboardData();
    setShowSearchModal(false);
  };

  const statCards = [
    {
      title: 'Total Books',
      value: stats.totalBooks,
      icon: BookOpen,
      color: 'blue',
      description: 'In your library',
    },
    {
      title: 'Read',
      value: stats.readBooks,
      icon: CheckCircle,
      color: 'green',
      description: 'Completed books',
    },
    {
      title: 'Reading',
      value: stats.readingBooks,
      icon: Clock,
      color: 'blue',
      description: 'Currently reading',
    },
    {
      title: 'Want to Read',
      value: stats.wantToReadBooks,
      icon: Star,
      color: 'yellow',
      description: 'In your wishlist',
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'yellow':
        return 'bg-yellow-50 text-yellow-600';
      case 'red':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Welcome back! Here's your reading overview.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center">
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reading Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* This Year's Progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">This Year</h3>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Books read this year</span>
              <span className="font-medium">{stats.booksThisYear}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Books read this month</span>
              <span className="font-medium">{stats.booksThisMonth}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Average rating</span>
              <span className="font-medium">{stats.averageRating.toFixed(1)}/5</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="w-full btn btn-primary flex items-center justify-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Book
            </button>
            <button 
              onClick={() => setShowLibraryModal(true)}
              className="w-full btn btn-secondary flex items-center justify-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Library
            </button>
          </div>
        </div>
      </div>

      {/* Next to Read */}
      {nextBooks.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Next to Read</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nextBooks.slice(0, 3).map((book) => (
              <div key={book.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                {book.thumbnail ? (
                  <img 
                    src={book.thumbnail} 
                    alt={book.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {book.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {book.author.join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((book) => (
              <div key={book.id} className="text-center">
                {book.thumbnail ? (
                  <img 
                    src={book.thumbnail} 
                    alt={book.title}
                    className="w-20 h-28 object-cover rounded mx-auto mb-2"
                  />
                ) : (
                  <div className="w-20 h-28 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {book.title}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {book.author.join(', ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <SearchModal
          onClose={() => setShowSearchModal(false)}
          onBookAdded={handleBookAdded}
        />
      )}

      {/* Library Modal */}
      {showLibraryModal && (
        <LibraryModal
          onClose={() => setShowLibraryModal(false)}
          onSearchGlobal={() => {
            setShowLibraryModal(false);
            setShowSearchModal(true);
          }}
        />
      )}
    </div>
  );
}; 