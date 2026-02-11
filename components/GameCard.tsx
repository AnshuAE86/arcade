
import React from 'react';
import { Link } from 'react-router-dom';
import { Game } from '../types';
import { StarIcon, PlayIcon, FireIcon } from '@heroicons/react/24/solid';

interface GameCardProps {
  game: Game;
  compact?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, compact = false }) => {
  return (
    <Link 
      to={`/game/${game.id}`}
      className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all duration-300"
    >
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={game.thumbnail} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        
        <div className="absolute top-2 left-2 flex gap-2">
          {game.isFeatured && (
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-fuchsia-500 text-white text-[10px] font-black uppercase">
              <FireIcon className="w-3 h-3" />
              Hot
            </span>
          )}
          <span className="px-2 py-1 rounded bg-slate-900/80 backdrop-blur text-slate-300 text-[10px] font-bold uppercase">
            {game.genre}
          </span>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-cyan-400 flex items-center justify-center text-slate-950 shadow-lg scale-90 group-hover:scale-100 transition-transform">
            <PlayIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-slate-100 truncate flex-1 group-hover:text-cyan-400 transition-colors">
            {game.title}
          </h3>
          <div className="flex items-center gap-1 text-yellow-500 ml-2">
            <StarIcon className="w-3 h-3" />
            <span className="text-[11px] font-bold">{game.rating}</span>
          </div>
        </div>
        
        {!compact && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">
            {game.description}
          </p>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>By <span className="text-slate-300">{game.creator}</span></span>
          <span className="font-medium">{(game.plays / 1000).toFixed(1)}k Plays</span>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
