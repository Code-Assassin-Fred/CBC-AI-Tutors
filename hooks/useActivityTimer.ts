'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '@/lib/context/AuthContext';

interface ActivityContext {
    grade?: string;
    subject?: string;
    strand?: string;
    substrand?: string;
    courseId?: string;
    lessonId?: string;
}

export function useActivityTimer(type: 'classroom' | 'course', context: ActivityContext | null) {
    const { user } = useAuth();
    const startTimeRef = useRef<number | null>(null);
    const contextRef = useRef(context);

    // Keep context ref up to date
    useEffect(() => {
        contextRef.current = context;
    }, [context]);

    useEffect(() => {
        if (!user || !context) return;

        // 1. Log session start immediately so it shows up on dashboard
        const startData = {
            userId: user.uid,
            type: 'study_session',
            sessionType: type,
            context,
            durationSeconds: 0,
            timestamp: new Date(),
        };
        axios.post('/api/user/activity', startData).catch(() => { });

        // 2. Start timer for duration tracking
        startTimeRef.current = Date.now();

        return () => {
            // Save duration on unmount
            if (startTimeRef.current && user && contextRef.current) {
                const endTime = Date.now();
                const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);

                // Only save if session was more than 5 seconds to avoid noise
                if (durationSeconds > 5) {
                    const activityData = {
                        userId: user.uid,
                        type: 'study_session',
                        sessionType: type,
                        context: contextRef.current,
                        durationSeconds,
                        timestamp: new Date(),
                    };

                    // Use fetch with keepalive for reliable saving during unmount/page hide
                    fetch('/api/user/activity', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(activityData),
                        keepalive: true,
                    }).catch(err => {
                        console.error('Failed to auto-save activity duration:', err);
                    });
                }
            }
        };
    }, [user, context, type]);
}
