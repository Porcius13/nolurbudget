import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Tag,
    Trash2,
    Calendar,
    Search,
    Filter
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Transaction } from '../types';
import { cn } from '../lib/utils';

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: number) => void;
}

export default function TransactionList({ transactions, onDelete }: TransactionListProps) {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filterType, setFilterType] = React.useState<'all' | 'income' | 'expense'>('all');
    const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
    const [minPrice, setMinPrice] = React.useState<string>('');
    const [maxPrice, setMaxPrice] = React.useState<string>('');

    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.category_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        const matchesMin = !minPrice || t.amount >= parseFloat(minPrice);
        const matchesMax = !maxPrice || t.amount <= parseFloat(maxPrice);
        return matchesSearch && matchesType && matchesMin && matchesMax;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="İşlemlerde ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-background/50 dark:bg-background/5 backdrop-blur-xl border border-border rounded-2xl text-foreground placeholder:text-muted-foreground outline-none transition-all focus:ring-1 focus:ring-primary/50"
                    />
                </div>
                <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={cn(
                        "p-3 bg-background/50 dark:bg-background/5 backdrop-blur-xl border border-border rounded-2xl transition-colors",
                        showAdvancedFilters ? "text-primary border-primary/30" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <Filter size={20} />
                </button>
            </div>

            <AnimatePresence>
                {showAdvancedFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
                            <button
                                onClick={() => setFilterType(prev => prev === 'all' ? 'income' : prev === 'income' ? 'expense' : 'all')}
                                className="h-12 bg-white dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5"
                            >
                                Tür: {filterType === 'all' ? 'Tümü' : filterType === 'income' ? 'Gelir' : 'Gider'}
                            </button>
                            <input
                                type="number"
                                placeholder="Min ₺"
                                value={minPrice}
                                onChange={e => setMinPrice(e.target.value)}
                                className="h-12 bg-white dark:bg-slate-800 rounded-xl px-4 text-[10px] font-black border border-slate-100 dark:border-white/5 outline-none"
                            />
                            <input
                                type="number"
                                placeholder="Max ₺"
                                value={maxPrice}
                                onChange={e => setMaxPrice(e.target.value)}
                                className="h-12 bg-white dark:bg-slate-800 rounded-xl px-4 text-[10px] font-black border border-slate-100 dark:border-white/5 outline-none"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="glass rounded-[2.5rem] overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">İşlem Geçmişi</h3>
                        <p className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase mt-1">Son Aktiviteler</p>
                    </div>
                    <Calendar className="text-indigo-400" size={20} />
                </div>

                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {filteredTransactions.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Tag size={24} />
                            </div>
                            <p className="font-medium text-slate-500 dark:text-white/60">İşlem bulunamadı.</p>
                            <p className="text-sm">Arama kriterlerinizi değiştirmeyi deneyin.</p>
                        </div>
                    ) : (
                        filteredTransactions.map((t, idx) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="p-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between group border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white relative overflow-hidden group-hover:scale-105 transition-transform"
                                        style={{ backgroundColor: `${t.category_color}20` || 'rgba(128,128,128,0.1)' }}
                                    >
                                        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: t.category_color || '#888' }} />
                                        <Tag size={20} strokeWidth={2.5} style={{ color: t.category_color || '#888' }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{t.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-black text-slate-400 dark:text-white/40 uppercase tracking-widest">{t.category_name}</span>
                                            <span className="w-0.5 h-0.5 bg-slate-300 dark:bg-white/20 rounded-full" />
                                            <span className="text-[9px] font-bold text-slate-400 dark:text-white/30 truncate">{format(parseISO(t.date), 'd MMM yyyy', { locale: tr })}</span>
                                            {t.is_ai_generated && (
                                                <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-indigo-500/20 ml-1">AI</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className={cn(
                                        "font-black text-base tracking-tighter privacy-blur",
                                        t.type === 'income' ? "text-emerald-500 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                                    )}>
                                        {t.type === 'income' ? '+' : '-'}{(t.amount || 0).toLocaleString('tr-TR')} <span className="text-xs font-medium opacity-30">₺</span>
                                    </p>
                                    <button
                                        onClick={() => onDelete(t.id)}
                                        className="p-2 text-slate-300 dark:text-white/10 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    );
}
