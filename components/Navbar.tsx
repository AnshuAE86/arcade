
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { 
  Bars3Icon, 
  MagnifyingGlassIcon, 
  BellIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

interface NavbarProps {
  user: User | null;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onToggleSidebar, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, text: "New challenge live: Sweatcoin Move-to-Game Jam!", type: "challenge", time: "2h ago" },
    { id: 2, text: "New game released: AI Architect by SimMaster", type: "game", time: "5h ago" },
    { id: 3, text: "Milestone reached! You've gained over 1k followers.", type: "milestone", time: "1d ago" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="px-4 h-16 flex items-center justify-between gap-4">
        {user && (
          <button 
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-slate-100 lg:hidden"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        )}

        {!user && (
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="text-xl font-bold font-orbitron tracking-tighter text-cyan-400">VAIBE</span>
          </Link>
        )}

        <div className="flex-1 max-w-xl hidden md:block">
          <div className="relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400" />
            <input 
              type="text" 
              placeholder="Search games, creators, challenges..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/20 focus:border-cyan-400/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Removed Wallet Button as it was the item directly left of the bell */}

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 transition-colors relative ${showNotifications ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-100'}`}
                >
                  <BellIcon className="w-6 h-6" />
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-fuchsia-500 rounded-full border-2 border-slate-950"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                      <h3 className="font-bold text-sm uppercase tracking-widest">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)}>
                        <XMarkIcon className="w-4 h-4 text-slate-500 hover:text-white" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((n) => (
                        <div key={n.id} className="p-4 border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                          <p className="text-sm text-slate-300 group-hover:text-white transition-colors">{n.text}</p>
                          <span className="text-[10px] text-slate-500 font-bold uppercase mt-2 block tracking-tight">{n.time}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full py-3 text-xs font-black text-cyan-400 bg-slate-950/50 hover:bg-slate-950 transition-colors uppercase tracking-widest">
                      Mark all as read
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
                <Link to="/profile" className="text-right hidden sm:block hover:opacity-80 transition-opacity">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Level 7</p>
                </Link>
                <Link to="/profile">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-10 h-10 rounded-xl border border-slate-700 bg-slate-800 object-cover"
                  />
                </Link>
                <button 
                  onClick={onLogout}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/20">
              Launch Arcade
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
