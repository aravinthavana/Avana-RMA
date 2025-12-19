import React from 'react';
import { Rma, Customer, RmaStatus } from '../types';
import { motion } from 'framer-motion';
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, ChartBarIcon } from './icons';

interface DashboardProps {
    rmas: Rma[];
    customers: Customer[];
    onNavigateToRmas: () => void;
    onNavigateToCustomers: () => void;
    onNewRma: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ rmas, customers, onNavigateToRmas, onNavigateToCustomers, onNewRma }) => {
    // Calculate statistics
    const totalRmas = rmas.length;
    const pendingRmas = rmas.filter(r => r.serviceCycles?.some(c => c.status === RmaStatus.PENDING)).length;
    const inRepairRmas = rmas.filter(r => r.serviceCycles?.some(c => c.status === RmaStatus.IN_REPAIR)).length;
    const completedRmas = rmas.filter(r => r.serviceCycles?.every(c => c.status === RmaStatus.CLOSED || c.status === RmaStatus.SHIPPED)).length;
    const totalCustomers = customers.length;

    // Get recent RMAs (last 5)
    const recentRmas = [...rmas].sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()).slice(0, 5);

    const stats = [
        { label: 'Total RMAs', value: totalRmas, icon: ChartBarIcon, color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-50' },
        { label: 'Pending', value: pendingRmas, icon: ClockIcon, color: 'bg-yellow-500', textColor: 'text-yellow-600', bgLight: 'bg-yellow-50' },
        { label: 'In Repair', value: inRepairRmas, icon: ExclamationTriangleIcon, color: 'bg-orange-500', textColor: 'text-orange-600', bgLight: 'bg-orange-50' },
        { label: 'Completed', value: completedRmas, icon: CheckCircleIcon, color: 'bg-green-500', textColor: 'text-green-600', bgLight: 'bg-green-50' },
    ];

    const quickActions = [
        { label: 'New RMA', onClick: onNewRma, color: 'bg-primary-600 hover:bg-primary-700', icon: '📝' },
        { label: 'View All RMAs', onClick: onNavigateToRmas, color: 'bg-slate-600 hover:bg-slate-700', icon: '📋' },
        { label: 'Manage Customers', onClick: onNavigateToCustomers, color: 'bg-indigo-600 hover:bg-indigo-700', icon: '👥' },
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">RMA Management Dashboard</h1>
                <p className="text-sm sm:text-base text-slate-600">Welcome back! Here's your overview of the RMA system.</p>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`${stat.bgLight} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow`}
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-slate-600 truncate">{stat.label}</p>
                                <p className={`text-2xl sm:text-3xl font-bold ${stat.textColor} mt-1 sm:mt-2`}>{stat.value}</p>
                            </div>
                            <div className={`${stat.color} p-2 sm:p-3 rounded-lg sm:rounded-xl self-start`}>
                                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200"
            >
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={action.label}
                            onClick={action.onClick}
                            className={`${action.color} text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2`}
                        >
                            <span className="text-xl sm:text-2xl">{action.icon}</span>
                            <span className="truncate">{action.label}</span>
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Recent RMAs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200"
            >
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Recent RMAs</h2>
                    <button onClick={onNavigateToRmas} className="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium">
                        View All →
                    </button>
                </div>

                {recentRmas.length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                        {recentRmas.map((rma, index) => {
                            const latestStatus = rma.serviceCycles?.[rma.serviceCycles.length - 1]?.status || RmaStatus.PENDING;
                            const statusColors = {
                                [RmaStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
                                [RmaStatus.RECEIVED]: 'bg-blue-100 text-blue-800',
                                [RmaStatus.IN_REPAIR]: 'bg-orange-100 text-orange-800',
                                [RmaStatus.REPAIRED]: 'bg-green-100 text-green-800',
                                [RmaStatus.SHIPPED]: 'bg-purple-100 text-purple-800',
                                [RmaStatus.CLOSED]: 'bg-gray-100 text-gray-800',
                            };

                            return (
                                <div
                                    key={rma.id || `rma-${index}`}
                                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                                    onClick={onNavigateToRmas}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">RMA #{rma.id}</p>
                                        <p className="text-xs sm:text-sm text-slate-600 truncate">{rma.customer?.name || 'Unknown Customer'}</p>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4 self-start sm:self-auto">
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[latestStatus]}`}>
                                            {latestStatus}
                                        </span>
                                        <span className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(rma.creationDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 sm:py-12">
                        <p className="text-sm sm:text-base text-slate-500 mb-3 sm:mb-4">No RMAs yet</p>
                        <button
                            onClick={onNewRma}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm sm:text-base bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Create Your First RMA
                        </button>
                    </div>
                )}
            </motion.div>

            {/* Customer Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg text-white"
            >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-bold mb-1">{totalCustomers} Active Customers</h2>
                        <p className="text-sm sm:text-base text-indigo-100">Manage your customer relationships</p>
                    </div>
                    <button
                        onClick={onNavigateToCustomers}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-white text-indigo-600 rounded-lg sm:rounded-xl font-medium hover:bg-indigo-50 transition-colors self-start sm:self-auto whitespace-nowrap"
                    >
                        View Customers
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
