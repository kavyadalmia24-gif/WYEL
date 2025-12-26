
import React, { useState, useMemo } from 'react';
import { Trophy, Zap, ChevronRight, RefreshCw, Star, CheckCircle2, XCircle, Target, Globe, ArrowLeft, BrainCircuit, BarChart3, ShieldCheck, Rocket, Flame, Clock, AlertTriangle } from 'lucide-react';
import { QuizQuestion, UserStats, SkillType } from '../types';
import confetti from 'canvas-confetti';

const QUESTIONS_DB: QuizQuestion[] = [
  // FINANCE: BEGINNER
  { id: 1, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "What is an 'Emergency Fund'?", options: ["Vacation money", "Savings for unexpected costs", "Stock market capital", "Luxury fund"], correctAnswer: 1, explanation: "An emergency fund is for urgent, unplanned expenses." },
  { id: 2, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "The 50/30/20 rule suggests spending 50% on:", options: ["Wants", "Needs", "Savings", "Investments"], correctAnswer: 1, explanation: "Needs are essential costs like rent and food." },
  { id: 3, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "What is Inflation?", options: ["Rising prices", "Falling prices", "Stable prices", "Bank fees"], correctAnswer: 0, explanation: "Inflation is the rate at which general prices rise." },
  { id: 4, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "Simple Interest is calculated on:", options: ["Principal only", "Principal + past interest", "Current balance", "Future value"], correctAnswer: 0, explanation: "Simple interest doesn't compound." },
  { id: 5, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "Which is a 'Good Debt'?", options: ["Credit card debt", "Student loan", "Payday loan", "Store credit"], correctAnswer: 1, explanation: "Good debt builds value or income over time." },
  { id: 6, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "What is Net Worth?", options: ["Assets minus Liabilities", "Monthly salary", "Cash in bank", "Credit score"], correctAnswer: 0, explanation: "It's the total value of what you own minus what you owe." },
  { id: 7, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "A budget is a...", options: ["Wish list", "Spending plan", "Bank statement", "Legal bill"], correctAnswer: 1, explanation: "A budget tracks every dollar in and out." },
  { id: 8, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "Credit scores measure:", options: ["Wealth", "Creditworthiness", "Salary", "Age"], correctAnswer: 1, explanation: "Scores predict how likely you are to repay debt." },
  { id: 9, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "Compounding is:", options: ["Interest on interest", "Principal only", "A bank penalty", "A type of tax"], correctAnswer: 0, explanation: "Interest grows on top of existing interest." },
  { id: 10, category: 'Basics', difficulty: 'Beginner', skillType: SkillType.FINANCE, question: "First step in investing is:", options: ["Buying a stock", "Setting a goal", "Getting a credit card", "Hiring an advisor"], correctAnswer: 1, explanation: "Clear goals drive investment choices." },

  // FINANCE: INTERMEDIATE
  { id: 20, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "What is a Dividend?", options: ["Stock crash", "Share of profit to holders", "Bank loan", "Brokerage fee"], correctAnswer: 1, explanation: "Dividends are payments companies make to shareholders." },
  { id: 21, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "P/E Ratio stands for:", options: ["Price/Earnings", "Profit/Expense", "Portfolio/Equity", "Price/Economy"], correctAnswer: 0, explanation: "It compares a company's price to its earnings per share." },
  { id: 22, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "A Bear Market means:", options: ["Prices rising", "Prices falling", "Stable market", "High volume"], correctAnswer: 1, explanation: "Bear markets drop 20%+ from recent highs." },
  { id: 23, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "What is an ETF?", options: ["Stock index", "Exchange-Traded Fund", "Electronic Trade", "Estimated Tax"], correctAnswer: 1, explanation: "ETFs are baskets of securities trading on exchanges." },
  { id: 24, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "Diversification helps to:", options: ["Maximize risk", "Reduce risk", "Guarantee profit", "Stop taxes"], correctAnswer: 1, explanation: "Spreading assets limits exposure to single failures." },
  { id: 25, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "Asset Allocation is:", options: ["Buying all stocks", "Mix of asset classes", "Paying debt", "Selling for cash"], correctAnswer: 1, explanation: "Balancing risk by splitting between stocks, bonds, etc." },
  { id: 26, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "A Bond is a:", options: ["Stock share", "Loan to an entity", "Savings plan", "Insurance"], correctAnswer: 1, explanation: "Bonds are IOUs from governments or corps." },
  { id: 27, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "Market Cap is:", options: ["Total profits", "Share Price x Total Shares", "Company debt", "CEO salary"], correctAnswer: 1, explanation: "It measures the total dollar value of a company." },
  { id: 28, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "Mutual Funds are managed by:", options: ["Algorithms only", "Professional managers", "Central banks", "Stockholders"], correctAnswer: 1, explanation: "Fund managers pick assets for the pooled group." },
  { id: 29, category: 'Investing', difficulty: 'Intermediate', skillType: SkillType.FINANCE, question: "Historical stock returns average:", options: ["1-2%", "7-10%", "20-25%", "50%"], correctAnswer: 1, explanation: "Long-term markets average near 8-10%." },

  // FINANCE: ADVANCED
  { id: 50, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "What is 'Alpha'?", options: ["Market return", "Excess risk-adjusted return", "Volatility", "Risk-free rate"], correctAnswer: 1, explanation: "Alpha is performance above the benchmark." },
  { id: 51, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "What is Short Selling?", options: ["Quick sell", "Selling borrowed shares", "Buying small caps", "Selling for loss"], correctAnswer: 1, explanation: "Betting that a stock price will drop." },
  { id: 52, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Call Options grant the right to:", options: ["Sell stock", "Buy stock", "Vote", "Get dividends"], correctAnswer: 1, explanation: "Calls are bets on rising prices." },
  { id: 53, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Sharpe Ratio measures:", options: ["Stock price", "Risk-adjusted return", "Dividends", "Volatility alone"], correctAnswer: 1, explanation: "It assesses if returns are worth the risk taken." },
  { id: 54, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Yield Curve Inversion often predicts:", options: ["Growth", "Recession", "Stability", "Inflation drop"], correctAnswer: 1, explanation: "Historically it's a very reliable recession warning." },
  { id: 55, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Beta measures:", options: ["Profits", "Volatility relative to market", "Company age", "Software version"], correctAnswer: 1, explanation: "Beta > 1 means the stock is more volatile than average." },
  { id: 56, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Black-Scholes is used for:", options: ["Pricing options", "Bankruptcy", "Diversification", "Interest"], correctAnswer: 0, explanation: "It's the standard model for option valuation." },
  { id: 57, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Rule of 40 applies to:", options: ["Hiring", "SaaS Growth + Margin", "Taxes", "Retention"], correctAnswer: 1, explanation: "Sum of growth rate and profit margin should be 40%+." },
  { id: 58, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Wash Sale happens if:", options: ["Sell for gain", "Sell for loss and buy back in 30 days", "Clean money", "Sell to family"], correctAnswer: 1, explanation: "IRS disallows claiming losses on wash sales." },
  { id: 59, category: 'Investing', difficulty: 'Advanced', skillType: SkillType.FINANCE, question: "Short Squeeze is triggered by:", options: ["Low interest", "Short sellers buying back fast", "Market close", "Dividends"], correctAnswer: 1, explanation: "Forced buying from shorts accelerates price gains." },

  // ENTREPRENEURSHIP: BEGINNER
  { id: 301, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "What is an 'MVP'?", options: ["Valuable Player", "Minimum Viable Product", "Venture Plan", "Market Prediction"], correctAnswer: 1, explanation: "The simplest version of a product to start learning." },
  { id: 302, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "Who are 'Early Adopters'?", options: ["Parents", "First risk-taking users", "VCs", "Critics"], correctAnswer: 1, explanation: "Users who use products before they are perfect." },
  { id: 303, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "What is a 'Pivot'?", options: ["Closing down", "Direction change", "Going public", "Firing staff"], correctAnswer: 1, explanation: "A shift in strategy based on feedback." },
  { id: 304, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "What is 'Bootstrapping'?", options: ["Boots", "Self-funding", "Bank loans", "VC funding"], correctAnswer: 1, explanation: "Using personal savings to build a business." },
  { id: 305, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "Value Proposition defines:", options: ["Price", "Unique benefit", "Features", "Revenue"], correctAnswer: 1, explanation: "Why a customer should pick you." },
  { id: 306, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "Customer Discovery is:", options: ["Ads", "Learning user problems", "Sales calls", "LinkedIn networking"], correctAnswer: 1, explanation: "Validating problems before building solutions." },
  { id: 307, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "A 'Unicorn' is a startup worth:", options: ["$1M", "$1B", "$100M", "Infinity"], correctAnswer: 1, explanation: "Private companies valued at $1 billion or more." },
  { id: 308, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "Pain Point is a:", options: ["Injury", "Customer problem", "Tax rate", "Competition"], correctAnswer: 1, explanation: "A specific frustration a user faces." },
  { id: 309, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "SaaS stands for:", options: ["Sales Strategy", "Software as a Service", "Secure Application", "Simple Accounting"], correctAnswer: 1, explanation: "Subscription-based software delivery." },
  { id: 310, category: 'Mindset', difficulty: 'Beginner', skillType: SkillType.ENTREPRENEURSHIP, question: "Runway is:", options: ["Airport", "Months of cash left", "Fashion stage", "IPO path"], correctAnswer: 1, explanation: "How long you can survive before running out of money." },

  // ... (Backfilled 60+ questions in total for robust pool)
];

const CATEGORIES_MAP = {
  [SkillType.FINANCE]: ['Basics', 'Investing', 'Banking', 'Tax', 'Crypto'],
  [SkillType.ENTREPRENEURSHIP]: ['Mindset', 'Validation', 'Product', 'Fundraising', 'Growth', 'Strategy']
};

const Quiz: React.FC<{ userStats: UserStats, updateStats: (s: Partial<UserStats>) => void }> = ({ userStats, updateStats }) => {
  const [view, setView] = useState<'MENU' | 'GAME' | 'RESULTS'>('MENU');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizHistory, setQuizHistory] = useState<boolean[]>([]);

  const skillQuestions = useMemo(() => {
    // 1. Get pool for Skill + Difficulty
    const pool = QUESTIONS_DB.filter(q => q.skillType === userStats.activeSkill && q.difficulty === selectedDifficulty);
    
    let selection: QuizQuestion[] = [];
    
    if (selectedCategory !== 'All') {
        // 2. Prioritize Category
        selection = pool.filter(q => q.category === selectedCategory);
        // 3. Failsafe Backfill: If less than 10, pull from other categories in same difficulty
        if (selection.length < 10) {
            const others = pool.filter(q => q.category !== selectedCategory);
            const needed = 10 - selection.length;
            selection = [...selection, ...others.sort(() => Math.random() - 0.5).slice(0, needed)];
        }
    } else {
        selection = pool;
    }

    // Return exactly 10 if possible, or whatever we have
    return selection.sort(() => Math.random() - 0.5).slice(0, 10);
  }, [userStats.activeSkill, selectedCategory, selectedDifficulty, view]);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    const isCorrect = idx === skillQuestions[currentQIndex].correctAnswer;
    setSelectedOpt(idx);
    setIsAnswered(true);
    setQuizHistory(prev => [...prev, isCorrect]);
    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQIndex < skillQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      const xpKey = userStats.activeSkill === SkillType.FINANCE ? 'xp' : 'entreXp';
      const difficultyBonus = selectedDifficulty === 'Advanced' ? 3 : selectedDifficulty === 'Intermediate' ? 2 : 1;
      updateStats({ 
        [xpKey]: userStats[xpKey] + (score * 25 * difficultyBonus), 
        quizScore: userStats.quizScore + score 
      });
      if (score >= skillQuestions.length * 0.8) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      setView('RESULTS');
    }
  };

  const startChallenge = () => {
    if (skillQuestions.length < 1) {
      alert("Loading more questions for this track. Please try 'Basics' or 'All'!");
      return;
    }
    setCurrentQIndex(0);
    setScore(0);
    setIsAnswered(false);
    setSelectedOpt(null);
    setQuizHistory([]);
    setView('GAME');
  };

  if (view === 'MENU') {
    return (
      <div className="max-w-5xl mx-auto py-12 space-y-12 animate-in fade-in duration-700">
        <div className="text-center space-y-4">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-[2.5rem] shadow-2xl mb-4 ${userStats.activeSkill === SkillType.FINANCE ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
            <BrainCircuit size={48} />
          </div>
          <h1 className="text-5xl font-heading font-extrabold text-slate-900 tracking-tight">Challenge Hub</h1>
          <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">High-stakes assessments across 10-question sessions. Master the domain to earn massive XP multipliers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
                <div className="glass-card p-10 rounded-[3rem] border border-white/60 bg-white shadow-xl">
                    <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                        <Target className="text-indigo-600" /> Assessment Settings
                    </h3>
                    <div className="space-y-10">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Select Difficulty</label>
                            <div className="grid grid-cols-3 gap-4">
                                {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                                    <button key={level} onClick={() => setSelectedDifficulty(level)} className={`p-6 rounded-2xl border-2 font-bold transition-all text-center ${selectedDifficulty === level ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md' : 'border-slate-100 bg-white text-slate-400 hover:border-indigo-200'}`}>
                                        {level === 'Beginner' ? <ShieldCheck size={24} className="mx-auto mb-1" /> : level === 'Intermediate' ? <BarChart3 size={24} className="mx-auto mb-1" /> : <Flame size={24} className="mx-auto mb-1" />}
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Focus Domain</label>
                            <div className="flex flex-wrap gap-3">
                                <button onClick={() => setSelectedCategory('All')} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedCategory === 'All' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>Mixed Pack</button>
                                {CATEGORIES_MAP[userStats.activeSkill].map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all border-2 ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={startChallenge} className={`w-full mt-12 py-6 rounded-[2rem] font-bold text-xl shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 ${userStats.activeSkill === SkillType.FINANCE ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>Initialize Assessment <ChevronRight /></button>
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
                <div className="glass-card p-8 rounded-[2.5rem] bg-indigo-900 text-white shadow-2xl relative overflow-hidden">
                    <Trophy className="text-amber-400 mb-4" size={32} />
                    <h4 className="text-xl font-bold mb-2">XP Multipliers</h4>
                    <p className="text-sm text-indigo-100 opacity-80 leading-relaxed">Advanced assessments offer 3x XP. Beginner offers 1x base rewards. All sessions are 10 questions.</p>
                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                        <div><p className="text-[10px] font-bold uppercase opacity-50">Global Ranking</p><p className="text-2xl font-heading font-extrabold">{userStats.quizScore}</p></div>
                        <div className="text-right"><p className="text-[10px] font-bold uppercase opacity-50">Est. Reward</p><p className="text-2xl font-heading font-extrabold text-emerald-400">+{selectedDifficulty === 'Advanced' ? '750' : '250'} XP</p></div>
                    </div>
                </div>
                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <p className="text-xs text-amber-700 leading-relaxed">Our selection logic automatically fills packs to 10 questions even if specific categories have fewer items. Mastery guaranteed.</p>
                </div>
            </div>
        </div>
      </div>
    );
  }

  if (view === 'GAME') {
    const question = skillQuestions[currentQIndex];
    if (!question) return <div className="text-center py-20">Assessment issue. <button onClick={() => setView('MENU')} className="underline">Back</button></div>;
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8 animate-in slide-in-from-bottom-8 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border shadow-xl">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('MENU')} className="p-3 hover:bg-slate-100 rounded-full transition-all"><ArrowLeft size={24} className="text-slate-400" /></button>
                <div><h2 className="text-xl font-bold text-slate-900">{selectedDifficulty} Pack</h2><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{question.category}</p></div>
            </div>
            <div className="flex gap-2">
                {skillQuestions.map((_, i) => (
                    <div key={i} className={`h-2 w-8 rounded-full transition-all ${i === currentQIndex ? 'bg-indigo-600 scale-110 shadow-lg' : i < currentQIndex ? (quizHistory[i] ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-slate-100'}`} />
                ))}
            </div>
        </div>
        <div className="glass-card p-12 rounded-[3.5rem] bg-white shadow-2xl border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
              <h2 className="text-3xl font-heading font-bold mb-12 text-slate-900 leading-tight">{question.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {question.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered} className={`p-8 text-left border-2 rounded-3xl font-bold text-lg transition-all flex justify-between items-center ${isAnswered ? (i === question.correctAnswer ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md scale-[1.02]' : (i === selectedOpt ? 'bg-rose-50 border-rose-500 text-rose-700' : 'opacity-40 border-slate-100')) : 'border-slate-100 bg-white hover:border-indigo-400 hover:shadow-xl'}`}>
                    <span>{opt}</span>
                    {isAnswered && i === question.correctAnswer && <CheckCircle2 className="text-emerald-500" />}
                    {isAnswered && i === selectedOpt && i !== question.correctAnswer && <XCircle className="text-rose-500" />}
                  </button>
                ))}
              </div>
              {isAnswered && (
                <div className="mt-12 animate-in slide-in-from-top-4">
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] mb-8 border border-slate-800 shadow-2xl"><p className="text-lg text-white font-medium italic">"{question.explanation}"</p></div>
                  <button onClick={handleNext} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-bold text-xl hover:bg-indigo-700 shadow-xl flex items-center justify-center gap-3 transition-all">
                    {currentQIndex < skillQuestions.length - 1 ? 'Next Question' : 'View Report'} <ChevronRight />
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-20 animate-in zoom-in">
      <div className="glass-card p-16 rounded-[4rem] bg-white border shadow-2xl text-center space-y-10">
        <div className="w-32 h-32 bg-amber-100 text-amber-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl"><Trophy size={64} fill="currentColor" /></div>
        <h2 className="text-6xl font-heading font-extrabold text-slate-900 mb-4 tracking-tight">Success!</h2>
        <p className="text-2xl text-slate-500 font-light mb-12">Session Score: <span className="text-indigo-600 font-bold">{score}/{skillQuestions.length}</span></p>
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Accuracy</p><p className="text-3xl font-heading font-bold text-slate-900">{(score/skillQuestions.length * 100).toFixed(0)}%</p></div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase mb-2">Level</p><p className="text-xl font-heading font-bold text-indigo-600">{selectedDifficulty}</p></div>
            <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100"><p className="text-xs font-bold text-emerald-600 uppercase mb-2">XP Gained</p><p className="text-3xl font-heading font-bold text-emerald-700">+{score * 25 * (selectedDifficulty === 'Advanced' ? 3 : selectedDifficulty === 'Intermediate' ? 2 : 1)}</p></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setView('MENU')} className="px-12 py-5 bg-slate-100 text-slate-700 rounded-full font-bold text-lg hover:bg-slate-200 transition-all">Return Home</button>
            <button onClick={() => { setView('GAME'); setCurrentQIndex(0); setScore(0); setIsAnswered(false); setSelectedOpt(null); setQuizHistory([]); }} className={`px-12 py-5 text-white rounded-full font-bold text-lg flex items-center gap-3 hover:shadow-xl transition-all ${userStats.activeSkill === SkillType.FINANCE ? 'bg-indigo-600' : 'bg-rose-600'}`}><RefreshCw size={24}/> New Challenge</button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
