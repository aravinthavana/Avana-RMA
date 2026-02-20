import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationApi, Notification } from '../src/api/notifications.api';
import toast from 'react-hot-toast';

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUnreadCount = async () => {
        const { data, error } = await notificationApi.getUnreadCount();
        if (data) {
            setUnreadCount(data.count);
        }
    };

    const fetchNotifications = async () => {
        const { data, error } = await notificationApi.getUnread();
        if (data) {
            setNotifications(data);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        const { error } = await notificationApi.markAsRead(id);
        if (!error) {
            setNotifications(notifications.filter(n => n.id !== id));
            setUnreadCount(Math.max(0, unreadCount - 1));
        }
    };

    const handleMarkAllAsRead = async () => {
        const { error } = await notificationApi.markAllAsRead();
        if (!error) {
            setNotifications([]);
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        }
    };

    const parseMetadata = (metadata?: string) => {
        if (!metadata) return null;
        try {
            return JSON.parse(metadata);
        } catch {
            return null;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                    >
                        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-semibold text-slate-900">Notifications</h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-slate-500 text-sm">
                                    No new notifications
                                </div>
                            ) : (
                                notifications.map((notification) => {
                                    const metadata = parseMetadata(notification.metadata);
                                    return (
                                        <div
                                            key={notification.id}
                                            className="px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-slate-900 mb-1">
                                                        {notification.message}
                                                    </p>
                                                    {metadata && (
                                                        <div className="text-xs text-slate-600 space-y-1">
                                                            {metadata.email && <div>Email: {metadata.email}</div>}
                                                            {metadata.resetUrl && (
                                                                <a
                                                                    href={metadata.resetUrl}
                                                                    className="text-primary-600 hover:underline block truncate"
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    Reset Link
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(notification.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium shrink-0"
                                                >
                                                    Mark read
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
