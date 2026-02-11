
export enum GameGenre {
  ACTION = 'Action',
  PUZZLE = 'Puzzle',
  RACING = 'Racing',
  STRATEGY = 'Strategy',
  ARCADE = 'Arcade',
  HYPERCASUAL = 'Hypercasual'
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
  vibeTokens: number;
  gamesPlayed: number;
  gamesCreated: number;
  challengePoints: number; // Added for player leaderboard
  library: string[]; // IDs of games added to library
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
