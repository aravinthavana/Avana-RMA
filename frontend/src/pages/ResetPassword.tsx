import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState<{ email: string; name: string } | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!token) {
            toast.error('Invalid token');
            return;
        }

        setIsLoading(true);
        try {
            const { data, error } = await apiClient.post<{ email: string; name: string }>('/api/auth/reset-password', { token, newPassword: password });

            if (error) {
                toast.error(error);
            } else if (data) {
                setSuccessData(data);
                toast.success('Password reset successfully!');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('Failed to reset password. Link may be expired.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEmail = () => {
        if (!successData) return;

        const subject = 'Your Password Has Been Reset - Avana RMA';
        const body = `Hello ${successData.name},\n\nYour password for the Avana RMA system has been successfully reset by the administrator.\n\nYour new password is: ${password}\n\nPlease login and change it immediately for security purposes.\n\nLogin URL: ${window.location.origin}/login\n\nBest regards,\nAvana Administration`;

        window.location.href = `mailto:${successData.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-xl text-red-600 font-bold mb-2">Invalid Link</h2>
                    <p className="text-slate-600 mb-4">This password reset link is invalid or missing a token.</p>
                    <button onClick={() => navigate('/login')} className="text-primary-600 hover:underline">Go to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 relative z-10"
            >
                {successData ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 font-display mb-2">Password Reset!</h2>
                        <p className="text-slate-600 mb-6">You have successfully reset the password for <br /><span className="font-semibold text-slate-800">{successData.email}</span></p>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-left">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">New Password</p>
                            <p className="font-mono text-lg text-slate-900 select-all">{password}</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleOpenEmail}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send via Email
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all"
                            >
                                Return to Login
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 font-display">Set New Password</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">New Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </motion.button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
