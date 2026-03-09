
import React, { useState } from 'react';
import { MOCK_CHALLENGES } from '../constants';
import AdUnit from '../components/AdUnit';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ChevronRightIcon,
  SparklesIcon,
  CheckBadgeIcon,
  XMarkIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const Challenges: React.FC = () => {
  const [showSchedule, setShowSchedule] = useState(false);
  const [remindedJams, setRemindedJams] = useState<string[]>([]);

  const fullSchedule = [
    { date: 'Oct 15 - Oct 22', title: 'Cyberpunk Weekly Jam', tier: 'Weekly Jam', prize: 'Rev Share' },
    { date: 'Oct 25 - Nov 10', title: 'Sweatcoin Move-to-Game Jam', tier: 'Branded', prize: '$SWEAT' },
    { date: 'Nov 01 - Nov 30', title: 'The Great AI Showdown', tier: 'Monthly', prize: 'Creator Grant' },
    { date: 'Dec 01 - Jan 15', title: 'Arcade Genesis Championship', tier: 'Seasonal', prize: '$VIBE Token Launch' },
  ];

  const handleRemindMe = (title: string) => {
    if (remindedJams.includes(title)) {
      alert(`You are already subscribed to reminders for "${title}".`);
      return;
    }
    setRemindedJams(prev => [...prev, title]);
    alert(`Reminder set for "${title}"! We'll notify you when it goes live.`);
  };

  return (
    <div className="space-y-10">
      <div className="relative p-10 md:p-16 rounded-[40px] overflow-hidden bg-slate-900 border border-slate-800">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500/20 to-transparent blur-3xl -z-10"></div>
        <div className="max-w-3xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-black font-orbitron tracking-tighter mb-6 leading-none">
            CREATOR <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">CHALLENGES</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-8">
            Compete in weekly jams and brand partnerships to build your reputation, earn exclusive tokens, and launch your gaming career.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/creator-zone" className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-1 text-center">
              START CREATING
            </Link>
            <button 
              onClick={() => setShowSchedule(true)}
              className="px-8 py-4 bg-slate-800 border border-slate-700 text-white font-bold rounded-2xl hover:bg-slate-700 transition-all"
            >
              VIEW FULL SCHEDULE
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showSchedule && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
              <h2 className="text-2xl font-black font-orbitron tracking-tight uppercase">Arcade Jam Schedule</h2>
              <button onClick={() => setShowSchedule(false)} className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800 rounded-xl">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              {fullSchedule.map((item, i) => {
                const isReminded = remindedJams.includes(item.title);
                return (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-slate-950/50 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-1">
                        <ClockIcon className="w-3 h-3" />
                        {item.date}
                      </div>
                      <h3 className="text-xl font-bold group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                      <p className="text-slate-500 text-xs font-medium uppercase tracking-tighter">{item.tier} • Prize: {item.prize}</p>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemindMe(item.title);
                      }}
                      className={`mt-4 md:mt-0 px-5 py-2 text-xs font-black rounded-xl transition-all uppercase tracking-widest flex items-center gap-2 ${
                        isReminded 
                        ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-default' 
                        : 'text-slate-100 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950'
                      }`}
                    >
                      {isReminded ? (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          REMINDED
                        </>
                      ) : (
                        'Remind Me'
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="p-8 bg-slate-950/30 border-t border-slate-800 flex justify-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">More jams added monthly. Stay sharp.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { name: 'Weekly Jams', freq: 'Weekly', prize: 'Rev Share', icon: CalendarIcon, color: 'text-cyan-400' },
          { name: 'Monthly Showdowns', freq: 'Monthly', prize: 'Adv Rev Share', icon: SparklesIcon, color: 'text-fuchsia-400' },
          { name: 'Branded Challenges', freq: 'Partnered', prize: 'Custom Tokens', icon: CheckBadgeIcon, color: 'text-green-400' },
          { name: 'Seasonal Series', freq: 'Quarterly', prize: 'Token Launch', icon: CurrencyDollarIcon, color: 'text-yellow-400' },
        ].map((tier, idx) => (
          <div key={idx} className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all">
            <tier.icon className={`w-8 h-8 ${tier.color} mb-4`} />
            <h3 className="text-lg font-bold mb-1">{tier.name}</h3>
            <p className="text-xs text-slate-400 mb-4">{tier.freq}</p>
            <div className="pt-3 border-t border-slate-800">
              <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Top Reward</p>
              <p className="font-orbitron font-bold text-xs">{tier.prize}</p>
            </div>
          </div>
        ))}
      </div>

      {/* AD SPOT 1 */}
      <AdUnit slot="challenges-mid-1" />

      <div className="space-y-6">
        <h2 className="text-3xl font-black font-orbitron flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-cyan-400" />
          ACTIVE COMPETITIONS
        </h2>
        
        <div className="space-y-6">
          {MOCK_CHALLENGES.map(challenge => (
            <div key={challenge.id} className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-cyan-500/50 transition-all">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-[400px] h-64 lg:h-auto relative overflow-hidden">
                  <img src={challenge.banner} alt={challenge.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className="px-3 py-1 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase rounded shadow-lg">
                      {challenge.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex-1 p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-cyan-400 text-xs font-black uppercase tracking-widest">{challenge.tier}</span>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <CalendarIcon className="w-4 h-4" />
                        Deadline: {new Date(challenge.deadline).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-3xl font-black mb-4 group-hover:text-cyan-400 transition-colors tracking-tight">{challenge.title}</h3>
                    <p className="text-slate-400 leading-relaxed mb-6">
                      {challenge.description} 
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-slate-500" />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black">Entries</p>
                          <p className="font-bold text-sm">{challenge.participants}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase font-black">Prize Pool</p>
                          <p className="font-bold text-sm text-slate-100">{challenge.prize}</p>
                        </div>
                      </div>
                    </div>
                    <Link to="/creator-zone" className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all flex items-center gap-2 group/btn active:scale-95">
                      SUBMIT ENTRY
                      <ChevronRightIcon className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
