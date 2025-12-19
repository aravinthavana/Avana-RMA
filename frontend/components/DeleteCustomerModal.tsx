import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from './icons';

interface DeleteCustomerModalProps {
    isOpen: boolean;
    customerName: string;
    rmaCount: number;
    onCancel: () => void;
    onDeleteCustomerOnly: () => void;
    onDeleteCustomerAndRmas: () => void;
}

/**
 * Custom modal for deleting customers with choice to keep or delete RMAs
 */
export const DeleteCustomerModal: React.FC<DeleteCustomerModalProps> = ({
    isOpen,
    customerName,
    rmaCount,
    onCancel,
    onDeleteCustomerOnly,
    onDeleteCustomerAndRmas,
}) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={onCancel}
                    />

                    {/* Modal */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                            </div>

                            {/* Content */}
                            <div className="mt-4 text-center">
                                <h3 className="text-xl font-bold text-slate-900 font-display">
                                    Delete Customer?
                                </h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    You are about to delete <span className="font-semibold text-slate-900">{customerName}</span>.
                                </p>
                                {rmaCount > 0 && (
                                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-800">
                                            This customer has <span className="font-bold">{rmaCount} RMA{rmaCount > 1 ? 's' : ''}</span> associated with it.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="mt-6 space-y-3">
                                {rmaCount > 0 && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onDeleteCustomerOnly}
                                        className="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg font-semibold text-sm shadow-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all"
                                    >
                                        Delete Customer Only
                                    </motion.button>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onDeleteCustomerAndRmas}
                                    className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all"
                                >
                                    Delete Customer {rmaCount > 0 && '+ RMAs'}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    className="w-full px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all"
                                >
                                    Cancel
                                </motion.button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};
