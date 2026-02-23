import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award } from 'lucide-react';
import { UserStats } from '../types';
import { cn } from '../lib/utils';

export default function Achievements() {
    const [stats, setStats] = useState<UserStats>({ level: 1, exp: 0, streak: 0 });

    const fetchStats = async () => {
        const res = await fetch('/api/user-stats');
        const data = await res.json();
        setStats(data);
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const expToNextLevel = stats.level * 1000;
    const progress = (stats.exp / expToNextLevel) * 100;

    return (
        <div className="space-y-6">
            <div className="premium-card p-8 rounded-[3rem] bg-indigo-600 text-white relative overflow-hidden shadow-2xl shadow-indigo-600/40">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-4 -translate-y-4">
                    <Trophy size={120} strokeWidth={1} />
                </div>

                <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Mevcut Seviye</p>
                    <h2 className="text-6xl font-black mb-6">Lvl {stats.level}</h2>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                            <span>{stats.exp} XP</span>
                            <span>{expToNextLevel} XP</span>
                        </div>
                        <div className="h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl flex-1">
                            <p className="text-[10px] font-black uppercase opacity-60">Seri</p>
                            <p className="text-xl font-black">{stats.streak} GÜN</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl flex-1">
                            <p className="text-[10px] font-black uppercase opacity-60">Rozetler</p>
                            <p className="text-xl font-black">4</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {[
                    { name: 'Erken Kuş', icon: <Zap size={20} />, desc: '7 gün üst üste giriş yap.', unlocked: true },
                    { name: 'Tasarruf Ustası', icon: <Target size={20} />, desc: 'Bütçenin %20 altında kal.', unlocked: false },
                    { name: 'Yatırımcı', icon: <TrendingUp size={20} />, desc: 'İlk hedefine ulaş.', unlocked: false },
                    { name: 'Asistan Dostu', icon: <Star size={20} />, desc: 'Chat ile 10 soru sor.', unlocked: true },
                ].map((badge, i) => (
                    <div
                        key={i}
                        className={cn(
                            "premium-card p-5 rounded-3xl space-y-3 transition-all",
                            badge.unlocked ? "opacity-100" : "opacity-40 grayscale"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            badge.unlocked ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}>
                            {badge.icon}
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">{badge.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight mt-1">{badge.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { TrendingUp } from 'lucide-react';
