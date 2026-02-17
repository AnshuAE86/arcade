
import { Game, GameGenre, User, Challenge, BrandZone } from './types';

export const MOCK_GAMES: Game[] = [
  {
    id: '1',
    title: 'Neon Drift 3000',
    description: 'A high-speed car drifting through a futuristic neon cyberpunk cityscape.',
    thumbnail: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
    genre: GameGenre.RACING,
    plays: 125000,
    weeklyPlays: 12000,
    rating: 4.8,
    creator: 'CyberGhost',
    iframeUrl: 'https://www.crazygames.com/embed/polytrack',
    tags: ['3D', 'Fast', 'Synthwave'],
    createdAt: '2024-01-15',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Void Runner',
    description: 'An endless runner survival game set in the vast, deep void of outer space.',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    genre: GameGenre.ACTION,
    plays: 89000,
    weeklyPlays: 5400,
    rating: 4.5,
    creator: 'MetaPixel',
    iframeUrl: 'https://www.crazygames.com/embed/ovo',
    tags: ['Hard', 'Space', 'Speedrun'],
    createdAt: '2024-01-10',
    isFeatured: true
  },
  {
    id: '3',
    title: 'Zen Garden Puzzle',
    description: 'A relaxing tile-matching puzzle game set in a beautiful, serene Japanese garden.',
    thumbnail: 'https://images.unsplash.com/photo-1517594422361-5eeb8ae275a9?auto=format&fit=crop&q=80&w=800',
    genre: GameGenre.PUZZLE,
    plays: 45000,
    weeklyPlays: 890,
    rating: 4.9,
    creator: 'NatureCoder',
    iframeUrl: 'https://www.crazygames.com/embed/mahjongg-solitaire',
    tags: ['Relaxing', 'Garden', 'Strategy'],
    createdAt: '2024-01-12'
  },
  {
    id: '4',
    title: 'Bit Brawl',
    description: 'An 8-bit retro street fighter style combat game. Choose your champion and fight.',
    thumbnail: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=800',
    genre: GameGenre.ACTION,
    plays: 210000,
    weeklyPlays: 15600,
    rating: 4.7,
    creator: 'RetroKing',
    iframeUrl: 'https://www.crazygames.com/embed/bloxdhop-io',
    tags: ['Multiplayer', 'Combat', 'Retro'],
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    title: 'AI Architect',
    description: 'A robot-driven city builder where you manage automated systems and growth.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    genre: GameGenre.STRATEGY,
    plays: 32000,
    weeklyPlays: 1200,
    rating: 4.2,
    creator: 'SimMaster',
    iframeUrl: 'https://www.crazygames.com/embed/idlescape',
    tags: ['Building', 'Robot', 'AI'],
    createdAt: '2024-01-20'
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: 'AlexVibe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  role: 'Creator',
  walletAddress: '0x71C...9A21',
  vibeTokens: 1250,
  gamesPlayed: 45,
  gamesCreated: 3,
  challengePoints: 450,
  library: ['1', '3']
};

export const MOCK_LEADERS: Partial<User>[] = [
  { id: 'l1', name: 'ProGamerX', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro', challengePoints: 2450 },
  { id: 'l2', name: 'SwiftFinger', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Swift', challengePoints: 2100 },
  { id: 'l3', name: 'ComboKing', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Combo', challengePoints: 1850 },
  { id: 'l4', name: 'AlexVibe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', challengePoints: 450 },
  { id: 'l5', name: 'LofiBoi', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lofi', challengePoints: 320 },
];

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
