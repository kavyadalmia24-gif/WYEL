
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, Search, Star, Info, Zap, Shield, Target, Award, Bell, Activity, Trophy, BarChart3, DollarSign, Bot, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { UserStats, Stock, NewsItem } from '../types';
import { analyzeTradeMove } from '../services/geminiService';
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
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL' | 'SHORT'>('BUY');
  const [notification, setNotification] = useState<string | null>(null);
  const [mainTab, setMainTab] = useState<'TRADE' | 'PORTFOLIO' | 'MISSIONS' | 'LEADERBOARD'>('TRADE');
  const [activeListTab, setActiveListTab] = useState<'ALL' | 'WATCHLIST'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // AI Analyst States
  const [analystReport, setAnalystReport] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedStock = useMemo(() => 
    stocks.find(s => s.symbol === selectedStockSymbol) || stocks[0], 
  [stocks, selectedStockSymbol]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(stocks.map(s => s.category)));
    return ['All', ...cats.sort()];
  }, [stocks]);

  const showNotification = (msg: string, type: 'success' | 'error') => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const portfolioValue = useMemo(() => userStats.holdings.reduce((acc, curr) => {
    const currentPrice = stocks.find(s => s.symbol === curr.symbol)?.price || 0;
    return acc + (curr.quantity * currentPrice);
  }, 0), [userStats.holdings, stocks]);

  const handleTrade = async () => {
    const qty = parseInt(tradeQuantity);
    if (isNaN(qty) || qty <= 0) {
      showNotification("Please enter a valid quantity", "error");
      return;
    }

    const price = selectedStock.price;
    const totalCost = qty * price;
    let successful = false;

    if (tradeAction === 'BUY') {
      if (userStats.walletBalance < totalCost) {
        showNotification("Insufficient Denari Balance!", "error");
        return;
      }

      const newHoldings = userStats.holdings.map(h => ({ ...h }));
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
          leverage: 1
        });
      }

      updateStats({
        walletBalance: userStats.walletBalance - totalCost,
        coins: userStats.coins + Math.floor(qty * 5),
        holdings: newHoldings
      });
      
      successful = true;
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      showNotification(`Bought ${qty} ${selectedStock.symbol}`, "success");
    } else if (tradeAction === 'SELL') {
      const existingItem = userStats.holdings.find(h => h.symbol === selectedStock.symbol && h.type === 'LONG');
      
      if (!existingItem || existingItem.quantity < qty) {
        showNotification("Insufficient holdings to sell", "error");
        return;
      }

      const newHoldings = userStats.holdings
        .map(h => ({ ...h }))
        .map(h => {
          if (h.symbol === selectedStock.symbol && h.type === 'LONG') {
            return { ...h, quantity: h.quantity - qty };
          }
          return h;
        })
        .filter(h => h.quantity > 0);

      const profit = (price - existingItem.avgPrice) * qty;

      updateStats({
        walletBalance: userStats.walletBalance + (qty * price),
        holdings: newHoldings,
        xp: userStats.xp + (profit > 0 ? 50 : 10) 
      });

      successful = true;
      showNotification(`Sold ${qty} ${selectedStock.symbol}`, "success");
    }

    if (successful) {
      setTradeQuantity('');
      // Trigger AI Analyst
      setIsAnalyzing(true);
      try {
        const report = await analyzeTradeMove(
          tradeAction === 'BUY' ? 'BUY' : 'SELL',
          selectedStock,
          qty,
          portfolioValue,
          userStats.walletBalance
        );
        setAnalystReport(report);
      } catch (e) {
        console.error("Analyst Error:", e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const toggleWatchlist = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const watchlist = userStats.watchlist || [];
    const newWatchlist = watchlist.includes(symbol) ? watchlist.filter(s => s !== symbol) : [...watchlist, symbol];
    updateStats({ watchlist: newWatchlist });
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          stock.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || stock.category === selectedCategory;
    if (activeListTab === 'WATCHLIST') return matchesSearch && (userStats.watchlist || []).includes(stock.symbol);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <div className="glass-card p-6 rounded-[2rem] border border-indigo-100 bg-white/50 flex flex-wrap items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                      <DollarSign size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available Capital</p>
                      <p className="text-2xl font-heading font-extrabold text-slate-900">${userStats.walletBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
              </div>
              <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Trophy size={24} />
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Value</p>
                      <p className="text-2xl font-heading font-extrabold text-slate-900">${portfolioValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
              </div>
          </div>

          <div className="bg-slate-900 px-8 py-4 rounded-3xl shadow-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <Activity size={20} className="text-white" />
              </div>
              <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Net Worth</p>
                  <p className="text-2xl font-heading font-black text-white">
                      ${(userStats.walletBalance + portfolioValue).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px]">
        {/* Market List */}
        <div className="lg:col-span-3 glass-card rounded-[2.5rem] border overflow-hidden flex flex-col bg-white shadow-lg">
           <div className="p-4 border-b space-y-3">
             <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setActiveListTab('ALL')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeListTab === 'ALL' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>All Assets</button>
                <button onClick={() => setActiveListTab('WATCHLIST')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeListTab === 'WATCHLIST' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Watchlist</button>
             </div>
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
               <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search stocks..." className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-indigo-100 outline-none font-medium" />
             </div>
             <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
                {categories.map(cat => (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{cat}</button>
                ))}
             </div>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {filteredStocks.map(stock => (
                    <div key={stock.symbol} onClick={() => setSelectedStockSymbol(stock.symbol)} className={`p-4 rounded-2xl cursor-pointer transition-all border group relative flex justify-between items-center ${selectedStockSymbol === stock.symbol ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[0.98]' : 'bg-transparent border-transparent hover:bg-slate-50'}`}>
                      <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm ${stock.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>{stock.symbol[0]}</div>
                          <div>
                              <span className="font-bold text-slate-900 block text-sm">{stock.symbol}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase">{stock.category}</span>
                          </div>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-slate-800 text-sm">${stock.price.toFixed(2)}</div>
                          <div className={`text-[10px] font-bold ${stock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%</div>
                      </div>
                    </div>
                ))}
           </div>
        </div>

        {/* Trade Center */}
        <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="flex items-center gap-6 border-b border-slate-200 pb-2 px-2">
                {['TRADE', 'PORTFOLIO', 'MISSIONS'].map(tab => (
                    <button key={tab} onClick={() => setMainTab(tab as any)} className={`flex items-center gap-2 pb-2 px-2 text-sm font-bold transition-all border-b-2 ${mainTab === tab ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>{tab}</button>
                ))}
            </div>

            {mainTab === 'TRADE' && (
                <>
                <div className="glass-card p-8 rounded-[3rem] border bg-white shadow-xl h-[350px] flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-heading font-extrabold text-slate-900">{selectedStock.name}</h2>
                            <p className="text-4xl font-heading font-black text-slate-900 mt-2">${selectedStock.price.toFixed(2)}</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-2 ${selectedStock.change >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {selectedStock.change >= 0 ? <TrendingUp size={18}/> : <TrendingDown size={18}/>}
                            {Math.abs(selectedStock.change).toFixed(2)}%
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={selectedStock.history}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="price" stroke={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} strokeWidth={4} fillOpacity={0.1} fill={selectedStock.change >= 0 ? '#10b981' : '#f43f5e'} />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] bg-white border shadow-xl">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
                        {['BUY', 'SELL'].map(action => (
                            <button key={action} onClick={() => setTradeAction(action as any)} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tradeAction === action ? (action === 'BUY' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-rose-500 text-white shadow-lg') : 'text-slate-500 hover:text-slate-800'}`}>{action}</button>
                        ))}
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                             <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-widest">Quantity</label>
                             <input type="number" value={tradeQuantity} onChange={e => setTradeQuantity(e.target.value)} placeholder="0" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-2xl focus:ring-4 focus:ring-indigo-100 outline-none transition-all" />
                        </div>
                        <button onClick={handleTrade} disabled={isAnalyzing} className={`px-12 py-5 rounded-2xl font-bold text-white shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 ${tradeAction === 'BUY' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} disabled:opacity-50`}>
                            {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : null}
                            Execute {tradeAction}
                        </button>
                    </div>
                    {notification && (
                         <div className={`mt-6 text-center text-sm font-bold p-4 rounded-2xl animate-in slide-in-from-top-2 ${notification.toLowerCase().includes('insufficient') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'}`}>{notification}</div>
                    )}
                </div>
                </>
            )}

            {mainTab === 'PORTFOLIO' && (
                <div className="bg-white p-8 rounded-[3rem] border shadow-xl flex-1 overflow-y-auto custom-scrollbar">
                    <h3 className="text-2xl font-heading font-black text-slate-900 mb-8">Asset Holdings</h3>
                    <div className="space-y-4">
                        {userStats.holdings.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-[2rem] border border-dashed">
                                <Activity className="mx-auto text-slate-300 mb-4" size={48} />
                                <p className="text-slate-500 font-medium">No open positions. Start trading!</p>
                            </div>
                        ) : userStats.holdings.map((h, i) => {
                            const stock = stocks.find(s => s.symbol === h.symbol);
                            const currentVal = (stock?.price || 0) * h.quantity;
                            const profit = currentVal - (h.avgPrice * h.quantity);
                            return (
                                <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border hover:border-indigo-200 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{h.symbol}</div>
                                        <div>
                                            <p className="font-bold text-slate-900">{h.quantity} Shares</p>
                                            <p className="text-xs text-slate-500 font-medium">Avg: ${h.avgPrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-lg">${currentVal.toFixed(2)}</p>
                                        <p className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                            {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({((profit / (h.avgPrice * h.quantity)) * 100).toFixed(2)}%)
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>

        {/* Analyst and News Column */}
        <div className="lg:col-span-3 flex flex-col gap-6 h-full">
            {/* AI Analyst Desk */}
            <div className={`glass-card p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl transition-all duration-500 overflow-hidden flex flex-col ${isAnalyzing ? 'ring-4 ring-indigo-500/50' : ''}`}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                            <Bot className="text-white" size={20} />
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-white/70">Analyst Desk</h3>
                            <p className="text-[10px] text-indigo-300 font-bold uppercase">Live Performance Feedback</p>
                        </div>
                    </div>
                    {isAnalyzing && <Sparkles className="text-amber-400 animate-pulse" size={18} />}
                </div>

                <div className="flex-1 space-y-4">
                    {analystReport ? (
                        <div className="bg-white/10 p-5 rounded-2xl border border-white/10 animate-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle size={14} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Latest Verdict</span>
                            </div>
                            <div className="text-xs leading-relaxed text-indigo-50 font-medium prose-invert" dangerouslySetInnerHTML={{ __html: analystReport.replace(/\n/g, '<br />') }} />
                        </div>
                    ) : (
                        <div className="text-center py-12 px-6">
                            <Bot size={32} className="mx-auto text-white/20 mb-4" />
                            <p className="text-xs text-white/40 font-medium italic">Make a trade to receive your first professional evaluation.</p>
                        </div>
                    )}
                </div>
                
                {isAnalyzing && (
                    <div className="mt-4 p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 flex items-center gap-3">
                        <Loader2 size={16} className="animate-spin text-indigo-400" />
                        <p className="text-[10px] font-bold text-indigo-200">Processing market tape and trade data...</p>
                    </div>
                )}
            </div>

            {/* News Feed */}
            <div className="glass-card p-6 rounded-[2.5rem] bg-white border shadow-xl flex-1 overflow-hidden flex flex-col">
                <h3 className="font-heading font-bold text-xs uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Bell size={14} /> Breaking News</h3>
                <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                    {newsFeed.length === 0 ? (
                        <div className="text-center py-10 opacity-30">
                            <Search className="mx-auto mb-2" size={32} />
                            <p className="text-xs font-bold">Scanning for updates...</p>
                        </div>
                    ) : newsFeed.map(news => (
                        <div key={news.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition-colors shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${news.sentiment === 'POSITIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{news.sentiment}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{news.timestamp}</span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 leading-snug">{news.headline}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Market;
