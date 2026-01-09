'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { UserPreferences } from '@/types/userprofile';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const defaultPreferences: UserPreferences = {
    studyReminders: true,
    soundEffects: false,
    weeklyReports: true,
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [displayName, setDisplayName] = useState('');
    const [grade, setGrade] = useState<number | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

    // Fetch settings on mount
    useEffect(() => {
        if (isOpen && user) {
            fetchSettings();
        }
    }, [isOpen, user]);

    const fetchSettings = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/user/${user.uid}/settings`);
            const data = await res.json();
            if (data.success && data.settings) {
                setDisplayName(data.settings.displayName || user.displayName || '');
                setGrade(data.settings.grade || null);
                setPreferences(data.settings.preferences || defaultPreferences);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await fetch(`/api/user/${user.uid}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, grade, preferences }),
            });
        } catch (err) {
            console.error('Error saving settings:', err);
        } finally {
            setIsSaving(false);
        }
    };

    const togglePreference = (key: keyof UserPreferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleLogout = async () => {
        await signOut(auth);
        onClose();
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'preferences', label: 'Preferences' },
        { id: 'account', label: 'Account' },
    ] as const;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end pt-16 pr-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-80 max-h-[70vh] bg-[#0b0f12] rounded-xl border border-white/10 overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Settings</h3>
                    <button
                        onClick={onClose}
                        className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 px-4 pt-3 pb-2 border-b border-white/5">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${activeTab === tab.id
                                ? 'bg-[#0ea5e9] text-white'
                                : 'text-white/50 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-4 max-h-[45vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="py-8 text-center text-white/40 text-sm">Loading...</div>
                    ) : (
                        <>
                            {activeTab === 'profile' && (
                                <div className="space-y-4">
                                    {/* Avatar */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                                            <img
                                                src={user?.photoURL ?? 'https://i.pravatar.cc/150?img=25'}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                {displayName || user?.displayName || 'Student'}
                                            </p>
                                            <p className="text-xs text-white/50">{user?.email}</p>
                                        </div>
                                    </div>

                                    {/* Name input */}
                                    <div>
                                        <label className="block text-xs text-white/50 mb-1.5">Display Name</label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#0ea5e9]/50"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm text-white">Study reminders</p>
                                            <p className="text-xs text-white/40">Get daily study reminders</p>
                                        </div>
                                        <button
                                            onClick={() => togglePreference('studyReminders')}
                                            className={`w-10 h-6 rounded-full relative transition-colors ${preferences.studyReminders ? 'bg-[#0ea5e9]' : 'bg-white/20'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.studyReminders ? 'right-1' : 'left-1 bg-white/60'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm text-white">Sound effects</p>
                                            <p className="text-xs text-white/40">Play sounds for actions</p>
                                        </div>
                                        <button
                                            onClick={() => togglePreference('soundEffects')}
                                            className={`w-10 h-6 rounded-full relative transition-colors ${preferences.soundEffects ? 'bg-[#0ea5e9]' : 'bg-white/20'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.soundEffects ? 'right-1' : 'left-1 bg-white/60'}`} />
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="text-sm text-white">Weekly reports</p>
                                            <p className="text-xs text-white/40">Email weekly progress</p>
                                        </div>
                                        <button
                                            onClick={() => togglePreference('weeklyReports')}
                                            className={`w-10 h-6 rounded-full relative transition-colors ${preferences.weeklyReports ? 'bg-[#0ea5e9]' : 'bg-white/20'}`}
                                        >
                                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${preferences.weeklyReports ? 'right-1' : 'left-1 bg-white/60'}`} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'account' && (
                                <div className="space-y-3">
                                    <div className="py-2 border-b border-white/10">
                                        <p className="text-sm text-white">Email</p>
                                        <p className="text-xs text-white/50 mt-0.5">{user?.email}</p>
                                    </div>

                                    <div className="py-2 border-b border-white/10">
                                        <p className="text-sm text-white">Account Type</p>
                                        <p className="text-xs text-white/50 mt-0.5">Free Trial</p>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors"
                                    >
                                        Log Out
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {(activeTab === 'profile' || activeTab === 'preferences') && (
                    <div className="px-4 py-3 border-t border-white/10">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full text-center text-xs text-[#0ea5e9] hover:underline disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
