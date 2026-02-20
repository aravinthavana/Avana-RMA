import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../src/context/AuthContext';
import { WrenchScrewdriverIcon, BuildingOffice2Icon, XMarkIcon, ChevronRightIcon, HomeIcon } from './icons';
import { NotificationBell } from './NotificationBell';

interface SidebarLayoutProps {
    children: React.ReactNode;
    activeView: 'dashboard' | 'rma' | 'customer' | 'users' | 'logs' | 'profile';
    onNavigate: (view: 'rma' | 'customer' | 'users' | 'dashboard' | 'logs' | 'profile') => void;
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
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { id: 'home' as const, label: 'Dashboard', icon: HomeIcon, callback: onGoHome },
        { id: 'rma' as const, label: 'RMAs', icon: WrenchScrewdriverIcon, callback: () => onNavigate('rma') },
        { id: 'customer' as const, label: 'Customers', icon: BuildingOffice2Icon, callback: () => onNavigate('customer') },
        ...(user?.role === 'ADMIN' ? [
            { id: 'users' as const, label: 'Users', icon: BuildingOffice2Icon, callback: () => onNavigate('users') },
            { id: 'logs' as const, label: 'System Logs', icon: WrenchScrewdriverIcon, callback: () => window.location.href = '/system-logs' }
        ] : []),
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
                        className="fixed inset-y-0 left-0 z-50 w-72 bg-white/90 backdrop-blur-xl shadow-2xl p-6 lg:hidden flex flex-col"
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

                        <div className="mt-auto pt-6 border-t border-slate-200/50">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-primary-700 border border-primary-200">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => {
                                        onNavigate('profile');
                                        setIsMobileMenuOpen(false);
                                    }}
                                >
                                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name || 'User'}</p>
                                    <p className="text-xs text-slate-500 truncate">{user?.role || 'Admin'}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Sign out"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.div
                layout
                initial={false}
                animate={{ width: isCollapsed ? 80 : 288 }}
                className="hidden lg:flex flex-col fixed inset-y-0 border-r border-slate-200/60 bg-white/70 backdrop-blur-md z-30 transition-all duration-300 ease-in-out"
            >
                <div className={`flex items-center h-20 px-6 border-b border-slate-200/50 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="relative h-8 w-8 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-indigo-500 rounded-lg blur opacity-70"></div>
                        <img src="https://avanamedical.com/wp-content/themes/avana/assets/images/logo.png" alt="Logo" className="relative h-full w-full object-contain" />
                    </div>
                    {!isCollapsed && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-display font-bold text-xl text-slate-900 tracking-tight whitespace-nowrap overflow-hidden"
                        >
                            Avana RMA
                        </motion.span>
                    )}
                </div>

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-24 bg-white border border-slate-200 shadow-sm rounded-full p-1 text-slate-400 hover:text-slate-600 transition-colors z-40 hidden lg:flex"
                >
                    {isCollapsed ? <ChevronRightIcon className="w-4 h-4" /> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>}
                </button>

                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => item.callback?.()}
                            title={isCollapsed ? item.label : undefined}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all group max-w-full ${(activeView === item.id || (item.id === 'home' && !activeView))
                                ? 'bg-gradient-to-r from-primary-50 to-indigo-50 text-primary-700 ring-1 ring-primary-500/10 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${(activeView === item.id || (item.id === 'home' && !activeView)) ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                            {!isCollapsed && (
                                <motion.span
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "auto" }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="whitespace-nowrap overflow-hidden"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            {!isCollapsed && (activeView === item.id || (item.id === 'home' && !activeView)) && (
                                <motion.div layoutId="active-nav" className="ml-auto w-1 h-1 rounded-full bg-primary-500 flex-shrink-0" />
                            )}
                        </button>
                    ))}
                </nav>
            </motion.div>

            {/* Main Content Area */}
            <motion.div
                layout
                className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
                style={{ marginLeft: isCollapsed ? '80px' : '288px' }} // 80px = w-20, 288px = w-72. Using style for smoother integration with motion if needed, but class logic works too if responsive.
            >
                {/* Mobile Header */}
                <div className="sticky top-0 z-20 flex items-center gap-x-6 bg-white/80 backdrop-blur-md px-4 py-4 shadow-sm sm:px-6 lg:hidden border-b border-slate-200/60 w-full">
                    <button type="button" className="-m-2.5 p-2.5 text-slate-700 hover:text-slate-900" onClick={() => setIsMobileMenuOpen(true)}>
                        <span className="sr-only">Open sidebar</span>
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                    <div className="flex-1 text-sm font-semibold leading-6 text-slate-900 font-display">Avana RMA</div>
                    {user?.role === 'ADMIN' && <NotificationBell />}
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-end gap-x-6 bg-white/50 backdrop-blur-md px-8 py-4 shadow-sm border-b border-slate-200/60 sticky top-0 z-20 w-full">
                    <div className="flex items-center gap-4">
                        {user?.role === 'ADMIN' && <NotificationBell />}
                        <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

                        {/* Interactive Profile Section */}
                        <div
                            className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100/50 transition-colors cursor-pointer group"
                            onClick={() => onNavigate('profile')}
                        >
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">{user?.name}</span>
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center text-xs font-bold text-primary-700 border border-primary-200 group-hover:border-primary-300 transition-colors">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>

                        {/* Logout Button in Header */}
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            title="Sign out"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                            </svg>
                        </button>
                    </div>
                </div>

                <main className="flex-1 py-8 w-full max-w-[100vw] overflow-x-hidden">
                    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </motion.div>
        </div>
    );
};
