import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { WrenchScrewdriverIcon, ChevronRightIcon } from './icons';

const MainDashboard: React.FC = () => {
    const navigate = useNavigate();

    const modules = [
        {
            id: 'rma',
            title: 'RMA Management',
            description: 'Manage Return Merchandise Authorizations, track repair cycles, and view repair history.',
            icon: WrenchScrewdriverIcon,
            path: '/rma-dashboard',
            color: 'bg-primary-500',
            textColor: 'text-primary-600',
            bgLight: 'bg-primary-50',
            borderColor: 'border-primary-100'
        }
        // Future modules can be added here
    ];

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Avana Service Portal</h1>
                <p className="text-sm sm:text-base text-slate-600">Select a service module below to get started.</p>
            </motion.div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {modules.map((mod, index) => (
                    <motion.div
                        key={mod.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        onClick={() => navigate(mod.path)}
                        className={`group relative ${mod.bgLight} rounded-2xl p-6 shadow-sm border ${mod.borderColor} hover:shadow-md transition-all cursor-pointer overflow-hidden`}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${mod.color} opacity-5 group-hover:scale-150 transition-transform duration-500`}></div>

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`p-3 rounded-xl ${mod.color} shadow-sm`}>
                                    <mod.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className={`text-xl font-bold ${mod.textColor}`}>{mod.title}</h3>
                            </div>
                            
                            <p className="text-slate-600 text-sm flex-grow mb-6 leading-relaxed">
                                {mod.description}
                            </p>
                            
                            <div className={`flex items-center text-sm font-semibold ${mod.textColor} group-hover:gap-2 transition-all`}>
                                Open Module 
                                <ChevronRightIcon className="w-4 h-4 ml-1" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MainDashboard;
