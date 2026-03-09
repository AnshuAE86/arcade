import React, { useState, useEffect } from 'react';
import { MOCK_CHALLENGES, BRAND_ZONES } from '../constants';
import FeaturedCarousel from '../components/FeaturedCarousel';
import GameCard from '../components/GameCard';
import AdUnit from '../components/AdUnit';
import { Link } from 'react-router-dom';
import {
  FireIcon,
  SparklesIcon,
  ArrowRightIcon,
  TrophyIcon,
  LightBulbIcon,
  ChevronRightIcon,
  UserGroupIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  UserPlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Game, User } from '../types';
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../App';

interface HomeProps {
  games: Game[];
  user: User | null;
  onDemoLogin: (role: 'Player' | 'Creator' | 'Guest') => void;
}

export const Home: React.FC<HomeProps> = ({ games, user, onDemoLogin }) => {
  const [aiIdea, setAiIdea] = useState<string>("");
  const [isIdeaLoading, setIsIdeaLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const featuredGames = games.filter(g => g.isFeatured);
  const trending = games.slice(0, 4); // Added trending games
  const recentlyPlayedGames = user
    ? (user.recentlyPlayed || []).map(id => games.find(g => g.id === id)).filter(Boolean) as Game[]
    : [];

  const generateIdea = async () => {
    setIsIdeaLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Give me one short, creative, and viral-potential game idea for a browser arcade platform. Max 20 words.",
      });
      setAiIdea(response.text || "A racing game where you drift through a neon city controlled by music beats.");
    } catch (error) {
      console.error(error);
      setAiIdea("A puzzle game where the gravity shifts every time you solve a move.");
    } finally {
      setIsIdeaLoading(false);
    }
  };

  useEffect(() => {
    generateIdea();
  }, []);

  return (
    <div className="p-8 space-y-12">
      {/* Demo Mode Welcome Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-cyan-600/20 via-indigo-600/20 to-fuchsia-600/20 border border-cyan-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex-grow text-center md:text-left">
            <h2 className="text-2xl font-black font-orbitron text-white mb-2">WELCOME TO VAIBE ARCADE</h2>
            <p className="text-slate-400 max-w-xl">
              Sign in with Google to save your progress, earn rewards, and compete on the global leaderboards.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="px-8 py-4 bg-white text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-3 uppercase tracking-widest text-xs"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="" />
              Sign in with Google
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onDemoLogin('Player')}
                className="px-4 py-4 bg-slate-800/50 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all flex items-center gap-2 text-[10px] uppercase tracking-wider"
              >
                <UserPlusIcon className="w-4 h-4" /> Try Player Demo
              </button>
              <button
                onClick={() => onDemoLogin('Creator')}
                className="px-4 py-4 bg-slate-800/50 text-slate-300 font-bold rounded-2xl hover:bg-slate-700 transition-all flex items-center gap-2 text-[10px] uppercase tracking-wider"
              >
                <WrenchScrewdriverIcon className="w-4 h-4" /> Try Creator Demo
              </button>
            </div>
          </div>
        </div>
      )}

      <FeaturedCarousel games={featuredGames} />

      {/* Continue Playing Section */}
      {user && recentlyPlayedGames.length > 0 && (
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
                <ArrowPathIcon className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black font-orbitron tracking-tight uppercase">Continue Playing</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {recentlyPlayedGames.map(game => (
              <Link
                key={game.id}
                to={`/game/${game.id}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all shadow-lg"
              >
                <img src={game.thumbnail} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={game.title} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[10px] font-black text-white uppercase truncate">{game.title}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">{game.genre}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-cyan-900/20 to-transparent p-6 rounded-3xl border border-cyan-500/10 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20">
          <LightBulbIcon className="w-8 h-8 text-cyan-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-1">Neural Inspiration Engine</h3>
          <p className="text-slate-300 italic">"{isIdeaLoading ? "Querying neural forge..." : aiIdea}"</p>
        </div>
        <button
          onClick={generateIdea}
          disabled={isIdeaLoading}
          className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 uppercase tracking-widest"
        >
          {isIdeaLoading ? "REFORGING..." : "NEW SPARK"}
        </button>
      </section>

      {/* AD SPOT 1 */}
      <AdUnit slot="home-top-1" />

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FireIcon className="w-7 h-7 text-orange-500" />
            <h2 className="text-2xl font-black font-orbitron tracking-tight">TRENDING NOW</h2>
          </div>
          <Link to="/catalog" className="text-slate-400 hover:text-cyan-400 text-sm font-bold flex items-center gap-1 group">
            See All <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trending.map(game => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl font-black font-orbitron mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
              BRAND UNIVERSES
            </h2>
            <p className="text-slate-400 leading-relaxed mb-6">
              Enter specialized zones featuring games developed exclusively for global brands. Earn unique rewards and compete in sponsored challenges.
            </p>
            <Link to="/zones" className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-slate-700 inline-block uppercase text-xs tracking-widest">
              Explore All Zones
            </Link>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {BRAND_ZONES.map(zone => (
              <Link
                key={zone.id}
                to="/zones"
                className="p-6 rounded-2xl border border-slate-700/50 hover:border-slate-500 transition-all cursor-pointer bg-slate-900/50 block"
                style={{ borderLeft: `4px solid ${zone.color}` }}
              >
                <img src={zone.logo} alt={zone.name} className="h-8 object-contain mb-4 grayscale hover:grayscale-0 transition-all" />
                <h3 className="font-bold mb-2 uppercase text-sm tracking-tight">{zone.name} Zone</h3>
                <p className="text-xs text-slate-400">{zone.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-7 h-7 text-yellow-500" />
            <h2 className="text-2xl font-black font-orbitron tracking-tight">ACTIVE JAMS</h2>
          </div>
          <Link to="/challenges" className="text-slate-400 hover:text-cyan-400 text-sm font-bold flex items-center gap-1 group uppercase tracking-widest">
            All Challenges <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_CHALLENGES.filter(c => c.status === 'active').map(challenge => (
            <Link
              key={challenge.id}
              to="/challenges"
              className="group relative h-64 rounded-3xl overflow-hidden border border-slate-800 hover:border-yellow-500/50 transition-all"
            >
              <img src={challenge.banner} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              <div className="absolute bottom-6 left-8 right-8">
                <span className="px-3 py-1 bg-yellow-500 text-slate-950 text-[10px] font-black uppercase rounded mb-3 inline-block">
                  {challenge.tier}
                </span>
                <h3 className="text-2xl font-black mb-2 uppercase font-orbitron tracking-tighter">{challenge.title}</h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-400 font-bold uppercase tracking-widest">Prize: {challenge.prize}</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{challenge.participants} PLAYERS</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* AD SPOT 2 */}
      <AdUnit slot="home-footer-1" />
    </div>
  );
};
