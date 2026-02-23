import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    PieChart as PieChartIcon,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { SummaryCard } from './UI';
import { Transaction, Category, Summary } from '../types';
import { getFinancialInsights } from '../services/insightsService';
import { Sparkles, Loader2 } from 'lucide-react';

interface DashboardProps {
    summary: Summary;
    transactions: Transaction[];
    categories: Category[];
}

export default function Dashboard({ summary, transactions, categories }: DashboardProps) {
    const [insight, setInsight] = React.useState<string | null>(null);
    const [isLoadingInsight, setIsLoadingInsight] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

    const categoryTransactions = transactions.filter(t =>
        selectedCategory && t.category_name === selectedCategory
    );

    React.useEffect(() => {
        const fetchInsight = async () => {
            setIsLoadingInsight(true);
            const text = await getFinancialInsights(transactions, summary);
            setInsight(text);
            setIsLoadingInsight(false);
        };
        fetchInsight();
    }, [transactions, summary]);

    const chartData = [
        { name: 'Gelir', value: summary.total_income, color: '#10b981' },
        { name: 'Gider', value: summary.total_expense, color: '#ef4444' }
    ];

    const categoryData = categories
        .filter(c => c.type === 'expense')
        .map(cat => {
            const total = transactions
                .filter(t => t.category_id === cat.id)
                .reduce((sum, t) => sum + t.amount, 0);
            return { name: cat.name, value: total, color: cat.color };
        })
        .filter(d => d.value > 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            {/* AI Insight Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-6 rounded-[2.5rem] overflow-hidden relative"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={16} className="text-indigo-600 dark:text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-white/60">AI Finansal Koç</span>
                    </div>
                    {isLoadingInsight ? (
                        <div className="flex items-center gap-3">
                            <Loader2 size={18} className="animate-spin text-slate-400 dark:text-white/40" />
                            <p className="text-xs font-bold text-slate-400 dark:text-white/40 uppercase tracking-widest">Harcamaların analiz ediliyor...</p>
                        </div>
                    ) : (
                        <p className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white privacy-blur">
                            "{insight}"
                        </p>
                    )}
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4">
                <SummaryCard
                    title="Toplam Bakiye"
                    amount={summary.total_income - summary.total_expense}
                    icon={<Wallet className="text-white" />}
                    trend={summary.total_income > summary.total_expense ? 'up' : 'down'}
                    color="indigo"
                />
                <div className="grid grid-cols-2 gap-4">
                    <SummaryCard
                        title="Aylık Gelir"
                        amount={summary.total_income}
                        icon={<TrendingUp />}
                        color="emerald"
                    />
                    <SummaryCard
                        title="Aylık Gider"
                        amount={summary.total_expense}
                        icon={<TrendingDown />}
                        color="rose"
                    />
                </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
                <div className="glass p-6 rounded-[2.5rem]">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Gelir vs Gider</h3>
                            <p className="text-[10px] text-slate-400 dark:text-white/40 font-bold uppercase mt-1">Aylık Karşılaştırma</p>
                        </div>
                        <PieChartIcon className="text-indigo-600 dark:text-indigo-400" size={20} />
                    </div>
                    <div className="h-[240px] privacy-blur">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10, fontWeight: 900 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'currentColor', opacity: 0.4, fontSize: 10 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'var(--border)', opacity: 0.1 }}
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: '1px solid var(--glass-border)',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        backgroundColor: 'var(--glass-bg)',
                                        backdropFilter: 'blur(12px)',
                                        borderColor: 'var(--glass-border)'
                                    }}
                                />
                                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-card p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Kategori Dağılımı</h3>
                    <div className="h-[240px] flex items-center justify-center privacy-blur">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    onClick={(data) => setSelectedCategory(data.name)}
                                    className="cursor-pointer outline-none"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: 'none',
                                        borderRadius: '16px',
                                        color: '#fff',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <AnimatePresence>
                        {selectedCategory && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5"
                            >
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                                        {selectedCategory} Detayları
                                    </h4>
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className="text-[10px] font-black uppercase text-slate-400"
                                    >
                                        Kapat
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {categoryTransactions.map(t => (
                                        <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                            <span className="text-xs font-bold text-slate-900 dark:text-white">{t.description}</span>
                                            <span className="text-xs font-black">{t.amount.toLocaleString('tr-TR')} ₺</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-2 gap-y-3 mt-6">
                        {categoryData.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{cat.name}</span>
                                <span className="text-xs font-bold text-slate-400 ml-auto">{((cat.value / summary.total_expense) * 100).toFixed(0)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
