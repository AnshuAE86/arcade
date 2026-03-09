
import React, { useState } from 'react';
import { Game } from '../types';
import AdUnit from '../components/AdUnit';
import { 
  TrophyIcon, 
  FireIcon, 
  SparklesIcon, 
  PlayIcon,
  UserGroupIcon,
  BoltIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { MOCK_LEADERS } from '../constants';

interface LeaderboardsProps {
  games: Game[];
}

export const Leaderboards: React.FC<LeaderboardsProps> = ({ games }) => {
  const navigate = useNavigate();
  const [activeMetric, setActiveMetric] = useState<'plays' | 'weekly' | 'power' | 'creator' | 'players'>('plays');

  // Logic for different leaderboards
  const topGamesByPlays = [...games].sort((a, b) => b.plays - a.plays).slice(0, 10);
  const topGamesByWeekly = [...games].sort((a, b) => b.weeklyPlays - a.weeklyPlays).slice(0, 10);
  
  // Power Score: Rating * log10(plays + 1) to reward both quality and reach
  const topGamesByPower = [...games].sort((a, b) => {
    const scoreA = a.rating * Math.log10(a.plays + 1);
    const scoreB = b.rating * Math.log10(b.plays + 1);
    return scoreB - scoreA;
  }).slice(0, 10);
  
  // Aggregate creators by total plays
  const creatorStats = games.reduce((acc, game) => {
    if (!acc[game.creator]) {
      acc[game.creator] = { name: game.creator, totalPlays: 0, gamesCount: 0 };
    }
    acc[game.creator].totalPlays += game.plays;
    acc[game.creator].gamesCount += 1;
    return acc;
  }, {} as Record<string, { name: string, totalPlays: number, gamesCount: number }>);

  const topCreators = (Object.values(creatorStats) as Array<{ name: string, totalPlays: number, gamesCount: number }>)
    .sort((a, b) => b.totalPlays - a.totalPlays)
    .slice(0, 10);

  const topPlayers = [...MOCK_LEADERS].sort((a, b) => (b.challengePoints || 0) - (a.challengePoints || 0));

  return (
    <div className="space-y-10">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-orbitron tracking-tighter mb-2 uppercase">HALL OF FAME</h1>
          <p className="text-slate-400">The most influential games, creators, and competitors in the Arcade ecosystem.</p>
        </div>
        
        <div className="flex flex-wrap bg-slate-900 p-1 rounded-2xl border border-slate-800 gap-1">
          {[
            { id: 'plays', label: 'All Time', icon: PlayIcon },
            { id: 'weekly', label: 'Top This Week', icon: CalendarDaysIcon },
            { id: 'power', label: 'Power Score', icon: BoltIcon },
            { id: 'creator', label: 'Top Creators', icon: SparklesIcon },
            { id: 'players', label: 'Best Players', icon: UserGroupIcon },
          ].map((metric) => (
            <button 
              key={metric.id}
              onClick={() => setActiveMetric(metric.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeMetric === metric.id ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <metric.icon className="w-3.5 h-3.5" />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Rank</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {activeMetric === 'creator' ? 'Creator' : activeMetric === 'players' ? 'Player' : 'Game'}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {activeMetric === 'creator' ? 'Games' : activeMetric === 'players' ? 'Rank' : 'Genre'}
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">
                  {activeMetric === 'plays' ? 'Total Plays' : 
                   activeMetric === 'weekly' ? 'Weekly Plays' :
                   activeMetric === 'power' ? 'Power Score' :
                   activeMetric === 'creator' ? 'Total Reach' : 'Challenge Points'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {(
                activeMetric === 'plays' ? topGamesByPlays : 
                activeMetric === 'weekly' ? topGamesByWeekly :
                activeMetric === 'power' ? topGamesByPower :
                activeMetric === 'creator' ? topCreators : 
                topPlayers
              ).map((item: any, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black font-orbitron text-sm ${
                        idx === 0 ? 'bg-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 
                        idx === 1 ? 'bg-slate-300 text-slate-950' : 
                        idx === 2 ? 'bg-orange-500 text-slate-950' : 
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      {idx === 0 && <TrophyIcon className="w-5 h-5 text-yellow-500 animate-pulse" />}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                        <img 
                          src={activeMetric === 'creator' || activeMetric === 'players'
                            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.name}`
                            : (item as Game).thumbnail
                          } 
                          className="w-full h-full object-cover" 
                          alt="" 
                        />
                      </div>
                      <div>
                        <p className="font-black text-slate-100 group-hover:text-cyan-400 transition-colors uppercase text-sm tracking-widest">
                          {activeMetric === 'creator' || activeMetric === 'players' ? item.name : item.title}
                        </p>
                        {activeMetric !== 'creator' && activeMetric !== 'players' && <p className="text-[10px] text-slate-500 font-bold uppercase">by {item.creator}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700">
                      {activeMetric === 'creator' ? `${item.gamesCount} Built` : 
                       activeMetric === 'players' ? (item.challengePoints > 1000 ? 'Master' : 'Expert') : 
                       item.genre}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {activeMetric === 'power' ? (
                        <div className="flex flex-col items-end">
                          <p className="font-black font-orbitron text-xl text-fuchsia-400">
                            {(item.rating * Math.log10(item.plays + 1)).toFixed(1)}
                          </p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Quality Score</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <p className={`font-black font-orbitron text-xl ${activeMetric === 'players' ? 'text-yellow-400' : 'text-cyan-400'}`}>
                            {activeMetric === 'players' ? (item.challengePoints || 0).toLocaleString() :
                             activeMetric === 'weekly' ? (item.weeklyPlays || 0).toLocaleString() :
                             activeMetric === 'creator' ? (item.totalPlays / 1000).toFixed(1) + 'k' :
                             (item.plays / 1000).toFixed(1) + 'k'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                            {activeMetric === 'players' ? 'Total XP' : 'Engagement'}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AD SPOT 1 */}
      <AdUnit slot="leaderboards-bottom-1" />

      <div className="p-8 rounded-[40px] bg-gradient-to-r from-cyan-600/10 to-indigo-600/10 border border-cyan-500/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 bg-cyan-500/20 rounded-[24px] flex items-center justify-center border border-cyan-500/30">
            <FireIcon className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-black font-orbitron tracking-tight mb-2 uppercase">WANT TO BECOME THE NEXT LEGEND?</h3>
            <p className="text-slate-400 text-sm">Join active challenges, build viral games, or dominate the leaderboards to earn exclusive rewards.</p>
          </div>
          <button onClick={() => navigate('/creator-zone')} className="px-10 py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 uppercase text-xs tracking-widest">
            Enter Creator Zone
          </button>
        </div>
      </div>
    </div>
  );
};
