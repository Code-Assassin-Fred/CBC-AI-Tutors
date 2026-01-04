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
      href: '/dashboard/student',
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
      id: 'Classroom',
      label: 'Classroom',
      href: '/dashboard/student/classroom',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )
    },
    {
      id: 'Courses',
      label: 'Courses',
      href: '/dashboard/student/courses',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      id: 'Resources',
      label: 'Resources',
      href: '/dashboard/student/resources',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      )
    },
    {
      id: 'Career Paths',
      label: 'Career Paths',
      href: '/dashboard/student/paths',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      )
    },
    {
      id: 'Schedule',
      label: 'Schedule',
      href: '/dashboard/student/schedule',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )
    },
    {
      id: 'Community',
      label: 'Community',
      href: '/dashboard/student/community',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      )
    }
  ];

  return (
    <div
      className={`sticky top-0 h-screen flex flex-col items-center pt-8 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'
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
            const isActive = item.href === '/dashboard/student'
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

        {/* Promo Card - Hide when collapsed */}
        <div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'h-0 p-0 opacity-0' : 'p-4 opacity-100'}`}>
          <div className="p-4 rounded-xl bg-linear-to-br from-[#0a0f14] to-[#0b1113] border border-white/8 ring-1 ring-white/5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-white/95">Free Trial</p>
                <p className="text-xs text-[#9aa6b2] mt-1">7 days left</p>
              </div>
            </div>
            <button
              className="w-full px-3 py-2 text-xs font-medium rounded-md border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b] hover:text-white transition-colors"
              aria-label="Upgrade now"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
