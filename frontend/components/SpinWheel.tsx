import React, { useState, useEffect } from 'react';
import { SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { MOCK_USER, MOCK_QUESTS } from '../constants';
import { User } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

interface SpinWheelProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ user, setUser }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [canSpin, setCanSpin] = useState(true);
  const [countdown, setCountdown] = useState<string>('');
  const [isConfettiActive, setIsConfettiActive] = useState(false);

  const prizes = [10, 20, 50, 100, 200, 500, 10, 50]; // Simple prize pool

  useEffect(() => {
    const checkCanSpin = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/users/${user.id}/spin-status`);
        if (response.ok) {
          const status = await response.json();
          setCanSpin(status.canSpin);

          if (!status.canSpin) {
            const h = Math.floor(status.hoursLeft);
            const m = Math.floor((status.hoursLeft - h) * 60);
            setCountdown(`${h}h ${m}m`);
          } else {
            setCountdown('');
          }
        }
      } catch (error) {
        console.error('Error checking spin status:', error);
      }
    };

    checkCanSpin();
    const timer = setInterval(checkCanSpin, 60000);
    return () => clearInterval(timer);
  }, [user.id, user.lastSpinDate]);

  const handleSpin = async (isPaid: boolean = false) => {
    if (isSpinning) return;
    if (!isPaid && !canSpin) return;
    if (isPaid && user.arcadeCoins < 50) return;

    setIsSpinning(true);
    setResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/users/${user.id}/spin?is_paid=${isPaid}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to spin wheel');
      }

      const { randomIndex, wonAmount, newBalance, lastSpinDate } = await response.json();

      // Calculate exact rotation to land on the center of that sector
      // sectors are clockwise from top, so we need to account for that
      // Sector 0 is at 0 degrees (top), Sector 1 is at 45 degrees, etc.
      // The wheel pointer is at the top. 
      // To land on sector i, the wheel must rotate (360 - (i * sectorSize)) degrees
      const sectorSize = 360 / prizes.length;
      const targetSectorRotation = 360 - (randomIndex * sectorSize);
      const extraSpins = 360 * 10; // 10 full rotations for drama
      const finalRotation = rotation + extraSpins + targetSectorRotation - (rotation % 360);

      setRotation(finalRotation);

      setTimeout(() => {
        setIsSpinning(false);
        setResult(wonAmount);
        setIsConfettiActive(true);
        setTimeout(() => setIsConfettiActive(false), 3000);

        // Update User and Quest Progress
        setUser(prev => {
          if (!prev) return null;

          const updatedProgress = { ...prev.questProgress };
          MOCK_QUESTS.forEach(q => {
            if (q.category === 'spin-wheel' && !prev.completedQuests.includes(q.id)) {
              updatedProgress[q.id] = Math.min((updatedProgress[q.id] || 0) + 1, q.target);
            }
          });

          return {
            ...prev,
            arcadeCoins: newBalance,
            questProgress: updatedProgress,
            lastSpinDate: isPaid ? prev.lastSpinDate : lastSpinDate
          };
        });

        if (!isPaid) {
          setCanSpin(false);
        }
      }, 5000); // Longer duration for drama
    } catch (error) {
      console.error('Spin error:', error);
      setIsSpinning(false);
    }
  };

  return (
    <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Confetti Effect */}
      {isConfettiActive && (
        <div className="absolute inset-0 pointer-events-none z-[100]">
          {[...Array(30)].map((_, i) => (
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

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500"></div>

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold font-orbitron text-white mb-2 flex items-center justify-center gap-2">
          DAILY SPIN <SparklesIcon className="w-6 h-6 text-yellow-400" />
        </h2>
        <p className="text-slate-400 text-sm">Spin the wheel to win Arcade Coins!</p>
      </div>

      <div className="relative w-64 h-64 mb-8">
        {/* Wheel Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-8 h-8 bg-white rotate-45 border-4 border-slate-800 rounded-lg"></div>
        </div>

        {/* The Wheel */}
        <div
          className="w-full h-full rounded-full border-8 border-slate-700 relative overflow-hidden shadow-2xl shadow-cyan-500/10"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
          }}
        >
          {prizes.map((prize, i) => (
            <div
              key={i}
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: `rotate(${i * (360 / prizes.length)}deg)` }}
            >
              <div
                className={`absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 origin-bottom flex flex-col items-center pt-4 ${i % 2 === 0 ? 'text-cyan-400' : 'text-indigo-400'
                  }`}
              >
                <span className="font-bold text-lg rotate-0">{prize}</span>
              </div>
              <div
                className={`absolute top-0 left-0 w-full h-full origin-center opacity-20 ${i % 2 === 0 ? 'bg-cyan-500' : 'bg-indigo-500'
                  }`}
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((360 / prizes.length / 2) * (Math.PI / 180))}% 0%)`,
                  transform: `rotate(-${360 / prizes.length / 2}deg)`
                }}
              ></div>
              <div
                className={`absolute top-0 left-0 w-full h-full origin-center opacity-20 ${i % 2 === 0 ? 'bg-cyan-500' : 'bg-indigo-500'
                  }`}
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 - 50 * Math.tan((360 / prizes.length / 2) * (Math.PI / 180))}% 0%)`,
                  transform: `rotate(${360 / prizes.length / 2}deg)`
                }}
              ></div>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 border-4 border-slate-700 rounded-full flex items-center justify-center z-20">
            <div className="w-4 h-4 bg-cyan-500 rounded-full shadow-lg shadow-cyan-500/50 animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4">
        {result && !isSpinning && (
          <div className="text-center animate-bounce mb-4">
            <p className="text-yellow-400 font-bold text-xl uppercase tracking-widest">
              You won {result} Arcade Coins!
            </p>
          </div>
        )}

        <button
          onClick={() => handleSpin(false)}
          disabled={!canSpin || isSpinning}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${!canSpin || isSpinning
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
            : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 text-white hover:scale-105 shadow-xl shadow-indigo-500/25 active:scale-95'
            }`}
        >
          {isSpinning ? (
            <ArrowPathIcon className="w-6 h-6 animate-spin" />
          ) : canSpin ? (
            'FREE DAILY SPIN'
          ) : (
            `NEXT FREE SPIN IN ${countdown}`
          )}
        </button>

        {!canSpin && !isSpinning && (
          <button
            onClick={() => handleSpin(true)}
            disabled={user.arcadeCoins < 50}
            className={`w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${user.arcadeCoins < 50
              ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-900 hover:scale-105 shadow-xl shadow-orange-500/20 active:scale-95'
              }`}
          >
            <SparklesIcon className="w-6 h-6" />
            SPIN AGAIN (50 COINS)
          </button>
        )}

        {!canSpin && !isSpinning && (
          <p className="text-center text-xs text-slate-500 uppercase tracking-widest">
            Wait for the daily reset or spin again with coins!
          </p>
        )}
      </div>
    </div>
  );
};

export default SpinWheel;
