import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

interface AdminConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AdminConfirmContext = createContext<AdminConfirmContextType | undefined>(undefined);

export const AdminConfirmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [config, setConfig] = useState<ConfirmOptions | null>(null);
    const [resolveRef, setResolveRef] = useState<{ resolve: (value: boolean) => void } | null>(null);

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        setConfig(options);
        return new Promise((resolve) => {
            setResolveRef({ resolve });
        });
    };

    const handleClose = (value: boolean) => {
        if (resolveRef) {
            resolveRef.resolve(value);
        }
        setConfig(null);
        setResolveRef(null);
    };

    return (
        <AdminConfirmContext.Provider value={{ confirm }}>
            {children}
            <AnimatePresence>
                {config && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => handleClose(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-xl ${config.variant === 'danger' ? 'bg-red-500/10 text-red-500' :
                                            config.variant === 'warning' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-blue-500/10 text-blue-500'
                                        }`}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">
                                            {config.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">
                                            {config.message}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleClose(false)}
                                        className="text-gray-500 hover:text-white transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-white/5 border-t border-white/5">
                                <button
                                    onClick={() => handleClose(false)}
                                    className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                                >
                                    {config.cancelText || 'Cancel'}
                                </button>
                                <button
                                    onClick={() => handleClose(true)}
                                    className={`px-6 py-2 rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition-all ${config.variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.3)]' :
                                            config.variant === 'warning' ? 'bg-yellow-500 text-black hover:bg-yellow-600' :
                                                'bg-white text-black hover:bg-gray-200'
                                        }`}
                                >
                                    {config.confirmText || 'Confirm'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(AdminConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within an AdminConfirmProvider');
    }
    return context.confirm;
};
