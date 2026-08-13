import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { adminApi } from '../api/admin.api';
import { Navigate } from 'react-router-dom';

const DatabaseManagerPage: React.FC = () => {
    const { user } = useAuth();
    const [isBackingUp, setIsBackingUp] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ensure only admins can access this page
    if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'ADMIN')) {
        return <Navigate to="/" replace />;
    }

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            await adminApi.downloadDatabaseBackup();
            toast.success('Database backup downloaded successfully');
        } catch (error) {
            toast.error('Failed to download database backup');
            console.error(error);
        } finally {
            setIsBackingUp(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (!file.name.endsWith('.sql')) {
                toast.error('Please select a valid .sql backup file');
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleRestore = async () => {
        if (!selectedFile) {
            toast.error('Please select a file to restore');
            return;
        }

        if (confirmText !== 'RESTORE') {
            toast.error('Please type RESTORE to confirm');
            return;
        }

        setIsRestoring(true);
        try {
            await adminApi.restoreDatabaseBackup(selectedFile);
            toast.success('Database restored successfully! Reloading...');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error: any) {
            toast.error(error.message || 'Failed to restore database');
            console.error(error);
        } finally {
            setIsRestoring(false);
            setConfirmText('');
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Database Manager</h1>
                <p className="text-sm sm:text-base text-slate-600">Export backups or restore the system from a previous state.</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col h-full"
                >
                    <div className="flex-1">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Backup Database</h2>
                        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                            Download a full PostgreSQL dump of the current system. This includes all RMAs, Customers, Service Cycles, and System Logs.
                        </p>
                    </div>
                    <button
                        onClick={handleBackup}
                        disabled={isBackingUp}
                        className={`w-full py-3 px-4 rounded-xl font-medium text-white shadow-sm flex items-center justify-center gap-2 transition-all ${isBackingUp ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                            }`}
                    >
                        {isBackingUp ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Exporting...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Download Backup
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Restore Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 sm:p-8 flex flex-col h-full"
                >
                    <div className="flex-1">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mb-6">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Restore Database</h2>
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-6">
                            <p className="text-red-800 text-sm font-medium flex items-start gap-2">
                                <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                DANGER: This will permanently overwrite all current system data. This action cannot be undone.
                            </p>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Backup File (.sql)</label>
                                <input
                                    type="file"
                                    accept=".sql"
                                    onChange={handleFileChange}
                                    ref={fileInputRef}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 border border-slate-200 rounded-lg"
                                />
                            </div>

                            {selectedFile && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Type <span className="font-bold text-red-600">RESTORE</span> to confirm
                                    </label>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder="RESTORE"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <button
                        onClick={handleRestore}
                        disabled={!selectedFile || confirmText !== 'RESTORE' || isRestoring}
                        className={`w-full py-3 px-4 rounded-xl font-medium text-white shadow-sm flex items-center justify-center gap-2 transition-all ${
                            !selectedFile || confirmText !== 'RESTORE' || isRestoring
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 hover:shadow-md'
                        }`}
                    >
                        {isRestoring ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Restoring System...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Execute Restore
                            </>
                        )}
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default DatabaseManagerPage;
