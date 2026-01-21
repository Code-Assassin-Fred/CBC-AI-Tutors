'use client';

import React from 'react';
import Card from '../shared/Card';
import Link from 'next/link';

export default function QuickActionsCard() {
    const actions = [
        {
            title: "Teachers Guide",
            description: "Access structured lesson guides",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            color: "bg-emerald-500/10 text-emerald-500",
            href: "/dashboard/teacher/guide"
        },
        {
            title: "Generate Materials",
            description: "Create custom textbooks & quizzes",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            color: "bg-sky-500/10 text-sky-500",
            href: "/dashboard/teacher/textbooks"
        },
        {
            title: "Community",
            description: "Connect with fellow educators",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: "bg-purple-500/10 text-purple-500",
            href: "/dashboard/teacher/community"
        },
        {
            title: "Create Assessments",
            description: "Generate AI-powered quizzes & tests",
            icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            ),
            color: "bg-amber-500/10 text-amber-500",
            href: "/dashboard/teacher/assessments"
        }
    ];

    return (
        <Card className="h-full">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                    >
                        <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            {action.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{action.title}</h3>
                        <p className="text-sm text-[#9aa6b2]">{action.description}</p>
                    </Link>
                ))}
            </div>
        </Card>
    );
}
