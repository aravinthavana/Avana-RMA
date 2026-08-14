import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, User as UserIcon, Mail, Shield, CheckCircle, Ban, Trash2, Key, UploadCloud, Save } from 'lucide-react';
import { apiClient } from '../api/client';
import { User } from '../api/auth.api';
import { API_BASE_URL } from '../../config';

export default function UserDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Edit form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        isAdmin: false
    });

    // Reset password state
    const [resetPasswordValue, setResetPasswordValue] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchUserDetails();
        }
    }, [id]);

    const fetchUserDetails = async () => {
        try {
            setIsLoading(true);
            const { data } = await apiClient.get<User>(`/api/users/${id}`);
            setUser(data);
            setFormData({
                name: data.name,
                email: data.email,
                role: data.role,
                isAdmin: data.isAdmin
            });
        } catch (error) {
            console.error('Failed to fetch user', error);
            toast.error('Failed to load user details');
            navigate('/users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        try {
            setIsSaving(true);
            const { data } = await apiClient.put<User>(`/api/users/${user.id}`, formData);
            setUser(data);
            toast.success('User details updated successfully');
        } catch (error) {
            toast.error('Failed to update user details');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;
        try {
            const { data } = await apiClient.patch<User>(`/api/users/${user.id}/status`, { isActive: !user.isActive });
            setUser(data);
            toast.success(`User ${data.isActive ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            toast.error('Failed to update user status');
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await apiClient.delete(`/api/users/${user.id}`);
            toast.success('User deleted successfully');
            navigate('/users');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete user');
            console.error(error);
        }
    };

    const handleResetPassword = async () => {
        if (!user || !resetPasswordValue) return;
        try {
            setIsResetting(true);
            await apiClient.patch(`/api/users/${user.id}/reset-password`, { newPassword: resetPasswordValue });
            toast.success('Password reset successfully');
            setResetPasswordValue('');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
            console.error(error);
        } finally {
            setIsResetting(false);
        }
    };

    const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Profile picture must be less than 2MB.");
            e.target.value = '';
            return;
        }
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            toast.error("Profile picture must be a PNG or JPG image.");
            e.target.value = '';
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('profilePicture', file);

            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Upload failed');
            }

            const data = await response.json();
            setUser(data.data);
            toast.success('Profile picture updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload picture');
            console.error(error);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleRemoveProfilePic = async () => {
        if (!user || !window.confirm('Remove profile picture?')) return;
        try {
            const token = sessionStorage.getItem('token') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}/profile-picture`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Removal failed');
            }

            const data = await response.json();
            setUser(data.data);
            toast.success('Profile picture removed');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove picture');
            console.error(error);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
    }

    if (!user) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/users')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">User Profile</h1>
                        <p className="text-sm text-slate-500">Manage user details, profile picture, and access</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium 
                        ${user.isAdmin ? 'bg-purple-100 text-purple-800' :
                            user.role === 'MANAGER' ? 'bg-indigo-100 text-indigo-800' :
                            user.role === 'COORDINATOR' ? 'bg-amber-100 text-amber-800' :
                            user.role === 'SERVICE_ENGINEER' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                        }`}>
                        {user.isAdmin ? `Admin (${user.role})` : user.role}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Profile Picture & Actions */}
                <div className="md:col-span-1 space-y-6">
                    {/* Profile Picture Card */}
                    <div className="glass p-6 rounded-xl shadow-sm text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4 group">
                            {user.profilePictureUrl ? (
                                <img 
                                    src={`${API_BASE_URL}${user.profilePictureUrl}`} 
                                    alt={user.name} 
                                    className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-indigo-100 rounded-full flex items-center justify-center text-4xl font-bold text-primary-700 border-4 border-white shadow-lg">
                                    {user.name.charAt(0)}
                                </div>
                            )}
                            
                            {/* Hover overlay for profile picture */}
                            <label className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <UploadCloud className="text-white mb-1" size={24} />
                                <span className="text-white text-xs font-medium">Upload</span>
                                <input 
                                    type="file" 
                                    accept="image/png, image/jpeg, image/jpg" 
                                    className="hidden" 
                                    onChange={handleProfilePicUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">{user.name}</h2>
                        <p className="text-sm text-slate-500 mb-4">{user.email}</p>

                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg text-left border border-slate-100">
                            <strong>Profile Picture Guidelines:</strong>
                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                <li>Max file size: 2MB</li>
                                <li>Supported formats: JPG, PNG</li>
                                <li>Recommended: Square image (1:1)</li>
                            </ul>
                        </div>
                        
                        {user.profilePictureUrl && (
                            <button
                                onClick={handleRemoveProfilePic}
                                className="mt-4 text-sm text-red-600 hover:text-red-700 flex items-center justify-center gap-1 w-full"
                            >
                                <Trash2 size={14} /> Remove Picture
                            </button>
                        )}
                    </div>

                    {/* Quick Actions Card */}
                    <div className="glass p-6 rounded-xl shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-700 border-b border-slate-100 pb-2">User Actions</h3>
                        
                        <button
                            onClick={handleToggleStatus}
                            className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                                user.isActive 
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}
                        >
                            {user.isActive ? (
                                <><Ban size={18} /> Deactivate User</>
                            ) : (
                                <><CheckCircle size={18} /> Activate User</>
                            )}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                        >
                            <Trash2 size={18} /> Delete User
                        </button>
                    </div>
                </div>

                {/* Right Column - User Details Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="glass p-6 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-2">
                            <UserIcon className="text-primary-600" /> Edit User Details
                        </h3>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-slate-700">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                >
                                    <option value="MANAGER">Manager</option>
                                    <option value="COORDINATOR">Coordinator</option>
                                    <option value="SERVICE_ENGINEER">Service Engineer</option>
                                </select>
                            </div>

                            <div className="flex items-center pt-2">
                                <input
                                    type="checkbox"
                                    id="isAdmin"
                                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                    checked={formData.isAdmin}
                                    onChange={e => setFormData({ ...formData, isAdmin: e.target.checked })}
                                />
                                <label htmlFor="isAdmin" className="ml-2 block text-sm font-medium text-slate-700">
                                    Has Admin Privileges
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                                >
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Reset Password Card */}
                    <div className="glass p-6 rounded-xl shadow-sm">
                        <h3 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-2">
                            <Key className="text-amber-600" /> Reset Password
                        </h3>

                        <div className="flex gap-4 items-end">
                            <div className="flex-1 space-y-1">
                                <label className="text-sm font-medium text-slate-700">New Password</label>
                                <input
                                    type="password"
                                    value={resetPasswordValue}
                                    onChange={(e) => setResetPasswordValue(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                            <button
                                onClick={handleResetPassword}
                                disabled={isResetting || !resetPasswordValue}
                                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 whitespace-nowrap"
                            >
                                {isResetting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
