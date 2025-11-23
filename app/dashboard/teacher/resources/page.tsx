'use client';

import { useState } from 'react';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import DashboardLayout from '@/components/Teacher/layout/DashboardLayout';
import Card from '@/components/Teacher/shared/Card';

interface Resource {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'exam';
  subject: string;
  grade: string;
  createdAt: string;
  lastModified: string;
}

export default function ResourcesPage() {
  useDashboardProtection(['teacher']);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lesson' | 'quiz' | 'exam'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  const resources: Resource[] = [
    {
      id: '1',
      title: 'Introduction to Quadratic Equations',
      type: 'lesson',
      subject: 'Mathematics',
      grade: 'Grade 10',
      createdAt: '2024-10-15',
      lastModified: '2024-10-15',
    },
    {
      id: '2',
      title: 'Algebra Mid-Term Quiz',
      type: 'quiz',
      subject: 'Mathematics',
      grade: 'Grade 10',
      createdAt: '2024-10-14',
      lastModified: '2024-10-14',
    },
    {
      id: '3',
      title: 'Cell Structure and Functions',
      type: 'lesson',
      subject: 'Biology',
      grade: 'Grade 9',
      createdAt: '2024-10-13',
      lastModified: '2024-10-16',
    },
    {
      id: '4',
      title: 'End of Term Biology Exam',
      type: 'exam',
      subject: 'Biology',
      grade: 'Grade 9',
      createdAt: '2024-10-12',
      lastModified: '2024-10-12',
    },
    {
      id: '5',
      title: 'Shakespeare: Romeo and Juliet Analysis',
      type: 'lesson',
      subject: 'English',
      grade: 'Grade 11',
      createdAt: '2024-10-10',
      lastModified: '2024-10-11',
    },
    {
      id: '6',
      title: 'World War II Comprehensive Exam',
      type: 'exam',
      subject: 'History',
      grade: 'Grade 10',
      createdAt: '2024-10-08',
      lastModified: '2024-10-08',
    },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.grade.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return '📝';
      case 'quiz': return '📋';
      case 'exam': return '📄';
      default: return '📚';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return '#7c3aed';
      case 'quiz': return '#06b6d4';
      case 'exam': return '#10b981';
      default: return '#9aa6b2';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-[#7c3aed]/10 border-[#7c3aed]/20 text-[#7c3aed]';
      case 'quiz': return 'bg-[#06b6d4]/10 border-[#06b6d4]/20 text-[#06b6d4]';
      case 'exam': return 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]';
      default: return 'bg-white/5 border-white/10 text-[#9aa6b2]';
    }
  };

  return (
    <DashboardLayout active="Resource Library">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white/95 mb-2">Resource Library</h1>
          <p className="text-[#9aa6b2]">Access and manage your saved lesson plans, quizzes, and exams</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            {/* Search */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <svg 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9aa6b2]" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, subject, or grade..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0b0f12] border border-white/8 text-white placeholder-[#9aa6b2] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              {['all', 'lesson', 'quiz', 'exam'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                    filterType === type
                      ? 'bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white shadow-lg'
                      : 'bg-[#0b0f12] text-[#9aa6b2] border border-white/8 hover:border-white/15'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0b0f12] border border-white/8">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-[#7c3aed] text-white' : 'text-[#9aa6b2] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-[#7c3aed] text-white' : 'text-[#9aa6b2] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 px-1">
          <p className="text-sm text-[#9aa6b2]">
            Showing {filteredResources.length} of {resources.length} resources
          </p>
        </div>

        {/* Resources Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="group hover:border-white/15 hover:bg-[#0d1318] transition-all duration-300 cursor-pointer">
                <div className="space-y-4">
                  {/* Type Icon */}
                  <div className="flex items-start justify-between">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${getTypeColor(resource.type)}20` }}
                    >
                      {getTypeIcon(resource.type)}
                    </div>
                    <span className={`px-3 py-1 rounded-lg border text-xs font-medium capitalize ${getTypeBadgeClass(resource.type)}`}>
                      {resource.type}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-semibold text-white/95 mb-2 line-clamp-2 group-hover:text-[#7c3aed] transition-colors duration-300">
                      {resource.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#9aa6b2]">
                      <span>{resource.subject}</span>
                      <span>•</span>
                      <span>{resource.grade}</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="pt-4 border-t border-white/8">
                    <p className="text-xs text-[#9aa6b2] mb-3">
                      Created {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 px-3 py-2 rounded-lg bg-[#7c3aed] text-white text-xs font-medium hover:bg-[#6b21a8] transition-all">
                        View
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-[#0b0f12] border border-white/8 text-white/90 hover:border-white/15 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                      <button className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="group hover:border-white/15 hover:bg-[#0d1318] transition-all duration-300 cursor-pointer">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: `${getTypeColor(resource.type)}20` }}
                  >
                    {getTypeIcon(resource.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3 className="text-base font-semibold text-white/95 group-hover:text-[#7c3aed] transition-colors duration-300 line-clamp-1">
                        {resource.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-lg border text-xs font-medium capitalize shrink-0 ${getTypeBadgeClass(resource.type)}`}>
                        {resource.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#9aa6b2]">
                      <span>{resource.subject}</span>
                      <span>•</span>
                      <span>{resource.grade}</span>
                      <span>•</span>
                      <span>Created {new Date(resource.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-xs font-medium hover:bg-[#6b21a8] transition-all">
                      View
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-[#0b0f12] border border-white/8 text-white/90 hover:border-white/15 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredResources.length === 0 && (
          <Card className="py-16">
            <div className="text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-white/95 mb-2">No resources found</h3>
              <p className="text-sm text-[#9aa6b2] mb-6">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start creating lessons, quizzes, and exams'}
              </p>
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white font-semibold hover:from-[#6b21a8] hover:to-[#7c3aed] transition-all shadow-lg shadow-purple-500/25">
                Create Your First Resource
              </button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
