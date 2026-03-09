import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  RocketLaunchIcon, 
  TrophyIcon, 
  RectangleGroupIcon, 
  CloudArrowUpIcon,
  UserCircleIcon,
  XMarkIcon,
  BoltIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckBadgeIcon,
  TicketIcon,
  PresentationChartLineIcon,
  UserPlusIcon,
  WrenchScrewdriverIcon,
  ArrowRightStartOnRectangleIcon,
  PuzzlePieceIcon,
  FireIcon,
  MapIcon,
  CreditCardIcon,
  HandRaisedIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  HashtagIcon,
  MusicalNoteIcon,
  TrophyIcon as TrophyOutline,
  LightBulbIcon,
  ShieldCheckIcon as ShieldIcon,
  LifebuoyIcon,
  TruckIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { User } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  user: User | null;
  onDemoLogin: (role: 'Player' | 'Creator' | 'Guest') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, user, onDemoLogin }) => {
  const menuItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Browse Games', path: '/catalog', icon: RectangleGroupIcon },
    { name: 'Quests', path: '/quests', icon: CheckBadgeIcon },
    { name: 'Raffles', path: '/raffles', icon: TicketIcon, roles: ['Player', 'Creator'] },
    { name: 'Leaderboards', path: '/leaderboards', icon: ChartBarIcon },
    { name: 'Data Dashboard', path: '/dashboard', icon: PresentationChartLineIcon, roles: ['Creator'] },
    { name: 'Brand Zones', path: '/zones', icon: BuildingOfficeIcon, roles: ['Player', 'Creator'] },
    { name: 'Challenges', path: '/challenges', icon: TrophyIcon, roles: ['Creator'] },
    { name: 'Token Launch', path: '/launch', icon: RocketLaunchIcon, roles: ['Creator'] },
    { name: 'Creator Zone', path: '/creator-zone', icon: CloudArrowUpIcon, roles: ['Player', 'Creator'] },
    { name: 'Profile', path: '/profile', icon: UserCircleIcon, roles: ['Player', 'Creator'] },
  ];

  const genres = [
    { name: 'Action', icon: FireIcon },
    { name: 'Adventure', icon: MapIcon },
    { name: 'Car', icon: TruckIcon },
    { name: 'Card', icon: IdentificationIcon },
    { name: 'Casual', icon: HandRaisedIcon },
    { name: 'Clicker', icon: CursorArrowRaysIcon },
    { name: 'FPS', icon: LifebuoyIcon },
    { name: 'Horror', icon: EyeIcon },
    { name: '.io', icon: HashtagIcon },
    { name: 'Puzzle', icon: PuzzlePieceIcon },
    { name: 'Shooting', icon: LifebuoyIcon },
    { name: 'Sports', icon: TrophyOutline },
    { name: 'Thinking', icon: LightBulbIcon },
    { name: 'Tower Defense', icon: BuildingOfficeIcon },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between p-6">
        <NavLink to="/" className="flex items-center gap-2 group">
          <BoltIcon className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xl font-bold font-orbitron tracking-tighter group-hover:text-cyan-400 transition-colors">ARCADE</span>
        </NavLink>
        <button onClick={toggle} className="lg:hidden text-slate-400 hover:text-white transition-colors">
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>

      <nav className="px-4 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-450px)]">
        <div className="mb-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Main Menu</p>
          {menuItems.filter(item => !item.roles || (user && item.roles.includes(user.role))).map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-4 border-cyan-400' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`
              }
            >
              <item.icon className={`w-5 h-5 transition-colors group-hover:text-cyan-400`} />
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </div>

        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Genres</p>
          {genres.map((genre) => (
            <NavLink
              key={genre.name}
              to={`/catalog?genre=${genre.name}`}
              className="flex items-center gap-3 px-4 py-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all group"
            >
              <genre.icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
              <span className="text-xs font-medium">{genre.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
        {/* Demo Mode Switcher */}
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Demo Mode Controls</p>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onDemoLogin('Player')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                user?.role === 'Player' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <UserPlusIcon className="w-3.5 h-3.5" /> PLAYER
            </button>
            <button 
              onClick={() => onDemoLogin('Creator')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
                user?.role === 'Creator' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <WrenchScrewdriverIcon className="w-3.5 h-3.5" /> CREATOR
            </button>
          </div>
          {user && (
            <button 
              onClick={() => onDemoLogin('Guest')}
              className="w-full mt-2 py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5" /> LOGOUT DEMO
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-600/20 to-fuchsia-600/20 border border-indigo-500/20">
          <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Seasonal Series</p>
          <p className="text-sm font-semibold mb-3">Genesis Championship</p>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3">
            <div className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 h-1.5 rounded-full w-[65%]"></div>
          </div>
          <NavLink to="/challenges" className="block w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs text-center font-bold rounded-lg transition-colors">
            JOIN NOW
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
