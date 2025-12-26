
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

export enum StartupJourneyStage {
  IDEATION = 'IDEATION',
  DISCOVERY = 'DISCOVERY',
  MARKET = 'MARKET',
  PRODUCT = 'PRODUCT',
  STRATEGY = 'STRATEGY',
  PROTOTYPE = 'PROTOTYPE',
  VALIDATION = 'VALIDATION',
  PITCH = 'PITCH'
}

export interface PitchSlide {
  title: string;
  content: string;
  keyPoints: string[];
}

export interface StartupState {
  id: string;
  name: string;
  currentStage: StartupJourneyStage;
  interests: string;
  data: {
    problem: string;
    solution: string;
    targetUser: string;
    tam: string;
    competitors: string;
    mvpFeatures: string[];
    techStack: string;
    revenueModel: string;
    gtmStrategy: string;
    validationPlan: string;
    userFlow: string;
  };
  pitchDeck: PitchSlide[];
  isCompleted: boolean;
  xpEarned: number;
}

export interface UserStats {
  xp: number;
  entreXp: number;
  level: number;
  coins: number;
  lessonsCompleted: number;
  quizScore: number;
  walletBalance: number;
  holdings: any[];
  watchlist: string[];
  pendingOrders: any[];
  achievements: any[];
  missions: any[];
  streakDays: number;
  activeSkill: SkillType;
  savedStartups: StartupState[];
}

export interface NewsItem {
  id: string;
  headline: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  affectedSymbol?: string;
  affectedSector?: string;
  timestamp: string;
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

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  skillType?: SkillType;
  category?: string;
  difficulty?: string;
}

export interface GeneratedLessonData {
  title: string;
  content: string;
  quiz: QuizQuestion[];
  simulator?: 'SIP' | 'LUMPSUM' | 'EMI' | 'null' | null;
}

export interface CalculationResult {
  investedAmount: number;
  totalInterest: number;
  totalValue: number;
  monthlyEMI?: number;
  breakdown: Array<{
    year: number;
    balance: number;
    invested: number;
  }>;
  chartData?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
