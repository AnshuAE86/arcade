import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, GamePlay, Catalog, Profile, Challenges, CreatorZone, Login, Launch, Zones, Leaderboards, Quests, Raffles, Dashboard } from './pages';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import { MOCK_USER, MOCK_QUESTS } from './constants';
import { User, Game, Quest } from './types';
import { supabase, supabaseUrl } from './supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  const [leaderboardGames, setLeaderboardGames] = useState<Game[]>([]);
  const [weeklyLeaderboardGames, setWeeklyLeaderboardGames] = useState<Game[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Fetch games from backend for browse/catalog
  const fetchGamesFromBackend = async (genre?: string) => {
    try {
      const url = genre ? `${BACKEND_URL}/games/browse?genre=${genre}` : `${BACKEND_URL}/games/browse`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  // Fetch featured games from backend
  const fetchFeaturedGamesFromBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/games/featured?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedGames(data);
      }
    } catch (error) {
      console.error('Error fetching featured games:', error);
    }
  };

  // Fetch leaderboard games from backend
  const fetchLeaderboardFromBackend = async () => {
    try {
      const playsResponse = await fetch(`${BACKEND_URL}/games/leaderboard?limit=5&sort_by=plays`);
      if (playsResponse.ok) {
        const data = await playsResponse.json();
        setLeaderboardGames(data);
      }

      const weeklyResponse = await fetch(`${BACKEND_URL}/games/leaderboard?limit=5&sort_by=weeklyPlays`);
      if (weeklyResponse.ok) {
        const data = await weeklyResponse.json();
        setWeeklyLeaderboardGames(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Fetch genres from backend
  const fetchGenresFromBackend = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/games/genres`);
      if (response.ok) {
        const data = await response.json();
        setGenres(data);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Fetch user profile from backend
  const fetchUserFromBackend = async (userId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/users/${userId}`);
      if (response.ok) {
        const profile = await response.json();
        setUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Helper to check if we are using a real Supabase instance
  const isSupabaseConfigured = !supabaseUrl.includes('placeholder-project');

  useEffect(() => {
    fetchGamesFromBackend();
    fetchFeaturedGamesFromBackend();
    fetchLeaderboardFromBackend();
    fetchGenresFromBackend();

    if (isSupabaseConfigured) {
      // Check initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          fetchUserFromBackend(session.user.id);
        } else {
          setIsAuthLoading(false);
        }
      });

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          fetchUserFromBackend(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setIsAuthLoading(false);
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

  const handleLogout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      setUser(null);
    }
  }, [isSupabaseConfigured]);

  const handleUpdateProfile = useCallback(async (updatedUser: Partial<User>) => {
    if (!user) return;

    // Optimistic update
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);

    try {
      const response = await fetch(`${BACKEND_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) {
        console.error('Failed to update profile in backend');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }, [user]);

  const handleDemoLogin = useCallback((role: 'Player' | 'Creator' | 'Guest') => {
    setIsAuthLoading(false);
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
  }, []);

  const addToRecentlyPlayed = useCallback((gameId: string) => {
    if (!user) return;
    const current = user.recentlyPlayed || [];
    const filtered = current.filter(id => id !== gameId);
    const updated = [gameId, ...filtered].slice(0, 7);
    setUser({ ...user, recentlyPlayed: updated });
  }, [user]);

  const addGame = useCallback((newGame: Game) => setGames(prev => [newGame, ...prev]), []);

  const toggleLibraryGame = useCallback(async (gameId: string) => {
    if (!user) return;
    const inLibrary = user.library?.includes(gameId) || false;
    const newLibrary = inLibrary
      ? (user.library || []).filter(id => id !== gameId)
      : [...(user.library || []), gameId];

    // Optimistic update
    setUser({ ...user, library: newLibrary });

    try {
      const response = await fetch(`${BACKEND_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ library: newLibrary }),
      });
      if (!response.ok) {
        console.error('Failed to update library in backend');
      }
    } catch (error) {
      console.error('Error updating library:', error);
    }
  }, [user]);

  const rewardUser = useCallback((amount: number, type: 'vibe' | 'arcade' = 'vibe') => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return {
        ...prevUser,
        vibeTokens: type === 'vibe' ? (prevUser.vibeTokens || 0) + amount : prevUser.vibeTokens,
        arcadeCoins: type === 'arcade' ? (prevUser.arcadeCoins || 0) + amount : prevUser.arcadeCoins,
        gamesPlayed: (prevUser.gamesPlayed || 0) + 1
      };
    });
  }, []);

  const updateQuestProgress = useCallback((category: Quest['category'], amount: number) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const updatedProgress = { ...prevUser.questProgress };
      let changed = false;

      MOCK_QUESTS.forEach(quest => {
        if (quest.category === category && !(prevUser.completedQuests || []).includes(quest.id)) {
          const currentProgress = updatedProgress[quest.id] || 0;
          if (currentProgress < quest.target) {
            updatedProgress[quest.id] = Math.min(currentProgress + amount, quest.target);
            changed = true;
          }
        }
      });

      if (changed) {
        return { ...prevUser, questProgress: updatedProgress };
      }
      return prevUser;
    });
  }, []);

  // Guard for registered users
  const ProtectedRoute = ({ children, requireCreator = false }: { children: React.ReactNode, requireCreator?: boolean }) => {
    if (isAuthLoading && !user) return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
      </div>
    );

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
          genres={genres}
        />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
          <Navbar user={user} onLogout={handleLogout} onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Home games={games} featuredGames={featuredGames} user={user} onDemoLogin={handleDemoLogin} />} />
              <Route path="/catalog" element={<Catalog genres={genres} />} />
              <Route path="/leaderboards" element={<Leaderboards games={leaderboardGames} weeklyGames={weeklyLeaderboardGames} />} />
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
              <Route path="/game/:id" element={<GamePlay user={user} onPlayComplete={rewardUser} updateQuestProgress={updateQuestProgress} games={games} userLibrary={user?.library || []} onToggleLibrary={toggleLibraryGame} onLaunch={addToRecentlyPlayed} />} />
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
