import React, { useState, useEffect } from 'react';
import { MOCK_RAFFLES, MOCK_USER } from '../constants';
import { Raffle, User } from '../types';
import { authenticatedFetch } from '../utils/api';
import {
  TicketIcon,
  ClockIcon,
  TrophyIcon,
  InformationCircleIcon,
  SparklesIcon,
  ShoppingBagIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

interface RafflesProps {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const RaffleCard: React.FC<{
  raffle: Raffle;
  user: User;
  onEnter: (raffle: Raffle) => void;
  isEntering: boolean;
}> = ({ raffle, user, onEnter, isEntering }) => {
  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysLeft = calculateDaysLeft(raffle.endDate);
  const canAfford = (user.arcadeCoins || 0) >= raffle.cost;

  return (
    <div className="bg-slate-800/40 rounded-3xl border border-slate-700/50 overflow-hidden flex flex-col md:flex-row hover:border-cyan-500/50 transition-all group">
      <div className="md:w-1/3 relative h-48 md:h-auto">
        <img
          src={raffle.image}
          alt={raffle.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-700 flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase">{daysLeft} Days Left</span>
        </div>
      </div>

      <div className="md:w-2/3 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors uppercase font-orbitron">
            {raffle.title}
          </h2>
          <div className="p-2 bg-slate-700/50 rounded-lg text-yellow-400">
            <TrophyIcon className="w-5 h-5" />
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-6 flex-grow">
          {raffle.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Total Entries</p>
            <p className="text-lg font-bold text-white">{raffle.entries}</p>
          </div>
          <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Odds of Winning</p>
            <p className="text-lg font-bold text-cyan-400">{raffle.entries > 0 ? `1 in ${raffle.entries + 1}` : '100%'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-auto">
          <div className="flex-grow">
            <p className="text-[10px] text-slate-500 font-black uppercase">Cost Per Entry</p>
            <div className="flex items-center gap-1">
              <SparklesIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-xl font-black text-white">{raffle.cost}</span>
              <span className="text-xs font-bold text-slate-500">COINS</span>
            </div>
          </div>
          <button
            onClick={() => onEnter(raffle)}
            disabled={!canAfford || raffle.isEntered || isEntering}
            className={`px-8 py-3 rounded-2xl font-black text-sm uppercase transition-all flex items-center gap-2 ${raffle.isEntered
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
              : canAfford
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:scale-105 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
              } ${isEntering ? 'opacity-70' : ''}`}
          >
            {isEntering ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : raffle.isEntered ? (
              <>
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                JOINED
              </>
            ) : (
              <>
                <ShoppingBagIcon className="w-5 h-5" />
                ENTER NOW
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Raffles: React.FC<RafflesProps> = ({ user, setUser }) => {
  const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEntering, setIsEntering] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastEnteredRaffle, setLastEnteredRaffle] = useState<string>('');
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'raffles' | 'shop'>('raffles');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rafflesRes, shopRes] = await Promise.all([
          authenticatedFetch(`${BACKEND_URL}/raffles/`),
          authenticatedFetch(`${BACKEND_URL}/shop/items`)
        ]);

        if (rafflesRes.ok) {
          const rafflesData = await rafflesRes.json();
          setActiveRaffles(rafflesData);
        }

        if (shopRes.ok) {
          const shopData = await shopRes.json();

          // Fetch user purchases to mark items as owned
          const purchasesRes = await authenticatedFetch(`${BACKEND_URL}/shop/my-purchases`);
          const purchasesData = purchasesRes.ok ? await purchasesRes.json() : [];
          const purchasedItemIds = new Set(purchasesData.map((p: any) => p.item_id));

          // Map backend items to frontend format (adding icons based on category)
          const mappedShop = shopData.map((item: any) => ({
            ...item,
            isOwned: purchasedItemIds.has(item.id),
            icon: item.category === 'Feature' ? SparklesIcon :
              item.category === 'Game' ? TicketIcon :
                item.category === 'Utility' ? ShoppingBagIcon :
                  item.category === 'Boost' ? TrophyIcon : SparklesIcon
          }));
          setShopItems(mappedShop);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) return null;

  const handleEnterRaffle = async (raffle: Raffle) => {
    if (user.arcadeCoins >= raffle.cost && !raffle.isEntered) {
      // 1. Optimistic Update: Update UI immediately
      const previousRaffles = [...activeRaffles];
      const previousCoins = user.arcadeCoins;

      setActiveRaffles(prev => prev.map(r =>
        r.id === raffle.id ? { ...r, isEntered: true, entries: (r.entries || 0) + 1 } : r
      ));

      setUser(prev => prev ? ({
        ...prev,
        arcadeCoins: prev.arcadeCoins - raffle.cost
      }) : null);

      setIsEntering(raffle.id);

      try {
        const response = await authenticatedFetch(`${BACKEND_URL}/raffles/${raffle.id}/enter?user_id=${user.id}`, {
          method: 'POST'
        });

        if (response.ok) {
          const updatedRaffle = await response.json();

          // Update with real data from server (keeps isEntered: true)
          setActiveRaffles(prev => prev.map(r =>
            r.id === raffle.id ? { ...updatedRaffle, isEntered: true } : r
          ));

          setLastEnteredRaffle(raffle.title);
          setShowConfirmation(true);
          setIsConfettiActive(true);
          setTimeout(() => setIsConfettiActive(false), 3000);
        } else {
          // Rollback on error
          const error = await response.json();
          alert(error.detail || "Failed to enter raffle");
          setActiveRaffles(previousRaffles);
          setUser(prev => prev ? { ...prev, arcadeCoins: previousCoins } : null);
        }
      } catch (error) {
        console.error("Error entering raffle:", error);
        alert("An error occurred while entering the raffle");
        // Rollback on error
        setActiveRaffles(previousRaffles);
        setUser(prev => prev ? { ...prev, arcadeCoins: previousCoins } : null);
      } finally {
        setIsEntering(null);
      }
    }
  };

  const handleBuyShopItem = async (item: any) => {
    // Check if already owned (especially for unique items like Ad-Free Pass)
    const isOwned = shopItems.find(i => i.id === item.id)?.isOwned;
    if (isOwned && item.title === 'Ad-Free Pass') {
      alert("You already own this item!");
      return;
    }

    if (user.arcadeCoins >= item.cost) {
      // Optimistic update
      const previousCoins = user.arcadeCoins;
      const previousPremium = user.isPremium;

      setUser(prev => prev ? ({
        ...prev,
        arcadeCoins: prev.arcadeCoins - item.cost,
        isPremium: item.title === 'Ad-Free Pass' ? true : prev.isPremium,
        extraSpins: item.title === 'Extra Spin Ticket' ? (prev.extraSpins || 0) + 1 : prev.extraSpins
      }) : null);

      try {
        const response = await authenticatedFetch(`${BACKEND_URL}/shop/purchase/${item.id}`, {
          method: 'POST'
        });

        if (response.ok) {
          const result = await response.json();
          setLastEnteredRaffle(item.title);
          setShowConfirmation(true);
          setIsConfettiActive(true);
          setTimeout(() => setIsConfettiActive(false), 3000);

          // Update user state with precise balance from server
          if (result.new_balance !== undefined) {
            setUser(prev => prev ? ({
              ...prev,
              arcadeCoins: result.new_balance,
              extraSpins: result.new_extra_spins !== undefined ? result.new_extra_spins : prev.extraSpins
            }) : null);
          }
        } else {
          const error = await response.json();
          alert(error.detail || "Purchase failed");
          // Rollback
          setUser(prev => prev ? ({ ...prev, arcadeCoins: previousCoins, isPremium: previousPremium }) : null);
        }
      } catch (error) {
        console.error("Error purchasing item:", error);
        alert("An error occurred during purchase");
        // Rollback
        setUser(prev => prev ? ({ ...prev, arcadeCoins: previousCoins, isPremium: previousPremium }) : null);
      }
    }
  };

  return (
    <div className="p-8 relative overflow-hidden">
      {/* Confetti Effect */}
      {isConfettiActive && (
        <div className="fixed inset-0 pointer-events-none z-[100]">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#22d3ee', '#6366f1', '#d946ef', '#fbbf24'][Math.floor(Math.random() * 4)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 1}s`
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-orbitron">{activeTab === 'raffles' ? 'ENTRY SUCCESSFUL!' : 'PURCHASE SUCCESSFUL!'}</h3>
            <p className="text-slate-400 mb-8">{activeTab === 'raffles' ? `You have successfully entered the ${lastEnteredRaffle} raffle. Good luck!` : `You have successfully purchased: ${lastEnteredRaffle}`}</p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full py-4 bg-cyan-500 text-slate-950 font-black rounded-2xl hover:bg-cyan-400 transition-colors"
            >
              AWESOME
            </button>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-orbitron text-white mb-2 uppercase">ARCADE {activeTab}</h1>
          <p className="text-slate-400">Spend Arcade Coins to {activeTab === 'raffles' ? 'win prizes' : 'unlock features'}.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('raffles')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'raffles' ? 'bg-cyan-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Raffles
            </button>
            <button
              onClick={() => setActiveTab('shop')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'shop' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              Coin Shop
            </button>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <TicketIcon className="w-6 h-6 text-cyan-400" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold">Arcade Coins</p>
              <p className="text-xl font-bold text-white">{user.arcadeCoins}</p>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
        </div>
      ) : activeTab === 'raffles' ? (
        activeRaffles.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {activeRaffles.map(raffle => (
              <RaffleCard
                key={raffle.id}
                raffle={raffle}
                user={user}
                onEnter={handleEnterRaffle}
                isEntering={isEntering === raffle.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800">
            <TicketIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2 font-orbitron uppercase tracking-tighter">No Active Raffles</h2>
            <p className="text-slate-500">Check back later for new prizes and gift cards!</p>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopItems.map(item => (
            <div key={item.id} className="bg-slate-800/40 rounded-3xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8" />
                </div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 uppercase font-orbitron">{item.title}</h3>
              <p className="text-sm text-slate-400 mb-8 flex-grow">{item.description}</p>

              <button
                onClick={() => handleBuyShopItem(item)}
                disabled={user.arcadeCoins < item.cost || (item.isOwned && item.title === 'Ad-Free Pass')}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-center gap-2 ${user.arcadeCoins >= item.cost && !(item.isOwned && item.title === 'Ad-Free Pass')
                  ? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white hover:scale-105 shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
              >
                {item.isOwned && item.title === 'Ad-Free Pass' ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    OWNED
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4" />
                    {item.cost} COINS
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-12 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400">
          <InformationCircleIcon className="w-12 h-12" />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold text-white mb-2 uppercase font-orbitron">How Raffles Work</h3>
          <p className="text-slate-400 text-sm max-w-2xl">
            Each ticket you purchase gives you one chance to win. Winners are drawn automatically when the timer expires.
            All prizes are digital and will be delivered to your account email within 24 hours of winning.
          </p>
        </div>
        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-colors whitespace-nowrap">
          VIEW TERMS
        </button>
      </div>
    </div>
  );
};


