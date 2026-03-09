import React, { useState } from 'react';
import { MOCK_QUESTS, MOCK_USER } from '../constants';
import { Quest, User } from '../types';
import SpinWheel from '../components/SpinWheel';
import { Link } from 'react-router-dom';
import {
  CheckCircleIcon,
  CalendarIcon,
  SparklesIcon,
  GiftIcon,
  UserGroupIcon,
  ShareIcon,
  PlayIcon,
  ClockIcon,
  ArrowPathIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

interface QuestsProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export const Quests: React.FC<QuestsProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'special'>('daily');

  if (!user) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-tr from-cyan-500 to-indigo-600 rounded-3xl shadow-2xl shadow-cyan-500/20 mb-8">
            <GiftIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black font-orbitron text-white mb-6 tracking-tighter uppercase">Unlock Your Potential</h1>
          <p className="text-xl text-slate-400 mb-10 leading-relaxed">
            Join the VAIBE Arcade today and start earning <span className="text-cyan-400 font-bold">Arcade Coins</span> for every game you play.
            Complete daily missions, climb the hall of fame, and win real prizes in our exclusive raffles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
            {([
              { title: "Daily Rewards", desc: "Get coins just for checking in and playing your favorite games.", icon: CalendarIcon },
              { title: "Exclusive Items", desc: "Spend your earnings on ad-free passes and premium game keys.", icon: TicketIcon },
              { title: "Social Perks", desc: "Refer friends and join the global community in our secure chat.", icon: UserGroupIcon },
            ]).map((benefit, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <benefit.icon className="w-8 h-8 text-cyan-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 uppercase font-orbitron text-sm">{benefit.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-10 py-5 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-cyan-500/20 uppercase tracking-widest"
            >
              Start Earning Now
            </Link>
            <p className="text-slate-500 text-sm italic">Free to join, forever to play.</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredQuests = MOCK_QUESTS.filter(q => q.type === activeTab);

  const getProgress = (quest: Quest) => {
    return user.questProgress?.[quest.id] || 0;
  };

  const isCompleted = (quest: Quest) => {
    return getProgress(quest) >= quest.target;
  };

  const isClaimed = (quest: Quest) => {
    return (user.completedQuests || []).includes(quest.id);
  };

  const handleClaim = (quest: Quest) => {
    if (isCompleted(quest) && !isClaimed(quest)) {
      setUser(prev => prev ? ({
        ...prev,
        arcadeCoins: (prev.arcadeCoins || 0) + quest.reward,
        completedQuests: [...(prev.completedQuests || []), quest.id]
      }) : null);
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'check-in': return <CheckCircleIcon className="w-6 h-6" />;
      case 'play-games': return <PlayIcon className="w-6 h-6" />;
      case 'play-time': return <ClockIcon className="w-6 h-6" />;
      case 'spin-wheel': return <ArrowPathIcon className="w-6 h-6" />;
      case 'watch-ads': return <TicketIcon className="w-6 h-6" />;
      case 'social': return <ShareIcon className="w-6 h-6" />;
      case 'referral': return <UserGroupIcon className="w-6 h-6" />;
      default: return <SparklesIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2">QUESTS & MISSIONS</h1>
          <p className="text-slate-400">Complete challenges to earn Arcade Coins.</p>
        </div>
        <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <GiftIcon className="w-6 h-6 text-yellow-400" />
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold">Arcade Coins</p>
            <p className="text-xl font-bold text-white">{user.arcadeCoins}</p>
          </div>
        </div>
      </div>

      <div className="mb-12 max-w-2xl mx-auto">
        <SpinWheel user={user} setUser={setUser} />
      </div>

      <div className="flex gap-4 mb-8">
        {(['daily', 'weekly', 'special'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === tab
                ? 'bg-cyan-500 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.map(quest => {
          const progress = getProgress(quest);
          const percent = Math.min((progress / quest.target) * 100, 100);
          const completed = isCompleted(quest);
          const claimed = isClaimed(quest);

          return (
            <div key={quest.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-700 rounded-xl text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-900 transition-colors">
                  {getIcon(quest.category)}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-cyan-400">+{quest.reward}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-black">Arcade Coins</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{quest.title}</h3>
              <p className="text-sm text-slate-400 mb-6">{quest.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-cyan-400">{progress} / {quest.target}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              <button
                disabled={!completed || claimed}
                onClick={() => handleClaim(quest)}
                className={`w-full py-3 rounded-xl font-bold transition-all ${claimed
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : completed
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 hover:scale-[1.02] shadow-lg shadow-yellow-500/20'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
              >
                {claimed ? 'CLAIMED' : completed ? 'CLAIM REWARD' : 'IN PROGRESS'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};


