
import { Stock, NewsItem } from '../types';

// Helper to generate initial history so charts aren't empty on load
export const generateInitialHistory = (basePrice: number) => {
  const history = [];
  let price = basePrice;
  for (let i = 0; i < 20; i++) {
    // Generate simulated past data
    price = price * (1 - (Math.random() - 0.5) * 0.02);
    history.push({ 
      time: `${i}:00`, 
      price: price 
    });
  }
  return history;
};

// --- MARKET ENGINE ---

// 1. Generate News
const NEWS_TEMPLATES = [
  { text: "Record profits reported by {company}", sentiment: 0.15, type: 'POSITIVE' },
  { text: "{company} faces regulatory scrutiny", sentiment: -0.15, type: 'NEGATIVE' },
  { text: "New product launch drives {sector} optimism", sentiment: 0.1, type: 'POSITIVE' },
  { text: "Global supply chain issues hit {sector}", sentiment: -0.1, type: 'NEGATIVE' },
  { text: "Market analysts upgrade {company} to Buy", sentiment: 0.08, type: 'POSITIVE' },
  { text: "CEO steps down at {company}", sentiment: -0.12, type: 'NEGATIVE' },
  { text: "Breakthrough technology announced by {company}", sentiment: 0.2, type: 'POSITIVE' },
  { text: "Inflation fears cause dip in {sector} stocks", sentiment: -0.08, type: 'NEGATIVE' },
];

export const generateMarketNews = (stocks: Stock[]): NewsItem | null => {
  if (Math.random() > 0.3) return null; // 30% chance of news per tick

  const template = NEWS_TEMPLATES[Math.floor(Math.random() * NEWS_TEMPLATES.length)];
  const stock = stocks[Math.floor(Math.random() * stocks.length)];
  
  let headline = template.text
    .replace('{company}', stock.name)
    .replace('{sector}', stock.category);

  return {
    id: Date.now().toString(),
    headline,
    sentiment: template.type as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
    affectedSymbol: template.text.includes('{company}') ? stock.symbol : undefined,
    affectedSector: template.text.includes('{sector}') ? stock.category : undefined,
    timestamp: new Date().toLocaleTimeString()
  };
};

// 2. Update Price Algorithm
export const calculateNextPrice = (stock: Stock, marketSentiment: number, newsImpact: number = 0): number => {
  // Base volatility + Sector Volatility
  const volatility = stock.volatility || 0.01; 
  const randomMove = (Math.random() - 0.5) * 2 * volatility;
  
  // Sentiment Drag (Stocks tend to drift towards their sentiment)
  const sentimentMove = stock.sentiment * 0.005;
  
  // Market Trend Drag
  const marketMove = marketSentiment * 0.002;

  const totalChangePercent = randomMove + sentimentMove + marketMove + newsImpact;
  
  return Math.max(0.1, stock.price * (1 + totalChangePercent));
};

// Full List of Stocks with Added Metadata for Simulation
export const INITIAL_STOCKS: Stock[] = [
  // Major Real World Tech
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 415.50, change: 1.2, history: generateInitialHistory(415.50), category: 'Tech', sentiment: 0.5, volatility: 0.015 },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 198.40, change: -2.1, history: generateInitialHistory(198.40), category: 'Auto', sentiment: 0.2, volatility: 0.035 },
  { symbol: 'T', name: 'AT&T Inc', price: 17.20, change: 0.5, history: generateInitialHistory(17.20), category: 'Telecom', sentiment: 0.1, volatility: 0.008 },

  // Tech & Innovation
  { symbol: 'TCH', name: 'TechVision Inc', price: 145.20, change: 2.4, history: generateInitialHistory(145.20), category: 'Tech', sentiment: 0.8, volatility: 0.02 },
  { symbol: 'AIX', name: 'Artificial Minds', price: 175.60, change: 3.2, history: generateInitialHistory(175.60), category: 'Tech', sentiment: 0.9, volatility: 0.025 },
  { symbol: 'CYB', name: 'CyberShield', price: 120.30, change: 1.5, history: generateInitialHistory(120.30), category: 'Tech', sentiment: 0.4, volatility: 0.018 },
  { symbol: 'CHP', name: 'MicroChip Inc', price: 340.10, change: 2.1, history: generateInitialHistory(340.10), category: 'Tech', sentiment: 0.6, volatility: 0.022 },
  { symbol: 'SFT', name: 'Cloud Soft', price: 180.90, change: 1.8, history: generateInitialHistory(180.90), category: 'Tech', sentiment: 0.5, volatility: 0.015 },
  { symbol: 'QTM', name: 'Quantum Core', price: 512.40, change: 4.1, history: generateInitialHistory(512.40), category: 'Tech', sentiment: 0.7, volatility: 0.03 },
  { symbol: 'RBT', name: 'Robo Dynamics', price: 88.20, change: -0.5, history: generateInitialHistory(88.20), category: 'Tech', sentiment: -0.2, volatility: 0.028 },

  // Energy & Utilities
  { symbol: 'GRN', name: 'GreenEnergy Corp', price: 89.50, change: -1.2, history: generateInitialHistory(89.50), category: 'Energy', sentiment: 0.3, volatility: 0.02 },
  { symbol: 'SLR', name: 'SolarGrid Systems', price: 42.10, change: -0.5, history: generateInitialHistory(42.10), category: 'Energy', sentiment: 0.4, volatility: 0.025 },
  { symbol: 'UTL', name: 'Urban Utilities', price: 55.75, change: 0.2, history: generateInitialHistory(55.75), category: 'Utilities', sentiment: 0.1, volatility: 0.005 },
  { symbol: 'CLN', name: 'Pure Water', price: 42.80, change: 0.9, history: generateInitialHistory(42.80), category: 'Utilities', sentiment: 0.2, volatility: 0.006 },
  { symbol: 'NUC', name: 'Fusion Power', price: 102.30, change: 0.8, history: generateInitialHistory(102.30), category: 'Energy', sentiment: 0.6, volatility: 0.04 },

  // Finance & Real Estate
  { symbol: 'FNS', name: 'FinSecure Bank', price: 45.30, change: 1.1, history: generateInitialHistory(45.30), category: 'Finance', sentiment: 0.2, volatility: 0.01 },
  { symbol: 'REI', name: 'RealEstate Trust', price: 105.40, change: 0.1, history: generateInitialHistory(105.40), category: 'Real Estate', sentiment: 0.1, volatility: 0.012 },
  { symbol: 'INS', name: 'SafeGuard Ins', price: 140.75, change: 0.2, history: generateInitialHistory(140.75), category: 'Finance', sentiment: 0, volatility: 0.009 },
  { symbol: 'CON', name: 'BuildIt Corp', price: 95.20, change: 0.6, history: generateInitialHistory(95.20), category: 'Real Estate', sentiment: 0.3, volatility: 0.015 },

  // Health & Pharma
  { symbol: 'BIO', name: 'BioHealth Sys', price: 210.75, change: 0.8, history: generateInitialHistory(210.75), category: 'Health', sentiment: 0.4, volatility: 0.018 },
  { symbol: 'MED', name: 'MediCare Plus', price: 156.80, change: -0.3, history: generateInitialHistory(156.80), category: 'Health', sentiment: -0.1, volatility: 0.01 },
  { symbol: 'PHR', name: 'PharmaGiant', price: 165.20, change: -0.4, history: generateInitialHistory(165.20), category: 'Health', sentiment: -0.2, volatility: 0.012 },
  { symbol: 'GEN', name: 'Gene Therapies', price: 88.90, change: 2.5, history: generateInitialHistory(88.90), category: 'Health', sentiment: 0.7, volatility: 0.05 },

  // Consumer & Retail
  { symbol: 'RET', name: 'Global Retail', price: 67.80, change: 0.2, history: generateInitialHistory(67.80), category: 'Consumer', sentiment: 0.1, volatility: 0.012 },
  { symbol: 'FOD', name: 'FastFood Chain', price: 34.20, change: -1.1, history: generateInitialHistory(34.20), category: 'Consumer', sentiment: -0.1, volatility: 0.01 },
  { symbol: 'ECM', name: 'ShopEasy', price: 210.30, change: 1.2, history: generateInitialHistory(210.30), category: 'Consumer', sentiment: 0.3, volatility: 0.015 },
  { symbol: 'LUX', name: 'Luxe Brand', price: 560.00, change: -0.5, history: generateInitialHistory(560.00), category: 'Consumer', sentiment: 0.1, volatility: 0.018 },
  { symbol: 'FSH', name: 'TrendWear', price: 55.30, change: 1.1, history: generateInitialHistory(55.30), category: 'Consumer', sentiment: 0.2, volatility: 0.02 },
  { symbol: 'BEV', name: 'Fizz Beverages', price: 72.10, change: 0.5, history: generateInitialHistory(72.10), category: 'Consumer', sentiment: 0.1, volatility: 0.01 },
  { symbol: 'GME', name: 'GameVerse', price: 45.20, change: 4.5, history: generateInitialHistory(45.20), category: 'Consumer', sentiment: 0.6, volatility: 0.04 },

  // Transport & Auto
  { symbol: 'ATF', name: 'AutoFuture Motors', price: 320.10, change: -3.5, history: generateInitialHistory(320.10), category: 'Auto', sentiment: -0.4, volatility: 0.03 },
  { symbol: 'EVX', name: 'Electric Volts', price: 88.90, change: 1.8, history: generateInitialHistory(88.90), category: 'Auto', sentiment: 0.5, volatility: 0.035 },
  { symbol: 'AIR', name: 'SkyHigh Airlines', price: 120.50, change: -0.8, history: generateInitialHistory(120.50), category: 'Travel', sentiment: -0.1, volatility: 0.025 },
  { symbol: 'SHP', name: 'Ocean Freight', price: 32.50, change: -1.5, history: generateInitialHistory(32.50), category: 'Logistics', sentiment: -0.2, volatility: 0.015 },
  { symbol: 'LOG', name: 'Global Logistics', price: 112.40, change: 0.7, history: generateInitialHistory(112.40), category: 'Logistics', sentiment: 0.1, volatility: 0.012 },

  // Commodities & Others
  { symbol: 'CRY', name: 'CryptoCoin X', price: 2300.50, change: 5.2, history: generateInitialHistory(2300.50), category: 'Crypto', sentiment: 0.8, volatility: 0.08 },
  { symbol: 'GLD', name: 'Gold Reserve', price: 1850.00, change: 0.4, history: generateInitialHistory(1850.00), category: 'Commodity', sentiment: 0.2, volatility: 0.005 },
  { symbol: 'OIL', name: 'Global Oil', price: 78.40, change: 0.5, history: generateInitialHistory(78.40), category: 'Commodity', sentiment: 0, volatility: 0.02 },
  { symbol: 'MIN', name: 'Rare Earth Mining', price: 28.40, change: -2.3, history: generateInitialHistory(28.40), category: 'Commodity', sentiment: -0.3, volatility: 0.03 },
  { symbol: 'TEL', name: 'Connect Telecom', price: 65.40, change: 0.3, history: generateInitialHistory(65.40), category: 'Telecom', sentiment: 0.1, volatility: 0.01 },
  { symbol: 'SPC', name: 'Orbit Tech', price: 450.60, change: 5.4, history: generateInitialHistory(450.60), category: 'Space', sentiment: 0.9, volatility: 0.05 },
  { symbol: 'STM', name: 'StreamLine Media', price: 18.90, change: -3.2, history: generateInitialHistory(18.90), category: 'Media', sentiment: -0.2, volatility: 0.025 },
  
  // Agriculture & Defense
  { symbol: 'AGR', name: 'AgriCorp Global', price: 44.20, change: 0.5, history: generateInitialHistory(44.20), category: 'Agri', sentiment: 0.1, volatility: 0.015 },
  { symbol: 'DEF', name: 'Shield Defense', price: 210.00, change: 1.4, history: generateInitialHistory(210.00), category: 'Defense', sentiment: 0.3, volatility: 0.01 },
  { symbol: 'EDU', name: 'EduLearn Systems', price: 35.60, change: -0.2, history: generateInitialHistory(35.60), category: 'Education', sentiment: 0, volatility: 0.01 },
];
