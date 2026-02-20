import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiClient.post('/api/auth/forgot-password', { email });
            setIsSubmitted(true);
            toast.success('Reset link sent!');
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('Failed to process request.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-md p-8 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 relative z-10"
            >
                <button
                    onClick={() => navigate('/login')}
                    className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Reset Password</h2>
                    <p className="text-slate-500 mt-2 text-sm">
                        {isSubmitted
                            ? "Check your email (or server console) for the reset link."
                            : "Enter your email to receive a reset link."}
                    </p>
                </div>

                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
                                placeholder="name@company.com"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Link'}
                        </motion.button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6">
                            email sent to <strong>{email}</strong>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
                        >
                            Return to Login
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
