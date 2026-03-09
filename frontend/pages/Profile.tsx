import React, { useState, useRef, useEffect } from 'react';
import { User, Game } from '../types';
import GameCard from '../components/GameCard';
import {
  PencilIcon,
  ShareIcon,
  WalletIcon,
  ChartBarIcon,
  SparklesIcon,
  PlayIcon,
  BookmarkIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  CameraIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface ProfileProps {
  user: User | null;
  games: Game[];
  onUpdateProfile: (updated: Partial<User>) => void;
}

type Tab = 'My Games' | 'Library' | 'Collections' | 'Analytics';

export const Profile: React.FC<ProfileProps> = ({ user, games, onUpdateProfile }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>('My Games');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editRole, setEditRole] = useState<'Player' | 'Creator'>(user?.role || 'Player');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';
          const response = await fetch(`${BACKEND_URL}/users/${user.id}`);
          if (response.ok) {
            const latestUser = await response.json();
            onUpdateProfile(latestUser);
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (!user) return <div className="p-20 text-center">Please login to view profile.</div>;

  const myGames = games.filter(g => g.creator === user.name || g.creator === 'CyberGhost');
  const libraryGames = games.filter(g => user.library?.includes(g.id) || false);

  // Dynamic EXP Calculation
  // Level 1: 0-500, Level 2: 501-1100, Level 3: 1101-1800...
  // Requirement(L) = 500 + (L-1)*100
  const getLevelInfo = (totalExp: number = 0) => {
    // Inverse of T(L) = 50L^2 + 350L - 400
    const level = Math.floor((-7 + Math.sqrt(81 + totalExp / 12.5)) / 2) || 1;
    const totalExpToCurrentLevel = 50 * (level - 1) * (level + 8);
    const expIntoLevel = totalExp - totalExpToCurrentLevel;
    const expRequiredForNext = 500 + (level - 1) * 100;
    return { level, expIntoLevel, expRequiredForNext };
  };

  const { level, expIntoLevel, expRequiredForNext } = getLevelInfo(user.exp || 0);

  const handleSave = () => {
    onUpdateProfile({ name: editName, role: editRole, avatar: editAvatar });
    setIsEditing(false);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Cover & Profile Header */}
      <div className="relative">
        <div className="h-48 md:h-64 rounded-[40px] bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 overflow-hidden border border-slate-800">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>

        <div className="px-8 flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
          <div className="relative group" onClick={triggerFileInput}>
            <img
              src={isEditing ? editAvatar : user.avatar}
              alt={user.name}
              className={`w-32 h-32 md:w-44 md:h-44 rounded-[32px] bg-slate-900 border-4 border-slate-950 shadow-2xl transition-all object-cover ${isEditing ? 'cursor-pointer hover:brightness-75' : ''}`}
            />
            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[32px] pointer-events-none">
                <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-white text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity mt-1">Change Avatar</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex-1 pb-4 text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4 max-w-md bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl mb-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profile Type</label>
                  <div className="flex gap-2">
                    {['Player', 'Creator'].map((r) => (
                      <button
                        key={r}
                        onClick={() => setEditRole(r as any)}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${editRole === r ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                  <h1 className="text-4xl font-black font-orbitron tracking-tighter uppercase">{user.name}</h1>
                  {user.isPremium && (
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-600 p-[1px] rounded-lg">
                      <div className="bg-slate-950 px-2 py-0.5 rounded-[7px] flex items-center gap-1">
                        <SparklesIcon className="w-3 h-3 text-yellow-400" />
                        <span className="text-[10px] font-black text-yellow-400 uppercase">PRO</span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-slate-400 max-w-xl line-clamp-2 mb-6">
                  Building the future of decentralized gaming. Always experimenting with new mechanics and AI integrations. Arcade Genesis Creator.
                </p>

                {/* EXP Progress Bar */}
                <div className="max-w-md mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2">
                      <BoltIcon className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Level {level}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{expIntoLevel} / {expRequiredForNext} XP</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 transition-all duration-1000"
                      style={{ width: `${(expIntoLevel / expRequiredForNext) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 font-medium">
              <h1 className="text-3xl md:text-4xl font-black font-orbitron tracking-tighter uppercase">{user.name}</h1>
              {user.isPremium && (
                <div className="bg-gradient-to-r from-yellow-400 to-amber-600 p-[1px] rounded-lg">
                  <div className="bg-slate-950 px-2 py-0.5 rounded-[7px] flex items-center gap-1">
                    <SparklesIcon className="w-3 h-3 text-yellow-400" />
                    <span className="text-[10px] font-black text-yellow-400 uppercase">PRO</span>
                  </div>
                </div>
              )}
              <span className="flex items-center gap-1.5"><UserIcon className="w-4 h-4 text-indigo-400" /> {user.role}</span>
              <span className="flex items-center gap-1.5"><BoltIcon className="w-4 h-4 text-cyan-400" /> Level {level}</span>
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                Code: <span className="text-cyan-400">{user.referralCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(user.referralCode);
                    alert('Referral code copied!');
                  }}
                  className="p-1 hover:text-white transition-colors"
                >
                  <ShareIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            </div>
          </div>

          <div className="flex gap-2 pb-4">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm text-slate-400"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl hover:bg-cyan-400 transition-all font-black text-sm shadow-lg shadow-cyan-500/20"
                >
                  <CheckIcon className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-300">
                  <ShareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm"
                >
                  <PencilIcon className="w-4 h-4" />
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Games Created', value: myGames.length, icon: ChartBarIcon, color: 'text-cyan-400' },
          { label: 'Library Size', value: libraryGames.length, icon: BookmarkIcon, color: 'text-fuchsia-400' },
          { label: 'Total Plays', value: user.gamesPlayed, icon: PlayIcon, color: 'text-yellow-400' },
          { label: 'Followers', value: '1.2k', icon: ChartBarIcon, color: 'text-indigo-400' },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-3`} />
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black font-orbitron tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Content Tabs */}
      <div className="space-y-8">
        <div className="flex border-b border-slate-800 gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {(['My Games', 'Library', 'Collections', 'Analytics'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-black uppercase tracking-widest transition-all border-b-2 ${activeTab === tab
                ? 'text-cyan-400 border-cyan-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'My Games' && (
            <>
              {myGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
              <div
                onClick={() => navigate('/creator-zone')}
                className="rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center p-8 space-y-4 hover:border-cyan-500/50 transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <p className="font-bold text-slate-400 group-hover:text-slate-200 uppercase text-xs tracking-widest">Submit New Game</p>
              </div>
            </>
          )}

          {activeTab === 'Library' && (
            <>
              {libraryGames.length > 0 ? (
                libraryGames.map(game => (
                  <GameCard key={game.id} game={game} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center space-y-4">
                  <BookmarkIcon className="w-16 h-16 text-slate-800 mx-auto" />
                  <p className="text-slate-500 font-bold">Your library is empty. Discover games to save them here!</p>
                  <button onClick={() => navigate('/catalog')} className="px-6 py-2 bg-slate-800 text-cyan-400 font-bold rounded-xl border border-slate-700 uppercase text-xs tracking-widest">
                    Browse Games
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'Collections' && (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
              Feature coming soon!
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest">
              Detailed creator analytics are available for verified accounts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
