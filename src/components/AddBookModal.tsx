import React, { useState } from 'react';
import { X, BookOpen, CheckCircle, Clock, Star, AlertCircle } from 'lucide-react';
import { Book, UserBook, Category } from '../types';
import { storageService } from '../services/storage';
import { formatAuthors, getStatusColor, getStatusLabel } from '../utils';

interface AddBookModalProps {
  book: Book;
  onAdd: (status: UserBook['status'], categories: string[]) => void;
  onClose: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({
  book,
  onAdd,
  onClose,
}) => {
  const [status, setStatus] = useState<UserBook['status']>('want-to-read');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategorySelection, setShowCategorySelection] = useState(false);

  const categories = storageService.getCategories();

  const statusOptions: Array<{ value: UserBook['status']; label: string; icon: any }> = [
    { value: 'want-to-read', label: 'Want to Read', icon: Star },
    { value: 'reading', label: 'Currently Reading', icon: Clock },
    { value: 'read', label: 'Finished Reading', icon: CheckCircle },
    { value: 'stopped', label: 'Stopped Reading', icon: AlertCircle },
  ];

  const handleStatusChange = (newStatus: UserBook['status']) => {
    setStatus(newStatus);
    if (newStatus === 'want-to-read') {
      setShowCategorySelection(true);
    } else {
      setShowCategorySelection(false);
      setSelectedCategories([]);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAdd = () => {
    onAdd(status, selectedCategories);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Book to Library</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Book Info */}
            <div className="flex space-x-4 mb-6">
              {book.thumbnail ? (
                <img
                  src={book.thumbnail}
                  alt={book.title}
                  className="w-20 h-28 object-cover rounded shadow-sm"
                />
              ) : (
                <div className="w-20 h-28 bg-gray-200 rounded shadow-sm flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{book.title}</h4>
                <p className="text-sm text-gray-500">{formatAuthors(book.author)}</p>
                {book.publisher && (
                  <p className="text-xs text-gray-400">{book.publisher}</p>
                )}
                {book.pageCount && (
                  <p className="text-xs text-gray-400">{book.pageCount} pages</p>
                )}
              </div>
            </div>

            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reading Status
              </label>
              <div className="space-y-2">
                {statusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        status === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={status === option.value}
                        onChange={() => handleStatusChange(option.value)}
                        className="sr-only"
                      />
                      <Icon className={`h-5 w-5 mr-3 ${
                        status === option.value ? 'text-primary-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        status === option.value ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Category Selection (for want-to-read) */}
            {showCategorySelection && categories.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Categories (Optional)
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="mr-3"
                      />
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: category.color || '#6B7280' }}
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
                {categories.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No categories created yet. You can create categories in Settings.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleAdd}
              className="btn btn-primary w-full sm:w-auto sm:ml-3"
            >
              Add to Library
            </button>
            <button
              onClick={handleClose}
              className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 