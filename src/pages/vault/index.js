import { useEffect, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { Home, PlusCircle, Settings, Search, Eye, EyeOff, Trash2, X, Lock, Save, User } from 'lucide-react';

// --- Add Credential Modal ---
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
      <div className="bg-[#1B1D2B] rounded-xl w-full max-w-md shadow-2xl transform transition-all duration-300 scale-100 border border-[#2A2C3E]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b border-[#2A2C3E] pb-3">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Lock className="w-6 h-6 mr-2 text-[#8C5FFF]" />
              Add New Credential
            </h2>
            <button onClick={handleClose} className="text-slate-400 hover:text-white transition p-1">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="App/Website Name (e.g., GitHub)" value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-[#2A2C3E] bg-[#212337] text-white rounded-lg focus:ring-[#8C5FFF] focus:border-[#8C5FFF] placeholder-[#7E7F9A]" required
            />
            <input type="text" placeholder="Username or Email" value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-[#2A2C3E] bg-[#212337] text-white rounded-lg focus:ring-[#8C5FFF] focus:border-[#8C5FFF] placeholder-[#7E7F9A]" required
            />
            <div className="relative">
              <input type={isPasswordVisible ? 'text' : 'password'} placeholder="Password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-[#2A2C3E] bg-[#212337] text-[#A085FF] rounded-lg focus:ring-[#8C5FFF] focus:border-[#8C5FFF] pr-12 placeholder-[#7E7F9A]" required
              />
              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#7E7F9A] hover:text-[#8C5FFF]"
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <input type="url" placeholder="Website URL (Optional, for logo: https://example.com)" value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-3 border border-[#2A2C3E] bg-[#212337] text-white rounded-lg focus:ring-[#8C5FFF] focus:border-[#8C5FFF] placeholder-[#7E7F9A]"
            />
            <button type="submit" className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#8C5FFF] to-[#5A4BFF] text-white font-semibold rounded-lg shadow-lg shadow-[#8C5FFF33] hover:from-[#9B6CFF] hover:to-[#6D5CFF] transition duration-200">
              <Save className="w-5 h-5 mr-2" /> Save Credential
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [credentials, setCredentials] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [showPasswordIds, setShowPasswordIds] = useState([]);
  const [activeTab, setActiveTab] = useState("vault");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Firebase Setup ---
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

  // --- Firestore Listener ---
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

  // --- Search Filter ---
  useEffect(() => {
    const filteredList = credentials.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.username.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(filteredList);
  }, [search, credentials]);

  // --- CRUD Operations ---
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
    <div className="flex justify-center items-center h-screen bg-[#0F111A] text-[#8C5FFF]">
      <svg className="animate-spin h-8 w-8 mr-3" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="text-lg font-semibold text-white">Loading Vault...</span>
    </div>
  );

  const isSearchEmpty = search.length > 0 && filtered.length === 0;

  return (
    <div className="min-h-screen bg-[#0F111A] flex flex-col relative font-sans">
      
      {/* Header */}
      <div className="sticky top-0 bg-[#1B1D2B] text-white px-6 py-4 flex justify-between items-center shadow-lg shadow-black/20 z-10 border-b border-[#2A2C3E]">
        <h1 className="text-3xl font-extrabold tracking-tight text-[#8C5FFF]">OnePass Vault</h1>
        <div className="flex items-center space-x-2 text-sm bg-[#212337] px-2 py-1 rounded">
            <User className="w-4 h-4 text-[#7E7F9A]" />
            <span className="hidden sm:inline-block font-mono text-[#A085FF] truncate max-w-xs">{userId || 'Guest User'}</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto pt-4 pb-24">
        {/* Search */}
        <div className="px-6 py-4">
          <div className="flex items-center bg-[#1B1D2B] rounded-xl px-4 py-2 shadow-inner border border-[#2A2C3E]">
            <Search className="w-5 h-5 text-[#7E7F9A] mr-2" />
            <input type="text" placeholder="Search by name or username..." value={search}
              onChange={(e)=>setSearch(e.target.value)}
              className="flex-1 outline-none text-white text-base bg-[#1B1D2B] placeholder-[#7E7F9A]"
            />
          </div>
        </div>

        <div className="px-6 space-y-4">
          {search.length > 0 && filtered.length > 0 && (
             <p className="text-sm text-[#7E7F9A] mt-2 font-medium">
                Found <span className="text-[#8C5FFF] font-semibold">{filtered.length} matches</span> for &quot;{search}&quot;
            </p>
          )}

          {isSearchEmpty && (
            <div className="text-center p-10 bg-[#1A1C2F] rounded-xl shadow-inner border border-dashed border-[#8C5FFF] mt-6">
              <Search className="w-12 h-12 text-[#8C5FFF] mx-auto mb-4" />
              <p className="text-white text-lg font-medium">No results found for &quot;{search}&quot;.</p>
              <p className="text-sm text-[#7E7F9A] mt-1">Try a different name or username.</p>
            </div>
          )}

          {credentials.length === 0 && search.length === 0 && (
            <div className="text-center p-10 bg-[#1A1C2F] rounded-xl shadow-lg border border-[#2A2C3E] mt-6">
              <Lock className="w-16 h-16 text-[#8C5FFF] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Your Vault is Empty</h2>
              <p className="text-[#7E7F9A] mb-6">Start managing your digital life securely by adding your first credential.</p>
              <button onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-[#8C5FFF] to-[#5A4BFF] text-white font-semibold rounded-full shadow-lg shadow-[#8C5FFF33] hover:from-[#9B6CFF] hover:to-[#6D5CFF] transition duration-200"
              >
                <PlusCircle className="w-5 h-5 mr-2" /> Add New Password
              </button>
            </div>
          )}

          {/* Credential Cards */}
          {filtered.length > 0 && filtered.map(c => (
            <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#1A1C2F] p-5 rounded-2xl border border-[#2A2C3E] shadow-md hover:shadow-[#8C5FFF33] transition-transform hover:scale-[1.02]">
              <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                {c.url ? (
                  <img src={`https://t2.gstatic.com/faviconV2?client=SOCIAL&url=${c.url}&size=64`}
                    onError={(e)=>{ e.target.onerror=null; e.target.src=`https://placehold.co/64x64/334155/C7D2FE?text=${c.name[0]?.toUpperCase()||'?'}`}}
                    className="w-10 h-10 rounded-full border border-[#2A2C3E] object-contain flex-shrink-0"
                    alt={`${c.name} logo`} />
                ) : (
                  <div className="w-10 h-10 bg-[#3B2D6B] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#8C5FFF] font-bold text-lg">{c.name[0]?.toUpperCase()||'?'}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-white font-semibold text-lg">{c.name}</h2>
                  <p className="text-[#7E7F9A] text-sm">{c.username}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto mt-2 sm:mt-0">
                <span className="font-mono bg-[#212337] text-[#A085FF] px-3 py-1 rounded-lg text-sm flex-1 truncate">
                  {showPasswordIds.includes(c.id) ? c.password : "••••••••••••"}
                </span>
                <button onClick={()=>togglePassword(c.id)} className="p-2 rounded-full hover:bg-[#1A1C2F] transition flex-shrink-0">
                  {showPasswordIds.includes(c.id) ? <EyeOff size={20} className="text-[#8C5FFF]" /> : <Eye size={20} className="text-[#7E7F9A]" />}
                </button>
                <button onClick={()=>handleDeleteCredential(c.id)} className="p-2 rounded-full hover:bg-[#FF4B4B33] flex-shrink-0">
                  <Trash2 size={20} className="text-[#FF4B4B]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 w-full bg-[#1B1D2B] shadow-t-lg py-2 flex justify-around items-center border-t border-[#2A2C3E] z-20">
        <button onClick={()=>setActiveTab("vault")} className="flex flex-col items-center p-2">
          <Home size={24} className={`${activeTab==="vault"?"text-[#8C5FFF]":"text-[#7E7F9A]"}`} />
          <span className={`text-xs mt-1 font-medium ${activeTab==="vault"?"text-[#8C5FFF]":"text-[#7E7F9A]"}`}>Vault</span>
        </button>
        <button onClick={()=>setIsModalOpen(true)} className="flex flex-col items-center -mt-8 p-4 bg-gradient-to-r from-[#8C5FFF] to-[#5A4BFF] rounded-full shadow-xl hover:scale-110 transition-transform">
          <PlusCircle size={36} className="text-white" />
        </button>
        <button onClick={()=>setActiveTab("settings")} className="flex flex-col items-center p-2">
          <Settings size={24} className={`${activeTab==="settings"?"text-[#8C5FFF]":"text-[#7E7F9A]"}`} />
          <span className={`text-xs mt-1 font-medium ${activeTab==="settings"?"text-[#8C5FFF]":"text-[#7E7F9A]"}`}>Settings</span>
        </button>
      </div>

      <AddCredentialModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleAddCredential} />
    </div>
  );
}
