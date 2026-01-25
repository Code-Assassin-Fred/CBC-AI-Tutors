'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/lib/context/SidebarContext';

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
}

interface SidebarNavProps {
    active?: string;
}

export default function SidebarNav({ active = 'Dashboard' }: SidebarNavProps) {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useSidebar();

    const navItems: NavItem[] = [
        {
            id: 'Dashboard',
            label: 'Dashboard',
            href: '/dashboard/teacher',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                </svg>
            )
        },
        {
            id: 'Teachers Guide',
            label: 'Teachers Guide',
            href: '/dashboard/teacher/guide',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: 'Custom Textbooks',
            label: 'Custom Textbooks',
            href: '/dashboard/teacher/textbooks',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            id: 'Custom Lessons',
            label: 'Custom Lessons',
            href: '/dashboard/teacher/custom-lessons',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        {
            id: 'Create Assessments',
            label: 'Assessments',
            href: '/dashboard/teacher/assessments',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
            )
        },
        {
            id: 'Community',
            label: 'Community',
            href: '/dashboard/teacher/community',
            icon: (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
            )
        }
    ];

    return (
        <div
            className={`hidden md:flex sticky top-0 h-screen flex-col items-center pt-8 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'lg:w-72 w-20'
                }`}
        >
            {/* Logo */}
            <div className={`flex items-center gap-2.5 mb-5 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                <img
                    src="/logo1.jpg"
                    alt="Curio Logo"
                    className="w-7 h-7 rounded-lg object-cover flex-shrink-0"
                />
                <span
                    className={`text-lg font-semibold text-white/95 transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                        }`}
                >
                    Curio
                </span>
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col flex-1 w-[90%] bg-linear-to-b from-[#0b0f12] to-[#0c1116] rounded-t-2xl border-t border-l border-r border-white/10 shadow-[inset_-1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
                {/* Scrollable Nav */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => {
                        const isActive = item.href === '/dashboard/teacher'
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ease-in-out ${isActive ? 'text-[#0ea5e9]' : 'text-white/75 hover:text-white'
                                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                                aria-label={item.label}
                                title={isCollapsed ? item.label : undefined}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 -z-10 rounded-2xl bg-[#0ea5e9]/10 shadow-[0_8px_24px_rgba(14,165,233,0.35)] transition-all duration-300" />
                                )}
                                <span
                                    className={`${isActive ? 'text-[#0ea5e9]' : 'text-white/75 group-hover:text-white'}`}
                                >
                                    {item.icon}
                                </span>
                                <span
                                    className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                        } ${isActive ? 'text-[#0ea5e9]' : ''}`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Collapse Toggle Icon */}
                <div
                    className="p-4 border-t border-white/10 flex justify-center cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={toggleSidebar}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg
                        className="w-5 h-5 text-white/60 hover:text-white/90 transition-all duration-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isCollapsed ? (
                            /* Expand icon >> */
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                            />
                        ) : (
                            /* Collapse icon << */
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                            />
                        )}
                    </svg>
                </div>

            </aside>
        </div>
    );
}
