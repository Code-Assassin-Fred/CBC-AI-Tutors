'use client';

import { useState } from 'react';
import { useDashboardProtection } from '@/hooks/useRoleRedirect';
import DashboardLayout from '@/components/Teacher/layout/DashboardLayout';
import LessonPlanForm from '@/components/Teacher/lesson-planner/LessonPlanForm';
import QuizGeneratorModal from '@/components/Teacher/lesson-planner/QuizGeneratorModal';
import ExamGeneratorModal from '@/components/Teacher/lesson-planner/ExamGeneratorModal';
import LessonPlanDisplay from '@/components/Teacher/lesson-planner/LessonPlanDisplay';

type GenerationMode = 'lesson' | 'quiz' | 'exam';

export default function LessonPlannerPage() {
  useDashboardProtection(['teacher']);
  
  const [mode, setMode] = useState<GenerationMode>('lesson');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (formData: any) => {
    setIsGenerating(true);
    
    // Simulate AI generation with mock data
    setTimeout(() => {
      if (mode === 'lesson') {
        setGeneratedContent({
          type: 'lesson',
          topic: formData.topic,
          grade: formData.grade,
          subject: formData.subject,
          objectives: [
            'Understand the fundamental concepts and principles',
            'Apply knowledge to solve practical problems',
            'Analyze and evaluate different approaches',
            'Create original solutions using learned techniques'
          ],
          materials: [
            'Whiteboard and markers',
            'Textbook: Chapter references',
            'Worksheets (provided)',
            'Interactive digital tools',
            'Student notebooks'
          ],
          duration: '60 minutes',
          activities: [
            {
              title: 'Introduction & Warm-up',
              duration: '10 minutes',
              description: 'Begin with a brief review of previous concepts. Engage students with a thought-provoking question or scenario related to today\'s topic. This activates prior knowledge and sets the context for new learning.'
            },
            {
              title: 'Direct Instruction',
              duration: '15 minutes',
              description: 'Present the main concepts using clear explanations, visual aids, and real-world examples. Break down complex ideas into manageable chunks. Encourage questions and check for understanding throughout.'
            },
            {
              title: 'Guided Practice',
              duration: '15 minutes',
              description: 'Work through examples together as a class. Guide students step-by-step through problem-solving processes. Gradually release responsibility as students gain confidence.'
            },
            {
              title: 'Independent Practice',
              duration: '15 minutes',
              description: 'Students work individually or in pairs on practice problems. Circulate to provide support and feedback. Observe student work to identify common misconceptions.'
            },
            {
              title: 'Conclusion & Assessment',
              duration: '5 minutes',
              description: 'Summarize key learning points. Use exit tickets or quick formative assessment. Preview the next lesson and assign homework if applicable.'
            }
          ],
          assessment: 'Formative assessment through observation during guided and independent practice. Exit ticket with 2-3 questions to gauge understanding. Review homework assignments to identify areas needing reinforcement.',
          homework: 'Complete practice problems from textbook pages. Prepare questions for next class discussion. Optional: Create a real-world example of today\'s concept.',
          differentiation: 'For advanced learners: Provide extension activities with higher-order thinking challenges. For struggling students: Offer simplified examples, visual aids, and additional one-on-one support.',
          timestamp: new Date().toISOString()
        });
      }
      setIsGenerating(false);
    }, 2000);
  };

  const handleModeChange = (newMode: GenerationMode) => {
    setMode(newMode);
    setGeneratedContent(null);
  };

  return (
    <DashboardLayout active="Lesson Planner">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white/95 mb-2">AI Lesson Planner</h1>
          <p className="text-[#9aa6b2]">Create comprehensive lesson plans, quizzes, and exams with AI assistance</p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => handleModeChange('lesson')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              mode === 'lesson'
                ? 'bg-gradient-to-r from-[#7c3aed] to-[#9333ea] text-white shadow-lg shadow-purple-500/25'
                : 'bg-[#0b0f12] text-[#9aa6b2] border border-white/8 hover:border-white/15'
            }`}
          >
            📝 Lesson Plan
          </button>
          <button
            onClick={() => handleModeChange('quiz')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              mode === 'quiz'
                ? 'bg-gradient-to-r from-[#06b6d4] to-[#0891b2] text-white shadow-lg shadow-cyan-500/25'
                : 'bg-[#0b0f12] text-[#9aa6b2] border border-white/8 hover:border-white/15'
            }`}
          >
            📋 Quiz
          </button>
          <button
            onClick={() => handleModeChange('exam')}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              mode === 'exam'
                ? 'bg-gradient-to-r from-[#10b981] to-[#059669] text-white shadow-lg shadow-emerald-500/25'
                : 'bg-[#0b0f12] text-[#9aa6b2] border border-white/8 hover:border-white/15'
            }`}
          >
            📄 Exam
          </button>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-5">
            {mode === 'lesson' && (
              <LessonPlanForm 
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
            {mode === 'quiz' && (
              <QuizGeneratorModal 
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
            {mode === 'exam' && (
              <ExamGeneratorModal 
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
              />
            )}
          </div>

          {/* Display Section */}
          <div className="lg:col-span-7">
            {generatedContent ? (
              <LessonPlanDisplay content={generatedContent} />
            ) : (
              <div className="rounded-2xl bg-[#0b0f12] border border-white/8 p-12 text-center">
                <div className="text-6xl mb-4">✨</div>
                <h3 className="text-lg font-semibold text-white/95 mb-2">
                  Ready to Create
                </h3>
                <p className="text-sm text-[#9aa6b2]">
                  Fill out the form and click generate to create your {mode === 'lesson' ? 'lesson plan' : mode === 'quiz' ? 'quiz' : 'exam'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
