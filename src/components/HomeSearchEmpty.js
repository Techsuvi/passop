// components/HomeSearchEmpty.jsx
import { Plus, Lock } from 'lucide-react';
import Header from './Header'; 

const HomeSearchEmpty = () => {
  return (
    <div className="min-h-screen bg-red-500 dark:bg-red-900 flex flex-col items-center">
      <Header title="All Passwords" showSearch={true} />

      <main className="flex-grow w-full max-w-4xl p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-10 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Lock className="w-16 h-16 text-blue-500 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Passwords Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
            It looks like you haven&apos;t added any passwords yet. Start by creating a new entry.
          </p>
          <button className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:bg-blue-700 transition duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Add New Password
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomeSearchEmpty;