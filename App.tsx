
import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, GamePlay, Catalog, Profile, Challenges, CreatorZone, Login, Launch, Zones, Leaderboards } from './pages';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { MOCK_USER, MOCK_GAMES } from './constants';
import { User, Game } from './types';
import { createClient } from '@supabase/supabase-js';

// Secure initialization: Use placeholders if env vars are missing to prevent crash
// Exported supabaseUrl to resolve undefined errors in troubleshooting views
export const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null); 
  const [games, setGames] = useState<Game[]>(MOCK_GAMES);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Helper to check if we are using a real Supabase instance
  const isSupabaseConfigured = !supabaseUrl.includes('placeholder-project');

  const mapSupabaseUser = (sbUser: any): User => ({
    id: sbUser.id,
    name: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || 'Gamer',
    avatar: sbUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sbUser.id}`,
    role: 'Creator', 
    email: sbUser.email,
    vibeTokens: 1250,
    gamesPlayed: 45,
    gamesCreated: 3,
    challengePoints: 450,
    library: ['1', '3']
  });

  useEffect(() => {
    if (isSupabaseConfigured) {
      // Check initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        }
      });

      // Listen for auth changes (Crucial for handling Magic Link redirects)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          setUser(mapSupabaseUser(session.user));
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, [isSupabaseConfigured]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
    }
  };

  const handleUpdateProfile = (updatedUser: Partial<User>) => {
    if (user) setUser({ ...user, ...updatedUser });
  };

  const addGame = (newGame: Game) => setGames(prev => [newGame, ...prev]);

  const toggleLibraryGame = (gameId: string) => {
    if (!user) return;
    const inLibrary = user.library.includes(gameId);
    const newLibrary = inLibrary 
      ? user.library.filter(id => id !== gameId)
      : [...user.library, gameId];
    setUser({ ...user, library: newLibrary });
  };

  const rewardUser = (amount: number) => {
    if (user) {
      setUser({
        ...user,
        vibeTokens: user.vibeTokens + amount,
        gamesPlayed: user.gamesPlayed + 1
      });
    }
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        {!user ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <Routes>
              <Route path="*" element={<Login onLogin={setUser} />} />
            </Routes>
          </div>
        ) : (
          <>
            <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(!isSidebarOpen)} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
              <Navbar user={user} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} onLogout={handleLogout} />
              <main className="flex-1 p-4 md:p-8">
                <Routes>
                  <Route path="/" element={<Home games={games} />} />
                  <Route path="/game/:id" element={
                    <GamePlay 
                      games={games} 
                      onPlayComplete={rewardUser} 
                      userLibrary={user.library}
                      onToggleLibrary={toggleLibraryGame}
                    />
                  } />
                  <Route path="/catalog" element={<Catalog games={games} />} />
                  <Route path="/profile" element={<Profile user={user} games={games} onUpdateProfile={handleUpdateProfile} />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/leaderboards" element={<Leaderboards games={games} />} />
                  <Route path="/creator-zone" element={<CreatorZone user={user} onUpload={addGame} />} />
                  <Route path="/launch" element={<Launch user={user} games={games} />} />
                  <Route path="/zones" element={<Zones />} />
                </Routes>
              </main>
              <footer className="border-t border-slate-800 p-8 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold font-orbitron tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                      ARCADE
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-8 text-slate-400 text-sm">
                    <button onClick={() => alert("Privacy Policy")} className="hover:text-cyan-400 transition-colors">Privacy Policy</button>
                    <button onClick={() => alert("Terms of Service")} className="hover:text-cyan-400 transition-colors">Terms of Service</button>
                    <button onClick={() => alert("Dev Portal")} className="hover:text-cyan-400 transition-colors">Developer Portal</button>
                  </div>
                  <p className="text-slate-500 text-sm">© 2024 Arcade Ecosystem. All rights reserved.</p>
                </div>
              </footer>
            </div>
          </>
        )}
      </div>
    </Router>
  );
};

export default App;
