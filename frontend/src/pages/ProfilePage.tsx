import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }

        try {
            await authApi.changePassword(passwordData.currentPassword, passwordData.newPassword);
            toast.success('Password updated successfully');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setIsChangingPassword(false);
        } catch (error) {
            toast.error('Failed to update password');
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* User Info Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-xl border border-white/20 shadow-sm text-center">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-700 border-4 border-white shadow-lg mb-4">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <h2 className="text-xl font-bold text-slate-800">{user?.name}</h2>
                        <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium border border-primary-100">
                            {user?.role}
                        </span>
                    </div>

                    <div className="glass p-6 rounded-xl border border-white/20 shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Contact Details</h3>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Mail size={18} className="text-slate-400" />
                            <span className="text-sm">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Shield size={18} className="text-slate-400" />
                            <span className="text-sm cursor-help" title="User ID">ID: {user?.id?.slice(0, 8)}...</span>
                        </div>
                    </div>
                </div>

                {/* Settings / Actions */}
                <div className="md:col-span-2">
                    <div className="glass p-6 rounded-xl border border-white/20 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-slate-400" />
                            Security Settings
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                    value={passwordData.currentPassword}
                                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        value={passwordData.newPassword}
                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full px-4 py-2 bg-white/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                                        value={passwordData.confirmPassword}
                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 shadow-sm hover:shadow"
                                >
                                    <Save size={18} />
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
