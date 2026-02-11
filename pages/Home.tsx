
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
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { Game } from '../types';
import { GoogleGenAI } from "@google/genai";

export const Home: React.FC<{ games: Game[] }> = ({ games }) => {
  const [aiIdea, setAiIdea] = useState<string>("");
  const [isIdeaLoading, setIsIdeaLoading] = useState(false);

  const featured = games.filter(g => g.isFeatured).length > 0 ? games.filter(g => g.isFeatured) : games.slice(0, 3);
  const trending = [...games].sort((a, b) => b.plays - a.plays).slice(0, 4);
  const newest = [...games].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);

  const generateIdea = async () => {
    setIsIdeaLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    <div className="space-y-12">
      <FeaturedCarousel games={featured} />

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
