import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Plus,
    Target,
    TrendingUp,
    ChevronRight,
    PieChart as PieChartIcon
} from 'lucide-react';
import { Budget, Category, Transaction } from '../types';
import { cn } from '../lib/utils';

interface BudgetManagerProps {
    budgets: Budget[];
    categories: Category[];
    transactions: Transaction[];
    onAddBudget: (data: any) => void;
}

export default function BudgetManager({ budgets, categories, transactions, onAddBudget }: BudgetManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newBudget, setNewBudget] = useState({
        category_id: '',
        amount: '',
    });

    const getProgress = (categoryId: number, budgetAmount: number) => {
        const spent = transactions
            .filter(t => t.category_id === categoryId && t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
            spent,
            percentage: Math.min((spent / budgetAmount) * 100, 100),
            isOver: spent > budgetAmount
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Bütçe Takibi</h2>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Harcama Hedefleri</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 active:scale-90 transition-all"
                >
                    {isAdding ? <Plus className="rotate-45" /> : <Plus />}
                </button>
            </div>

            {isAdding && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="premium-card p-6 rounded-3xl overflow-hidden"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kategori</label>
                                <select
                                    value={newBudget.category_id}
                                    onChange={e => setNewBudget({ ...newBudget, category_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold appearance-none text-slate-900 dark:text-white"
                                >
                                    <option value="">Seçiniz</option>
                                    {categories.filter(c => c.type === 'expense').map(cat => (
                                        <option key={cat.id} value={cat.id} className="text-slate-900 dark:text-white">{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Limit (₺)</label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={newBudget.amount}
                                    onChange={e => setNewBudget({ ...newBudget, amount: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                onAddBudget(newBudget);
                                setIsAdding(false);
                                setNewBudget({ category_id: '', amount: '' });
                            }}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                        >
                            Hedef Oluştur
                        </button>
                    </div>
                </motion.div>
            )}

            <div className="space-y-4">
                {budgets.length === 0 ? (
                    <div className="p-12 text-center premium-card rounded-3xl opacity-60 grayscale">
                        <Target size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Henüz planlanmış bütçe yok</p>
                    </div>
                ) : (
                    budgets.map(budget => {
                        const stats = getProgress(budget.category_id, budget.amount);
                        return (
                            <div key={budget.id} className="premium-card p-5 rounded-3xl group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                                            style={{ backgroundColor: budget.category_color }}
                                        >
                                            <PieChartIcon size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{budget.category_name}</h4>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aylık Limit: {budget.amount} ₺</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn(
                                            "font-black",
                                            stats.isOver ? "text-rose-500" : "text-emerald-500"
                                        )}>
                                            {stats.spent.toLocaleString('tr-TR')} ₺
                                        </p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harcanan</p>
                                    </div>
                                </div>

                                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.percentage}%` }}
                                        className={cn(
                                            "h-full rounded-full",
                                            stats.isOver ? "bg-rose-500" : "bg-indigo-500"
                                        )}
                                    />
                                </div>

                                <div className="flex justify-between items-center mt-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        %{stats.percentage.toFixed(0)} Tamamlandı
                                    </span>
                                    {stats.isOver && (
                                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                                            <TrendingUp size={12} /> Limit Aşıldı
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </motion.div>
    );
}
