import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Home, PlusCircle, Settings, Search, Eye, EyeOff, Trash2, X, Lock, Save, User, LogOut, Shield } from 'lucide-react';

// --- Theme Colors ---
// Primary Red: #E53E3E (a vibrant, common red)
// Secondary Red: #C53030 (a darker red for hover/accents)
// Light Backgrounds: #FFFFFF, #F7F7F7
// Dark Text/Elements: #1A202C (dark gray/black)
// Subtle Text/Borders: #A0AEC0 (light gray)

// --- Add Credential Modal (Unchanged from previous response) ---
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
    } else console.warn("Please fill in Name, Username, and Password.");
  };

  const handleClose = () => {
    setName(''); setUsername(''); setPassword(''); setUrl(''); setIsPasswordVisible(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 border border-[#E2E8F0]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-[#E2E8F0] pb-3">
            <h2 className="text-2xl font-bold text-[#1A202C] flex items-center">
              <Lock className="w-6 h-6 mr-2 text-[#E53E3E]" />
              Add New Credential
            </h2>
            <button onClick={handleClose} className="text-[#A0AEC0] hover:text-[#1A202C] transition p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="App/Website Name (e.g., GitHub)" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-[#E2E8F0] bg-white text-[#1A202C] rounded-lg focus:ring-[#E53E3E] focus:border-[#E53E3E] placeholder-[#A0AEC0]" required
            />
            <input type="text" placeholder="Username or Email" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-[#E2E8F0] bg-white text-[#1A202C] rounded-lg focus:ring-[#E53E3E] focus:border-[#E53E3E] placeholder-[#A0AEC0]" required
            />
            <div className="relative">
              <input type={isPasswordVisible ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-[#E2E8F0] bg-white text-[#C53030] rounded-lg focus:ring-[#E53E3E] focus:border-[#E53E3E] pr-12 placeholder-[#A0AEC0]" required
              />
              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#A0AEC0] hover:text-[#E53E3E]"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <input type="url" placeholder="Website URL (Optional, for logo: https://example.com)" value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-[#E2E8F0] bg-white text-[#1A202C] rounded-lg focus:ring-[#E53E3E] focus:border-[#E53E3E] placeholder-[#A0AEC0]"
            />
            <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#E53E3E] to-[#C53030] text-white font-semibold rounded-lg shadow-lg shadow-[#E53E3E33] hover:from-[#C53030] hover:to-[#B52C2C] transition duration-200">
              <Save className="w-5 h-5 mr-2" /> Save Credential
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Page Components (Simulating settings.js and account.js) ---

const SettingsPage = ({ setActiveTab }) => (
  <div className="p-6">
    <h2 className="text-3xl font-extrabold text-[#1A202C] mb-6 border-b pb-2 border-[#E2E8F0]">Settings ⚙️</h2>
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-[#E2E8F0]">
      <div className="flex justify-between items-center p-3 rounded-lg border border-[#E2E8F0]">
        <span className="text-[#1A202C] font-medium">Theme</span>
        <span className="text-[#E53E3E] font-semibold">White/Red</span>
      </div>
      <div className="flex justify-between items-center p-3 rounded-lg border border-[#E2E8F0]">
        <span className="text-[#1A202C] font-medium">Backup</span>
        <button className="text-sm px-3 py-1 bg-[#E53E3E] text-white rounded-full hover:bg-[#C53030]">Run Backup</button>
      </div>
      <button 
        onClick={() => { /* Implement logout logic here */ }} 
        className="w-full flex items-center justify-center px-4 py-2 bg-[#E53E3E] text-white font-semibold rounded-lg hover:bg-[#C53030] transition duration-200">
        <LogOut className="w-5 h-5 mr-2" /> Logout
      </button>
    </div>
  </div>
);

const AccountPage = ({ userId, setActiveTab }) => (
  <div className="p-6">
    <h2 className="text-3xl font-extrabold text-[#1A202C] mb-6 border-b pb-2 border-[#E2E8F0]">Account 👤</h2>
    <div className="space-y-4 bg-white p-6 rounded-xl shadow-md border border-[#E2E8F0]">
      <div className="p-3 bg-[#EEEEEE] rounded-lg border border-[#E2E8F0] flex items-center">
        <User className="w-5 h-5 mr-3 text-[#E53E3E]" />
        <div className='truncate'>
          <p className="text-xs text-[#A0AEC0]">User ID</p>
          <p className="font-mono text-[#1A202C] text-sm truncate">{userId || 'Loading...'}</p>
        </div>
      </div>
      <div className="p-3 bg-[#EEEEEE] rounded-lg border border-[#E2E8F0] flex items-center">
        <Shield className="w-5 h-5 mr-3 text-[#E53E3E]" />
        <div>
          <p className="text-xs text-[#A0AEC0]">Authentication Status</p>
          <p className="text-sm text-[#1A202C]">Anonymous Sign-in</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Vault/HomePage Component (Extracted from App for cleaner rendering logic) ---
const VaultPage = ({ search, setSearch, filtered, isSearchEmpty, credentials, togglePassword, handleDeleteCredential, showPasswordIds, setIsModalOpen }) => (
  <>
    {/* Search */}
    <div className="px-6 py-4">
      <div className="flex items-center bg-white rounded-xl px-4 py-2 shadow-sm border border-[#E2E8F0]">
        <Search className="w-5 h-5 text-[#A0AEC0] mr-2" />
        <input type="text" placeholder="Search by name or username..." value={search}
          onChange={(e)=>setSearch(e.target.value)}
          className="flex-1 outline-none text-[#1A202C] text-base bg-white placeholder-[#A0AEC0]"
        />
      </div>
    </div>

    <div className="px-6 space-y-4">
      {search.length > 0 && filtered.length > 0 && (
        <p className="text-sm text-[#A0AEC0] mt-2 font-medium">
          Found <span className="text-[#E53E3E] font-semibold">{filtered.length} matches</span> for &quot;{search}&quot;
        </p>
      )}

      {isSearchEmpty && (
        <div className="text-center p-10 bg-white rounded-xl shadow-inner border border-dashed border-[#E53E3E] mt-6">
          <Search className="w-12 h-12 text-[#E53E3E] mx-auto mb-4" />
          <p className="text-[#1A202C] text-lg font-medium">No results found for &quot;{search}&quot;.</p>
          <p className="text-sm text-[#A0AEC0] mt-1">Try a different name or username.</p>
        </div>
      )}

      {credentials.length === 0 && search.length === 0 && (
        <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-[#E2E8F0] mt-6">
          <Lock className="w-16 h-16 text-[#E53E3E] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1A202C] mb-2">Your Vault is Empty</h2>
          <p className="text-[#A0AEC0] mb-6">Start managing your digital life securely by adding your first credential.</p>
          <button onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-[#E53E3E] to-[#C53030] text-white font-semibold rounded-full shadow-lg shadow-[#E53E3E33] hover:from-[#C53030] hover:to-[#B52C2C] transition duration-200"
          >
            <PlusCircle className="w-5 h-5 mr-2" /> Add New Password
          </button>
        </div>
      )}

      {/* Credential Cards */}
      {filtered.length > 0 && filtered.map(c => (
        <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-md hover:shadow-[#E53E3E33] transition-transform hover:scale-[1.02]">
          <div className="flex items-center space-x-4 mb-3 sm:mb-0">
            {c.url ? (
              <img src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&url=${c.url}&size=64`}
                onError={(e)=>{ e.target.onerror=null; e.target.src=`https://placehold.co/64x64/E2E8F0/1A202C?text=${c.name[0]?.toUpperCase()||'?'}`}}
                className="w-10 h-10 rounded-full border border-[#E2E8F0] object-contain flex-shrink-0"
                alt={`${c.name} logo`} />
            ) : (
              <div className="w-10 h-10 bg-[#FEE2E2] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#E53E3E] font-bold text-lg">{c.name[0]?.toUpperCase()||'?'}</span>
              </div>
            )}
            <div>
              <h2 className="text-[#1A202C] font-semibold text-lg">{c.name}</h2>
              <p className="text-[#A0AEC0] text-sm">{c.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto mt-2 sm:mt-0">
            <span className="font-mono bg-[#EEEEEE] text-[#C53030] px-3 py-1 rounded-lg text-sm flex-1 truncate">
              {showPasswordIds.includes(c.id) ? c.password : "••••••••••••"}
            </span>
            <button onClick={()=>togglePassword(c.id)} className="p-2 rounded-full hover:bg-[#F0F0F0] transition flex-shrink-0">
              {showPasswordIds.includes(c.id) ? <EyeOff size={20} className="text-[#E53E3E]" /> : <Eye size={20} className="text-[#A0AEC0]" />}
            </button>
            <button onClick={()=>handleDeleteCredential(c.id)} className="p-2 rounded-full hover:bg-[#FF4B4B1A] flex-shrink-0">
              <Trash2 size={20} className="text-[#FF4B4B]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </>
);


// --- Main App ---
export default function App() {
  const [credentials, setCredentials] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showPasswordIds, setShowPasswordIds] = useState([]);
  // Default to 'vault', can be 'settings' or 'account'
  const [activeTab, setActiveTab] = useState("vault"); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Firebase Setup (Unchanged) ---
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

  useEffect(() => {
    if (!firebaseConfig) { console.error("Firebase config missing"); setIsLoading(false); return; }

    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const authInstance = getAuth(app);
    setDb(firestore);

    const authenticate = async () => {
      try {
        if (initialAuthToken) await signInWithCustomToken(authInstance, initialAuthToken);
        else await signInAnonymously(authInstance);
      } catch (error) { console.error("Firebase Auth Error:", error); }
    };

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) setUserId(user.uid); else setUserId(null);
      setIsAuthReady(true); setIsLoading(false);
    });

    authenticate();
    return () => unsubscribe();
  }, []);

  // --- Firestore Listener (Unchanged) ---
  useEffect(() => {
    if (!db || !isAuthReady || !userId) return;
    const credentialsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'credentials');
    const q = query(credentialsCollectionRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a,b)=> (b.createdAt?.toMillis()||0) - (a.createdAt?.toMillis()||0));
      setCredentials(fetched);
    }, (error) => console.error("Firestore Listener Error:", error));
    return () => unsubscribe();
  }, [db, isAuthReady, userId]);

  // --- Search Filter (Unchanged) ---
  useEffect(() => {
    // Only run search filter if we are on the vault tab
    if (activeTab === 'vault') {
        const filteredList = credentials.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.username.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(filteredList);
    } else {
        setFiltered(credentials); // Or clear it depending on desired behavior
    }
  }, [search, credentials, activeTab]);

  // --- CRUD Operations (Unchanged) ---
  const handleAddCredential = async (newCred) => {
    if (!db || !userId) return;
    try { await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'credentials'), newCred); }
    catch (error) { console.error("Error adding document: ", error); }
  };
  const handleDeleteCredential = async (id) => {
    if (!db || !userId) return;
    try { await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'credentials', id)); }
    catch (error) { console.error("Error deleting document: ", error); }
  };
  const togglePassword = (id) => setShowPasswordIds(prev => prev.includes(id) ? prev.filter(i=>i!==id) : [...prev,id]);

  if (isLoading) return (
    <div className="flex justify-center items-center h-screen bg-[#F7F7F7] text-[#E53E3E]">
      <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-lg font-semibold text-[#1A202C]">Loading Vault...</span>
    </div>
  );

  const isSearchEmpty = search.length > 0 && filtered.length === 0;

  // Function to render the correct page content
  const renderContent = () => {
    switch (activeTab) {
      case 'settings':
        return <SettingsPage setActiveTab={setActiveTab} />;
      case 'account':
        return <AccountPage userId={userId} setActiveTab={setActiveTab} />;
      case 'vault':
      default:
        return <VaultPage 
          search={search}
          setSearch={setSearch}
          filtered={filtered}
          isSearchEmpty={isSearchEmpty}
          credentials={credentials}
          togglePassword={togglePassword}
          handleDeleteCredential={handleDeleteCredential}
          showPasswordIds={showPasswordIds}
          setIsModalOpen={setIsModalOpen}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col relative font-sans">
      
      {/* Header */}
      <div className="sticky top-0 bg-white text-[#1A202C] px-6 py-4 flex justify-between items-center shadow-lg shadow-black/10 z-10 border-b border-[#E2E8F0]">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#E53E3E]">OnePass Vault</h1>
        
        {/* Account Button (Moved to top-right Header, clicks to 'account' tab) */}
        <button onClick={()=>setActiveTab("account")} 
            className="flex items-center space-x-2 text-sm bg-[#EEEEEE] px-2 py-1 rounded hover:shadow-md hover:bg-[#E53E3E] hover:text-white transition duration-150">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline-block font-mono truncate max-w-xs">{userId ? 'Account' : 'Guest User'}</span>
        </button>
      </div>

      {/* Main Content Area: Renders the active page */}
      <main className="flex-1 overflow-y-auto pt-4 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Common to all pages) */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-t-lg py-2 flex justify-around items-center border-t border-[#E2E8F0] z-20">
        
        {/* Vault/Home Button */}
        <button onClick={()=>setActiveTab("vault")} className="flex flex-col items-center p-2">
          <Home size={24} className={`${activeTab==="vault"?"text-[#E53E3E]":"text-[#A0AEC0]"}`} />
          <span className={`text-xs mt-1 font-medium ${activeTab==="vault"?"text-[#E53E3E]":"text-[#A0AEC0]"}`}>Vault</span>
        </button>
        
        {/* Add Credential Button */}
        <button onClick={()=>setIsModalOpen(true)} className="flex flex-col items-center -mt-8 p-4 bg-gradient-to-r from-[#E53E3E] to-[#C53030] rounded-full shadow-xl hover:scale-110 transition-transform">
          <PlusCircle size={36} className="text-white" />
        </button>
        
        {/* Settings Button */}
        <button onClick={()=>setActiveTab("settings")} className="flex flex-col items-center p-2">
          <Settings size={24} className={`${activeTab==="settings"?"text-[#E53E3E]":"text-[#A0AEC0]"}`} />
          <span className={`text-xs mt-1 font-medium ${activeTab==="settings"?"text-[#E53E3E]":"text-[#A0AEC0]"}`}>Settings</span>
        </button>
      </div>

      <AddCredentialModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleAddCredential} />
    </div>
  );
}