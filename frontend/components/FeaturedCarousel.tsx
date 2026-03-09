
import React, { useState } from 'react';
import { Game } from '../types';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from '@heroicons/react/24/solid';

interface FeaturedCarouselProps {
  games: Game[];
}

const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({ games }) => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % games.length);
  const prev = () => setCurrent((prev) => (prev - 1 + games.length) % games.length);

  const activeGame = games[current];

  return (
    <div className="relative w-full h-[300px] md:h-[450px] rounded-3xl overflow-hidden group">
      {/* Background with motion */}
      <div className="absolute inset-0 transition-opacity duration-1000">
        <img 
          src={activeGame.thumbnail} 
          alt={activeGame.title}
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-2xl">
        <div className="flex gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
            FEATURED GAME
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700">
            {activeGame.genre}
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-black font-orbitron mb-4 tracking-tighter leading-tight">
          {activeGame.title}
        </h1>
        
        <p className="text-slate-300 text-lg mb-8 line-clamp-3 md:line-clamp-none max-w-lg">
          {activeGame.description}
        </p>

        <div className="flex items-center gap-4">
          <Link 
            to={`/game/${activeGame.id}`}
            className="flex items-center gap-2 px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-2xl font-black text-lg transition-all transform hover:scale-105 hover:rotate-1"
          >
            <PlayIcon className="w-6 h-6" />
            PLAY NOW
          </Link>
          <button className="p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-100 rounded-2xl transition-all">
            Add to Library
          </button>
        </div>
      </div>

      {/* Navigation */}
      <button 
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/50 hover:bg-cyan-400 text-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeftIcon className="w-8 h-8" />
      </button>
      <button 
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/50 hover:bg-cyan-400 text-white hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex gap-2">
        {games.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all ${idx === current ? 'w-8 bg-cyan-400' : 'w-2 bg-slate-700 hover:bg-slate-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default FeaturedCarousel;
