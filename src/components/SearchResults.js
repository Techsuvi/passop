// components/SearchResults.jsx
import PasswordEntry from './PasswordEntry';
import { Search } from 'lucide-react';
import Header from './Header'; 

// Mock data to simulate results
const mockData = [
  { id: 1, title: 'Google Mail', url: 'https://mail.google.com', date: '2 days ago', isFavorite: true },
  { id: 2, title: 'Google Drive', url: 'https://drive.google.com', date: '1 week ago', isFavorite: false },
  { id: 3, title: 'YouTube (Google)', url: 'https://www.youtube.com', date: '4 weeks ago', isFavorite: true },
];

const SearchResults = ({ searchTerm = "google" }) => {
  // Simple filter logic for demonstration
  const filteredData = mockData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.url.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center">
      <Header title="All Passwords" showSearch={true} />

      <main className="flex-grow w-full max-w-4xl p-6 sm:p-8">
        
        {/* Results Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            <span className="text-blue-500">{filteredData.length} Results</span> for **"{searchTerm}"**
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Showing all matches from your vault.</p>
        </div>

        {/* List of Results */}
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((entry) => (
              <PasswordEntry 
                key={entry.id} 
                title={entry.title} 
                url={entry.url} 
                date={entry.date} 
                isFavorite={entry.isFavorite} 
              />
            ))
          ) : (
            // Search Empty State (No Matches)
             <div className="flex flex-col items-center justify-center min-h-[30vh] text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                <Search className="w-16 h-16 text-red-500 mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    No Matches Found
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                    We could not find any entries matching **"{searchTerm}"**. Try refining your search terms.
                </p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchResults;