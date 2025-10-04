// components/PasswordEntry.jsx
import { Copy, Globe } from 'lucide-react';

const PasswordEntry = ({ title, url, date, isFavorite }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-150 cursor-pointer border border-gray-200 dark:border-gray-700">
      
      {/* Site Icon and Text */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-600/20 rounded-lg text-blue-600 dark:text-blue-400">
          <Globe className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{url}</p>
        </div>
      </div>
      
      {/* Actions and Metadata */}
      <div className="flex items-center space-x-4">
        <span className="hidden sm:inline text-sm text-gray-400 dark:text-gray-500">{date}</span>
        
        {isFavorite && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-yellow-500 fill-current"
            viewBox="0 0 24 24"
          >
            <path d="M12 17.27l6.18 3.73-1.64-7.03 5.46-4.73-7.19-.61L12 2.11 8.19 8.63l-7.19.61 5.46 4.73-1.64 7.03z" />
          </svg>
        )}
        
        <button
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
          aria-label="Copy Password"
        >
          <Copy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PasswordEntry;