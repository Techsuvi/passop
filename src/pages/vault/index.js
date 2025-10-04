import { useEffect, useState, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Home, PlusCircle, Settings, Search, Eye, EyeOff, Trash2, X, Lock, Save, User } from 'lucide-react';

// --- 1. FIREBASE SETUP & GLOBAL VARIABLES (MANDATORY) ---

// Retrieve global variables provided by the environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Component for the Add Credential Modal (replaces prompt)
const AddCredentialModal = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && username && password) {
      onSave({ name, username, password, url, createdAt: serverTimestamp() });
      onClose();
    } else {
      // Use a custom UI element for error/warning instead of alert()
      console.warn("Please fill in Name, Username, and Password.");
    }
  };

  const handleClose = () => {
    // Reset form fields on close
    setName('');
    setUsername('');
    setPassword('');
    setUrl('');
    setIsPasswordVisible(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 border border-slate-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-3">
            <h2 className="text-2xl font-bold text-white flex items-center">
                <Lock className="w-6 h-6 mr-2 text-violet-400" />
                Add New Credential
            </h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-white transition p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="App/Website Name (e.g., GitHub)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-slate-700 bg-slate-700 text-white rounded-lg focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400"
              required
            />
            <input
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-700 bg-slate-700 text-white rounded-lg focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400"
              required
            />
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-slate-700 bg-slate-700 text-white rounded-lg focus:ring-violet-500 focus:border-violet-500 pr-12 placeholder-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-violet-400"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              >
                {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <input
              type="url"
              placeholder="Website URL (Optional, for logo: https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-slate-700 bg-slate-700 text-white rounded-lg focus:ring-violet-500 focus:border-violet-500 placeholder-slate-400"
            />
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 bg-violet-600 text-white font-semibold rounded-lg shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition duration-200"
            >
              <Save className="w-5 h-5 mr-2" />
              Save Credential
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [credentials, setCredentials] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showPasswordIds, setShowPasswordIds] = useState([]);
  const [activeTab, setActiveTab] = useState("vault");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Firebase States
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 2. FIREBASE INITIALIZATION AND AUTHENTICATION ---
  useEffect(() => {
    if (!firebaseConfig) {
      console.error("Firebase config is missing.");
      setIsLoading(false);
      return;
    }

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const authInstance = getAuth(app);

    setDb(firestore);

    const authenticate = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(authInstance, initialAuthToken);
        } else {
          await signInAnonymously(authInstance);
        }
      } catch (error) {
        console.error("Firebase Auth Error:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null); 
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });

    authenticate();
    return () => unsubscribe();
  }, []);

  // --- 3. FIRESTORE REAL-TIME DATA LISTENER (onSnapshot) ---
  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;

    // Path for private user data: /artifacts/{appId}/users/{userId}/credentials
    const credentialsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'credentials');
    const q = query(credentialsCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCredentials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by creation time (newest first)
      fetchedCredentials.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      
      setCredentials(fetchedCredentials);
    }, (error) => {
      console.error("Firestore Listener Error:", error);
    });

    return () => unsubscribe();
  }, [db, isAuthReady, userId]);

  // --- 4. SEARCH AND FILTER LOGIC ---
  useEffect(() => {
    const filteredList = credentials.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredList);
  }, [search, credentials]);

  // --- 5. CRUD OPERATIONS ---

  const handleAddCredential = async (newCred) => {
    if (!db || !userId) return;
    try {
      const credentialsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'credentials');
      await addDoc(credentialsCollectionRef, newCred);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const handleDeleteCredential = async (credentialId) => {
    if (!db || !userId) return;
    try {
      const docRef = doc(db, 'artifacts', appId, 'users', userId, 'credentials', credentialId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const togglePassword = (id) => {
    setShowPasswordIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // --- 6. LOADING AND ERROR STATES ---
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900 text-violet-500">
        <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span className="text-lg font-semibold text-white">Loading Vault...</span>
      </div>
    );
  }

  const isSearchEmpty = search.length > 0 && filtered.length === 0;

  // --- 7. MAIN RENDER ---
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col relative font-sans">
      
      {/* Header */}
      <div className="sticky top-0 bg-slate-800 text-white px-6 py-4 flex justify-between items-center shadow-lg shadow-black/20 z-10 border-b border-slate-700">
        <h1 className="text-3xl font-extrabold tracking-tight text-violet-400">OnePass Vault</h1>
        <div className="flex items-center space-x-2 text-sm">
            <User className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline-block font-mono text-slate-300 truncate max-w-xs">{userId || 'Guest User'}</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pt-4 pb-24">
        
        {/* Search */}
        <div className="px-6 py-4">
          <div className="flex items-center bg-slate-800 rounded-xl px-4 py-2 shadow-inner border border-slate-700">
            <Search className="w-5 h-5 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search by name or username..."
              className="flex-1 outline-none text-white text-base bg-slate-800 placeholder-slate-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 space-y-4">
          
          {/* Search Results Count */}
          {search.length > 0 && filtered.length > 0 && (
             <p className="text-sm text-slate-400 mt-2 font-medium">
                Found <span className="text-violet-400 font-semibold">{filtered.length} matches</span> for **&quot;{search}&quot;**
            </p>
          )}

          {/* Search Empty State */}
          {isSearchEmpty && (
            <div className="text-center p-10 bg-slate-800 rounded-xl shadow-inner border border-dashed border-violet-700 mt-6">
              <Search className="w-12 h-12 text-violet-500 mx-auto mb-4" />
              <p className="text-white text-lg font-medium">No results found for **&quot;{search}&quot;**.</p>
              <p className="text-sm text-slate-400 mt-1">Try a different name or username.</p>
            </div>
          )}

          {/* Initial Empty State (No credentials and no search term) */}
          {credentials.length === 0 && search.length === 0 && (
            <div className="text-center p-10 bg-slate-800 rounded-xl shadow-lg border border-slate-700 mt-6">
              <Lock className="w-16 h-16 text-violet-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Your Vault is Empty</h2>
              <p className="text-slate-400 mb-6">Start managing your digital life securely by adding your first credential.</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center mx-auto px-6 py-3 bg-violet-600 text-white font-semibold rounded-full shadow-lg shadow-violet-500/30 hover:bg-violet-700 transition duration-200"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add New Password
              </button>
            </div>
          )}

          {/* Credential Cards */}
          {filtered.length > 0 && (
            <div className="space-y-4">
              {filtered.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-800 p-4 rounded-xl shadow-md hover:shadow-xl transition border border-slate-700"
                >
                  {/* Left Side: Logo and Details */}
                  <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                    {/* Logo/Favicon */}
                    {c.url ? (
                      <img
                        src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&amp;url=${c.url}&amp;size=64`}
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/64x64/334155/C7D2FE?text=${c.name[0]?.toUpperCase() || '?'}`}}
                        className="w-10 h-10 rounded-full border border-slate-600 object-contain flex-shrink-0"
                        alt={`${c.name} logo`}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-violet-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-violet-400 font-bold text-lg">{c.name[0]?.toUpperCase() || '?'}</span>
                      </div>
                    )}
                    <div>
                      <h2 className="text-white font-semibold text-lg">{c.name}</h2>
                      <p className="text-slate-400 text-sm">{c.username}</p>
                    </div>
                  </div>

                  {/* Right Side: Password and Actions */}
                  <div className="flex items-center space-x-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <span className="font-mono bg-slate-700 text-violet-300 px-3 py-1 rounded-lg text-sm flex-1 truncate">
                      {showPasswordIds.includes(c.id) ? c.password : "••••••••••••"}
                    </span>
                    <button
                      onClick={() => togglePassword(c.id)}
                      className="p-2 rounded-full hover:bg-slate-700 transition flex-shrink-0"
                      aria-label={showPasswordIds.includes(c.id) ? "Hide password" : "Show password"}
                    >
                      {showPasswordIds.includes(c.id) ? (
                        <EyeOff size={20} className="text-violet-400" />
                      ) : (
                        <Eye size={20} className="text-slate-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCredential(c.id)}
                      className="p-2 rounded-full hover:bg-red-900/50 transition flex-shrink-0"
                      aria-label="Delete credential"
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-800 shadow-t-lg py-2 flex justify-around items-center border-t border-slate-700 z-20">
        
        {/* Vault */}
        <button
          onClick={() => setActiveTab("vault")}
          className="flex flex-col items-center text-center focus:outline-none p-2"
        >
          <Home
            size={24}
            className={`${activeTab === "vault" ? "text-violet-400" : "text-slate-500"}`}
          />
          <span className={`text-xs mt-1 font-medium ${activeTab === "vault" ? "text-violet-400" : "text-slate-500"}`}>
            Vault
          </span>
        </button>

        {/* Add Button (Center/Floating) */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center text-center focus:outline-none -mt-6 p-4 bg-violet-600 rounded-full shadow-xl shadow-violet-500/50 hover:bg-violet-700 transition duration-200 transform hover:scale-105"
          aria-label="Add new credential"
        >
          <PlusCircle
            size={36}
            className="text-white"
          />
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab("settings")}
          className="flex flex-col items-center text-center focus:outline-none p-2"
        >
          <Settings
            size={24}
            className={`${activeTab === "settings" ? "text-violet-400" : "text-slate-500"}`}
          />
          <span className={`text-xs mt-1 font-medium ${activeTab === "settings" ? "text-violet-400" : "text-slate-500"}`}>
            Settings
          </span>
        </button>
      </div>

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddCredential}
      />
    </div>
  );
}
