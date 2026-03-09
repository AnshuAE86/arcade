import React from 'react';
import { MOCK_ANALYTICS } from '../constants';
import { User, Game } from '../types';
import { 
  ChartBarIcon, 
  UsersIcon, 
  ClockIcon, 
  ArrowTrendingUpIcon, 
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ArrowPathRoundedSquareIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface DashboardProps {
  user: User;
  games: Game[];
}

export const Dashboard: React.FC<DashboardProps> = ({ user, games }) => {
  const creatorGames = games.filter(g => g.creator === user.name || g.creator === 'Mock Creator');
  const data = MOCK_ANALYTICS;

  // Mock delta data (monthly changes)
  const deltas = {
    totalPlays: +12.5,
    uniquePlayers: +8.2,
    avgSessionTime: -2.4,
    completionRate: +5.1
  };

  const exportToCSV = () => {
    const headers = ['Metric', 'Current Value', 'Growth %'];
    const rows = [
      ['Total Plays', data.totalPlays, `${deltas.totalPlays}%`],
      ['Unique Players', data.uniquePlayers, `${deltas.uniquePlayers}%`],
      ['Avg Session Time', data.avgSessionTime, `${deltas.avgSessionTime}%`],
      ['Completion Rate', data.completionRate, `${deltas.completionRate}%`],
      ['Returning Users', data.returningUsers, 'N/A']
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `arcade_analytics_${user.name.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2 uppercase tracking-tighter">CREATOR DASHBOARD</h1>
          <p className="text-slate-400">Analytics for <span className="text-cyan-400 font-bold">{user.name}</span></p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all"
          >
            <ArrowDownTrayIcon className="w-5 h-5" /> EXPORT CSV
          </button>
          <div className="bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-700">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Tracking</p>
            <p className="text-xl font-bold text-white">{creatorGames.length} Active Games</p>
          </div>
        </div>
      </div>

      {/* Game Selector for Analytics */}
      <div className="mb-12 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {creatorGames.map(game => (
          <button key={game.id} className="flex-shrink-0 flex items-center gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all">
            <img src={game.thumbnail} className="w-10 h-10 rounded-lg object-cover" alt={game.title} />
            <span className="text-sm font-bold text-white whitespace-nowrap">{game.title}</span>
          </button>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Plays', value: data.totalPlays.toLocaleString(), icon: ChartBarIcon, color: 'text-cyan-400', bg: 'bg-cyan-500/10', delta: deltas.totalPlays },
          { label: 'Unique Players', value: data.uniquePlayers.toLocaleString(), icon: UsersIcon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', delta: deltas.uniquePlayers },
          { label: 'Avg. Session', value: `${data.avgSessionTime} min`, icon: ClockIcon, color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', delta: deltas.avgSessionTime },
          { label: 'Completion Rate', value: `${data.completionRate}%`, icon: ArrowTrendingUpIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10', delta: deltas.completionRate },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 hover:border-slate-600 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-8 h-8" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.delta > 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                {Math.abs(stat.delta)}%
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Engagement & Retention */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <ArrowPathRoundedSquareIcon className="w-6 h-6 text-indigo-400" /> RETENTION & LOYALTY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">{data.returningUsers}%</div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Returning Users</p>
                <div className="mt-4 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${data.returningUsers}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">{data.day1ReturnRate}%</div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Day 1 Return</p>
                <div className="mt-4 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${data.day1ReturnRate}%` }}></div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-white mb-2">{data.day7ReturnRate}%</div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Day 7 Return</p>
                <div className="mt-4 w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-fuchsia-500 rounded-full" style={{ width: `${data.day7ReturnRate}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <UserGroupIcon className="w-6 h-6 text-fuchsia-400" /> AGE DISTRIBUTION
              </h3>
              <div className="space-y-4">
                {Object.entries(data.demographics.age).map(([range, percent], i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>{range} Years</span>
                      <span className="text-white">{percent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-fuchsia-500" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <GlobeAltIcon className="w-6 h-6 text-emerald-400" /> TOP COUNTRIES
              </h3>
              <div className="space-y-4">
                {Object.entries(data.demographics.countries).map(([country, percent], i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 text-xs font-bold text-slate-500">{country}</div>
                    <div className="flex-grow h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/50" style={{ width: `${percent}%` }}></div>
                    </div>
                    <div className="w-10 text-xs font-bold text-white text-right">{percent}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Analytics */}
        <div className="space-y-8">
          <div className="bg-slate-800/40 rounded-3xl p-8 border border-slate-700/50">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-6 h-6 text-cyan-400" /> DEVICE TYPE
            </h3>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="flex gap-12 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{data.demographics.devices.mobile}%</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mobile</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-1">{data.demographics.devices.desktop}%</div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Desktop</p>
                </div>
              </div>
              <div className="w-full h-6 bg-slate-700 rounded-full overflow-hidden flex">
                <div className="h-full bg-cyan-500" style={{ width: `${data.demographics.devices.mobile}%` }}></div>
                <div className="h-full bg-slate-600" style={{ width: `${data.demographics.devices.desktop}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-600 to-fuchsia-600 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
            <h3 className="text-xl font-bold mb-4 font-orbitron uppercase tracking-tighter relative z-10">Premium Insights</h3>
            <p className="text-indigo-100 text-sm mb-6 relative z-10">Unlock real-time data tracking, custom events, and detailed player journey maps with Arcade Pro.</p>
            <button className="w-full py-4 bg-white text-indigo-600 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all relative z-10">
              UPGRADE NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


