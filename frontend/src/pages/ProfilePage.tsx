import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Mail, Shield, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth.api';
import { API_BASE_URL } from '../../config';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [uploadingSignature, setUploadingSignature] = useState(false);

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

    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        try {
            setUploadingSignature(true);
            const response = await authApi.uploadSignature(file);
            toast.success('Signature uploaded successfully');
            // Update local user context if possible, or trigger a refresh
            // For now, we rely on the backend to serve the image correctly when fetched next time
            // We can optionally refresh the page to reload the user context
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            toast.error('Failed to upload signature');
            console.error(error);
        } finally {
            setUploadingSignature(false);
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
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center text-3xl font-bold text-primary-700 border-4 border-white shadow-lg mb-4 overflow-hidden">
                            {user?.profilePictureUrl ? (
                                <img src={`${API_BASE_URL}${user.profilePictureUrl}`} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            )}
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

                        {/* Signature Preview */}
                        <div className="glass p-6 rounded-xl border border-white/20 shadow-sm space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">Digital Signature</h3>
                            {user?.signatureUrl ? (
                                <div className="bg-white p-4 rounded border border-slate-200">
                                    <img 
                                        src={`${API_BASE_URL}${user.signatureUrl}`} 
                                        alt="My Signature" 
                                        className="max-h-20 object-contain mx-auto mix-blend-multiply" 
                                        onError={(e) => {
                                            // Fallback if image fails to load
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center py-4">No signature uploaded yet.</p>
                            )}
                            <div>
                                <label className="flex items-center justify-center w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors">
                                    {uploadingSignature ? 'Uploading...' : (user?.signatureUrl ? 'Update Signature' : 'Upload Signature')}
                                    <input 
                                        type="file" 
                                        accept="image/png, image/jpeg, image/jpg" 
                                        className="hidden" 
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                if (file.size > 2 * 1024 * 1024) {
                                                    toast.error("Signature image must be less than 2MB.");
                                                    e.target.value = '';
                                                    return;
                                                }
                                                if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                                                    toast.error("Signature must be a PNG or JPG image.");
                                                    e.target.value = '';
                                                    return;
                                                }
                                                handleSignatureUpload(e);
                                            }
                                        }}
                                        disabled={uploadingSignature}
                                    />
                                </label>
                                <p className="text-xs text-slate-500 mt-2 text-center">
                                    Used in Test Reports as your E-Sign.<br />
                                    <span className="text-slate-400">Max size: 2MB. Formats: PNG, JPG.<br />Recommended: 300x100px PNG.</span>
                                </p>
                                {user?.signatureUrl && (
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Are you sure you want to remove your digital signature?')) {
                                                try {
                                                    await authApi.removeSignature();
                                                    toast.success('Signature removed successfully');
                                                    setTimeout(() => window.location.reload(), 1000);
                                                } catch (e) {
                                                    toast.error('Failed to remove signature');
                                                }
                                            }
                                        }}
                                        className="mt-3 flex items-center justify-center w-full px-4 py-2 bg-red-50 border border-red-200 rounded-lg shadow-sm text-sm font-medium text-red-600 hover:bg-red-100 cursor-pointer transition-colors"
                                    >
                                        Remove Signature
                                    </button>
                                )}
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
