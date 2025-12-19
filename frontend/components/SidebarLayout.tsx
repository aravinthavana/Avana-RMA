import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/context/AuthContext';
import { WrenchScrewdriverIcon, BuildingOffice2Icon, XMarkIcon, ChevronRightIcon, HomeIcon } from './icons';

interface SidebarLayoutProps {
    children: React.ReactNode;
    activeView: 'dashboard' | 'rma' | 'customer';
    onNavigate: (view: 'rma' | 'customer') => void;
    onGoHome?: () => void;
}

const Bars3Icon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children, activeView, onNavigate, onGoHome }) => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'home' as const, label: 'Dashboard', icon: HomeIcon, callback: onGoHome },
        { id: 'rma' as const, label: 'RMAs', icon: WrenchScrewdriverIcon, callback: () => onNavigate('rma') },
        { id: 'customer' as const, label: 'Customers', icon: BuildingOffice2Icon, callback: () => onNavigate('customer') },
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex text-slate-900 font-sans">
            {/* Mobile Menu Backdrop */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl shadow-2xl p-6 lg:hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="relative h-8 w-8">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-lg blur opacity-70"></div>
                                    <img src="https://avanamedical.com/wp-content/themes/avana/assets/images/logo.png" alt="Logo" className="relative h-full w-full object-contain" />
                                </div>
                                <span className="font-display font-bold text-xl text-slate-900">Avana RMA</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        item.callback?.();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${(activeView === item.id || (item.id === 'home' && !activeView))
                                        ? 'bg-primary-50/80 text-primary-700 ring-1 ring-primary-500/10 shadow-sm'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <item.icon className={`w-5 h-5 ${(activeView === item.id || (item.id === 'home' && !activeView)) ? 'text-primary-600' : 'text-slate-400'}`} />
                                    {item.label}
                                    {(activeView === item.id || (item.id === 'home' && !activeView)) && <ChevronRightIcon className="ml-auto w-4 h-4 text-primary-400" />}
                                </button>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200/60 bg-white/70 backdrop-blur-md z-30">
                <div className="flex items-center gap-3 h-20 px-6 border-b border-slate-200/50">
                    <div className="relative h-8 w-8">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-lg blur opacity-70"></div>
                        <img src="https://avanamedical.com/wp-content/themes/avana/assets/images/logo.png" alt="Logo" className="relative h-full w-full object-contain" />
                    </div>
                    <span className="font-display font-bold text-xl text-slate-900 tracking-tight">Avana RMA</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => item.callback?.()}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all group ${(activeView === item.id || (item.id === 'home' && !activeView))
                                ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 ring-1 ring-primary-500/10 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${(activeView === item.id || (item.id === 'home' && !activeView)) ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                            {item.label}
                            {(activeView === item.id || (item.id === 'home' && !activeView)) && (
                                <motion.div layoutId="active-nav" className="ml-auto w-1 h-1 rounded-full bg-primary-500" />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-primary-700 border border-primary-200">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role || 'Admin'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Sign out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:pl-72 flex flex-col flex-1">
                {/* Mobile Header */}
                <div className="sticky top-0 z-20 flex items-center gap-x-6 bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-slate-200/60">
                    <button type="button" className="-m-2.5 p-2.5 text-slate-700 hover:text-slate-900" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 text-sm font-semibold leading-6 text-slate-900 font-display">Avana RMA</div>
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">EA</div>
                </div>

                <main className="flex-1 py-8">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
