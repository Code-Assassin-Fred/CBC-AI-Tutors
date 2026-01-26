'use client';

import React from 'react';
import Card from '../shared/Card';
import Link from 'next/link';

export default function QuickActionsCard() {
    const actions = [
        {
            title: "AI Teachers Guide",
            description: "Access structured lesson guides with real-time AI assistance",
            href: "/dashboard/teacher/guide"
        },
        {
            title: "Custom Textbooks",
            description: "Create AI-powered custom textbooks",
            href: "/dashboard/teacher/textbooks"
        },
        {
            title: "Custom Lessons",
            description: "Generate specialized AI lesson plans",
            href: "/dashboard/teacher/custom-lessons"
        },
        {
            title: "Create Assessments",
            description: "Generate fully AI-powered quizzes & tests or upload your material and generate based on that material",
            href: "/dashboard/teacher/assessments"
        },
        {
            title: "Community",
            description: "Connect with fellow educators",
            href: "/dashboard/teacher/community"
        }
    ];

    return (
        <Card className="h-full">
            <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {actions.map((action, idx) => (
                    <Link
                        key={idx}
                        href={action.href}
                        className="flex flex-col p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300 group"
                    >
                        <h3 className="text-lg font-semibold text-[#0ea5e9] mb-1">{action.title}</h3>
                        <p className="text-sm text-[#9aa6b2]">{action.description}</p>
                    </Link>
                ))}
            </div>
        </Card>
    );
}
