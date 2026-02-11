
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
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle }) => {
  const menuItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Browse Games', path: '/catalog', icon: RectangleGroupIcon },
    { name: 'Leaderboards', path: '/leaderboards', icon: ChartBarIcon },
    { name: 'Brand Zones', path: '/zones', icon: BuildingOfficeIcon },
    { name: 'Challenges', path: '/challenges', icon: TrophyIcon },
    { name: 'Token Launch', path: '/launch', icon: RocketLaunchIcon },
    { name: 'Creator Zone', path: '/creator-zone', icon: CloudArrowUpIcon },
    { name: 'Profile', path: '/profile', icon: UserCircleIcon },
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

      <nav className="px-4 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-500/10 to-transparent text-cyan-400 border-l-4 border-cyan-400' 
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`
            }
          >
            <item.icon className={`w-6 h-6 transition-colors group-hover:text-cyan-400`} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
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
