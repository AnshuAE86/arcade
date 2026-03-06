import React, { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, GamePlay, Catalog, Profile, Challenges, CreatorZone, Login, Launch, Zones, Leaderboards, Quests, Raffles, Dashboard } from './pages';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import { MOCK_USER, MOCK_GAMES, MOCK_QUESTS } from './constants';
import { User, Game, Quest } from './types';
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
    arcadeCoins: 500,
    gamesPlayed: 45,
    gamesCreated: 3,
    challengePoints: 450,
    library: ['1', '3'],
    questProgress: {},
    completedQuests: [],
    isPremium: false,
    referralCode: `ARC-${sbUser.id.substring(0, 5).toUpperCase()}`,
    referralCount: 0,
    exp: 100,
    recentlyPlayed: []
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

  const handleDemoLogin = (role: 'Player' | 'Creator' | 'Guest') => {
    if (role === 'Guest') {
      setUser(null);
    } else {
      setUser({
        ...MOCK_USER,
        id: `demo-${role.toLowerCase()}`,
        name: `Demo ${role}`,
        role: role as 'Player' | 'Creator',
        arcadeCoins: 1000,
        vibeTokens: 2500,
        isPremium: role === 'Creator',
        referralCode: role === 'Creator' ? 'CREATOR-DEMO' : 'PLAYER-DEMO',
        referralCount: 5,
        exp: 1250,
        recentlyPlayed: ['1', '2']
      });
    }
  };

  const addToRecentlyPlayed = (gameId: string) => {
    if (!user) return;
    const current = user.recentlyPlayed || [];
    const filtered = current.filter(id => id !== gameId);
    const updated = [gameId, ...filtered].slice(0, 7);
    setUser({ ...user, recentlyPlayed: updated });
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

  const rewardUser = (amount: number, type: 'vibe' | 'arcade' = 'vibe') => {
    if (user) {
      setUser({
        ...user,
        vibeTokens: type === 'vibe' ? user.vibeTokens + amount : user.vibeTokens,
        arcadeCoins: type === 'arcade' ? user.arcadeCoins + amount : user.arcadeCoins,
        gamesPlayed: user.gamesPlayed + 1
      });
    }
  };

  const updateQuestProgress = (category: Quest['category'], amount: number) => {
    if (!user) return;

    const updatedProgress = { ...user.questProgress };
    let changed = false;

    MOCK_QUESTS.forEach(quest => {
      if (quest.category === category && !user.completedQuests.includes(quest.id)) {
        const currentProgress = updatedProgress[quest.id] || 0;
        if (currentProgress < quest.target) {
          updatedProgress[quest.id] = Math.min(currentProgress + amount, quest.target);
          changed = true;
        }
      }
    });

    if (changed) {
      setUser({ ...user, questProgress: updatedProgress });
    }
  };

  // Guard for registered users
  const ProtectedRoute = ({ children, requireCreator = false }: { children: React.ReactNode, requireCreator?: boolean }) => {
    if (!user) return <Login onLogin={setUser} />;
    if (requireCreator && user.role !== 'Creator') {
      return (
        <div className="p-20 text-center">
          <h1 className="text-2xl font-bold text-white mb-4 uppercase font-orbitron">Access Denied</h1>
          <p className="text-slate-400">Only creators can access the data dashboard.</p>
          <Link to="/" className="inline-block mt-8 px-6 py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl">Go Home</Link>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-inter">
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggle={() => setSidebarOpen(!isSidebarOpen)} 
          user={user}
          onDemoLogin={handleDemoLogin}
        />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
          <Navbar user={user} onLogout={handleLogout} />
          
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home games={games} user={user} onDemoLogin={handleDemoLogin} />} />
              <Route path="/catalog" element={<Catalog games={games} />} />
              <Route path="/leaderboards" element={<Leaderboards games={games} />} />
              <Route path="/zones" element={<Zones />} />
              <Route path="/challenges" element={
                <ProtectedRoute requireCreator>
                  <Challenges />
                </ProtectedRoute>
              } />
              <Route path="/launch" element={
                <ProtectedRoute requireCreator>
                  <Launch user={user} games={games} />
                </ProtectedRoute>
              } />
              <Route path="/creator-zone" element={<CreatorZone user={user} />} />
              
              <Route path="/quests" element={
                <Quests user={user} setUser={setUser} />
              } />
              
              <Route path="/raffles" element={
                <ProtectedRoute>
                  <Raffles user={user} setUser={setUser} />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <ProtectedRoute requireCreator>
                  <Dashboard user={user} games={games} />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile user={user} games={games} onUpdateProfile={handleUpdateProfile} />
                </ProtectedRoute>
              } />
              <Route path="/game/:id" element={<GamePlay user={user} rewardUser={rewardUser} updateQuestProgress={updateQuestProgress} toggleLibrary={toggleLibraryGame} games={games} userLibrary={user?.library || []} onToggleLibrary={toggleLibraryGame} onLaunch={(id) => addToRecentlyPlayed(id)} />} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
            </Routes>
          </main>
        </div>
        {user && <Chat />}
      </div>
    </Router>
  );
};

export default App;
