export enum GameGenre {
  ACTION = 'Action',
  ADVENTURE = 'Adventure',
  CAR = 'Car',
  CARD = 'Card',
  CASUAL = 'Casual',
  CLICKER = 'Clicker',
  FPS = 'FPS',
  HORROR = 'Horror',
  IO = '.io',
  PUZZLE = 'Puzzle',
  SHOOTING = 'Shooting',
  SPORTS = 'Sports',
  THINKING = 'Thinking',
  TOWER_DEFENSE = 'Tower Defense'
}

export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  genre: GameGenre;
  plays: number;
  weeklyPlays: number; // Added for weekly leaderboard
  rating: number;
  creator: string;
  iframeUrl: string;
  tags: string[];
  createdAt: string;
  isFeatured?: boolean;
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'Player' | 'Creator';
  walletAddress?: string;
  email?: string;
  vibeTokens?: number; // Regular currency
  arcadeCoins?: number; // Premium currency (non-token)
  gamesPlayed?: number;
  gamesCreated?: number;
  challengePoints?: number;
  library?: string[];
  lastSpinDate?: string;
  questProgress?: {
    [questId: string]: number; // current value
  };
  completedQuests?: string[];
  isPremium?: boolean;
  referralCode: string;
  referralCount?: number;
  exp?: number;
  recentlyPlayed?: string[]; // Last 7 game IDs
  followers?: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'daily' | 'weekly' | 'special';
  target: number;
  current?: number;
  category: 'check-in' | 'play-games' | 'play-time' | 'spin-wheel' | 'watch-ads' | 'social' | 'referral';
  icon?: string;
}

export interface Raffle {
  id: string;
  title: string;
  description: string;
  prize: string;
  cost: number;
  entries: number;
  maxEntries?: number;
  endDate: string;
  image: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
  isModerated: boolean;
}

export interface AnalyticsData {
  totalPlays: number;
  uniquePlayers: number;
  avgSessionTime: number; // in minutes
  completionRate: number; // percentage
  replayRate: number; // percentage
  returningUsers: number; // percentage
  day1ReturnRate: number;
  day7ReturnRate: number;
  demographics: {
    age: { [key: string]: number };
    gender: { [key: string]: number };
    countries: { [key: string]: number };
    devices: { mobile: number; desktop: number };
  };
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  tier: 'Weekly Jam' | 'Monthly Showdown' | 'Seasonal Championship' | 'Branded Challenge';
  prize: string;
  deadline: string;
  participants: number;
  status: 'active' | 'upcoming' | 'ended';
  banner: string;
  brandLogo?: string;
}

export interface BrandZone {
  id: string;
  name: string;
  logo: string;
  description: string;
  color: string;
  rewardType: string;
  gamesCount: number;
  playersCount: string;
}
