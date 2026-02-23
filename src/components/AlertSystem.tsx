import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Info, Sparkles, X } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AlertSystem() {
    const [alerts, setAlerts] = useState([
        { id: 1, type: 'warning', title: 'Hızlı Harcama', message: 'Kahve harcamaların bu hafta bütçenin %40\u0027ına ulaştı.', time: '10dk önce' },
        { id: 2, type: 'ai', title: 'Akıllı Tavsiye', message: 'Netflix aboneliğini artık kullanmıyor olabilir misin? İptal ederek yılda 2.400 ₺ tasarruf edebilirsin.', time: '1sa önce' },
    ]);

    const removeAlert = (id: number) => {
        setAlerts(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
                <Bell size={14} /> Bildirimler
            </h2>

            <div className="space-y-3">
                <AnimatePresence>
                    {alerts.map((alert) => (
                        <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={cn(
                                "p-5 rounded-3xl border flex gap-4 relative group transition-all",
                                alert.type === 'warning'
                                    ? "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
                                    : "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                alert.type === 'warning' ? "bg-rose-500 text-white" : "bg-indigo-600 text-white"
                            )}>
                                {alert.type === 'warning' ? <AlertTriangle size={18} /> : <Sparkles size={18} />}
                            </div>

                            <div className="flex-1 pr-4">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">{alert.title}</h3>
                                    <span className="text-[8px] font-bold text-slate-400">{alert.time}</span>
                                </div>
                                <p className="text-[11px] font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                                    {alert.message}
                                </p>
                            </div>

                            <button
                                onClick={() => removeAlert(alert.id)}
                                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
                            >
                                <X size={14} className="text-slate-400" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {alerts.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-xs font-bold text-slate-400">Harikasın! Şu an için kritik bir bildirim yok. ✨</p>
                    </div>
                )}
            </div>
        </div>
    );
}
