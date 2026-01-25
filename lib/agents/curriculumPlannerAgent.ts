/**
 * Curriculum Planner Agent
 * 
 * Designs the course structure and lesson breakdown for any topic.
 * This is Step 1 of course generation - creating the high-level outline.
 */

import { generateGeminiJSON, MODELS } from '@/lib/api/gemini';
import { CourseOutline, LessonOutline, CourseDifficulty } from '@/types/course';

const MODEL = MODELS.flash;

// ============================================
// STEP 1: RESEARCH TOPIC
// ============================================

interface TopicResearch {
    mainConcepts: string[];
    prerequisites: string[];
    targetAudience: string;
    suggestedDifficulty: CourseDifficulty;
    estimatedTotalTime: string;
    possibleTags: string[];
}

async function researchTopic(topic: string): Promise<TopicResearch> {
    const prompt = `You are an expert curriculum designer. Research this topic and provide insights for course creation.

TOPIC: "${topic}"

Analyze this topic and provide:
1. Main concepts that should be covered (5-10 key concepts)
2. Prerequisites learners should have
3. Target audience (who would learn this)
4. Suggested difficulty level
5. Estimated total learning time
6. Relevant tags/categories

Respond with ONLY a JSON object:
{
    "mainConcepts": ["concept1", "concept2", ...],
    "prerequisites": ["prerequisite1", ...],
    "targetAudience": "Description of ideal learner",
    "suggestedDifficulty": "beginner" | "intermediate" | "advanced",
    "estimatedTotalTime": "X hours",
    "possibleTags": ["tag1", "tag2", ...]
}`;

    const data = await generateGeminiJSON<TopicResearch>(prompt, MODEL);
    return data;
}

// ============================================
// STEP 2: CREATE COURSE STRUCTURE
// ============================================

interface CourseStructure {
    title: string;
    description: string;
    lessonTitles: string[];
}

async function createCourseStructure(
    topic: string,
    research: TopicResearch,
    lessonCount: number = 6
): Promise<CourseStructure> {
    const prompt = `You are an expert curriculum designer. Create a course structure for this topic.

TOPIC: "${topic}"

RESEARCH INSIGHTS:
- Main Concepts: ${research.mainConcepts.join(', ')}
- Target Audience: ${research.targetAudience}
- Difficulty: ${research.suggestedDifficulty}

Create a course with exactly ${lessonCount} lessons. Each lesson should:
- Build on previous lessons
- Cover 1-2 main concepts
- Have a clear, engaging title
- Be progressively more advanced

Respond with ONLY a JSON object:
{
    "title": "Engaging Course Title",
    "description": "2-3 sentence course description that hooks the learner",
    "lessonTitles": ["Lesson 1 Title", "Lesson 2 Title", ...]
}`;

    const data = await generateGeminiJSON<CourseStructure>(prompt, MODEL);
    return data;
}

// ============================================
// STEP 3: DETAIL EACH LESSON
// ============================================

async function detailLessons(
    topic: string,
    structure: CourseStructure,
    research: TopicResearch
): Promise<LessonOutline[]> {
    const prompt = `You are an expert curriculum designer. Create detailed outlines for each lesson.

COURSE: "${structure.title}"
TOPIC: "${topic}"

LESSON TITLES:
${structure.lessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

MAIN CONCEPTS TO COVER:
${research.mainConcepts.join(', ')}

For each lesson, provide:
- Specific topics covered
- 2-3 learning objectives (what students will be able to do)
- Estimated time to complete

Respond with ONLY a JSON object:
{
    "lessons": [
        {
            "order": 1,
            "title": "Lesson Title",
            "description": "Brief lesson description",
            "topics": ["topic1", "topic2"],
            "learningObjectives": ["Objective 1", "Objective 2"],
            "estimatedTime": "15 minutes"
        }
    ]
}`;

    const data = await generateGeminiJSON<{ lessons: LessonOutline[] }>(prompt, MODEL);
    return data.lessons;
}

// ============================================
// MAIN ORCHESTRATOR
// ============================================

export interface CurriculumPlannerCallback {
    onStepStart: (step: string, message: string) => void;
    onStepComplete: (step: string) => void;
    onError: (error: string) => void;
}

export async function planCurriculum(
    topic: string,
    callbacks: CurriculumPlannerCallback,
    options?: {
        lessonCount?: number;
        preferredDifficulty?: CourseDifficulty;
    }
): Promise<CourseOutline> {
    const lessonCount = options?.lessonCount || 6;

    // Step 1: Research
    callbacks.onStepStart('research', 'Researching topic...');
    const research = await researchTopic(topic);
    callbacks.onStepComplete('research');

    // Step 2: Structure
    callbacks.onStepStart('structure', 'Creating course structure...');
    const structure = await createCourseStructure(topic, research, lessonCount);
    callbacks.onStepComplete('structure');

    // Step 3: Detail lessons
    callbacks.onStepStart('detail', 'Detailing lessons...');
    const lessons = await detailLessons(topic, structure, research);
    callbacks.onStepComplete('detail');

    // Calculate total time
    const totalMinutes = lessons.reduce((acc, lesson) => {
        const match = lesson.estimatedTime.match(/(\d+)/);
        return acc + (match ? parseInt(match[1]) : 15);
    }, 0);
    const hours = Math.ceil(totalMinutes / 60);

    return {
        title: structure.title,
        description: structure.description,
        difficulty: options?.preferredDifficulty || research.suggestedDifficulty,
        estimatedTime: `${hours} hour${hours > 1 ? 's' : ''}`,
        tags: research.possibleTags.slice(0, 5),
        lessons,
    };
}

// Export research function for reuse
export { researchTopic };
export type { TopicResearch };
