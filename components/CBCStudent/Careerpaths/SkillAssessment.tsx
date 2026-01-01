"use client";

import { useState, useEffect } from 'react';
import { useCareer } from '@/lib/context/CareerContext';
import { Skill, SkillCategory } from '@/types/career';

export default function SkillAssessment() {
    const { activeCareer, setCurrentView, updateSkillState } = useCareer();

    const [currentSkillIndex, setCurrentSkillIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [isComplete, setIsComplete] = useState(false);

    // Flatten all skills from categories
    const allSkills: Skill[] = activeCareer?.skillCategories?.flatMap(
        (cat: SkillCategory) => cat.skills
    ).filter(skill => skill.assessmentQuestions && skill.assessmentQuestions.length > 0) || [];

    const currentSkill = allSkills[currentSkillIndex];
    const currentQuestion = currentSkill?.assessmentQuestions?.[currentQuestionIndex];
    const totalSkills = allSkills.length;
    const questionsPerSkill = currentSkill?.assessmentQuestions?.length || 3;

    const handleAnswer = (answerIndex: number) => {
        if (!currentSkill || !currentQuestion) return;

        const key = `${currentSkill.id}_${currentQuestion.id}`;
        const isCorrect = answerIndex === currentQuestion.correctAnswer;

        setAnswers(prev => ({
            ...prev,
            [key]: isCorrect ? 1 : 0,
        }));

        // Move to next question or skill
        if (currentQuestionIndex < questionsPerSkill - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (currentSkillIndex < totalSkills - 1) {
            // Calculate skill proficiency and save
            const skillAnswers = Object.entries(answers)
                .filter(([k]) => k.startsWith(currentSkill.id))
                .map(([, v]) => v);
            skillAnswers.push(isCorrect ? 1 : 0);

            const proficiency = Math.round((skillAnswers.reduce((a, b) => a + b, 0) / skillAnswers.length) * 100);

            updateSkillState(currentSkill.id, {
                skillId: currentSkill.id,
                skillName: currentSkill.name,
                proficiency,
                sources: [{ type: 'assessment', value: proficiency, timestamp: new Date() }],
                lastUpdated: new Date(),
            });

            setCurrentSkillIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        } else {
            // Calculate final skill proficiency
            const skillAnswers = Object.entries(answers)
                .filter(([k]) => k.startsWith(currentSkill.id))
                .map(([, v]) => v);
            skillAnswers.push(isCorrect ? 1 : 0);

            const proficiency = Math.round((skillAnswers.reduce((a, b) => a + b, 0) / skillAnswers.length) * 100);

            updateSkillState(currentSkill.id, {
                skillId: currentSkill.id,
                skillName: currentSkill.name,
                proficiency,
                sources: [{ type: 'assessment', value: proficiency, timestamp: new Date() }],
                lastUpdated: new Date(),
            });

            setIsComplete(true);
        }
    };

    useEffect(() => {
        if (isComplete) {
            setTimeout(() => setCurrentView('gap-analysis'), 500);
        }
    }, [isComplete, setCurrentView]);

    if (!activeCareer || !currentSkill) {
        return (
            <div className="max-w-xl mx-auto pt-24 text-center">
                <p className="text-white/50">No career selected</p>
                <button
                    onClick={() => setCurrentView('entry')}
                    className="mt-4 px-4 py-2 bg-white/10 rounded-lg text-white"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const overallProgress = ((currentSkillIndex * questionsPerSkill + currentQuestionIndex) / (totalSkills * questionsPerSkill)) * 100;

    return (
        <div className="max-w-xl mx-auto pt-12 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <p className="text-[#0ea5e9] text-sm font-medium mb-2">{activeCareer.title}</p>
                <h1 className="text-2xl font-bold text-white mb-2">Skill Assessment</h1>
                <p className="text-white/50 text-sm">
                    Let&apos;s see where you&apos;re starting from
                </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/60">
                        {currentSkill.name} ({currentSkillIndex + 1}/{totalSkills})
                    </span>
                    <span className="text-sm text-white/40">
                        Question {currentQuestionIndex + 1}/{questionsPerSkill}
                    </span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#0ea5e9] transition-all duration-300"
                        style={{ width: `${overallProgress}%` }}
                    />
                </div>
            </div>

            {/* Question */}
            {currentQuestion && (
                <div className="mb-8">
                    <h3 className="text-lg text-white mb-6">{currentQuestion.question}</h3>

                    <div className="space-y-3">
                        {currentQuestion.options?.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                                <span className="inline-flex items-center justify-center w-6 h-6 mr-3 bg-white/10 rounded-full text-sm text-white/60">
                                    {String.fromCharCode(65 + index)}
                                </span>
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Skip option */}
            <div className="text-center">
                <button
                    onClick={() => setCurrentView('gap-analysis')}
                    className="text-sm text-white/40 hover:text-white/60 transition-colors"
                >
                    Skip assessment for now
                </button>
            </div>
        </div>
    );
}
