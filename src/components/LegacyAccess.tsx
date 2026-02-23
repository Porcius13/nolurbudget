import * as React from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Shield,
    Heart,
    Lock,
    UserPlus,
    Mail,
    ChevronRight,
    Smartphone,
    Database,
    Bell
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function LegacyAccess() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-12"
        >
            {/* Legend Header */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                            <Heart size={24} className="text-rose-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">Dijital Miras</h2>
                            <p className="text-xs font-medium opacity-60 uppercase tracking-widest">Legacy Access</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-80 max-w-[300px]">
                        Sİze bir şey olması durumunda, finansal verilerinizin ve dijital varlıklarınızın kontrolünü kime devretmek istersiniz?
                    </p>
                </div>
                <div className="absolute right-[-20px] top-[-20px] opacity-10">
                    <Shield size={180} />
                </div>
            </div>

            {/* Config Section */}
            <div className="space-y-4">
                <div className="premium-card p-6 rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 dark:text-white">Vasi Belirle</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Henüz atanmadı</p>
                        </div>
                    </div>
                    <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <UserPlus size={18} />
                    </button>
                </div>

                <div className="premium-card p-6 rounded-3xl">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Erişim Yetkileri</h3>
                        <Lock size={16} className="text-slate-400" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Bakiye Bilgileri", icon: <Database />, active: true },
                            { label: "Harcama Geçmişi", icon: <Smartphone />, active: true },
                            { label: "Belge Kasası", icon: <Shield />, active: false },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-400">{React.cloneElement(item.icon as any, { size: 16 })}</div>
                                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                                </div>
                                <div className={cn(
                                    "w-10 h-5 rounded-full transition-all relative cursor-pointer",
                                    item.active ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                        item.active ? "right-1" : "left-1"
                                    )} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card p-6 rounded-3xl border-rose-100 dark:border-rose-900/30">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell size={18} className="text-rose-500" />
                        <h3 className="text-sm font-black uppercase tracking-widest text-rose-500">İnaktivite Süresi</h3>
                    </div>
                    <select className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-slate-600 dark:text-slate-400 outline-none focus:ring-2 focus:ring-rose-500/20 appearance-none">
                        <option value="3">3 Ay Hareketsizlik</option>
                        <option value="6">6 Ay Hareketsizlik</option>
                        <option value="12">1 Yıl Hareketsizlik</option>
                    </select>
                </div>
            </div>

            <button className="w-full py-5 premium-gradient-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl transition-all active:scale-[0.98]">
                MIRAS AYARLARINI KAYDET
            </button>
        </motion.div>
    );
}
