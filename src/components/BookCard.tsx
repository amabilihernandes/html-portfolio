import React from 'react';
import { Plus, Star, BookOpen } from 'lucide-react';
import { Book } from '../types';
import { formatAuthors, formatRating, getStarRating } from '../utils';

interface BookCardProps {
  book: Book;
  onAdd?: () => void;
  showAddButton?: boolean;
  showRating?: boolean;
  className?: string;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  onAdd,
  showAddButton = false,
  showRating = true,
  className = '',
}) => {
  return (
    <div className={`card hover:shadow-md transition-shadow ${className}`}>
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
            {formatAuthors(book.author)}
          </p>
          
          {book.publisher && (
            <p className="text-xs text-gray-400 truncate">
              {book.publisher}
            </p>
          )}

          {showRating && book.averageRating && (
            <div className="flex items-center mt-1">
              <div className="flex items-center text-xs text-gray-600">
                <Star className="h-3 w-3 text-yellow-400 mr-1" />
                {formatRating(book.averageRating)}
              </div>
              {book.ratingsCount && (
                <span className="text-xs text-gray-400 ml-1">
                  ({book.ratingsCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {book.pageCount && (
            <p className="text-xs text-gray-400 mt-1">
              {book.pageCount} pages
            </p>
          )}
        </div>

        {/* Add Button */}
        {showAddButton && onAdd && (
          <div className="flex-shrink-0">
            <button
              onClick={onAdd}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
              title="Add to library"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 