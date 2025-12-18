import React, { useMemo } from 'react';
import { UserStats } from '../types';
import { Trophy, Medal, Crown, Zap } from 'lucide-react';

interface LeaderboardProps {
    userStats: UserStats;
}

const Leaderboard = ({ userStats }: LeaderboardProps) => {

    const leaderboardData = useMemo(() => {
        const fakeUsers = [
            { name: "CryptoKing99", xp: 4500, level: 5, streak: 12, avatarColor: "bg-orange-500" },
            { name: "StockMaster", xp: 3800, level: 4, streak: 8, avatarColor: "bg-blue-500" },
            { name: "WallStWolf", xp: 3200, level: 4, streak: 5, avatarColor: "bg-slate-800" },
            { name: "HODLer_One", xp: 2900, level: 3, streak: 3, avatarColor: "bg-emerald-500" },
            { name: "SatoshiFan", xp: 2100, level: 3, streak: 15, avatarColor: "bg-purple-500" },
            { name: "BearTrap", xp: 1800, level: 2, streak: 2, avatarColor: "bg-rose-500" },
            { name: "BullRun_X", xp: 1500, level: 2, streak: 4, avatarColor: "bg-indigo-500" },
            { name: "MoonShot", xp: 900, level: 1, streak: 1, avatarColor: "bg-teal-500" },
        ];

        // Insert current user and sort
        const allUsers = [
            ...fakeUsers.map(u => ({ ...u, isUser: false })),
            { 
                name: "You (Guest)", 
                xp: userStats.xp, 
                level: userStats.level, 
                streak: userStats.streakDays, 
                avatarColor: "bg-indigo-600",
                isUser: true 
            }
        ];

        return allUsers
            .sort((a, b) => b.xp - a.xp)
            .map((u, idx) => ({ ...u, rank: idx + 1 }));

    }, [userStats.xp, userStats.level, userStats.streakDays]);

    const userEntry = leaderboardData.find(u => u.isUser);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl mb-4 shadow-lg shadow-amber-100">
                    <Trophy size={40} className="text-amber-600" fill="currentColor" />
                </div>
                <h1 className="text-4xl font-heading font-extrabold text-slate-900 mb-2">Global Leaderboard</h1>
                <p className="text-slate-500 text-lg">Compete with top traders worldwide.</p>
            </div>

            {/* Current User Stats Bar */}
            <div className="glass-card p-6 rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 font-heading font-bold text-2xl">
                            #{userEntry?.rank}
                        </div>
                        <div>
                            <p className="text-indigo-200 font-bold uppercase text-xs tracking-wider">Your Ranking</p>
                            <h3 className="text-2xl font-bold">Top {userEntry && Math.ceil((userEntry.rank / leaderboardData.length) * 100)}%</h3>
                        </div>
                    </div>
                    
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Total XP</p>
                            <p className="text-2xl font-heading font-bold">{userStats.xp.toLocaleString()}</p>
                        </div>
                         <div className="text-center">
                            <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Weekly Streak</p>
                            <p className="text-2xl font-heading font-bold flex items-center gap-1 justify-center">
                                <Zap size={18} fill="currentColor" className="text-yellow-400" /> {userStats.streakDays}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-xl">
                <div className="flex items-center justify-between px-4 pb-4 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div className="w-16">Rank</div>
                    <div className="flex-1">User</div>
                    <div className="w-24 text-center">Level</div>
                    <div className="w-24 text-right">XP</div>
                </div>
                
                <div className="space-y-2 mt-4">
                    {leaderboardData.map((entry) => (
                        <div 
                            key={entry.name}
                            className={`
                                flex items-center justify-between p-4 rounded-2xl transition-all
                                ${entry.isUser 
                                    ? 'bg-indigo-50 border-2 border-indigo-100 shadow-sm scale-[1.01]' 
                                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-100'
                                }
                            `}
                        >
                            <div className="w-16 flex items-center">
                                {entry.rank === 1 ? (
                                    <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center"><Crown size={16} fill="currentColor"/></div>
                                ) : entry.rank === 2 ? (
                                    <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center"><Medal size={16} /></div>
                                ) : entry.rank === 3 ? (
                                    <div className="w-8 h-8 bg-orange-50 text-orange-700 rounded-full flex items-center justify-center"><Medal size={16} /></div>
                                ) : (
                                    <span className="text-slate-400 font-bold ml-2">#{entry.rank}</span>
                                )}
                            </div>

                            <div className="flex-1 flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl ${entry.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                                    {entry.name[0]}
                                </div>
                                <div>
                                    <p className={`font-bold text-sm ${entry.isUser ? 'text-indigo-900' : 'text-slate-700'}`}>
                                        {entry.name} {entry.isUser && '(You)'}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                                        <Zap size={10} className="text-amber-500" /> {entry.streak} Day Streak
                                    </div>
                                </div>
                            </div>

                            <div className="w-24 text-center">
                                <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-500 text-xs font-bold">
                                    Lvl {entry.level}
                                </span>
                            </div>

                            <div className="w-24 text-right font-heading font-bold text-slate-900">
                                {entry.xp.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;