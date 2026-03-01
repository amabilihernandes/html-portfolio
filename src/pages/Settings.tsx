import React, { useState } from 'react';
import { Download, Upload, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { storageService } from '../services/storage';

export const Settings: React.FC = () => {
  const [importData, setImportData] = useState('');
  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showImportError, setShowImportError] = useState(false);

  const handleExportData = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booktracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = () => {
    if (!importData.trim()) return;

    const success = storageService.importData(importData);
    if (success) {
      setShowImportSuccess(true);
      setImportData('');
      setTimeout(() => setShowImportSuccess(false), 3000);
    } else {
      setShowImportError(true);
      setTimeout(() => setShowImportError(false), 3000);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      storageService.clearAllData();
      window.location.reload();
    }
  };

  const getStats = () => {
    const userBooks = storageService.getUserBooks();
    const books = storageService.getBooks();
    const categories = storageService.getCategories();
    
    return {
      totalBooks: books.length,
      userBooks: userBooks.length,
      categories: categories.length,
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your application preferences and data</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.totalBooks}</div>
          <div className="text-sm text-gray-500">Total Books</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.userBooks}</div>
          <div className="text-sm text-gray-500">Books in Library</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.categories}</div>
          <div className="text-sm text-gray-500">Categories</div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-6">
          {/* Export Data */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Export Data</h4>
            <p className="text-sm text-gray-500 mb-3">
              Download a backup of all your books, categories, and settings.
            </p>
            <button
              onClick={handleExportData}
              className="btn btn-secondary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </button>
          </div>

          {/* Import Data */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Import Data</h4>
            <p className="text-sm text-gray-500 mb-3">
              Restore your data from a previous backup file.
            </p>
            <div className="space-y-3">
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your backup JSON data here..."
                className="input"
                rows={6}
              />
              <div className="flex space-x-3">
                <button
                  onClick={handleImportData}
                  disabled={!importData.trim()}
                  className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </button>
                <button
                  onClick={() => setImportData('')}
                  className="btn btn-secondary"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Clear All Data */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Clear All Data</h4>
            <p className="text-sm text-gray-500 mb-3">
              Permanently delete all your books, categories, and settings. This action cannot be undone.
            </p>
            <button
              onClick={handleClearAllData}
              className="btn btn-danger flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Application Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Information</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Version</span>
            <span className="text-sm text-gray-900">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm text-gray-900">Local Browser Storage</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Data Source</span>
            <span className="text-sm text-gray-900">Google Books API</span>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {showImportSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Data imported successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {showImportError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                Failed to import data. Please check the format.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 