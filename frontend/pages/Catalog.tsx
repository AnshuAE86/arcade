import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { GameGenre, Game } from '../types';
import GameCard from '../components/GameCard';
import AdUnit from '../components/AdUnit';
import {
  FunnelIcon,
  ChevronDownIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  StarIcon as StarOutline
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { authenticatedFetch } from '../utils/api';

interface CatalogProps {
  genres: string[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

export const Catalog: React.FC<CatalogProps> = ({ genres: availableGenres }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genre');

  const genres = ['All', ...availableGenres];
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Popular' | 'Newest' | 'Rating'>('Popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Fetch games when genre changes (Backend Filtering)
  const fetchFilteredGames = async (genre: string) => {
    setIsLoading(true);
    try {
      const url = genre === 'All'
        ? `${BACKEND_URL}/games/browse`
        : `${BACKEND_URL}/games/browse?genre=${encodeURIComponent(genre)}`;
      const response = await authenticatedFetch(url);
      if (response.ok) {
        const data = await response.json();
        setGames(data);
      }
    } catch (error) {
      console.error('Error fetching filtered games:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const genre = genreParam || 'All';
    setActiveGenre(genre);
    fetchFilteredGames(genre);
  }, [genreParam]);

  const handleGenreChange = (genre: string) => {
    setActiveGenre(genre);
    if (genre === 'All') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', genre);
    }
    setSearchParams(searchParams);
  };

  // We still do some frontend sorting and rating filtering on the fetched set
  const filteredGames = games
    .filter(g => (activeGenre === 'All' || g.genre === activeGenre) && g.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === 'Popular') return b.plays - a.plays;
      if (sortBy === 'Newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'Rating') return b.rating - a.rating;
      return 0;
    });

  const clearFilters = () => {
    setActiveGenre('All');
    setMinRating(0);
    setSortBy('Popular');
    searchParams.delete('genre');
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-orbitron tracking-tighter mb-2 uppercase">BROWSER GAMES</h1>
          <p className="text-slate-400">Discover and play the best browser-based games in the Arcade.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <ListBulletIcon className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all font-bold text-sm ${isFilterOpen ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}
          >
            <FunnelIcon className="w-4 h-4" />
            {isFilterOpen ? 'Close Filters' : 'Filters'}
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FunnelIcon className="w-5 h-5 text-cyan-400" />
              Advanced Filters
            </h3>
            <button onClick={clearFilters} className="text-xs font-black text-slate-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
              Reset All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Min Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setMinRating(star)} className="transition-transform active:scale-90">
                    {minRating >= star ? (
                      <StarSolid className="w-6 h-6 text-yellow-500" />
                    ) : (
                      <StarOutline className="w-6 h-6 text-slate-700 hover:text-slate-500" />
                    )}
                  </button>
                ))}
                {minRating > 0 && <span className="text-xs font-bold text-slate-400 ml-2">{minRating}.0+</span>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Sort Results</label>
              <div className="flex flex-wrap gap-2">
                {(['Popular', 'Newest', 'Rating'] as const).map(option => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${sortBy === option ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Genre</label>
              <select
                value={activeGenre}
                onChange={(e) => handleGenreChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              >
                {genres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* AD SPOT 1 */}
      <AdUnit slot="catalog-header-1" />

      <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-800">
        {genres.slice(0, 8).map(genre => (
          <button
            key={genre}
            onClick={() => handleGenreChange(genre as any)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${activeGenre === genre
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
              }`}
          >
            {genre.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "flex flex-col gap-4"
      }>
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Scanning database...</p>
          </div>
        ) : filteredGames.length > 0 ? (
          filteredGames.map(game => (
            viewMode === 'grid'
              ? <GameCard key={game.id} game={game} />
              : (
                <div key={game.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-6 hover:border-cyan-500/50 transition-all cursor-pointer">
                  <img src={game.thumbnail} className="w-40 h-24 object-cover rounded-xl" alt={game.title} />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1 group-hover:text-cyan-400 transition-colors">{game.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-black uppercase text-cyan-400">{game.genre}</span>
                      <span className="flex items-center gap-1"><StarSolid className="w-3 h-3 text-yellow-500" /> {game.rating}</span>
                      <span>By {game.creator}</span>
                      <span>{(game.plays / 1000).toFixed(1)}k Plays</span>
                    </div>
                  </div>
                  <button className="px-6 py-2 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 rounded-xl font-bold transition-all text-sm uppercase">
                    Play
                  </button>
                </div>
              )
          ))
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-700">
              <FunnelIcon className="w-10 h-10" />
            </div>
            <p className="text-slate-400 font-bold text-xl uppercase tracking-widest font-orbitron">No games found</p>
            <p className="text-slate-500">Try adjusting your filters to find what you're looking for.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 border border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-slate-950 transition-all font-black rounded-xl uppercase text-xs tracking-widest"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {filteredGames.length > 0 && (
        <div className="pt-10 flex flex-col items-center gap-8">
          <button className="px-8 py-4 bg-slate-900 border border-slate-800 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-3 group">
            Load More Games
            <ChevronDownIcon className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </button>

          {/* AD SPOT 2 */}
          <AdUnit slot="catalog-footer-1" />
        </div>
      )}
    </div>
  );
};
