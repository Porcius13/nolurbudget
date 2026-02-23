import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck,
    FileText,
    Upload,
    AlertCircle,
    Calendar,
    ChevronRight,
    Search,
    Plus,
    X,
    Folder
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DocumentSafe() {
    const [isAdding, setIsAdding] = React.useState(false);
    const [docs, setDocs] = React.useState([
        { id: 1, name: "Kira Kontratı 2024", expiry: "2025-06-01", type: "contract", alert: "14 gün kaldı" },
        { id: 2, name: "Araç Sigortası", expiry: "2024-12-15", type: "insurance", alert: null },
        { id: 3, name: "Sağlık Poliçesi", expiry: "2025-03-20", type: "insurance", alert: null },
    ]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-12"
        >
            {/* Header */}
            <div className="premium-gradient-primary p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">AI Belge Kasası</h2>
                            <p className="text-xs font-medium opacity-80 uppercase tracking-widest">Güvenli Arşiv & Takip</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium leading-relaxed opacity-90 max-w-[280px]">
                        Kontratlar, poliçeler ve önemli belgeleriniz AI tarafından takip ediliyor. Expiry yaklaştığında sizi uyarırız.
                    </p>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
                    <FileText size={180} />
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group"
                >
                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">YENİ BELGE EKLE</span>
                </button>
                <button className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all group">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Folder size={22} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">KLASÖRLERİM</span>
                </button>
            </div>

            {/* Document List */}
            <div className="premium-card rounded-[2rem] overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h3 className="text-lg font-black">Aktif Belgeler</h3>
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <Search size={14} />
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-slate-50 dark:divide-slate-800">
                    {docs.map((doc) => (
                        <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                                    doc.alert ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30" : "bg-slate-50 text-slate-400 dark:bg-slate-800"
                                )}>
                                    <FileText size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{doc.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Calendar size={12} className="text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{new Date(doc.expiry).toLocaleDateString()}</span>
                                        {doc.alert && (
                                            <>
                                                <span className="w-1 h-1 bg-rose-300 rounded-full" />
                                                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">{doc.alert}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Warning */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 leading-relaxed">
                    AI Belge Kasası, belgelerinizin şifreli kopyalarını saklar. Expiry tarihlerini otomatik takip eder ve size bildirim gönderir.
                </p>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4 sm:items-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAdding(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 dark:border-white/10"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Belge Yükle</h3>
                                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center gap-4 text-slate-400">
                                    <Upload size={40} />
                                    <p className="text-xs font-bold uppercase tracking-widest">Belgeyi buraya sürükleyin</p>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Belge Adı"
                                    className="w-full h-14 px-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border-none font-bold text-slate-900 dark:text-white"
                                />
                                <button
                                    onClick={() => {
                                        setDocs([...docs, { id: Date.now(), name: "Yeni Belge", expiry: "2025-01-01", type: "other", alert: null }]);
                                        setIsAdding(false);
                                    }}
                                    className="w-full h-16 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 mt-4"
                                >
                                    Kaydet ve Şifrele
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
