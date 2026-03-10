
import { Game, GameGenre, User, Challenge, BrandZone } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'AlexVibe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'Creator',
  walletAddress: '0x71C...9A21',
  vibeTokens: 1250,
  arcadeCoins: 500, // Premium currency
  gamesPlayed: 45,
  gamesCreated: 3,
  challengePoints: 450,
  library: ['1', '3'],
  questProgress: {
    'd1': 1,
    'd2': 2,
    'w1': 5
  },
  completedQuests: [],
  isPremium: false,
  referralCode: 'VIBE-ALEX',
  referralCount: 12,
  exp: 1540,
  recentlyPlayed: ['2', '4'],
  followers: 1200
};

export const MOCK_QUESTS: Quest[] = [
  { id: 'd1', title: 'Daily Check-in', description: 'Log in to the arcade today.', reward: 10, type: 'daily', target: 1, category: 'check-in' },
  { id: 'd2', title: 'Game Master', description: 'Play 5 games in one day.', reward: 50, type: 'daily', target: 5, category: 'play-games' },
  { id: 'd3', title: 'Time Traveler', description: 'Play for 30 minutes.', reward: 30, type: 'daily', target: 30, category: 'play-time' },
  { id: 'd4', title: 'Lucky Spinner', description: 'Spin the wheel of fortune.', reward: 10, type: 'daily', target: 1, category: 'spin-wheel' },
  { id: 'd5', title: 'Ad Enthusiast', description: 'Watch 3 short ads.', reward: 20, type: 'daily', target: 3, category: 'watch-ads' },
  { id: 'w1', title: 'Weekly Warrior', description: 'Play 25 games in a week.', reward: 200, type: 'weekly', target: 25, category: 'play-games' },
  { id: 'w2', title: 'Dedicated Gamer', description: 'Play for 200 minutes in a week.', reward: 150, type: 'weekly', target: 200, category: 'play-time' },
  { id: 's1', title: 'Twitter Supporter', description: 'Follow us on Twitter/X.', reward: 100, type: 'special', target: 1, category: 'social' },
  { id: 's2', title: 'Refer a Friend', description: 'Invite a friend to join the arcade.', reward: 500, type: 'special', target: 1, category: 'referral' }
];

export const MOCK_RAFFLES: Raffle[] = [
  {
    id: 'r1',
    title: 'Steam Gift Card $20',
    description: 'Win a $20 Steam Gift Card to buy your favorite games!',
    prize: '$20 Steam Gift Card',
    cost: 50,
    entries: 145,
    endDate: '2024-04-01',
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'r2',
    title: 'Game Key: Elden Ring',
    description: 'Win a Steam key for the critically acclaimed Elden Ring.',
    prize: 'Elden Ring Steam Key',
    cost: 100,
    entries: 890,
    endDate: '2024-04-15',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'
  }
];

export const MOCK_ANALYTICS: AnalyticsData = {
  totalPlays: 1250430,
  uniquePlayers: 85200,
  avgSessionTime: 18.5,
  completionRate: 72.4,
  replayRate: 45.8,
  returningUsers: 62.5,
  day1ReturnRate: 38.2,
  day7ReturnRate: 15.6,
  demographics: {
    age: { '13-17': 25, '18-24': 40, '25-34': 20, '35+': 15 },
    gender: { 'Male': 58, 'Female': 39, 'Other': 3 },
    countries: { 'USA': 30, 'India': 15, 'Brazil': 10, 'UK': 8, 'Others': 37 },
    devices: { mobile: 65, desktop: 35 }
  }
};

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'c3',
    title: 'Sweatcoin Move-to-Game Jam',
    description: 'Design a hypercasual game that rewards physical activity mechanics. High performance entries will be integrated into the Sweatcoin ecosystem.',
    tier: 'Branded Challenge',
    prize: '50,000 $SWEAT + Brand Partnership',
    deadline: '2024-03-15T00:00:00Z',
    participants: 284,
    status: 'active',
    banner: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1200',
    brandLogo: 'https://sweatco.in/static/media/sweat-logo.f1e31e51.png'
  },
  {
    id: 'c1',
    title: 'Cyberpunk Weekly Jam',
    description: 'Create a game inspired by high tech, low life. Neon lights and dark alleys.',
    tier: 'Weekly Jam',
    prize: '40% Revenue Share (6mo)',
    deadline: '2024-02-15T00:00:00Z',
    participants: 124,
    status: 'active',
    banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1200'
  },
  {
    id: 'c2',
    title: 'The Great AI Showdown',
    description: 'A knight with a sword on his shoulder looking down on a landscape that looks like a CPU. Just show a robot. Push the limits of AI-generated assets in game design.',
    tier: 'Monthly Showdown',
    prize: '50% Revenue Share (12mo)',
    deadline: '2024-03-01T00:00:00Z',
    participants: 45,
    status: 'upcoming',
    banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=1200'
  }
];

export const BRAND_ZONES: BrandZone[] = [
  {
    id: 'b1',
    name: 'Red Bull',
    logo: 'https://logos-world.net/wp-content/uploads/2020/11/Red-Bull-Logo.png',
    description: 'Unleash your energy with high-adrenaline challenges and extreme sports simulations.',
    color: '#D21F3C',
    rewardType: 'Merchandise',
    gamesCount: 8,
    playersCount: '250k'
  },
  {
    id: 'b2',
    name: 'Telos',
    // Ring shape: Light blue (top-left) to Purple (bottom-right)
    logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjNjBBNUZBIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjQTg1NUY3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iMzUiIHN0cm9rZT0idXJsKCNnKSIgc3Ryb2tlLXdpZHRoPSIyMCIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==',
    description: 'Experience the fastest EVM with 15,200+ TPS and no front-running on Telos.',
    color: '#5E36E8',
    rewardType: 'TLOS Tokens',
    gamesCount: 15,
    playersCount: '120k'
  }
];
