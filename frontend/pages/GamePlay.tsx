import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Game, User } from '../types';
import AdUnit from '../components/AdUnit';
import {
  ArrowsPointingOutIcon,
  HeartIcon,
  ShareIcon,
  FlagIcon,
  HandThumbUpIcon,
  UserCircleIcon,
  BookmarkIcon as BookmarkOutline,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import GameCard from '../components/GameCard';

interface GamePlayProps {
  user: User | null;
  games: Game[];
  onPlayComplete: (amount: number) => void;
  updateQuestProgress?: (category: string, amount: number) => void;
  userLibrary: string[];
  onToggleLibrary: (id: string) => void;
  onLaunch?: (gameId: string) => void;
}

export const GamePlay: React.FC<GamePlayProps> = ({ games, onPlayComplete, updateQuestProgress, userLibrary, onToggleLibrary, onLaunch }) => {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    const found = games.find(g => g.id === id);
    if (found) {
      setGame(found);

      // Tracking games played
      if (updateQuestProgress) {
        updateQuestProgress('play-games', 1);
      }

      if (onLaunch) {
        onLaunch(found.id);
      }

      // Tracking play time (simulated after 5 seconds for demo)
      const timer = setTimeout(() => {
        onPlayComplete(10);
        if (updateQuestProgress) {
          updateQuestProgress('play-time', 1); // 1 minute/unit
        }
      }, 5000);

      return () => clearTimeout(timer);
    }
    window.scrollTo(0, 0);
  }, [id, games, updateQuestProgress]);

  if (!game) return <div className="p-20 text-center">Loading game...</div>;

  const toggleFullscreen = () => {
    const elem = document.getElementById('game-container');
    if (!elem) return;
    if (!isFullscreen) {
      elem.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const isInLibrary = userLibrary.includes(game.id);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Game Stage */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div id="game-container" className="relative aspect-video bg-black flex items-center justify-center">
          <iframe
            src={game.iframeUrl}
            className="w-full h-full border-none"
            title={game.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-slate-800">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black font-orbitron">{game.title}</h1>
            <div className="flex items-center gap-1 text-yellow-500 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <StarIcon className="w-5 h-5" />
              <span className="font-bold">{game.rating}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleLibrary(game.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${isInLibrary
                  ? 'bg-green-500/10 border-green-500 text-green-400'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
            >
              {isInLibrary ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  IN LIBRARY
                </>
              ) : (
                <>
                  <BookmarkOutline className="w-5 h-5" />
                  ADD TO LIBRARY
                </>
              )}
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20"
            >
              <ArrowsPointingOutIcon className="w-5 h-5" />
              FULLSCREEN
            </button>
          </div>
        </div>
      </div>

      {/* AD SPOT 1 - Below Game */}
      <AdUnit slot="gameplay-mid-1" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Rating Section */}
          <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-1">What did you think?</h3>
              <p className="text-slate-400 text-sm">Help the creator by leaving a rating.</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  onClick={() => setUserRating(star)}
                  className="transition-transform active:scale-90"
                >
                  <StarIcon
                    className={`w-10 h-10 ${(hoverRating || userRating || 0) >= star
                        ? 'text-yellow-500'
                        : 'text-slate-800'
                      }`}
                  />
                </button>
              ))}
              {userRating && (
                <span className="ml-2 text-cyan-400 font-black font-orbitron text-xl">
                  {userRating}.0
                </span>
              )}
            </div>
          </section>

          {/* Details */}
          <section className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${game.creator}`}
                alt={game.creator}
                className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700"
              />
              <div>
                <p className="text-sm text-slate-400">Created by</p>
                <p className="font-bold text-lg">{game.creator}</p>
              </div>
              <button className="ml-auto px-4 py-2 border border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all">
                Follow
              </button>
            </div>

            <h3 className="text-xl font-bold mb-4">Description</h3>
            <p className="text-slate-400 leading-relaxed mb-6">
              {game.description} Built with instant-play technology, this game features dynamic difficulty scaling and global leaderboards.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {game.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Plays</p>
                <p className="font-orbitron font-bold">{(game.plays / 1000).toFixed(1)}k</p>
              </div>
              <div className="text-center border-l border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Release</p>
                <p className="font-orbitron font-bold text-sm">Jan 2024</p>
              </div>
              <div className="text-center border-l border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Genre</p>
                <p className="font-orbitron font-bold text-sm">{game.genre}</p>
              </div>
              <div className="text-center border-l border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Earn</p>
                <p className="font-orbitron font-bold text-cyan-400">Tokens</p>
              </div>
            </div>
          </section>

          {/* Comments/Engagement (Mock) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Comments (124)</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <select className="bg-transparent text-sm font-bold border-none focus:ring-0 cursor-pointer">
                  <option>Top</option>
                  <option>Newest</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
                <UserCircleIcon className="w-10 h-10 text-slate-700" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-sm">CryptoGamer88</p>
                    <span className="text-[10px] text-slate-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-3">One of the best synthwave racers I've played in a browser. The mechanics are tight!</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-cyan-400">
                      <HandThumbUpIcon className="w-4 h-4" /> 12
                    </button>
                    <button className="text-[11px] text-slate-500 hover:text-slate-300 font-bold uppercase">Reply</button>
                  </div>
                </div>
              </div>
            </div>

            <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 font-bold text-sm hover:bg-slate-800 transition-all">
              Load More Comments
            </button>
          </section>
        </div>

        {/* Sidebar: Recommended */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-orbitron">MORE LIKE THIS</h3>
            <Link to="/catalog" className="text-xs text-cyan-400 font-bold uppercase hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {games.filter(g => g.id !== id && g.genre === game.genre).slice(0, 3).map(rec => (
              <GameCard key={rec.id} game={rec} compact />
            ))}

            {/* AD SPOT 2 - Sidebar */}
            <AdUnit slot="gameplay-sidebar-1" className="my-2" />

            {games.filter(g => g.id !== id && g.genre !== game.genre).slice(0, 2).map(rec => (
              <GameCard key={rec.id} game={rec} compact />
            ))}
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20">
            <h4 className="font-black text-cyan-400 mb-2 uppercase tracking-tight text-sm">GameFi Rewards</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Playing this game earns you rewards. Reach the Top 10 leaderboard this week to qualify for the Monthly Token Airdrop.
            </p>
            <Link to="/launch" className="w-full py-2 bg-cyan-500 text-slate-950 text-[10px] font-black rounded-lg uppercase block text-center">
              Check Eligibility
            </Link>
          </div>

          <div className="flex gap-2">
            <button className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-cyan-400 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <ShareIcon className="w-4 h-4" />
              Share
            </button>
            <button className="flex-1 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-red-400 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <FlagIcon className="w-4 h-4" />
              Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
