
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Briefcase, Search, Star, ListFilter, RefreshCw, X, LayoutGrid, Info, Zap, Shield, Target, Award, Bell, Activity, Trophy, BarChart3, Lock, Users } from 'lucide-react';
import { UserStats, Stock, NewsItem } from '../types';
import confetti from 'canvas-confetti';

interface MarketProps {
  userStats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
  stocks: Stock[];
  newsFeed: NewsItem[];
}

const Market: React.FC<MarketProps> = ({ userStats, updateStats, stocks, newsFeed }) => {
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('MSFT'); 
  const [tradeQuantity, setTradeQuantity] = useState<string>('');
  
  // Advanced Trading State
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL' | 'SHORT'>('BUY');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [leverage, setLeverage] = useState<number>(1);
  
  const [notification, setNotification] = useState<string | null>(null);
  
  // UI Tabs
  const [mainTab, setMainTab] = useState<'TRADE' | 'PORTFOLIO' | 'MISSIONS' | 'LEADERBOARD'>('TRADE');
  const [activeListTab, setActiveListTab] = useState<'ALL' | 'WATCHLIST'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStock = useMemo(() => 
    stocks.find(s => s.symbol === selectedStockSymbol) || stocks[0], 
  [stocks, selectedStockSymbol]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stocks.map(s => s.category)));
    return ['All', ...cats.sort()];
  }, [stocks]);

  // --- TRADING LOGIC ---
  const handleTrade = () => {
    const qty = parseInt(tradeQuantity);
    if (isNaN(qty) || qty <= 0) {
      showNotification("Please enter a valid quantity", "error");
      return;
    }

    const price = orderType === 'LIMIT' || orderType === 'STOP' ? parseFloat(limitPrice) : selectedStock.price;
    if ((orderType !== 'MARKET' && isNaN(price)) || (orderType !== 'MARKET' && price <= 0)) {
        showNotification("Please enter a valid target price", "error");
        return;
    }

    const totalCost = qty * price; // Simplification: Margin is handled simply

    // PENDING ORDER (LIMIT/STOP)
    if (orderType === 'LIMIT' || orderType === 'STOP') {
        const newPending = {
            id: Date.now().toString(),
            symbol: selectedStock.symbol,
            type: orderType === 'LIMIT' ? (tradeAction === 'BUY' ? 'LIMIT_BUY' : 'LIMIT_SELL') : 'STOP_LOSS',
            targetPrice: price,
            quantity: qty,
            leverage: leverage
        };
        // @ts-ignore - Simplifying type match
        updateStats({ pendingOrders: [...userStats.pendingOrders, newPending] });
        showNotification(`${orderType} order placed for ${selectedStock.symbol} @ $${price}`, "success");
        return;
    }

    // MARKET BUY
    if (tradeAction === 'BUY') {
      if (userStats.walletBalance < totalCost) {
        showNotification("Insufficient funds!", "error");
        return;
      }

      const newHoldings = [...userStats.holdings];
      const existingItem = newHoldings.find(h => h.symbol === selectedStock.symbol && h.type === 'LONG');

      if (existingItem) {
        const totalQty = existingItem.quantity + qty;
        existingItem.avgPrice = ((existingItem.avgPrice * existingItem.quantity) + (price * qty)) / totalQty;
        existingItem.quantity = totalQty;
      } else {
        newHoldings.push({
          symbol: selectedStock.symbol,
          quantity: qty,
          avgPrice: price,
          type: 'LONG',
          leverage: leverage
        });
      }

      updateStats({
        walletBalance: userStats.walletBalance - totalCost,
        holdings: newHoldings,
        // Update Missions
        missions: userStats.missions.map(m => m.type === 'TRADE_COUNT' ? {...m, progress: Math.min(m.target, m.progress + 1)} : m)
      });
      
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showNotification(`Bought ${qty} ${selectedStock.symbol}`, "success");
    } 
    // MARKET SELL
    else if (tradeAction === 'SELL') {
      const existingItem = userStats.holdings.find(h => h.symbol === selectedStock.symbol && h.type === 'LONG');
      
      if (!existingItem || existingItem.quantity < qty) {
        showNotification("Insufficient holdings to sell", "error");
        return;
      }

      existingItem.quantity -= qty;
      const profit = (price - existingItem.avgPrice) * qty;

      const newHoldings = existingItem.quantity === 0 
        ? userStats.holdings.filter(h => !(h.symbol === selectedStock.symbol && h.type === 'LONG'))
        : [...userStats.holdings];

      updateStats({
        walletBalance: userStats.walletBalance + (qty * price),
        holdings: newHoldings,
        xp: userStats.xp + (profit > 0 ? 50 : 10) // XP for trading
      });

      showNotification(`Sold ${qty} ${selectedStock.symbol} (${profit > 0 ? '+' : ''}$${profit.toFixed(0)})`, "success");
    }
    // SHORT SELL
    else if (tradeAction === 'SHORT') {
         // Simplified Short: We reserve cash = value, and track entry price. 
         // Real shorts borrow shares. Here we simulate "Betting against".
         if (userStats.walletBalance < totalCost) {
            showNotification("Insufficient collateral for Short!", "error");
            return;
         }
         
         const newHoldings = [...userStats.holdings];
         newHoldings.push({
             symbol: selectedStock.symbol,
             quantity: qty,
             avgPrice: price,
             type: 'SHORT',
             leverage: leverage
         });

         updateStats({
             walletBalance: userStats.walletBalance - totalCost, // Lock collateral
             holdings: newHoldings
         });
         showNotification(`Short position opened for ${selectedStock.symbol}`, "success");
    }

    setTradeQuantity('');
    setLimitPrice('');
  };

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const toggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const currentWatchlist = userStats.watchlist || [];
    const isInWatchlist = currentWatchlist.includes(symbol);
    const newWatchlist = isInWatchlist ? currentWatchlist.filter(s => s !== symbol) : [...currentWatchlist, symbol];
    updateStats({ watchlist: newWatchlist });
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || stock.category === selectedCategory;
    
    if (activeListTab === 'WATCHLIST') {
      const watchlist = userStats.watchlist || [];
      return matchesSearch && watchlist.includes(stock.symbol);
    }
    return matchesSearch && matchesCategory;
  });

  const portfolioValue = userStats.holdings.reduce((acc, curr) => {
      const currentPrice = stocks.find(s => s.symbol === curr.symbol)?.price || 0;
      if (curr.type === 'LONG') return acc + (curr.quantity * currentPrice);
      // For short, value is collateral + (entry - current) * qty
      return acc + (curr.quantity * curr.avgPrice) + ((curr.avgPrice - currentPrice) * curr.quantity);
  }, 0);

  // --- RENDER HELPERS ---

  const renderTooltip = (title: string, content: string) => (
      <div className="group relative inline-block ml-1">
          <Info size={14} className="text-slate-400 hover:text-indigo-500 cursor-help" />
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <strong className="block mb-1 text-indigo-300">{title}</strong>
              {content}
          </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      
      {/* GAMIFICATION HEADER */}
      <div className="glass-card p-4 rounded-2xl border border-indigo-100 bg-white/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                  <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-lg border-4 border-indigo-100">
                          {userStats.level}
                      </div>
                      <div className="absolute -bottom-1 -right-1 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                          LVL
                      </div>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Trader Rank</p>
                      <p className="text-sm font-bold text-slate-900">{userStats.level < 5 ? 'Rookie' : userStats.level < 10 ? 'Pro' : 'Whale'}</p>
                  </div>
              </div>
              
              <div className="h-8 w-px bg-slate-200"></div>

              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <Zap size={20} fill="currentColor" />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Streak</p>
                      <p className="text-sm font-bold text-slate-900">{userStats.streakDays} Days 🔥</p>
                  </div>
              </div>

               <div className="h-8 w-px bg-slate-200"></div>

               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Award size={20} />
                  </div>
                  <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Denari Coins</p>
                      <p className="text-sm font-bold text-slate-900">{userStats.coins}</p>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-100 px-4 py-2 rounded-xl">
              <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Net Worth</p>
                  <p className="text-lg font-heading font-extrabold text-slate-900">
                      ${(userStats.walletBalance + portfolioValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)] min-h-[600px]">
        
        {/* LEFT: ASSET SELECTOR */}
        <div className="lg:col-span-3 glass-card rounded-[2rem] border border-white/60 overflow-hidden flex flex-col bg-white/40 shadow-xl">
           <div className="p-4 border-b border-slate-100/50 bg-white/30 space-y-3">
             {/* Tabs */}
             <div className="flex bg-slate-100/80 p-1 rounded-xl">
                <button
                   onClick={() => setActiveListTab('ALL')}
                   className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeListTab === 'ALL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                   All Assets
                </button>
                <button
                   onClick={() => setActiveListTab('WATCHLIST')}
                   className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeListTab === 'WATCHLIST' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                >
                   Watchlist
                </button>
             </div>
             {/* Search */}
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search market..." 
                 className="w-full bg-white/80 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-indigo-300 font-medium"
               />
             </div>
             {/* Category Chips */}
             {activeListTab === 'ALL' && (
                <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}`}>{cat}</button>
                    ))}
                </div>
             )}
           </div>

           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredStocks.map(stock => (
                    <div 
                      key={stock.symbol}
                      onClick={() => setSelectedStockSymbol(stock.symbol)}
                      className={`p-3 rounded-xl cursor-pointer transition-all border group relative flex justify-between items-center ${selectedStockSymbol === stock.symbol ? 'bg-white border-indigo-200 shadow-md' : 'bg-transparent border-transparent hover:bg-white/60'}`}
                    >
                      <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${['Tech', 'Crypto'].includes(stock.category) ? 'bg-indigo-500' : 'bg-slate-600'}`}>
                              {stock.symbol[0]}
                          </div>
                          <div>
                              <span className="font-bold text-slate-900 block text-xs">{stock.symbol}</span>
                              <span className="text-[10px] text-slate-500 font-medium">{stock.name}</span>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-slate-800 text-xs">${stock.price.toFixed(2)}</div>
                          <div className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </div>
                      </div>
                      <button onClick={(e) => toggleWatchlist(e, stock.symbol)} className={`absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity ${(userStats.watchlist||[]).includes(stock.symbol) ? 'opacity-100 text-amber-400' : 'text-slate-300'}`}>
                         <Star size={10} fill="currentColor" />
                      </button>
                    </div>
                ))}
           </div>
        </div>

        {/* CENTER: MAIN TERMINAL */}
        <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Main Tabs */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-2 px-2">
                {[
                    {id: 'TRADE', label: 'Trading Terminal', icon: Activity},
                    {id: 'PORTFOLIO', label: 'Analytics', icon: BarChart3},
                    {id: 'MISSIONS', label: 'Missions', icon: Target},
                    {id: 'LEADERBOARD', label: 'Leaderboard', icon: Trophy}
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setMainTab(tab.id as any)}
                        className={`flex items-center gap-2 pb-2 px-2 text-sm font-bold transition-all border-b-2 ${mainTab === tab.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {mainTab === 'TRADE' && (
                <>
                {/* Chart Area */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/60 shadow-lg bg-white/60 h-[320px] flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-heading font-bold text-slate-900">{selectedStock.name}</h2>
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px] font-bold uppercase">{selectedStock.category}</span>
                            </div>
                            <p className="text-4xl font-heading font-extrabold text-slate-900 mt-1">${selectedStock.price.toFixed(2)}</p>
                        </div>
                        <div className={`text-right px-3 py-1 rounded-lg ${selectedStock.change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            <p className="text-sm font-bold flex items-center gap-1 justify-end">
                                {selectedStock.change >= 0 ? <TrendingUp size={16}/> : <TrendingDown size={16}/>}
                                {Math.abs(selectedStock.change).toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedStock.history}>
                            <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="price" stroke={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={3} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Form */}
                <div className="glass-card p-6 rounded-[2rem] border border-white/60 bg-white/60">
                    <div className="flex gap-4 mb-6">
                        <div className="flex-1 bg-slate-100 p-1 rounded-xl flex">
                            {['BUY', 'SELL', 'SHORT'].map(action => (
                                <button
                                    key={action}
                                    onClick={() => setTradeAction(action as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tradeAction === action 
                                        ? (action === 'BUY' ? 'bg-emerald-500 text-white shadow' : action === 'SELL' ? 'bg-rose-500 text-white shadow' : 'bg-amber-500 text-white shadow') 
                                        : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {action}
                                    {action === 'SHORT' && renderTooltip("Short Selling", "Betting that the stock price will go DOWN. High risk!")}
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 bg-slate-100 p-1 rounded-xl flex">
                             {['MARKET', 'LIMIT', 'STOP'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setOrderType(type as any)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${orderType === type ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {type}
                                    {type === 'LIMIT' && renderTooltip("Limit Order", "Buy/Sell only at a specific price or better.")}
                                    {type === 'STOP' && renderTooltip("Stop Loss", "Automatically trigger a sell if price drops below target.")}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Quantity</label>
                             <input 
                                type="number" 
                                value={tradeQuantity} 
                                onChange={e => setTradeQuantity(e.target.value)} 
                                placeholder="0" 
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                             />
                        </div>
                        
                        {(orderType === 'LIMIT' || orderType === 'STOP') && (
                            <div className="flex-1 animate-in slide-in-from-left duration-300">
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Target Price</label>
                                <input 
                                    type="number" 
                                    value={limitPrice} 
                                    onChange={e => setLimitPrice(e.target.value)} 
                                    placeholder={selectedStock.price.toFixed(2)} 
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-lg focus:ring-2 focus:ring-indigo-200 outline-none"
                                />
                            </div>
                        )}

                        <button 
                            onClick={handleTrade}
                            className={`px-8 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all hover:-translate-y-1 active:translate-y-0
                             ${tradeAction === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : tradeAction === 'SELL' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}
                            `}
                        >
                            {orderType === 'MARKET' ? tradeAction : `Place ${orderType}`}
                        </button>
                    </div>
                    
                    {notification && (
                         <div className={`mt-4 text-center text-xs font-bold p-2 rounded-lg animate-in fade-in ${notification.includes('error') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                             {notification}
                         </div>
                    )}
                </div>
                </>
            )}

            {mainTab === 'MISSIONS' && (
                <div className="glass-card p-6 rounded-[2rem] border border-white/60 bg-white/60 h-full overflow-y-auto">
                    <h3 className="font-heading font-bold text-xl text-slate-900 mb-4 flex items-center gap-2"><Target className="text-indigo-600"/> Daily Missions</h3>
                    <div className="space-y-4">
                        {userStats.missions.map(mission => (
                            <div key={mission.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 className="font-bold text-slate-800">{mission.title}</h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${(mission.progress / mission.target) * 100}%` }} />
                                        </div>
                                        <span className="text-xs text-slate-500 font-bold">{mission.progress}/{mission.target}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end text-xs font-bold text-amber-600 mb-1">
                                        <Award size={12} /> {mission.rewardXP} XP
                                    </div>
                                    <button 
                                        disabled={mission.progress < mission.target || mission.completed}
                                        className={`text-xs px-3 py-1 rounded-full font-bold transition-all ${mission.completed ? 'bg-emerald-100 text-emerald-700' : mission.progress >= mission.target ? 'bg-indigo-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'}`}
                                    >
                                        {mission.completed ? 'Claimed' : 'Claim Reward'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {mainTab === 'LEADERBOARD' && (
                <div className="glass-card p-6 rounded-[2rem] border border-white/60 bg-white/60 h-full">
                    <div className="text-center mb-6">
                        <Trophy size={48} className="text-amber-500 mx-auto mb-2" />
                        <h3 className="font-heading font-bold text-2xl text-slate-900">Top Traders</h3>
                        <p className="text-slate-500 text-sm">Ranked by weekly P&L %</p>
                    </div>
                    <div className="space-y-2">
                        {[
                            { rank: 1, name: 'CryptoKing99', gain: 142.5, you: false },
                            { rank: 2, name: 'StockMaster', gain: 98.2, you: false },
                            { rank: 3, name: 'WallStWolf', gain: 87.1, you: false },
                            { rank: 4, name: 'Guest User (You)', gain: 12.4, you: true },
                            { rank: 5, name: 'HODLer', gain: -5.2, you: false }
                        ].map(user => (
                            <div key={user.name} className={`flex items-center justify-between p-3 rounded-xl border ${user.you ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold w-6 text-center ${user.rank <= 3 ? 'text-amber-500' : 'text-slate-400'}`}>#{user.rank}</span>
                                    <span className={`font-bold ${user.you ? 'text-indigo-900' : 'text-slate-700'}`}>{user.name}</span>
                                </div>
                                <span className={`font-bold ${user.gain > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{user.gain > 0 ? '+' : ''}{user.gain}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* RIGHT: NEWS & PORTFOLIO */}
        <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* NEWS FEED */}
            <div className="glass-card p-5 rounded-[2rem] border border-white/60 bg-white/60 shadow-lg flex-1 overflow-hidden flex flex-col">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Bell size={14} /> Market News
                </h3>
                <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                    {newsFeed.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center italic">No breaking news yet...</p>
                    ) : (
                        newsFeed.map(news => (
                            <div key={news.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${news.sentiment === 'POSITIVE' ? 'bg-emerald-50 text-emerald-600' : news.sentiment === 'NEGATIVE' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
                                        {news.sentiment}
                                    </span>
                                    <span className="text-[10px] text-slate-400">{news.timestamp}</span>
                                </div>
                                <p className="text-xs font-bold text-slate-800 leading-snug">{news.headline}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* PORTFOLIO SNAPSHOT / RISK METER */}
            <div className="glass-card p-5 rounded-[2rem] border border-white/60 bg-white/60 shadow-lg">
                <h3 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <Shield size={14} /> Risk Analysis
                </h3>
                <div className="relative pt-4 pb-2 text-center">
                    <div className="h-3 w-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-500 rounded-full mb-2" />
                    <div className="absolute top-2 left-[30%] -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-slate-800" />
                    <p className="text-xs font-bold text-emerald-600">Low Risk • Conservative</p>
                    <p className="text-[10px] text-slate-400 mt-2">
                        Good diversification across {new Set(userStats.holdings.map(h => stocks.find(s => s.symbol === h.symbol)?.category)).size} sectors.
                    </p>
                </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default Market;
