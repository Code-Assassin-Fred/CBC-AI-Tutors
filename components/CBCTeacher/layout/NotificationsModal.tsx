'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { UserNotification } from '@/types/userprofile';

interface NotificationsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<UserNotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchNotifications();
        }
    }, [isOpen, user]);

    const fetchNotifications = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/notifications?userId=${user.uid}`);
            const data = await res.json();
            if (data.success) {
                setNotifications(data.notifications || []);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        try {
            await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ markAllRead: true, userId: user.uid }),
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Error marking notifications as read:', err);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success':
                return (
                    <div className="w-8 h-8 rounded-full bg-[#10b981]/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#10b981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                );
            case 'warning':
                return (
                    <div className="w-8 h-8 rounded-full bg-[#f59e0b]/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#f59e0b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-8 h-8 rounded-full bg-[#0ea5e9]/10 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#0ea5e9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (!isOpen) return null;

    const hasUnread = notifications.some(n => !n.read);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-80 max-h-[70vh] bg-[#0b0f12] rounded-xl border border-white/10 overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Notifications list */}
                <div className="max-h-[50vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="py-8 text-center text-white/40 text-sm">Loading...</div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-4 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        {getTypeIcon(notif.type)}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-white truncate">
                                                    {notif.title}
                                                </p>
                                                {!notif.read && (
                                                    <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full" />
                                                )}
                                            </div>
                                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <p className="text-xs text-white/30 mt-1">
                                                {formatTime(notif.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-white/40 text-sm">
                            No notifications
                        </div>
                    )}
                </div>

                {/* Footer */}
                {hasUnread && (
                    <div className="px-4 py-3 border-t border-white/10">
                        <button
                            onClick={handleMarkAllRead}
                            className="w-full text-center text-xs text-[#0ea5e9] hover:underline"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
