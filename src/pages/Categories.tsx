import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Category, UserBook } from '../types';
import { storageService } from '../services/storage';
import { generateId, getRandomColor } from '../utils';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    description: '',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    const categoriesData = storageService.getCategories();
    const userBooksData = storageService.getUserBooks();
    setCategories(categoriesData);
    setUserBooks(userBooksData);
  };

  const handleCreateCategory = () => {
    if (!formData.name.trim()) return;

    const newCategory: Category = {
      id: generateId(),
      name: formData.name.trim(),
      color: formData.color,
      description: formData.description.trim(),
      createdAt: new Date(),
    };

    storageService.addCategory(newCategory);
    setCategories(prev => [...prev, newCategory]);
    
    // Reset form
    setFormData({ name: '', color: getRandomColor(), description: '' });
    setShowCreateModal(false);
  };

  const handleEditCategory = () => {
    if (!editingCategory || !formData.name.trim()) return;

    const updatedCategory: Category = {
      ...editingCategory,
      name: formData.name.trim(),
      color: formData.color,
      description: formData.description.trim(),
    };

    storageService.updateCategory(updatedCategory);
    setCategories(prev => prev.map(cat => 
      cat.id === editingCategory.id ? updatedCategory : cat
    ));
    
    // Reset form
    setFormData({ name: '', color: getRandomColor(), description: '' });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Books will keep their category assignments.')) {
      return;
    }

    storageService.deleteCategory(categoryId);
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      color: category.color || getRandomColor(),
      description: category.description || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({ name: '', color: getRandomColor(), description: '' });
  };

  const getCategoryBookCount = (categoryId: string) => {
    return userBooks.filter(ub => ub.userCategories.includes(categoryId)).length;
  };

  const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600">Organize your books with custom categories</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getCategoryBookCount(category.id)} books
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditClick(category)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit category"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 mt-2">{category.description}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first category to start organizing your books.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 btn btn-primary"
          >
            Create Category
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCategory) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => {
                setShowCreateModal(false);
                handleCancelEdit();
              }}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter category name..."
                      className="input"
                      maxLength={50}
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                          title={`Select ${color}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Optional description..."
                      className="input"
                      rows={3}
                      maxLength={200}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={editingCategory ? handleEditCategory : handleCreateCategory}
                  disabled={!formData.name.trim()}
                  className="btn btn-primary w-full sm:w-auto sm:ml-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    handleCancelEdit();
                  }}
                  className="btn btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 