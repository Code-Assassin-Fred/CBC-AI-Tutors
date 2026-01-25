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

        // Start timer
        startTimeRef.current = Date.now();

        return () => {
            // Save on unmount
            if (startTimeRef.current && user && contextRef.current) {
                const endTime = Date.now();
                const durationSeconds = Math.round((endTime - startTimeRef.current) / 1000);

                // Only save if session was more than 10 seconds to avoid noise
                if (durationSeconds > 10) {
                    const activityData = {
                        userId: user.uid,
                        type: 'study_session',
                        sessionType: type,
                        context: contextRef.current,
                        durationSeconds,
                        timestamp: new Date(),
                    };

                    // Using navigator.sendBeacon for more reliable saving on unmount
                    // or just a standard axios post if beacon isn't suitable
                    axios.post('/api/user/activity', activityData).catch(err => {
                        console.error('Failed to auto-save activity duration:', err);
                    });
                }
            }
        };
    }, [user, context, type]);
}
