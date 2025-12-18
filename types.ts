
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CALCULATORS = 'CALCULATORS',
  QUIZ = 'QUIZ',
  LEARN = 'LEARN',
  ADVISOR = 'ADVISOR',
  MARKET = 'MARKET',
  SIMULATOR = 'SIMULATOR',
  LEADERBOARD = 'LEADERBOARD',
}

export enum SkillType {
  FINANCE = 'FINANCE',
  ENTREPRENEURSHIP = 'ENTREPRENEURSHIP',
}

export interface StartupState {
  name: string;
  industry: string;
  problem: string;
  model: 'B2B' | 'B2C' | 'SaaS' | 'Marketplace';
  stage: 'IDEATION' | 'VALIDATION' | 'TRACTION' | 'FUNDRAISING';
  budget: number;
  time: number; // In days/units
  metrics: {
    demand: number;
    wtp: number; // Willingness to pay
    retention: number;
    users: number;
    mrr: number;
    burn: number;
    confidence: number;
  };
  valuation: number;
  equityOffered: number;
}

export interface Investor {
  id: string;
  name: string;
  type: 'Angel' | 'VC' | 'Accelerator';
  appetite: 'Aggressive' | 'Balanced' | 'Conservative';
  prefIndustries: string[];
  minTraction: number;
  avatar: string;
}

export interface PortfolioItem {
  symbol: string;
  quantity: number;
  avgPrice: number;
  type: 'LONG' | 'SHORT';
  leverage: number;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  type: 'LIMIT_BUY' | 'LIMIT_SELL' | 'STOP_LOSS';
  targetPrice: number;
  quantity: number;
  leverage: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Mission {
  id: string;
  title: string;
  target: number;
  progress: number;
  rewardXP: number;
  rewardCoins: number;
  completed: boolean;
  type: 'TRADE_COUNT' | 'PROFIT_TARGET' | 'DIVERSIFY' | 'STARTUP_STEP';
}

export interface UserStats {
  xp: number;
  entreXp: number;
  level: number;
  coins: number;
  lessonsCompleted: number;
  quizScore: number;
  completedChapterIds?: string[];
  walletBalance: number;
  holdings: PortfolioItem[];
  watchlist: string[];
  pendingOrders: PendingOrder[];
  achievements: Achievement[];
  missions: Mission[];
  streakDays: number;
  activeSkill: SkillType;
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  history: { time: string; price: number }[];
  category: string;
  sentiment: number;
  volatility: number;
}

export interface NewsItem {
  id: string;
  headline: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  affectedSector?: string;
  affectedSymbol?: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  skillType?: SkillType;
}

export interface CalculationResult {
  investedAmount: number;
  totalInterest: number;
  totalValue: number;
  monthlyEMI?: number;
  breakdown: Array<{ year: number; balance: number; invested: number }>;
  chartData?: Array<{ name: string; value: number; color: string }>;
  pieSegments?: Array<{ name: string; value: number; color: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface GeneratedLessonData {
  title: string;
  content: string;
  quiz: QuizQuestion[];
  simulator?: 'SIP' | 'LUMPSUM' | 'EMI' | 'null' | null;
}
