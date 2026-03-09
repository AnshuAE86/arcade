
import React from 'react';
import { User, Game } from '../types';
import { RocketLaunchIcon, CheckCircleIcon, XCircleIcon, ChartBarIcon, CurrencyDollarIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface LaunchProps {
  user: User | null;
  games: Game[];
}

export const Launch: React.FC<LaunchProps> = ({ user, games }) => {
  const myGames = games.filter(g => g.creator === user?.name);
  
  const requirements = [
    { name: "Total Plays", target: "50,000+", current: myGames.reduce((acc, g) => acc + g.plays, 0).toLocaleString(), met: myGames.reduce((acc, g) => acc + g.plays, 0) >= 50000 },
    { name: "Verified Creator Status", target: "Verified", current: user?.role === 'Creator' ? "Verified" : "Pending", met: user?.role === 'Creator' },
    { name: "Active Games", target: "2+", current: myGames.length, met: myGames.length >= 2 },
    { name: "Average Rating", target: "4.5+", current: "4.7", met: true }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="relative p-12 rounded-[40px] bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 bg-indigo-500/20 rounded-3xl flex items-center justify-center border border-indigo-500/30">
            <RocketLaunchIcon className="w-12 h-12 text-indigo-400" />
          </div>
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl font-black font-orbitron tracking-tighter uppercase">TOKEN LAUNCH PIPELINE</h1>
            <p className="text-slate-400 max-w-2xl">
              Transform your game's success into a dedicated on-chain economy. Qualified creators can launch their own World Chain tokens directly through VAIBE.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ChartBarIcon className="w-6 h-6 text-cyan-400" />
              Eligibility Checklist
            </h3>
            <div className="space-y-4">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-4">
                    {req.met ? <CheckCircleIcon className="w-6 h-6 text-green-500" /> : <XCircleIcon className="w-6 h-6 text-slate-600" />}
                    <div>
                      <p className="font-bold text-sm">{req.name}</p>
                      <p className="text-xs text-slate-500">Target: {req.target}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-orbitron font-bold text-sm ${req.met ? 'text-slate-200' : 'text-slate-500'}`}>{req.current}</p>
                    <p className={`text-[9px] uppercase font-black ${req.met ? 'text-green-500' : 'text-slate-600'}`}>{req.met ? 'MET' : 'NOT MET'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-fuchsia-400" />
              Launch Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Smart Contracts", desc: "Automated ERC-20 contract deployment on World Chain." },
                { title: "Liquidity Bootstrapping", desc: "Seed funding for your token's initial market." },
                { title: "Governance", desc: "Allow your community to vote on game updates." },
                { title: "Ecosystem Perks", desc: "Cross-game utility for your game's token." }
              ].map((feat, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-800 bg-slate-900">
                  <h4 className="font-bold text-cyan-400 text-sm mb-1">{feat.title}</h4>
                  <p className="text-xs text-slate-500">{feat.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-fuchsia-700 shadow-xl shadow-indigo-500/20 text-center">
            <CurrencyDollarIcon className="w-16 h-16 text-white/50 mx-auto mb-6" />
            <h3 className="text-2xl font-black mb-4">READY TO SCALE?</h3>
            <p className="text-indigo-100 text-sm mb-8 leading-relaxed">
              Once you meet all requirements, you'll be assigned a dedicated VAIBE Launch Manager.
            </p>
            <button className="w-full py-4 bg-white text-indigo-600 font-black rounded-2xl hover:scale-105 transition-transform">
              APPLY NOW
            </button>
          </div>

          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/50">
            <p className="text-[10px] text-slate-500 font-bold uppercase mb-4 tracking-widest">Recent Successes</p>
            <div className="space-y-4">
              {[
                { name: "Neon Drift", token: "$DRIFT", volume: "1.2M WLD" },
                { name: "Bit Brawl", token: "$BRAWL", volume: "850k WLD" }
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">{s.name}</p>
                    <p className="text-[10px] text-indigo-400 font-bold">{s.token}</p>
                  </div>
                  <p className="text-xs text-slate-400">{s.volume}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
