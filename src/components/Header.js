// components/Header.jsx
import { Search } from 'lucide-react';

const Header = ({ title, showSearch }) => (
    <header className="sticky top-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{title}</h1>
            {showSearch && (
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your vault..."
                        className="w-full py-2 pl-10 pr-4 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white dark:placeholder-gray-500"
                    />
                </div>
            )}
        </div>
    </header>
);

export default Header;