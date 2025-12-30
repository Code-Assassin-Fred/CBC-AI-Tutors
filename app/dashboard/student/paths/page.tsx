"use client";

import DashboardLayout from '@/components/CBCStudent/layout/DashboardLayout';
import { CareerProvider, useCareer } from '@/lib/context/CareerContext';
import CareerEntrySelector from '@/components/CBCStudent/Careerpaths/CareerEntrySelector';
import CareerDiscoveryChat from '@/components/CBCStudent/Careerpaths/CareerDiscoveryChat';
import CareerGenerating from '@/components/CBCStudent/Careerpaths/CareerGenerating';
import SkillAssessment from '@/components/CBCStudent/Careerpaths/SkillAssessment';
import SkillGapAnalysis from '@/components/CBCStudent/Careerpaths/SkillGapAnalysis';
import CareerPathViewer from '@/components/CBCStudent/Careerpaths/CareerPathViewer';
import LearningPlanView from '@/components/CBCStudent/Careerpaths/LearningPlanView';

function CareerPathsContent() {
    const { currentView } = useCareer();

    const renderContent = () => {
        switch (currentView) {
            case 'entry':
                return <CareerEntrySelector />;
            case 'discovery-chat':
                return <CareerDiscoveryChat />;
            case 'generating':
                return <CareerGenerating />;
            case 'assessment':
                return <SkillAssessment />;
            case 'gap-analysis':
                return <SkillGapAnalysis />;
            case 'career-view':
                return <CareerPathViewer />;
            case 'learning-plan':
                return <LearningPlanView />;
            default:
                return <CareerEntrySelector />;
        }
    };

    return (
        <div className="min-h-screen">
            {renderContent()}
        </div>
    );
}

export default function CareerPathsPage() {
    return (
        <DashboardLayout active="Career Paths">
            <CareerProvider>
                <CareerPathsContent />
            </CareerProvider>
        </DashboardLayout>
    );
}
