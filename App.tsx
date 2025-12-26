
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Calculators from './views/Calculators';
import Quiz from './views/Quiz';
import Learn from './views/Learn';
import Advisor from './views/Advisor';
import Market from './views/Market';
import StartupSimulator from './views/StartupSimulator';
import Leaderboard from './views/Leaderboard';
import Auth from './views/Auth';
import { ViewState, UserStats, Stock, NewsItem, SkillType } from './types';
import { Menu } from 'lucide-react';
import { INITIAL_STOCKS, generateMarketNews, calculateNextPrice } from './utils/marketData';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>(INITIAL_STOCKS);
  const [newsFeed, setNewsFeed] = useState<NewsItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{email: string, name: string} | null>(null);
  
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0,
    entreXp: 0,
    level: 1,
    coins: 100,
    lessonsCompleted: 0,
    quizScore: 0,
    walletBalance: 10000,
    holdings: [],
    watchlist: ['TCH', 'BIO', 'AIX'],
    pendingOrders: [],
    achievements: [],
    missions: [],
    streakDays: 1,
    activeSkill: SkillType.FINANCE,
    savedStartups: []
  });

  // Load user on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('denari_session');
    if (savedSession) {
      const user = JSON.parse(savedSession);
      setCurrentUser(user);
      loadUserStats(user.email);
    }
  }, []);

  // Market Engine Interval
  useEffect(() => {
    const interval = setInterval(() => {
      const freshNews = generateMarketNews(stocks);
      if (freshNews) setNewsFeed(prev => [freshNews, ...prev].slice(0, 10));
      setStocks(current => current.map(s => {
        const nextPrice = calculateNextPrice(s, 0);
        return { ...s, price: nextPrice, history: [...s.history, { time: new Date().toLocaleTimeString(), price: nextPrice }].slice(-30) };
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [stocks]);

  // Persist stats whenever they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`denari_stats_${currentUser.email}`, JSON.stringify(userStats));
    }
  }, [userStats, currentUser]);

  const loadUserStats = (email: string) => {
    const savedStats = localStorage.getItem(`denari_stats_${email}`);
    if (savedStats) {
      setUserStats(JSON.parse(savedStats));
    }
  };

  const handleLogin = (email: string, name: string) => {
    const user = { email, name };
    setCurrentUser(user);
    localStorage.setItem('denari_session', JSON.stringify(user));
    loadUserStats(email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('denari_session');
    // Reset to default
    setUserStats({
      xp: 0,
      entreXp: 0,
      level: 1,
      coins: 100,
      lessonsCompleted: 0,
      quizScore: 0,
      walletBalance: 10000,
      holdings: [],
      watchlist: ['TCH', 'BIO', 'AIX'],
      pendingOrders: [],
      achievements: [],
      missions: [],
      streakDays: 1,
      activeSkill: SkillType.FINANCE,
      savedStartups: []
    });
    setCurrentView(ViewState.DASHBOARD);
  };

  const updateStats = (newStats: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...newStats }));
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD: return <Dashboard onNavigate={setCurrentView} userStats={userStats} stocks={stocks} updateStats={updateStats} />;
      case ViewState.LEARN: return <Learn userStats={userStats} updateStats={updateStats} />;
      case ViewState.QUIZ: return <Quiz userStats={userStats} updateStats={updateStats} />;
      case ViewState.CALCULATORS: return <Calculators userStats={userStats} />;
      case ViewState.MARKET: return <Market userStats={userStats} updateStats={updateStats} stocks={stocks} newsFeed={newsFeed} />;
      case ViewState.SIMULATOR: return <StartupSimulator userStats={userStats} updateStats={updateStats} />;
      case ViewState.ADVISOR: return <Advisor activeSkill={userStats.activeSkill} />;
      case ViewState.LEADERBOARD: return <Leaderboard userStats={userStats} />;
      default: return <Dashboard onNavigate={setCurrentView} userStats={userStats} stocks={stocks} updateStats={updateStats} />;
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeSkill={userStats.activeSkill}
        onLogout={handleLogout}
        userName={currentUser.name}
      />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <div className="md:hidden bg-white/80 backdrop-blur-md p-4 flex items-center justify-between border-b z-20">
          <div className="text-indigo-900 font-heading font-bold text-xl">Denari</div>
          <button onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto pb-10">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
