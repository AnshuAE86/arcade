
import React from 'react';
import { BRAND_ZONES } from '../constants';
import { Link } from 'react-router-dom';
import { BuildingOfficeIcon, SparklesIcon, TrophyIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export const Zones: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="text-5xl font-black font-orbitron tracking-tighter uppercase">BRAND UNIVERSES</h1>
        <p className="text-slate-400 text-lg">
          Immerse yourself in curated gaming experiences powered by the world's leading brands. 
          Exclusive rewards, unique mechanics, and sponsored challenges await.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {BRAND_ZONES.map(zone => (
          <div 
            key={zone.id} 
            className="group relative rounded-[40px] bg-slate-900 border border-slate-800 overflow-hidden hover:border-cyan-500/30 transition-all duration-500 shadow-2xl"
          >
            <div 
              className="absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: zone.color }}
            ></div>
            
            <div className="p-10 space-y-6">
              <div className="flex items-center justify-between">
                <img src={zone.logo} alt={zone.name} className="h-10 object-contain" />
                <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-400 font-bold uppercase border border-white/10">Active Zone</span>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black font-orbitron tracking-tight">{zone.name} Universe</h2>
                <p className="text-slate-400 leading-relaxed">
                  {zone.description} Join thousands of players competing in exclusive branded experiences.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 py-6 border-t border-slate-800">
                <div className="text-center">
                  <TrophyIcon className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Rewards</p>
                  <p className="font-bold text-sm">{zone.rewardType}</p>
                </div>
                <div className="text-center border-l border-slate-800">
                  <SparklesIcon className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Games</p>
                  <p className="font-bold text-sm">{zone.gamesCount}</p>
                </div>
                <div className="text-center border-l border-slate-800">
                  <BuildingOfficeIcon className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Players</p>
                  <p className="font-bold text-sm">{zone.playersCount}</p>
                </div>
              </div>

              <Link to="/catalog" className="w-full py-4 bg-slate-950 border border-slate-800 hover:border-slate-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 group/btn transition-all">
                ENTER UNIVERSE
                <ArrowRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="p-12 rounded-[40px] bg-gradient-to-r from-cyan-600/10 to-indigo-600/10 border border-cyan-500/20 text-center space-y-6">
        <h3 className="text-2xl font-black font-orbitron">WANT YOUR BRAND HERE?</h3>
        <p className="text-slate-400 max-w-xl mx-auto">
          Scale your brand's reach with a dedicated Arcade Zone. Deploy custom games, fund prize pools, and engage with our global gaming community.
        </p>
        <button 
          onClick={() => alert("Partnership request sent!")}
          className="px-10 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
        >
          CONTACT PARTNERSHIPS
        </button>
      </div>
    </div>
  );
};
