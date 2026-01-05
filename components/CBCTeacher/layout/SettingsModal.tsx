'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');

    if (!isOpen) return null;

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'account', label: 'Account' },
    ] as const;

    const handleLogout = async () => {
        await signOut(auth);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#0b0f12] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-5 pt-4 pb-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${activeTab === tab.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-5">
                    {activeTab === 'profile' && (
                        <div className="space-y-4">
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-white/10 overflow-hidden">
                                    <img
                                        src={user?.photoURL ?? 'https://i.pravatar.cc/150?img=25'}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        {user?.displayName || 'Teacher'}
                                    </p>
                                    <p className="text-xs text-white/50">{user?.email}</p>
                                </div>
                            </div>

                            {/* Name input */}
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5">Display Name</label>
                                <input
                                    type="text"
                                    defaultValue={user?.displayName || ''}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-xs text-white/50 mb-1.5">Subject</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Mathematics, Science"
                                    className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'preferences' && (
                        <div className="space-y-4">
                            {/* Notifications */}
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm text-white">Email updates</p>
                                    <p className="text-xs text-white/40">Receive updates about new content</p>
                                </div>
                                <button className="w-10 h-6 rounded-full bg-[#0ea5e9] relative">
                                    <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                                </button>
                            </div>

                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm text-white">Sound effects</p>
                                    <p className="text-xs text-white/40">Play sounds for actions</p>
                                </div>
                                <button className="w-10 h-6 rounded-full bg-white/20 relative">
                                    <span className="absolute left-1 top-1 w-4 h-4 bg-white/60 rounded-full" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="space-y-4">
                            <div className="py-3 border-b border-white/10">
                                <p className="text-sm text-white">Email</p>
                                <p className="text-xs text-white/50 mt-0.5">{user?.email}</p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-2.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'profile' && (
                    <div className="px-5 py-4 border-t border-white/10">
                        <button className="w-full px-4 py-2.5 bg-[#0ea5e9] text-white rounded-lg text-sm font-medium hover:bg-[#0ea5e9]/90 transition-colors">
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
